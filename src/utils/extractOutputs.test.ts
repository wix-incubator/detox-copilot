import {extractOutputs} from "./extractOutputs";
import {OutputMapper} from "./extractOutputs";

describe('extractOutputs', () => {
    it('should extract outputs from text', () => {
        const text = `
        These are my thoughts:
        <THOUGHTS>
        I think this is great
        </THOUGHTS>
        This is the action the copilot should perform:
         <ACTION>
         Tap on GREAT button
        </ACTION>`;
        const outputsMapper: OutputMapper = {THOUGHTS: 'thoughts', ACTION: 'action'};
        const outputs = extractOutputs({text, outputsMapper});
        expect(outputs).toEqual({thoughts: "I think this is great", action: 'Tap on GREAT button'});
    });

    it('should extract outputs from text with multiple tags', () => {
        const text = `
        These are my thoughts:
        <THOUGHTS>
        I think this is great
        </THOUGHTS>
        This is the action the copilot should perform:
         <ACTION>
         Tap on GREAT button
        </ACTION>
        <ACTION>
         Tap on WOW button
        </ACTION>`;
        const outputsMapper: OutputMapper = {THOUGHTS: 'thoughts', ACTION: 'action'};
        const outputs = extractOutputs({text, outputsMapper});
        expect(outputs).toEqual({thoughts: "I think this is great", action: 'Tap on GREAT button'});
    });
});
