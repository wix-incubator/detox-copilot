import { PilotPromptCreator } from '@/utils/PilotPromptCreator';
import {PreviousStep, PromptHandler, PilotReport, PilotStepReport, PilotStepPlan, ScreenCapturerResult, PilotStepReview, PilotPreviousStep} from '@/types';
import {extractOutputs, extractOutputsGivenMapper, REVIEW_OUTPUTS_MAPPER, STEP_OUTPUTS_MAPPER, SUMMARY_OUTPUTS_MAPPER} from '@/utils/extractOutputs'
import {CopilotStepPerformer} from '@/actions/CopilotStepPerformer';
import {ScreenCapturer} from '@/utils/ScreenCapturer';


export class PilotPerformer {
    
    constructor(
        private promptCreator: PilotPromptCreator,
        private copilotStepPerformer: CopilotStepPerformer,
        private promptHandler: PromptHandler,
        private screenCapturer: ScreenCapturer
    ) {
    }

    private extractReviewOutput(text: string): PilotStepReview {
        const { review, findings, score } = extractOutputs({
          text,
          outputsMapper: REVIEW_OUTPUTS_MAPPER,
        });
        return {review, findings: findings.split('\n'), score };
    }


    async analyseScreenAndCreateCopilotStep(goal: string, previous: PreviousStep[] = [], screenCapture : ScreenCapturerResult): Promise<PilotStepReport> {
        try {
            const { snapshot, viewHierarchy, isSnapshotImageAttached } = screenCapture;
            const prompt = this.promptCreator.createPrompt(goal, viewHierarchy, isSnapshotImageAttached, previous);
            const generatedPilotTaskDetails : string = await this.promptHandler.runPrompt(prompt, snapshot);

            const { thoughts, action, ux,  accessibility } = extractOutputsGivenMapper(generatedPilotTaskDetails, STEP_OUTPUTS_MAPPER);
            const plan : PilotStepPlan = {action, thoughts};
            
            return {plan, uxReview : this.extractReviewOutput(ux), accessibilityReview : this.extractReviewOutput(accessibility)};
        } catch (error) {
            console.error('\x1b[33m%s\x1b[0m', `pilot encountered an error: ${error instanceof Error ? error.message : error}`);
            throw error;
        }
    }

    async perform(goal: string): Promise<PilotReport> {
        let maxSteps = 100;
        let previousSteps: PilotPreviousStep[] = [];
        let report: PilotReport = { goal, steps: [] };
        
        for (let step = 0; step < maxSteps; step++) {
            const screenCapture : ScreenCapturerResult = await this.screenCapturer.capture();
            const { plan, uxReview, accessibilityReview } = await this.analyseScreenAndCreateCopilotStep(goal, previousSteps, screenCapture);
            
            if (plan.action == 'success') {
                const { summary } = extractOutputsGivenMapper(plan.thoughts, SUMMARY_OUTPUTS_MAPPER);
                report = { summary, goal, steps : [...report.steps], uxReview, accessibilityReview };
                console.log(JSON.stringify(report, null, 2));
                return report;
            }
            
            const { code, result } = await this.copilotStepPerformer.perform(plan.action, [...previousSteps], screenCapture);
            previousSteps = [...previousSteps, { step: plan.action, code, result, uxReview, accessibilityReview }];
            const stepReport: PilotStepReport = { plan, uxReview, accessibilityReview, code };
            report.steps = [...report.steps, stepReport];
        }
    
        console.warn(`pilot finished execution due to maxSteps limit of ${maxSteps} has been achieved`);
        console.log(JSON.stringify(report, null, 2));
        return report;
    }
}
