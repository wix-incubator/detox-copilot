import { PilotPromptCreator } from "@/utils/PilotPromptCreator";
import {
  PromptHandler,
  PilotReport,
  PilotStepReport,
  PilotStepPlan,
  ScreenCapturerResult,
  PilotReviewSection,
  PilotPreviousStep,
  PilotReview,
  PreviousStep,
  LoggerMessageColor,
} from "@/types";
import { extractOutputs, OUTPUTS_MAPPINGS } from "@/utils/extractOutputs";
import { CopilotStepPerformer } from "@/actions/CopilotStepPerformer";
import { ScreenCapturer } from "@/utils/ScreenCapturer";
import fs from 'fs';
import logger from "@/utils/logger";

export class PilotPerformer {
  constructor(
    private promptCreator: PilotPromptCreator,
    private copilotStepPerformer: CopilotStepPerformer,
    private promptHandler: PromptHandler,
    private screenCapturer: ScreenCapturer,
  ) {}

  private extractReviewOutput(text: string): PilotReviewSection {
    const { summary, findings, score } = extractOutputs({
      text,
      outputsMapper: OUTPUTS_MAPPINGS.PILOT_REVIEW_SECTION,
    });

    return {
      summary,
      findings: findings
        ?.split("\n")
        .map((finding: string) => finding.replace(/^- /, "").trim()),
      score,
    };
  }

  private logReviewSection(review: PilotReviewSection, type: "ux" | "a11y" | "i18n") {
    const config: {
      [key: string]: {
        emoji: string;
        color: LoggerMessageColor;
        findingColor: LoggerMessageColor;
      };
    } = {
      ux: {
        emoji: "🎨",
        color: "magentaBright",
        findingColor: "magenta",
      },
      a11y: {
        emoji: "👁️ ",
        color: "yellowBright",
        findingColor: "yellow",
      },
      i18n: {
        emoji: "🌐",
        color: "cyanBright",
        findingColor: "cyan",
      },
    };

    logger.info({
      message: `📝${config[type].emoji} Pilot ${type.toUpperCase()} review: ${review?.summary} (Score: ${review?.score})`,
      isBold: true,
      color: config[type].color,
    });

    review.findings?.forEach((finding) => {
      logger.info({
        message: `🔍 ${finding}`,
        isBold: false,
        color: config[type].findingColor,
      });
    });
  }

  async analyseScreenAndCreateCopilotStep(
    goal: string,
    previous: PilotPreviousStep[] = [],
    screenCapture: ScreenCapturerResult,
  ): Promise<PilotStepReport> {
    const analysisLoggerSpinner = logger.startSpinner(
      "🤔 Thinking on next step",
    );

    try {
      const { snapshot, viewHierarchy, isSnapshotImageAttached } =
        screenCapture;
      const prompt = this.promptCreator.createPrompt(
        goal,
        viewHierarchy,
        isSnapshotImageAttached,
        previous,
      );

      const generatedPilotTaskDetails: string =
        await this.promptHandler.runPrompt(prompt, snapshot);

      const { screenDescription, thoughts, action, ux, a11y, i18n } = extractOutputs({
        text: generatedPilotTaskDetails,
        outputsMapper: OUTPUTS_MAPPINGS.PILOT_STEP,
      });

      analysisLoggerSpinner.stop("success", `💭 Thoughts:`, {
        message: thoughts,
        isBold: true,
        color: "whiteBright",
      });

      const plan: PilotStepPlan = { action, thoughts };
      const review: PilotReview = {
        ux: this.extractReviewOutput(ux),
        a11y: this.extractReviewOutput(a11y),
        i18n: this.extractReviewOutput(i18n),
      };

      logger.info({
        message: `Conducting review for ${screenDescription}\n`,
        isBold: true,
        color: 'whiteBright',
      });

      review.ux && this.logReviewSection(review.ux, "ux");
      review.a11y && this.logReviewSection(review.a11y, "a11y");
      review.i18n && this.logReviewSection(review.i18n, "i18n");

      const goalAchieved = action === "success";

      const summary = goalAchieved
        ? extractOutputs({
            text: thoughts,
            outputsMapper: OUTPUTS_MAPPINGS.PILOT_SUMMARY,
          }).summary
        : undefined;

      return { screenDescription, plan, review, goalAchieved, summary };
    } catch (error) {
      analysisLoggerSpinner.stop(
        "failure",
        `😓 Pilot encountered an error, ${error instanceof Error ? error.message : error}`,
      );
      throw error;
    }
  }

  async perform(goal: string): Promise<PilotReport> {
    const maxSteps = 100;
    let previousSteps: PilotPreviousStep[] = [];
    let copilotSteps: PreviousStep[] = [];
    const report: PilotReport = { goal, steps: [] };

    logger.info(
      {
        message: `🛫 Pilot is about to reach goal:\n`,
        isBold: false,
        color: "cyan",
      },
      {
        message: goal,
        isBold: true,
        color: "cyanBright",
      },
    );

    for (let step = 0; step < maxSteps; step++) {
      const screenCapture: ScreenCapturerResult =
        await this.screenCapturer.capture();
      const { screenDescription, plan, review, goalAchieved, summary } =
        await this.analyseScreenAndCreateCopilotStep(
          goal,
          previousSteps,
          screenCapture,
        );

      if (goalAchieved) {
        logger.info(`🛬 Pilot reached goal: "${goal}"! 🎉 Summarizing:\n`, {
          message: `${summary}`,
          isBold: true,
          color: "whiteBright",
        });
        logger.writeLogsToFile(`pilot_logs_${Date.now()}`);
        return { goal, summary, steps: [...report.steps], review };
      }

      const { code, result } = await this.copilotStepPerformer.perform(
        plan.action,
        [...copilotSteps],
        screenCapture,
      );
      copilotSteps = [...copilotSteps, { step: plan.action, code, result }];
      previousSteps = [...previousSteps, { screenDescription, step: plan.action, review }];

      const stepReport: PilotStepReport = {
        screenDescription,
        plan,
        review,
        code,
        goalAchieved,
        summary,
      };
      report.steps = [...report.steps, stepReport];
    }

    logger.warn(
      `🛬 Pilot finished execution due to limit of ${maxSteps} steps has been reached`,
    );
    logger.writeLogsToFile(`pilot_logs_${Date.now()}`);
    return report;
  }
}