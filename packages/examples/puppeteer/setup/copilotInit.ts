import copilot from 'detox-copilot';
import {puppeteerPageApi} from './frameworkDriver';

/**
 * Represents the Detox Copilot facade.
 */
export class DetoxCopilot {
  init(promptHandler: any): void {
    copilot.init({
      frameworkDriver: puppeteerPageApi as any,
      promptHandler: promptHandler,
    });
  }
  
  start () : void {
    copilot.start();
  }
  end () : void {
    copilot.end();
  }

  async perform(...steps: any[]): Promise<any> {
    return await copilot.perform(...steps);
  }

  async pilot(goal: any): Promise<any> {
    return await copilot.pilot(goal);
  }
}

export default DetoxCopilot;