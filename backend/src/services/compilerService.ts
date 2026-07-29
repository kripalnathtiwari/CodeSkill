import axios from "axios";
import logger from "../config/logger";
import { exec } from "child_process";
import { promisify } from "util";
import fs from "fs";
import path from "path";
import crypto from "crypto";

const execAsync = promisify(exec);

interface ExecutionResult {
  status: "ACCEPTED" | "WRONG_ANSWER" | "RUNTIME_ERROR" | "COMPILATION_ERROR" | "TIME_LIMIT_EXCEEDED" | "MEMORY_LIMIT_EXCEEDED";
  output?: string;
  error?: string;
  runtime?: number; // ms
  memory?: number;  // KB
}

// Map frontend language keys to Piston runtime keys
const PISTON_LANG_MAP: Record<string, { name: string; version: string }> = {
  c: { name: "c", version: "*" },
  cpp: { name: "c++", version: "*" },
  java: { name: "java", version: "*" },
  python: { name: "python", version: "*" },
  javascript: { name: "javascript", version: "*" },
  typescript: { name: "typescript", version: "*" },
  go: { name: "go", version: "*" },
  rust: { name: "rust", version: "*" },
  kotlin: { name: "kotlin", version: "*" },
  php: { name: "php", version: "*" },
};

const cachedCommands: Record<string, string | null> = {};

async function checkCommandExists(cmd: string, versionFlag: string = "--version"): Promise<boolean> {
  try {
    await execAsync(`${cmd} ${versionFlag}`, { timeout: 2000 });
    return true;
  } catch (err: any) {
    return false;
  }
}

async function getPythonCommand(): Promise<string> {
  if (cachedCommands["python"]) return cachedCommands["python"]!;
  const candidates = ["python3", "python", "py"];
  for (const cmd of candidates) {
    if (await checkCommandExists(cmd, "--version")) {
      cachedCommands["python"] = cmd;
      return cmd;
    }
  }
  throw new Error("No Python interpreter (python3/python/py) found on the local system");
}

async function getNodeCommand(): Promise<string> {
  if (cachedCommands["node"]) return cachedCommands["node"]!;
  if (await checkCommandExists("node", "--version")) {
    cachedCommands["node"] = "node";
    return "node";
  }
  throw new Error("No Node.js runtime (node) found on the local system");
}

async function getTsCommand(): Promise<string> {
  if (cachedCommands["ts"]) return cachedCommands["ts"]!;
  const candidates = ["ts-node", "npx ts-node"];
  for (const cmd of candidates) {
    if (await checkCommandExists(cmd, "--version")) {
      cachedCommands["ts"] = cmd;
      return cmd;
    }
  }
  if (await checkCommandExists("node", "--version")) {
    cachedCommands["ts"] = "node";
    return "node";
  }
  throw new Error("No TypeScript runner found on the local system");
}

async function getCppCommand(): Promise<string> {
  if (cachedCommands["cpp"]) return cachedCommands["cpp"]!;
  const candidates = ["g++", "clang++", "gcc"];
  for (const cmd of candidates) {
    if (await checkCommandExists(cmd, "--version")) {
      cachedCommands["cpp"] = cmd;
      return cmd;
    }
  }
  throw new Error("No C/C++ compiler (g++/clang++/gcc) found on the local system");
}

async function getJavaCommand(): Promise<string> {
  if (cachedCommands["java"]) return cachedCommands["java"]!;
  if (await checkCommandExists("java", "-version")) {
    cachedCommands["java"] = "java";
    return "java";
  }
  throw new Error("No Java runtime (java) found on the local system");
}

function isSystemCommandError(err: any): boolean {
  if (!err) return false;
  const msg = `${err.message || ""} ${err.stderr || ""} ${err.error || ""}`.toLowerCase();
  const code = err.code || err.errno;
  if (code === 127 || code === "ENOENT" || code === "EACCES") return true;
  if (
    msg.includes("not found") ||
    msg.includes("not recognized as an internal or external command") ||
    msg.includes("no such file or directory") ||
    msg.includes("cannot find the file specified") ||
    msg.includes("no python interpreter") ||
    msg.includes("no node.js runtime") ||
    msg.includes("no c/c++ compiler") ||
    msg.includes("no java runtime") ||
    msg.includes("no typescript runner")
  ) {
    return true;
  }
  return false;
}

// Map languages to Judge0 ids if Judge0 self-hosted is configured
const JUDGE0_LANG_MAP: Record<string, number> = {
  c: 50,          // GCC 9.2.0
  cpp: 54,        // G++ 9.2.0
  java: 62,       // OpenJDK 13
  python: 71,     // Python 3.8.1
  javascript: 63, // Node.js 12.14.0
  typescript: 74, // TypeScript 3.7.4
  go: 60,         // Go 1.13.5
  rust: 73,       // Rust 1.40.0
  kotlin: 78,     // Kotlin 1.3.70
  php: 68,        // PHP 7.4.1
};

