export type OutputMapper = Record<string, string>;

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