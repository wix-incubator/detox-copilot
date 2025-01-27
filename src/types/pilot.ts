/**
 * Executed test step record.
 */
export type PreviousStep = {
  /** Step description */
  step: string;
  /** Generated test code */
  code: string;
  /** Step execution result */
  result: any;
};

/** Review section types */
export type PilotReviewSectionType = "ux" | "a11y"| "i18n";

/** Complete pilot review */
export type PilotReview = {
  [key in PilotReviewSectionType]?: PilotReviewSection;
};

/**
 * Single pilot step execution report.
 */
export type PilotStepReport = {
  /** Screen name of the current view */
  screenDescription: string;
  /** Action plan and reasoning */
  plan: PilotStepPlan;
  /** Optional reviews */
  review?: PilotReview;
  /** Generated code */
  code?: string;
  /** Indicates if the goal was achieved */
  goalAchieved: boolean;
  /** */
  summary?: string;
};

/**
 * Complete pilot execution report.
 */
export type PilotReport = {
  /** Target objective */
  goal: string;
  /** Execution summary */
  summary?: string;
  /** Individual step reports */
  steps: PilotStepReport[];
  /** Final reviews */
  review?: PilotReview;
};

/**
 * Pilot step planning output.
 */
export type PilotStepPlan = {
  /** Planned action */
  action: string;
  /** Reasoning process */
  thoughts: string;
};

/**
 * Review section content.
 */
export type PilotReviewSection = {
  /** Overall assessment */
  summary: string;
  /** Specific observations */
  findings?: string[];
  /** Numerical rating (1-10) */
  score: string;
};

/**
 * Previous pilot step record.
 */
export type PilotPreviousStep = {
  /** Screen description */
  screenDescription: string;
  /** Step description */
  step: string;
  /** Optional reviews */
  review?: PilotReview;
};