export class CompilerService {
  /**
   * Executes code using Piston API (Default / Free / Out-of-the-box) or Judge0 API
   */
  public static async executeCode(
    code: string,
    language: string,
    stdin: string,
    expectedOutput?: string,
    timeLimitMs: number = 2000
  ): Promise<ExecutionResult> {
    const langLower = language.toLowerCase();
    
    // Auto-flatten JSON stdin for statically typed languages using standard input reading
    let processedStdin = stdin || "";
    if (langLower !== "javascript" && langLower !== "typescript" && langLower !== "python") {
      try {
        const parsed = JSON.parse(processedStdin);
        if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
          let flatArgs: any[] = [];
          for (const key of Object.keys(parsed)) {
            const val = parsed[key];
            if (Array.isArray(val)) {
              flatArgs.push(val.length);
              flatArgs.push(val.join(" "));
            } else {
              flatArgs.push(val);
            }
          }
          processedStdin = flatArgs.join("\n");
        }
      } catch (e) {
        // Not JSON, leave as is
      }
    }
    
    // FAST PATH: Run local languages instantly bypassing remote API
    if (["javascript", "typescript", "python", "cpp", "c", "java"].includes(langLower)) {
      try {
        return await this.executeLocally(code, langLower, processedStdin, expectedOutput);
      } catch (localErr: any) {
        logger.error(`Local execution failed: ${localErr.message}, falling back to remote`);
      }
    }

    const useJudge0 = !!process.env.JUDGE0_API_URL;

