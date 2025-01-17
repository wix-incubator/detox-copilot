import { PilotPromptCreator } from '@/utils/PilotPromptCreator';
import {PreviousStep, PromptHandler, PilotReport, PilotStepReport, PilotStepPlan} from '@/types';
import {extractOutputs, OutputMapper} from '@/utils/extractOutputs'
import {CopilotStepPerformer} from '@/actions/CopilotStepPerformer';


export class PilotPerformer {
    
    constructor(
        private promptCreator: PilotPromptCreator,
        private copilotStepPerformer: CopilotStepPerformer,
        private promptHandler: PromptHandler,
    ) {
    }

    private  extractStepOutputs(text: string) : PilotStepPlan {
        const outputsMapper: OutputMapper = {
            thoughts: 'THOUGHTS',
            action: 'ACTION',
        };
        const parsedResult = extractOutputs({text, outputsMapper});
        return parsedResult as PilotStepPlan;
    }

    async createStepPlan(goal: string, previous: PreviousStep[] = []): Promise<PilotStepPlan> {
            try {
                const { snapshot, viewHierarchy, isSnapshotImageAttached } = await this.copilotStepPerformer.captureSnapshotAndViewHierarchy();
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
        const pilotReport: PilotReport = { report: [] };
    
        for (let step = 0; step < maxSteps; step++) {
            const pilotStepPlan: PilotStepPlan = await this.createStepPlan(goal, previousSteps);
    
            if (pilotStepPlan.action == 'success') {
                pilotReport.report.push({ plan: pilotStepPlan });
                console.log(JSON.stringify(pilotReport, null, 2));
                return pilotReport;
            }
    
            const { code, result } = await this.copilotStepPerformer.perform(pilotStepPlan.action, previousSteps);
            previousSteps.push({ step: pilotStepPlan.action, code, result });
            const pilotStepReport: PilotStepReport = { plan: pilotStepPlan, code };
            pilotReport.report.push(pilotStepReport);
        }
    
        console.log(`pilot finished execution due to maxSteps limit of ${maxSteps} has been achieved`);
        console.log(JSON.stringify(pilotReport, null, 2));
        return pilotReport;
    }
}
