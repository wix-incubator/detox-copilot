export type Output = {
  tag: string;
  isRequired: boolean;
};

export type OutputsMapping = Record<string, Output>;

export const OUTPUTS_MAPPINGS: Record<string, OutputsMapping> = {
  PILOT_REVIEW_SECTION: {
    summary: { tag: "SUMMARY", isRequired: false },
    findings: { tag: "FINDINGS", isRequired: false },
    score: { tag: "SCORE", isRequired: false },
  },
  PILOT_STEP: {
    screenDescription: { tag: "SCREENDESCRIPTION", isRequired: true },
    thoughts: { tag: "THOUGHTS", isRequired: true },
    action: { tag: "ACTION", isRequired: true },
    ux: { tag: "UX", isRequired: false },
    a11y: { tag: "ACCESSIBILITY", isRequired: false },
    i18n: { tag: "INTERNATIONALIZATION", isRequired: false },
  },
  PILOT_SUMMARY: {
    summary: { tag: "SUMMARY", isRequired: true },
  },
};

export function extractTaggedOutputs<M extends OutputsMapping>({
  text,
  outputsMapper,
}: {
  text: string;
  outputsMapper: M;
}): { [K in keyof M]: string } {
  const outputs: Partial<{ [K in keyof M]: string }> = {};

  for (const fieldName in outputsMapper) {
    const tag = outputsMapper[fieldName].tag;
    const regex = new RegExp(`<${tag}>(.*?)</${tag}>`, "s");
    const match = text.match(regex);
    if (match) {
      outputs[fieldName] = match[1].trim();
    } else if (!outputsMapper[fieldName].isRequired) {
      outputs[fieldName] = "N/A";
    } else {
      throw new Error(`Missing field for required tag <${tag}>`);
    }
  }

  return outputs as { [K in keyof M]: string };
}
