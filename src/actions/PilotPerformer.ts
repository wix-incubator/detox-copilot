import { PilotPromptCreator } from '@/utils/PilotPromptCreator';
import {PreviousStep, PromptHandler, PilotReport, PilotStepReport, PilotStepPlan, ScreenCapturerResult} from '@/types';
import {extractOutputs, OutputMapper} from '@/utils/extractOutputs'
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

    private  extractStepOutputs(text: string) : PilotStepPlan {
        const outputsMapper: OutputMapper = {
            thoughts: 'THOUGHTS',
            action: 'ACTION',
        };
        return extractOutputs({text, outputsMapper}) as PilotStepPlan;
    }

    async createStepPlan(goal: string, previous: PreviousStep[] = [], screenCapture : ScreenCapturerResult): Promise<PilotStepPlan> {
            try {
                const { snapshot, viewHierarchy, isSnapshotImageAttached } = screenCapture;
                const prompt = this.promptCreator.createPrompt(goal, viewHierarchy, isSnapshotImageAttached, previous);
                const generatedPilotTaskDetails : string = await this.promptHandler.runPrompt(prompt, snapshot);
                const pilotOutputParsed : PilotStepPlan = this.extractStepOutputs(generatedPilotTaskDetails)

                return pilotOutputParsed;
            } catch (error) {
                console.error('\x1b[33m%s\x1b[0m', `pilot encountered an error: ${error instanceof Error ? error.message : error}`);
                throw error;
            }
    }

    async perform(goal: string): Promise<PilotReport> {
        let maxSteps = 100;
        let previousSteps: PreviousStep[] = [];
        const report: PilotReport = { steps: [] };
        
        for (let step = 0; step < maxSteps; step++) {
            const screenCapture : ScreenCapturerResult = await this.screenCapturer.capture();
            const plan: PilotStepPlan = await this.createStepPlan(goal, previousSteps, screenCapture);
    
            if (plan.action == 'success') {
                report.steps = [...report.steps, { plan }];
                console.log(JSON.stringify(report, null, 2));
                return report;
            }
            
            const { code, result } = await this.copilotStepPerformer.perform(plan.action, [...previousSteps], screenCapture);
            previousSteps = [...previousSteps, { step: plan.action, code, result }];
            const pilotStepReport: PilotStepReport = { plan, code };
            report.steps = [...report.steps, pilotStepReport];
        }
    
        console.warn(`pilot finished execution due to maxSteps limit of ${maxSteps} has been achieved`);
        console.log(JSON.stringify(report, null, 2));
        return report;
    }
}
