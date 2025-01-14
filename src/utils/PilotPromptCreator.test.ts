import { PilotPromptCreator } from './PilotPromptCreator';
import {
    PreviousStep,
} from "@/types";


describe('PilotPromptCreator', () => {
    let promptCreator: PilotPromptCreator;

    beforeEach(() => {
        promptCreator = new PilotPromptCreator();
    });

    it('should create a prompt for an intent correctly', () => {
        const intent = 'tap button';
        const viewHierarchy = '<View><Button testID="submit" title="Submit" /></View>';
        const prompt = promptCreator.createPrompt(intent, viewHierarchy, true, []);
        expect(prompt).toMatchSnapshot();
    });

    it('should include previous intents in the context', () => {
        const intent = 'tap button';
        const previousSteps: PreviousStep[] = [
            {
                step: 'navigate to login screen',
                code: 'await element(by.id("login")).tap();',
                result: undefined
            },
            {
                step: 'enter username',
                code: 'await element(by.id("username")).typeText("john_doe");',
                result: undefined
            }
        ];

        const viewHierarchy = '<View><Button testID="submit" title="Submit" /></View>';

        const prompt = promptCreator.createPrompt(intent, viewHierarchy, false, previousSteps);

        expect(prompt).toMatchSnapshot();
    });

    it('should handle when no snapshot image is attached', () => {
        const intent = 'expect button to be visible';
        const viewHierarchy = '<View><Button testID="submit" title="Submit" /></View>';

        const prompt = promptCreator.createPrompt(intent, viewHierarchy, false, []);

        expect(prompt).toMatchSnapshot();
    });
});
