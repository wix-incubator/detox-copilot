export type OutputsMapping = Record<string, string>;

export namespace OUTPUTS_MAPPINGS {
    export enum PILOT_REVIEW_SECTION {
      summary = 'SUMMARY',
      findings = 'FINDINGS',
      score = 'SCORE',
    }
  
    export enum PILOT_STEP {
      thoughts = 'THOUGHTS',
      action = 'ACTION',
      ux = 'UX',
      a11y = 'ACCESSIBILITY',
    }
  
    export enum PILOT_SUMMARY {
      summary = 'SUMMARY',
    }
}

export function extractOutputs<M extends OutputsMapping>(
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