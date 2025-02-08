import { PilotError } from "@/errors/PilotError";

export class CodeEvaluationError extends PilotError {
  constructor(
    message: string,
    public originalError?: Error,
  ) {
    super(message, originalError);
    this.name = "CodeEvaluationError";
  }
}