    if (useJudge0) {
      const result = await this.executeJudge0(code, language, processedStdin, expectedOutput, timeLimitMs);
      if ((result.status === "RUNTIME_ERROR" && result.error && result.error.includes("Judge0 Server interaction issue")) ||
          (result.status === "COMPILATION_ERROR" && result.error && result.error.includes("Unsupported language"))) {
        logger.warn("Judge0 API failed or unsupported language, falling back to Piston API...");
        return this.executePiston(code, language, processedStdin, expectedOutput);
      }
      return result;
    } else {
      return this.executePiston(code, language, processedStdin, expectedOutput);
    }
  }

  private static async executePiston(
    code: string,
    language: string,
    stdin: string,
    expectedOutput?: string
  ): Promise<ExecutionResult> {
    const mapped = PISTON_LANG_MAP[language.toLowerCase()];
    if (!mapped) {
      return {
        status: "COMPILATION_ERROR",
        error: `Unsupported compiler language: ${language}`,
      };
    }

    try {
      const response = await axios.post("https://emkc.org/api/v2/piston/execute", {
        language: mapped.name,
        version: mapped.version,
        files: [
          {
            name: `main.${language === "javascript" ? "js" : language === "typescript" ? "ts" : language}`,
            content: code,
          },
        ],
        stdin: stdin || "",
      }, { timeout: 15000 }); // Provide sufficient timeout for remote sandbox compilation

      const { run } = response.data;

      if (run.code !== 0) {
        // Non-zero exit code represents runtime error or build error
        return {
          status: run.stderr ? "RUNTIME_ERROR" : "COMPILATION_ERROR",
          error: run.stderr || run.stdout,
          runtime: run.signal ? undefined : 0,
        };
      }

      const actualOutput = run.output ? run.output.trim() : "";
      const expected = expectedOutput ? expectedOutput.trim() : null;

      if (expected !== null) {
        if (actualOutput === expected) {
          return {
            status: "ACCEPTED",
            output: actualOutput,
            runtime: 50, // Piston doesn't return precision execution duration, mock standard container metrics
            memory: 1200,
          };
        } else {
          return {
            status: "WRONG_ANSWER",
            output: actualOutput,
            runtime: 50,
            memory: 1200,
          };
        }
      }

      return {
        status: "ACCEPTED",
        output: actualOutput,
        runtime: 10,
        memory: 500,
      };
    } catch (err: any) {
      logger.error(`Piston compiler service failed: ${err.message}`);
      
      return {
        status: "RUNTIME_ERROR",
        error: "Remote compiler service is currently unavailable or failed to execute the code. Please try again later.",
        runtime: 0,
        memory: 0,
      };
    }
  }

  private static async executeLocally(
    code: string,
    language: string,
    stdin: string,
    expectedOutput?: string
  ): Promise<ExecutionResult> {
    const tmpDir = path.join(process.cwd(), "tmp");
    if (!fs.existsSync(tmpDir)) {
      fs.mkdirSync(tmpDir, { recursive: true });
    }

    const codeHash = crypto.createHash("md5").update(code).digest("hex");
    const fileId = crypto.randomUUID();
    let extension = "txt";
    if (language === "javascript") extension = "js";
    else if (language === "typescript") extension = "ts";
    else if (language === "python") extension = "py";
    else if (language === "cpp" || language === "c") extension = "cpp";
    else if (language === "java") extension = "java";

    const filePath = path.join(tmpDir, `${codeHash}.${extension}`);
    const inputPath = path.join(tmpDir, `${fileId}.in`);
    const exePath = path.join(tmpDir, `${codeHash}.exe`);
    
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, code);
    }
    fs.writeFileSync(inputPath, stdin || "");

    let command = "";
    if (language === "javascript") {
      const nodeCmd = await getNodeCommand();
      command = `"${nodeCmd}" "${filePath}" < "${inputPath}"`;
    } else if (language === "typescript") {
      const tsCmd = await getTsCommand();
      command = `${tsCmd} "${filePath}" < "${inputPath}"`;
    } else if (language === "python") {
      const pyCmd = await getPythonCommand();
      command = `${pyCmd} "${filePath}" < "${inputPath}"`;
    } else if (language === "cpp" || language === "c") {
      const cppCmd = await getCppCommand();
      if (fs.existsSync(exePath)) {
        command = `"${exePath}" < "${inputPath}"`;
      } else {
        command = `${cppCmd} "${filePath}" -o "${exePath}" && "${exePath}" < "${inputPath}"`;
      }
    } else if (language === "java") {
      const javaCmd = await getJavaCommand();
      command = `"${javaCmd}" "${filePath}" < "${inputPath}"`;
    }

    try {
      const startTime = Date.now();
      const { stdout, stderr } = await execAsync(command, { timeout: 5000 });
      const runtime = Date.now() - startTime;
      
      // Cleanup (only delete input file, keep code and executable cached)
      if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
      
      if (stderr) {
        return {
          status: "RUNTIME_ERROR",
          error: stderr.trim(),
          runtime,
          memory: 1000
        };
      }
      
      const actualOutput = stdout.trim();
      const isCorrect = expectedOutput ? actualOutput === expectedOutput.trim() : true;
      
      return {
        status: isCorrect ? "ACCEPTED" : "WRONG_ANSWER",
        output: actualOutput,
        runtime,
        memory: 1500
      };
    } catch (err: any) {
      // Cleanup (only delete input file, keep code and executable cached)
      if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
      
      if (isSystemCommandError(err)) {
        throw err;
      }

      return {
        status: err.killed ? "TIME_LIMIT_EXCEEDED" : "RUNTIME_ERROR",
        error: err.stderr ? err.stderr.trim() : err.message,
        runtime: 5000,
        memory: 1000
      };
    }
  }

  private static async executeJudge0(
    code: string,
    language: string,
    stdin: string,
    expectedOutput?: string,
    timeLimitMs: number = 2000
  ): Promise<ExecutionResult> {
    const judge0Url = process.env.JUDGE0_API_URL;
    const judge0Key = process.env.JUDGE0_API_KEY || "";
    const langId = JUDGE0_LANG_MAP[language.toLowerCase()];

    if (!langId) {
      return {
        status: "COMPILATION_ERROR",
        error: `Unsupported language for Judge0: ${language}`,
      };
    }

    try {
      // Create execution submission
      const response = await axios.post(
        `${judge0Url}/submissions?wait=true&fields=*`,
        {
          source_code: Buffer.from(code).toString("base64"),
          language_id: langId,
          stdin: Buffer.from(stdin).toString("base64"),
          expected_output: expectedOutput ? Buffer.from(expectedOutput).toString("base64") : undefined,
          cpu_time_limit: timeLimitMs / 1000,
        },
        {
          headers: {
            "Content-Type": "application/json",
            "x-rapidapi-key": judge0Key,
            "x-rapidapi-host": new URL(judge0Url).host,
          },
        }
      );

      const data = response.data;
      const statusId = data.status.id; // 3 = Accepted, 4 = Wrong Answer, 6 = Compilation Error, etc.
      const stdout = data.stdout ? Buffer.from(data.stdout, "base64").toString("utf-8").trim() : "";
      const stderr = data.stderr ? Buffer.from(data.stderr, "base64").toString("utf-8").trim() : "";
      const compileOut = data.compile_output
        ? Buffer.from(data.compile_output, "base64").toString("utf-8").trim()
        : "";

      const runtime = Math.round((parseFloat(data.time) || 0) * 1000);
      const memory = data.memory || 0; // KB

      if (statusId === 3) {
        return { status: "ACCEPTED", output: stdout, runtime, memory };
      } else if (statusId === 4) {
        return { status: "WRONG_ANSWER", output: stdout, runtime, memory };
      } else if (statusId === 5) {
        return { status: "TIME_LIMIT_EXCEEDED", runtime, memory };
      } else if (statusId === 6) {
        return { status: "COMPILATION_ERROR", error: compileOut || stderr };
      } else if (statusId >= 7 && statusId <= 12) {
        return { status: "RUNTIME_ERROR", error: stderr };
      } else {
        return { status: "WRONG_ANSWER", output: stdout, error: stderr };
      }
    } catch (err: any) {
      logger.error(`Judge0 execution failed: ${err.message}`);
      return {
        status: "RUNTIME_ERROR",
        error: `Judge0 Server interaction issue: ${err.message}`,
      };
    }
  }
}
export default CompilerService;
