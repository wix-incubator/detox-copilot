export type OutputMapper = Record<string, string>;

export const REVIEW_OUTPUTS_MAPPER: OutputMapper = { review: 'REVIEW', findings: 'FINDINGS', score: 'SCORE'};
export const STEP_OUTPUTS_MAPPER: OutputMapper = { thoughts: 'THOUGHTS', action: 'ACTION', ux: 'UX', accessibility: 'ACCESSIBILITY'};
export const SUMMARY_OUTPUTS_MAPPER: OutputMapper = { summary : 'SUMMARY' };


export const extractOutputsGivenMapper  = (text: string, outputsMapper : OutputMapper)  => extractOutputs({text, outputsMapper});

export function extractOutputs<M extends OutputMapper>(
  { text, outputsMapper }: { text: string; outputsMapper: M }
): { [K in keyof M]: string } {
  const outputs: Partial<{ [K in keyof M]: string }> = {};

  for (const fieldName in outputsMapper) {
    const tag = outputsMapper[fieldName];
    const regex = new RegExp(`<${tag}>(.*?)<\/${tag}>`, 's');
    const match = text.match(regex);
    if (match) {
      outputs[fieldName] = match[1].trim();
    } else {
      throw new Error(`Missing field for tag <${tag}>`);
    }
  }

  return outputs as { [K in keyof M]: string };
}