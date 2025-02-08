import { Pilot } from "@/Pilot";
import {
  CopilotFacade,
  Config,
  TestingFrameworkAPICatalogCategory,
} from "@/types";

const copilot: CopilotFacade = {
  init: (config: Config) => {
    Pilot.init(config);
  },
  isInitialized: () => {
    return Pilot.isInitialized();
  },
  start: () => {
    Pilot.getInstance().start();
  },
  end: (isCacheDisabled?: boolean) => {
    Pilot.getInstance().end(isCacheDisabled);
  },
  perform: async (...steps: string[]) => {
    const copilotInstance = Pilot.getInstance();

    let result;
    for await (const intent of steps) {
      result = await copilotInstance.performStep(intent);
    }

    return result;
  },

  pilot: async (goal: string) => {
    return await Pilot.getInstance().pilot(goal);
  },

  extendAPICatalog: (
    categories: TestingFrameworkAPICatalogCategory[],
    context?: any,
  ) => {
    Pilot.getInstance().extendAPICatalog(categories, context);
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
