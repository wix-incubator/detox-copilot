import {
    PreviousStep,
    TestingFrameworkAPICatalog,
    TestingFrameworkAPICatalogCategory,
    TestingFrameworkAPICatalogItem
} from "@/types";

export class PromptCreator {
    constructor(private apiCatalog: TestingFrameworkAPICatalog) {}

    createPrompt(
        intent: string,
        viewHierarchy: string,
        isSnapshotImageAttached: boolean,
        previousSteps: PreviousStep[]
    ): string {
        return [
            this.createBasePrompt(),
            this.createContext(intent, viewHierarchy, isSnapshotImageAttached, previousSteps),
            this.createAPIInfo(),
            this.createInstructions(intent, isSnapshotImageAttached)
        ]
            .flat()
            .join('\n');
    }

    private createBasePrompt(): string[] {
        return [
            "# Test Code Generation",
            "",
            "You are an AI assistant tasked with generating test code for an application using the provided UI testing framework API.",
            "Please generate the minimal executable code to perform the desired intent based on the given information and context.",
            ""
        ];
    }

    private createContext(
        intent: string,
        viewHierarchy: string,
        isSnapshotImageAttached: boolean,
        previousSteps: PreviousStep[]
    ): string[] {
        let context = [
            "## Context",
            "",
            "### Intent to perform",
            "",
            `Generate the minimal executable code to perform the following intent: \"${intent}\"`,
            "",
            "### View hierarchy",
            "",
            "```",
            `${viewHierarchy}`,
            "```",
            ""
        ];

        if (isSnapshotImageAttached) {
            context.push(
                "### Snapshot image",
                "",
                "A snapshot image is attached for visual reference.",
                ""
            );
        }

        if (previousSteps.length > 0) {
            context.push(
                "### Previous intents",
                "",
                ...previousSteps.map((previousStep, index) => [
                    `#### Step ${index + 1}`,
                    `- Intent: \"${previousStep.step}\"`,
                    `- Generated code:`,
                    "```",
                    previousStep.code,
                    "```",
                    ""
                ]).flat(),
                ""
            );
        }

        return context;
    }

    private createAPIInfo(): string[] {
        return [
            "## Available Testing Framework API",
            ""
        ].concat(
            this.apiCatalog.categories
                .map((category) => this.formatAPICategory(category))
                .flat()
        );
    }

    private formatAPICategory(category: TestingFrameworkAPICatalogCategory): string[] {
        return [
            `### ${category.title}`,
            "",
            ...category.items.map((item) => this.formatAPIMethod(item)).flat()
        ];
    }

    private formatAPIMethod(method: TestingFrameworkAPICatalogItem): string[] {
        const methodInfo = [
            `#### ${method.signature}`,
            "",
            method.description,
            "",
            "##### Example",
            "",
            "```",
            method.example,
            "```",
            ""
        ];

        if (method.guidelines && method.guidelines.length > 0) {
            methodInfo.push(
                "##### Guidelines",
                "",
                ...method.guidelines.map((guideline) => `- ${guideline}`),
                ""
            );
        }

        return methodInfo;
    }

    private createInstructions(intent: string, isSnapshotImageAttached: boolean): string[] {
        return [
            "## Instructions",
            "",
            `Your task is to generate the minimal executable code to perform the following intent: \"${intent}\"`,
            "",
            "Please follow these steps carefully:",
            "",
            ...this.createStepByStepInstructions(isSnapshotImageAttached).map((instruction, index) => `${index + 1}. ${instruction}`),
            "",
            "### Examples",
            "",
            "#### Example of throwing an informative error:",
            "```typescript",
            'throw new Error("Unable to find the \'Submit\' button element in the current context.");',
            "```",
            ""
        ].concat(
            isSnapshotImageAttached
                ? [
                    "#### Example of returning a commented visual test if the visual assertion passes:",
                    "```typescript",
                    "// Visual assertion passed based on the snapshot image.",
                    "```",
                    ""
                ]
                : []
        ).concat([
            "Please provide your response below:"
        ]);
    }

    private createStepByStepInstructions(isSnapshotImageAttached: boolean): string[] {
        const steps = [];
        if (isSnapshotImageAttached) {
            steps.push(
                "Analyze the provided intent, the view hierarchy, and the snapshot image to understand the required action.",
                "Determine if the intent can be fully validated visually using the snapshot image.",
                "If the intent can be visually analyzed and passes the visual check, return only comments explaining the successful visual assertion.",
                "If the visual assertion fails, return code that throws an informative error explaining the failure.",
                "If visual validation is not possible, proceed to generate the minimal executable code required to perform the intent."
            );
        } else {
            steps.push(
                "Analyze the provided intent and the view hierarchy to understand the required action.",
                "Generate the minimal executable code required to perform the intent using the available API."
            );
        }
        steps.push(
            "If you cannot generate the relevant code due to ambiguity or invalid intent, return code that throws an informative error explaining the problem in one sentence.",
            "Wrap the generated code with backticks, without any additional formatting.",
            "Do not provide any additional code beyond the minimal executable code required to perform the intent."
        );
        return steps;
    }
}
