import {
    PilotPreviousStep,
} from "@/types";

export class PilotPromptCreator {
    constructor() {}

    createPrompt(
        goal: string,
        viewHierarchy: string,
        isSnapshotImageAttached: boolean,
        previousSteps: PilotPreviousStep[]
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
            "# Next Step Generation and UX/Accessibility Reporting",
            "",
            "You are an AI assistant tasked with:",
            "",
            `1. Predicting the next optimal action a user should take within an application to progress towards a specific goal or to declare success.",
                Please generate a one-line string that precisely describes the next action the user should take to move closer to their goal, 
                and another string (which can be greater than one line) which describes your toughts while creating the step. 
                If you think that the goal has been reached return a one word action 'success'`,
            "2. Creating comprehensive UX and accessibility reports that include a review, findings, and a score.",
            "",
            "Please adhere to the instructions below to provide detailed and helpful responses.",
            ""
        ];
    }

    private createContext(
        goal: string,
        viewHierarchy: string,
        isSnapshotImageAttached: boolean,
        previousSteps: PilotPreviousStep[]
    ): string[] {
        let context = [
            "## Context",
            "",
            `### Goal: "${goal}"`,
            "",
            "### View Hierarchy",
            "",
            "```",
            `${viewHierarchy}`,
            "```",
            ""
        ];

        if (isSnapshotImageAttached) {
            context.push(
                "### Snapshot Image",
                "",
                "A snapshot image is attached for visual reference.",
                ""
            );
        } else {
            context.push(
                "### Snapshot Image",
                "",
                "No snapshot image is attached for this intent.",
                ""
            );
        }

        if (previousSteps.length > 0) {
            context.push(
                "### Previous Steps",
                "",
                ...previousSteps.map((previousStep, index) => {
                    const stepDetails = [
                        `#### Step ${index + 1}`,
                        `- Intent: "${previousStep.step}"`,
                        `- Generated Code:`,
                        "```",
                        previousStep.code,
                        "```",
                    ];
        
                    if (previousStep.accessibilityReview) {
                        stepDetails.push(
                            `- Accessibility Review:`,
                            `  - Review: ${previousStep.accessibilityReview.review}`
                        );
        
                        if (previousStep.accessibilityReview.findings?.length) {
                            stepDetails.push(
                                `  - Findings:`,
                                ...previousStep.accessibilityReview.findings.map(finding => `    - ${finding}`)
                            );
                        }
        
                        stepDetails.push(
                            `  - Score: ${previousStep.accessibilityReview.score}`
                        );
                    }
        
                    if (previousStep.uxReview) {
                        stepDetails.push(
                            `- UX Review:`,
                            `  - Review: ${previousStep.uxReview.review}`
                        );
        
                        if (previousStep.uxReview.findings?.length) {
                            stepDetails.push(
                                `  - Findings:`,
                                ...previousStep.uxReview.findings.map(finding => `    - ${finding}`)
                            );
                        }
        
                        stepDetails.push(
                            `  - Score: ${previousStep.uxReview.score}`
                        );
                    }
        
                    stepDetails.push("");
                    return stepDetails;
                }).flat(),
                ""
            );
        }

        return context;
    }

    private createInstructions(goal: string, isSnapshotImageAttached: boolean): string[] {
        return [
            "## Instructions",
            "",
            `Your tasks are as follows:`,
            "",
            `1. **Next Action Prediction**: Generate a one-line string that precisely describes the next action the user should take to move closer to their goal: "${goal}"`,
            "",
            `2. **Thought Process**: Provide a detailed description (which can be more than one line) of your thought process while determining the next action.`,
            "",
            `3. **UX and Accessibility Report**: Create comprehensive UX and accessibility reports that include a review, findings, and a score.`,
            "",
            "### Please follow these steps carefully:",
            "",
            ...this.createStepByStepInstructions(isSnapshotImageAttached).map(
                (instruction, index) => `${index + 1}. ${instruction}`
            ),
            "",
            "### Verify the Prompt",
            "",
            "Before generating your response, please review the provided context and instructions to ensure they are clear and unambiguous.",
            "If you encounter any issues or have questions, please throw an informative error explaining the problem in one sentence.",
            "",
            "### Examples for Answer Formats",
            "",
            "#### Next Action with Thoughts:",
            "",
            `<THOUGHTS>
            To complete the registration process, tapping on the 'Submit' button (ID: btn_submit) is necessary.
            </THOUGHTS>
            <ACTION>
            Tap on the 'Submit' button (ID: btn_submit)
            </ACTION>

            <UX>
            <REVIEW>
            The 'Submit' button (ID: btn_submit) may not be clearly visible to users, potentially hindering the registration process.
            </REVIEW>
            <FINDINGS>
              The button is positioned below multiple input fields, requiring excessive scrolling - Position the 'Submit' button prominently or make it sticky on the screen.
              It uses a color that blends with the background - Use a contrasting color to make the button stand out.
              The button label uses a small font size, which may be hard to read - Increase the font size of the label to improve readability.
            </FINDINGS>
            <SCORE>
            6/10
            </SCORE>
            </UX>
            <ACCESSIBILITY>
            <REVIEW>
            The 'Submit' button (ID: btn_submit) lacks essential accessibility features.
            </REVIEW>
            <FINDINGS>
              Missing 'aria-label' or accessible name for screen readers. - Add an 'aria-label' with an appropriate description.
              The touch target size is smaller than recommended. - Increase the touch target size to at least 44x44 pixels.
              The contrast ratio between the text and background is insufficient. - Adjust colors to meet contrast ratio guidelines.
            </FINDINGS>
            <SCORE>
            5/10
            </SCORE>
            </ACCESSIBILITY>`,
            "",
            "#### Example of Success:",
            "",
            `<THOUGHTS>
            All actions required to achieve the goal have been completed successfully.
            <SUMMARY>
             overall summary of the action and reviews done given the previous steps
            </SUMMARY>
            </THOUGHTS>
            <ACTION>
            success
            </ACTION>
             <UX>
            <REVIEW>
             overall UX review sumarry given the last reviews done for the last steps
            </REVIEW>
            <FINDINGS>
              
            </FINDINGS>
            <SCORE>
            6/10  - this should be overall score for the whole flow
            </SCORE>
            </UX>
            <ACCESSIBILITY>
            <REVIEW>
            overall ACCESSIBILITY review sumarry given the last reviews done for the last steps
            </REVIEW>
            <FINDINGS>
              
            </FINDINGS>
            <SCORE>
            5/10 - this should be overall score for the whole flow
            </SCORE>
            </ACCESSIBILITY>`
            ,
            "",
            "#### Additional Example:",
            "",
            `<THOUGHTS>
            To view the user profile, selecting the 'Profile' icon (ID: icon_profile) is required.
            </THOUGHTS>
            <ACTION>
            Select the 'Profile' icon (ID: icon_profile)
            </ACTION>
            <UX>
            <REVIEW>
            The 'Profile' icon (ID: icon_profile) might not be immediately recognized by all users.
            </REVIEW>
            <FINDINGS>
              Uses an uncommon symbol instead of the standard user silhouette  - Replace with the standard user silhouette icon.
              Lacks a text label, which may confuse some users - Add a text label or tooltip that says 'Profile'.
            </FINDINGS>
            <SCORE>
            5/10
            </SCORE>
            </UX>
            <ACCESSIBILITY>
            <REVIEW>
            The 'Profile' icon (ID: icon_profile) has accessibility issues that could affect users with disabilities.
            </REVIEW>
            <FINDINGS>
              No 'aria-label' provided for screen readers - Add an 'aria-label' with the text 'User Profile'.
              The icon is not reachable via keyboard navigation - Ensure the icon can be focused and activated via keyboard.
            </FINDINGS>
            <SCORE>
            4/10
            </SCORE>
            </ACCESSIBILITY>`,
            "",
            "#### Example of Throwing an Informative Error:",
            "",
            "```",
            "Error: Unable to determine the next action due to insufficient information in the view hierarchy.",
            "```",
            "",
            "Please provide your response below:"
        ];
    }

    private createStepByStepInstructions(isSnapshotImageAttached: boolean): string[] {
        const steps = [
            "Analyze the provided goal, view hierarchy, and previous steps to understand the user's progress and available actions.",
            "Consider the elements present in the view hierarchy and, if available, the snapshot image to determine possible next actions.",
            "Determine the optimal next action the user should take to move closer to their goal.",
            "Ensure the action is directly related to available elements in the view hierarchy.",
            "Generate a one-line string that precisely describes this next action, enclosed within `<ACTION>` tags.",
            "Provide a detailed description of your thought process enclosed within `<THOUGHTS>` tags.",
            "When the goal achived add to <THOUGHTS> block a <SUMMARY> block which consits of summary of all the flow and findings, also provide comprehensive overall ux and accessibility review and total score given all the screens that have been seen in previous steps.  do this inside the <UX> and <ACCESSIBILITY> blocks as seen in the example",
            "Create a comprehensive UX report enclosed within `<UX>` tags, including a review, findings, and a score out of 10.",
            "Create a comprehensive Accessibility report enclosed within `<ACCESSIBILITY>` tags, including a review, findings, and a score out of 10.",
            "Make sure each section is clearly labeled and formatted as shown in the examples.",
            "If you cannot determine the next action due to ambiguity or missing information, throw an informative error explaining the problem in one sentence."
        ];
        return steps;
    }
}