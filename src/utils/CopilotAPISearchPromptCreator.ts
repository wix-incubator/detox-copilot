import {TestingFrameworkAPICatalog} from '@/types';
import {APIFormatter} from '@/utils/APIFormatter';

export class CopilotAPISearchPromptCreator {
    private apiFormatter: APIFormatter;

    constructor(private apiCatalog: TestingFrameworkAPICatalog) {
        this.apiFormatter = new APIFormatter(apiCatalog);
    }

    createPrompt(step: string, viewAnalysisResult?: string): string {
        return [
            "# API Method Search",
            "",
            "## Task Description",
            "",
            `Find API methods and categories that semantically match this task: "${step}"`,
            "",
            ...(viewAnalysisResult ? [
                "## View Analysis Context",
                "",
                viewAnalysisResult,
                ""
            ] : []),
            "## Search Context",
            "The following results are based on semantic similarity to your task. They represent potential matches that should be carefully evaluated, not necessarily the optimal or recommended solutions.",
            "",
            "## Available API Methods",
            "",
            this.apiFormatter.formatAPIInfo(),
            "",
            "## Instructions",
            "",
            "1. Analyze the semantic patterns in the task:",
            "   - Key terms and actions",
            "   - Object and state descriptions",
            "   - Expected behaviors and outcomes",
            "",
            "2. Review semantic matches found:",
            "   - Evaluate similarity scores",
            "   - Consider partial matches",
            "   - Note contextual relevance",
            "",
            "3. For each semantic match, assess:",
            "   - Match confidence level",
            "   - Contextual applicability",
            "   - Potential limitations",
            "",
            "Please provide your response in the following format:",
            "",
            "```",
            "Semantic Category Matches:",
            "1. [Category Name]",
            "   - Match Confidence: [High/Medium/Low - Why this category semantically matches]",
            "   - Context Notes: [Important contextual considerations]",
            "   - Limitations: [Where the semantic match might not translate to practical use]",
            "",
            "Semantic API Matches:",
            "1. methodName(params)",
            "   - Match Confidence: [High/Medium/Low - Explain the semantic similarity]",
            "   - Context Notes: [How the semantic match relates to actual usage]",
            "   - Limitations: [Potential gaps between semantic match and practical application]",
            "```",
            "",
            "Search Evaluation:",
            "- Consider that semantic matches may not be optimal solutions",
            "- Evaluate practical applicability beyond semantic similarity",
            "- Look for gaps between semantic matches and actual requirements",
            "- Consider alternative approaches if semantic matches are weak",
            "",
            "Additional Context:",
            "- Note the confidence level of semantic matches",
            "- Highlight where semantic similarity might be misleading",
            "- Suggest verification steps before accepting matches",
            "",
        ].join('\n');
    }
}
