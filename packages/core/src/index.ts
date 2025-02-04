import { Copilot } from "@/Copilot";
import {
  CopilotFacade,
  Config,
  TestingFrameworkAPICatalogCategory,
} from "@/types";

const copilot: CopilotFacade = {
  init: (config: Config) => {
    Copilot.init(config);
  },
  isInitialized: () => {
    return Copilot.isInitialized();
  },
  start: () => {
    Copilot.getInstance().start();
  },
  end: (isCacheDisabled?: boolean) => {
    Copilot.getInstance().end(isCacheDisabled);
  },
  perform: async (...steps: string[]) => {
    const copilotInstance = Copilot.getInstance();

    let result;
    for await (const intent of steps) {
      result = await copilotInstance.performStep(intent);
    }

    return result;
  },

  pilot: async (goal: string) => {
    return await Copilot.getInstance().pilot(goal);
  },

  extendAPICatalog: (
    categories: TestingFrameworkAPICatalogCategory[],
    context?: any,
  ) => {
    Copilot.getInstance().extendAPICatalog(categories, context);
  },
};

export default copilot;

export {
  CopilotFacade,
  Config,
  PromptHandler,
  TestingFrameworkDriver,
  TestingFrameworkAPICatalog,
  TestingFrameworkAPICatalogItem,
} from "./types";
