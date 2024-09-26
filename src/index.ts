import { Copilot } from "@/Copilot";
import {CopilotFacade, Config} from "@/types";

const copilot: CopilotFacade = {
    init: (config: Config) => {
        Copilot.init(config);
    },
    reset: () => {
        Copilot.getInstance().reset();
    },
    perform: async (...steps: string[]) => {
        const copilotInstance = Copilot.getInstance();

        let result;
        for await (const intent of steps) {
            result = await copilotInstance.performStep(intent);
        }

        return result;
    }
};

export default copilot;

export {
    CopilotFacade,
    Config,
    PromptHandler,
    TestingFrameworkDriver,
    TestingFrameworkAPICatalog,
    TestingFrameworkAPICatalogItem
} from './types';
