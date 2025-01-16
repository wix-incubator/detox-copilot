import { PilotPromptCreator } from '@/utils/PilotPromptCreator';
import {PreviousStep, PromptHandler, PilotReport, PilotStepReport} from '@/types';
import {extractOutputs, OutputMapper} from '@/utils/extractOutputs'
import {StepPerformer} from '@/actions/StepPerformer';


export class PilotPerformer {

    private getPreviousSteps: () => PreviousStep[];
    constructor(
        private promptCreator: PilotPromptCreator,
        private stepPerformer: StepPerformer,
        private promptHandler: PromptHandler,
        copilotGetPreviousSteps: () => PreviousStep[],
    ) {
        this.getPreviousSteps = copilotGetPreviousSteps;
    }

    private  extractStepOutputs(text: string) : PilotStepReport {
        const outputsMapper: OutputMapper = {
            thoughts: 'THOUGHTS',
            action: 'ACTION',
        };
        const parsedResult = extractOutputs({text, outputsMapper});
        return {action : parsedResult.action, thoughts: parsedResult.thoughts}
    }

    async createStep(goal: string, previous: PreviousStep[] = []): Promise<PilotStepReport> {
        let FailureResult: any = null;
            try {
                const { snapshot, viewHierarchy, isSnapshotImageAttached } = await this.stepPerformer.captureSnapshotAndViewHierarchy();
                const prompt = this.promptCreator.createPrompt(goal, viewHierarchy, isSnapshotImageAttached, previous);
                const generatedPilotTaskDetails : string = await this.promptHandler.runPrompt(prompt, snapshot);
                const pilotOutputParsed : PilotStepReport = this.extractStepOutputs(generatedPilotTaskDetails)

                return pilotOutputParsed;
            } catch (error) {
                FailureResult = error;
                console.error('\x1b[33m%s\x1b[0m', `pilot encountered an error: ${error instanceof Error ? error.message : error}`);
            }

        throw FailureResult;
    }

    async perform(goal :string) : Promise<PilotReport> {
        let genrateNextStep = true;
        let attempts = 10;
        const pilotReport : PilotReport = {report :[]};
        while (genrateNextStep && attempts) {
            const pilotOutput : PilotStepReport = await this.createStep(goal, this.getPreviousSteps());
            pilotReport.report.push(pilotOutput);
            genrateNextStep = pilotOutput.action == 'success' ? false : true;
            if (genrateNextStep) {
              await this.stepPerformer.perform(pilotOutput.action, this.getPreviousSteps());
            }
            attempts --;
            console.log(pilotOutput)
        }
        console.log(pilotReport)
        return pilotReport;
    }
}
