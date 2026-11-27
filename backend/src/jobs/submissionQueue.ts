/**
 * @deprecated Legacy shim — routes any remaining callers to durable BullMQ `code-execution` queue.
 */
import { enqueueCodeExecution } from "../queues/codeExecutionQueue";

export const addSubmissionJob = async (
  submissionId: string,
  userId = "unknown",
  requestId?: string
) => {
  return enqueueCodeExecution({ submissionId, userId, requestId });
};
