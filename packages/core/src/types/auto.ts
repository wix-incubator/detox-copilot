/** Review section types */
export type AutoReviewSectionType = "ux" | "a11y" | "i18n";

/** Complete Autopilot review */
export type AutoReview = {
  [key in AutoReviewSectionType]?: AutoReviewSection;
};

/**
 * Single Autopilot step execution report.
 */
export type AutoStepReport = {
  /** Screen name of the current view */
  screenDescription: string;
  /** Action plan and reasoning */
  plan: AutoStepPlan;
  /** Optional reviews */
  review?: AutoReview;
  /** Generated code */
  code?: string;
  /** Indicates if the goal was achieved */
  goalAchieved: boolean;
  /** Execution summary if exists */
  summary?: string;
};

/**
 * Complete Autopilot execution report.
 */
export type AutoReport = {
  /** Target objective */
  goal: string;
  /** Individual step reports */
  steps: AutoStepReport[];
  /** Optional final reviews */
  review?: AutoReview;
  /** Execution summary if exists */
  summary?: string;
};

/**
 * Pilot step planning output.
 */
export type AutoStepPlan = {
  /** Planned action */
  action: string;
  /** Reasoning process */
  thoughts: string;
};

/**
 * Review section content.
 */
export type AutoReviewSection = {
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
export type AutoPreviousStep = {
  /** Screen description */
  screenDescription: string;
  /** Step description */
  step: string;
  /** Optional reviews */
  review?: AutoReview;
};
