/**
 * Interface for handling AI service interactions.
 */
export interface PromptHandler {
  /**
   * Sends prompt to AI service and gets response.
   * @param prompt - Text prompt to send
   * @param image - Optional UI state image path
   */
  runPrompt: (prompt: string, image?: string) => Promise<string>;

  /**
   * Checks if AI service supports UI snapshots.
   */
  isSnapshotImageSupported: () => boolean;
}

/**
 * Code evaluation output.
 */
export type CodeEvaluationResult = {
  /** Generated test code */
  code: string;
  /** Execution result */
  result: any;
  /** Context for next iteration */
  sharedContext?: Record<string, any>;
};
