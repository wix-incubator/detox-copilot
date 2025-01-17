import { PilotPromptCreator } from '@/utils/PilotPromptCreator';
import {PreviousStep, PromptHandler, PilotReport, PilotStepReport} from '@/types';
import {extractOutputs, OutputMapper} from '@/utils/extractOutputs'
import {CopilotStepPerformer} from '@/actions/CopilotStepPerformer';


export class PilotPerformer {

    private getCopilotPreviousSteps: () => PreviousStep[];
    constructor(
        private promptCreator: PilotPromptCreator,
        private copilotStepPerformer: CopilotStepPerformer,
        private promptHandler: PromptHandler,
        getCopilotPreviousSteps: () => PreviousStep[],
    ) {
        this.getCopilotPreviousSteps = getCopilotPreviousSteps;
    }

    private  extractStepOutputs(text: string) : PilotStepReport {
        const outputsMapper: OutputMapper = {
            thoughts: 'THOUGHTS',
            action: 'ACTION',
        };
        const parsedResult = extractOutputs({text, outputsMapper});
        return parsedResult as PilotStepReport;
    }

    async createStep(goal: string, previous: PreviousStep[] = []): Promise<PilotStepReport> {
            try {
                const { snapshot, viewHierarchy, isSnapshotImageAttached } = await this.copilotStepPerformer.captureSnapshotAndViewHierarchy();
                const prompt = this.promptCreator.createPrompt(goal, viewHierarchy, isSnapshotImageAttached, previous);
                const generatedPilotTaskDetails : string = await this.promptHandler.runPrompt(prompt, snapshot);
                const pilotOutputParsed : PilotStepReport = this.extractStepOutputs(generatedPilotTaskDetails)

                return pilotOutputParsed;
            } catch (error) {
                console.error('\x1b[33m%s\x1b[0m', `pilot encountered an error: ${error instanceof Error ? error.message : error}`);
                throw error;
            }
    }

    async perform(goal :string) : Promise<PilotReport> {
        let maxSteps = 100;
        const pilotReport : PilotReport = {report :[]};
        for (let step = 0; step < maxSteps ; step ++) {
            const pilotOutput : PilotStepReport = await this.createStep(goal, this.getCopilotPreviousSteps());
            pilotReport.report.push(pilotOutput);
            if (pilotOutput.action == 'success') {
                console.log(pilotReport)
                return pilotReport;
            }
            await this.copilotStepPerformer.perform(pilotOutput.action, this.getCopilotPreviousSteps());
            console.log(pilotOutput)
        }
        console.log(`pilot finished execution due to maxSteps limit of ${maxSteps} has been achived`)
        console.log(pilotReport)
        return pilotReport;
    }
}
