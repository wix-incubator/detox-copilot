import {
    PreviousStep,
} from "@/types";

export class PilotPromptCreator {
    constructor() {}

    createPrompt(
        goal: string,
        viewHierarchy: string,
        isSnapshotImageAttached: boolean,
        previousSteps: PreviousStep[]
    ): string {
        return [
            this.createBasePrompt(),
            this.createContext(goal, viewHierarchy, isSnapshotImageAttached, previousSteps),
            this.createInstructions(goal, isSnapshotImageAttached)
        ]
            .flat()
            .join('\n');
    }

    private createBasePrompt(): string[] {
        return [
            "# Next Step Generation",
            "",
            "You are an AI assistant tasked with predicting the next optimal action a user should take within an application to progress towards a specific goal.",
            "Please generate a one-line string that precisely describes the next action the user should take to move closer to their goal",
            "If you think that the goal has been reached return a one word 'success'",
            ""
        ];
    }

    private createContext(
        goal: string,
        viewHierarchy: string,
        isSnapshotImageAttached: boolean,
        previousSteps: PreviousStep[]
    ): string[] {
        let context = [
            "## Context",
            "",
            "### Intent to perform",
            "",
            `Generate a one-line string that precisely describes the next action the user should take to move closer to their goal which is: \"${goal}\"`,
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
        } else {
            context.push(
                "### Snapshot image",
                "",
                "No snapshot image is attached for this intent.",
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

   

    private createInstructions(goal: string, isSnapshotImageAttached: boolean): string[] {
        return [
            "## Instructions",
            "",
            `Your task is to generate a one-line string that precisely describes the next action the user should take to move closer to their goal: \"${goal}\"`,
            "",
            "##Please follow these steps carefully:",
            "",
            ...this.createStepByStepInstructions(isSnapshotImageAttached).map((instruction, index) => `${index + 1}. ${instruction}`),
            "",
            "### Verify the Prompt",
            "",
            "Before generating the next action, please review the provided context and instructions to ensure they are clear and unambiguous.",
            "If you encounter any issues or have questions, please throw an informative error explaining the problem in one sentence.",
            "",
            "### Example for answer formats",
            "",
            "click on login button",
            "make sure welcome message appeares",
            "scroll to settings",
            "drag the circle to its places",
            "",
            "### Example of Throwing an Informative Error:",
            "```",
            "Error: Unable to determine the next action due to insufficient information in the view hierarchy.",
            "```",
            "",
            "Please provide your response below:"
        ];
    }

    private createStepByStepInstructions(isSnapshotImageAttached: boolean): string[] {
        const steps = [
            "Analyze the provided goal, view hierarchy, and previous steps to understand the user's progress and what actions are available.",
            "Consider the elements present in the view hierarchy and, if available, the snapshot image to determine possible next actions.",
            "Determine the optimal next action that the user should take to move closer to their goal.",
            "Ensure that the action is directly related to available elements in the view hierarchy.",
            "Generate a one-line string that precisely describes this next action.",
            "The description should be clear, specific, and actionable.",
            "Do not include any additional information or explanations beyond the one-line action description.",
            "If you cannot determine the next action due to ambiguity or missing information, throw an informative error explaining the problem in one sentence."
        ];
        return steps;
    }

}
