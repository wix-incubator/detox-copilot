import { PilotPromptCreator } from '@/utils/PilotPromptCreator';
import { PromptHandler, PilotReport, PilotStepReport, PilotStepPlan, ScreenCapturerResult, PilotReviewSection, PilotPreviousStep, PilotReview, PreviousStep } from '@/types';
import { extractOutputs, OUTPUTS_MAPPINGS } from '@/utils/extractOutputs';
import { CopilotStepPerformer } from '@/actions/CopilotStepPerformer';
import { ScreenCapturer } from '@/utils/ScreenCapturer';


export class PilotPerformer {
    
    constructor(
        private promptCreator: PilotPromptCreator,
        private copilotStepPerformer: CopilotStepPerformer,
        private promptHandler: PromptHandler,
        private screenCapturer: ScreenCapturer
    ) {
    }

    private extractReviewOutput(text: string): PilotReviewSection {
        const { summary, findings, score } = extractOutputs({
            text,
            outputsMapper: OUTPUTS_MAPPINGS.PILOT_REVIEW_SECTION,
        });
        return { summary, findings: findings?.split('\n'), score };
    }

    async analyseScreenAndCreateCopilotStep(goal: string, previous: PilotPreviousStep[] = [], screenCapture: ScreenCapturerResult): Promise<PilotStepReport> {
        try {
            const { snapshot, viewHierarchy, isSnapshotImageAttached } = screenCapture;
            const prompt = this.promptCreator.createPrompt(goal, viewHierarchy, isSnapshotImageAttached, previous);
            const generatedPilotTaskDetails: string = await this.promptHandler.runPrompt(prompt, snapshot);

            const { thoughts, action, ux, a11y } = extractOutputs({ text: generatedPilotTaskDetails, outputsMapper: OUTPUTS_MAPPINGS.PILOT_STEP });
            const plan: PilotStepPlan = { action, thoughts };
            const review: PilotReview = { ux: this.extractReviewOutput(ux), a11y: this.extractReviewOutput(a11y) };
          
            return { plan, review };
        } catch (error) {
            console.error('\x1b[33m%s\x1b[0m', `pilot encountered an error: ${error instanceof Error ? error.message : error}`);
            throw error;
        }
    }

    async perform(goal: string): Promise<PilotReport> {
        const maxSteps = 100;
        let previousSteps: PilotPreviousStep[] = [];
        let copilotSteps : PreviousStep[] = [];
        let report: PilotReport = { goal, steps: [] };

        for (let step = 0; step < maxSteps; step++) {
            const screenCapture: ScreenCapturerResult = await this.screenCapturer.capture();
            const { plan, review } = await this.analyseScreenAndCreateCopilotStep(goal, previousSteps, screenCapture);

            if (plan.action === 'success') {
                const { summary } = extractOutputs({ text: plan.thoughts, outputsMapper: OUTPUTS_MAPPINGS.PILOT_SUMMARY});
                report = { summary, goal, steps: [...report.steps], review };
                console.log(JSON.stringify(report, null, 2));
                return report;
            }

            const { code, result } = await this.copilotStepPerformer.perform(plan.action, [...copilotSteps], screenCapture);
            copilotSteps = [...copilotSteps, { step: plan.action, code, result }];
            previousSteps = [...previousSteps, { step: plan.action, review }];

            const stepReport: PilotStepReport = { plan, review, code };
            report.steps = [...report.steps, stepReport];
        }

        console.warn(`pilot finished execution due to maxSteps limit of ${maxSteps} has been reached`);
        console.log(JSON.stringify(report, null, 2));
        return report;
    }
}