import axios, { AxiosError, AxiosInstance } from "axios";
import { PermanentJobError, RateLimitError, RetryableServiceError } from "../lib/errors";

export type SubmissionVerdict =
  | "ACCEPTED"
  | "WRONG_ANSWER"
  | "TIME_LIMIT_EXCEEDED"
  | "COMPILATION_ERROR"
  | "RUNTIME_ERROR"
  | "MEMORY_LIMIT_EXCEEDED";

export interface Judge0ExecutionResult {
  token: string;
  statusId: number;
  status: SubmissionVerdict;
  stdout: string;
  stderr: string;
  compileOutput: string;
  runtimeMs: number;
  memoryKb: number;
}

const JUDGE0_LANG_MAP: Record<string, number> = {
  c: 50,
  cpp: 54,
  java: 62,
  python: 71,
  javascript: 63,
  typescript: 74,
  go: 60,
  rust: 73,
  kotlin: 78,
  php: 68,
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const encodeBase64 = (value: string): string => Buffer.from(value, "utf8").toString("base64");
const decodeBase64 = (value?: string | null): string =>
  value ? Buffer.from(value, "base64").toString("utf8").trim() : "";

/**
 * Dedicated Judge0 CE / RapidAPI client.
 * Submits asynchronously (`wait=false`) and polls until terminal status (or uses wait=true when enabled).
 * Classifies 429 / 5xx / timeouts as retryable, while unsupported languages or 4xx syntax payloads
 * raise PermanentJobError so BullMQ never wastes retries.
 */
export class Judge0Service {
  private readonly baseUrl: string;
  private readonly apiKey: string;
  private readonly http: AxiosInstance;
  private readonly pollIntervalMs: number;
  private readonly maxPollWaitMs: number;

  constructor() {
    this.baseUrl = (process.env.JUDGE0_API_URL || "").replace(/\/+$/, "");
    this.apiKey = process.env.JUDGE0_API_KEY || "";
    this.pollIntervalMs = parseInt(process.env.JUDGE0_POLL_INTERVAL_MS || "800", 10);
    this.maxPollWaitMs = parseInt(process.env.JUDGE0_MAX_POLL_WAIT_MS || "25000", 10);

    this.http = axios.create({
      timeout: parseInt(process.env.JUDGE0_HTTP_TIMEOUT_MS || "12000", 10),
    });
  }

  public isConfigured(): boolean {
    return Boolean(this.baseUrl);
  }

  public getLanguageId(language: string): number {
    const langId = JUDGE0_LANG_MAP[language.toLowerCase().trim()];
    if (!langId) {
      throw new PermanentJobError(`Unsupported programming language: ${language}`, "UNSUPPORTED_LANGUAGE");
    }
    return langId;
  }

  private buildHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (this.apiKey && this.baseUrl) {
      const host = new URL(this.baseUrl).host;
      if (host.includes("rapidapi")) {
        headers["x-rapidapi-key"] = this.apiKey;
        headers["x-rapidapi-host"] = host;
      } else {
        headers["X-Auth-Token"] = this.apiKey;
      }
    }

    return headers;
  }

  private classifyAxiosError(err: AxiosError<any>, context: string): never {
    const status = err.response?.status;
    const detail = err.response?.data?.error || err.response?.data?.message || err.message;

    if (status === 429) {
      const retryHeader = err.response?.headers?.["retry-after"];
      const retryAfterMs = retryHeader ? Number(retryHeader) * 1000 : undefined;
      throw new RateLimitError(`Judge0 rate limited during ${context}: ${detail}`, retryAfterMs);
    }

    if (status === 400 || status === 422) {
      throw new PermanentJobError(`Judge0 rejected payload during ${context} (${status}): ${detail}`, "JUDGE0_BAD_INPUT");
    }

    // 401/403 (expired key), 5xx, network errors, timeouts should retry with backoff or alert ops
    throw new RetryableServiceError(`Judge0 unavailable during ${context} (${status || err.code || "ERR"}): ${detail}`, status);
  }

  private mapStatus(statusId: number, stderr: string, compileOutput: string): SubmissionVerdict {
    if (statusId === 3) return "ACCEPTED";
    if (statusId === 4) return "WRONG_ANSWER";
    if (statusId === 5) return "TIME_LIMIT_EXCEEDED";
    if (statusId === 6) return "COMPILATION_ERROR";
    if (statusId >= 7 && statusId <= 12) return "RUNTIME_ERROR";
    if (statusId === 13) {
      throw new RetryableServiceError("Judge0 internal sandbox error (status 13)", 500);
    }
    if (statusId === 14) {
      throw new PermanentJobError(compileOutput || stderr || "Judge0 exec format error (status 14)", "EXEC_FORMAT_ERROR");
    }
    return "WRONG_ANSWER";
  }

  public async executeTestCase(params: {
    code: string;
    language: string;
    stdin: string;
    expectedOutput?: string;
    timeLimitMs?: number;
    memoryLimitMb?: number;
    callbackUrl?: string;
  }): Promise<Judge0ExecutionResult> {
    if (!this.baseUrl) {
      throw new RetryableServiceError("JUDGE0_API_URL is not configured", 503);
    }

    if (!params.code || !params.code.trim()) {
      throw new PermanentJobError("Source code cannot be empty", "EMPTY_SOURCE_CODE");
    }

    const languageId = this.getLanguageId(params.language);
    const headers = this.buildHeaders();
    const cpuLimitSec = Math.max(0.5, Math.min((params.timeLimitMs || 2000) / 1000, 15));
    const memoryLimitKb = params.memoryLimitMb ? params.memoryLimitMb * 1024 : undefined;

    let token: string;
    try {
      const submitRes = await this.http.post(
        `${this.baseUrl}/submissions?base64_encoded=true&wait=false`,
        {
          source_code: encodeBase64(params.code),
          language_id: languageId,
          stdin: encodeBase64(params.stdin || ""),
          ...(params.expectedOutput !== undefined
            ? { expected_output: encodeBase64(params.expectedOutput) }
            : {}),
          cpu_time_limit: cpuLimitSec,
          ...(memoryLimitKb ? { memory_limit: memoryLimitKb } : {}),
          ...(params.callbackUrl ? { callback_url: params.callbackUrl } : {}),
        },
        { headers }
      );
      token = submitRes.data?.token;
      if (!token) {
        throw new RetryableServiceError("Judge0 response missing submission token", 502);
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        this.classifyAxiosError(error, "submission creation");
      }
      throw error;
    }

    // Poll until Judge0 leaves status 1 (In Queue) / 2 (Processing)
    const deadline = Date.now() + this.maxPollWaitMs;
    while (Date.now() < deadline) {
      await sleep(this.pollIntervalMs);

      try {
        const pollRes = await this.http.get(
          `${this.baseUrl}/submissions/${token}?base64_encoded=true&fields=token,status,stdout,stderr,compile_output,time,memory`,
          { headers }
        );
        const data = pollRes.data;
        const statusId: number = data?.status?.id;

        if (statusId === 1 || statusId === 2) {
          continue;
        }

        const stdout = decodeBase64(data.stdout);
        const stderr = decodeBase64(data.stderr);
        const compileOutput = decodeBase64(data.compile_output);
        const verdict = this.mapStatus(statusId, stderr, compileOutput);

        return {
          token,
          statusId,
          status: verdict,
          stdout,
          stderr,
          compileOutput,
          runtimeMs: Math.round((parseFloat(data.time) || 0) * 1000),
          memoryKb: Number(data.memory) || 0,
        };
      } catch (error) {
        if (axios.isAxiosError(error)) {
          this.classifyAxiosError(error, "result polling");
        }
        throw error;
      }
    }

    throw new RetryableServiceError(`Judge0 polling timed out after ${this.maxPollWaitMs}ms for token ${token}`, 504);
  }
}

export const judge0Service = new Judge0Service();
export default judge0Service;
