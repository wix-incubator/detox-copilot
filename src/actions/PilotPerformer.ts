import { PilotPromptCreator } from '@/utils/PilotPromptCreator';
import {PreviousStep, PromptHandler, PilotReport, PilotStepReport, PilotStepPlan, CaptureResult} from '@/types';
import {extractOutputs, OutputMapper} from '@/utils/extractOutputs'
import {CopilotStepPerformer} from '@/actions/CopilotStepPerformer';



export class PilotPerformer {
    
    constructor(
        private promptCreator: PilotPromptCreator,
        private copilotStepPerformer: CopilotStepPerformer,
        private promptHandler: PromptHandler,
        private capture: () => Promise<CaptureResult>
    ) {
    }

    private  extractStepOutputs(text: string) : PilotStepPlan {
        const outputsMapper: OutputMapper = {
            thoughts: 'THOUGHTS',
            action: 'ACTION',
        };
        return extractOutputs({text, outputsMapper}) as PilotStepPlan;
    }

    async createStepPlan(goal: string, previous: PreviousStep[] = [], captureResult : CaptureResult): Promise<PilotStepPlan> {
            try {
                const { snapshot, viewHierarchy, isSnapshotImageAttached } = captureResult;
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
        const previousSteps: PreviousStep[] = [];
        const report: PilotReport = { steps: [] };
        
        for (let step = 0; step < maxSteps; step++) {
            const captureResult : CaptureResult = await this.capture();
            const plan: PilotStepPlan = await this.createStepPlan(goal, previousSteps, captureResult);
    
            if (plan.action == 'success') {
                report.steps.push({ plan });
                console.log(JSON.stringify(report, null, 2));
                return report;
            }
            
            const previousStepsSnapshot = [...previousSteps];
            const { code, result } = await this.copilotStepPerformer.perform(plan.action, previousStepsSnapshot, undefined, captureResult);
            previousSteps.push({ step: plan.action, code, result });
            const pilotStepReport: PilotStepReport = { plan, code };
            report.steps.push(pilotStepReport);
        }
    
        console.warn(`pilot finished execution due to maxSteps limit of ${maxSteps} has been achieved`);
        console.log(JSON.stringify(report, null, 2));
        return report;
    }
}
