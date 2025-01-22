export type OutputMapper = Record<string, string>;

export namespace OUTPUT_MAPPERS {
    export enum REVIEW {
      summary = 'SUMMARY',
      findings = 'FINDINGS',
      score = 'SCORE',
    }
  
    export enum STEP {
      thoughts = 'THOUGHTS',
      action = 'ACTION',
      ux = 'UX',
      a11y = 'ACCESSIBILITY',
    }
  
    export enum SUMMARY {
      summary = 'SUMMARY',
    }
}

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