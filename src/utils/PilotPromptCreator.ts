import { PilotPreviousStep, PilotReviewSectionType } from "@/types";

export class PilotPromptCreator {
  constructor() {}

  createPrompt(
    goal: string,
    viewHierarchy: string,
    isSnapshotImageAttached: boolean,
    previousSteps: PilotPreviousStep[],
  ): string {
    return [
      this.createBasePrompt(),
      this.createContext(
        goal,
        viewHierarchy,
        isSnapshotImageAttached,
        previousSteps,
      ),
      this.createInstructions(goal, isSnapshotImageAttached),
    ]
      .flat()
      .join("\n");
  }

  private createBasePrompt(): string[] {
    return [
      "# Next Step Generation and UX/Accessibility/Internationalization Reporting",
      "",
      "You are an AI assistant tasked with:",
      "",
      `1. Predicting the next optimal action a user should take within an application to progress towards a specific goal or to declare success.`,
      `   Please generate a one-line string that precisely describes the next action the user should take to move closer to their goal,`,
      `   and another string (which can be greater than one line) which describes your thoughts while creating the step.`,
      `   If you think that the goal has been reached return a one word action 'success'`,
      "2. Creating comprehensive UX, Accessibility, and Internationalization reports that include a review, findings, and a score.",
      "",
      "Please adhere to the instructions below to provide detailed and helpful responses.",
      "",
    ];
  }

  private createContext(
    goal: string,
    viewHierarchy: string,
    isSnapshotImageAttached: boolean,
    previousSteps: PilotPreviousStep[],
  ): string[] {
    const context = [
      "## Context",
      "",
      `### Goal: "${goal}"`,
      "",
      "### View Hierarchy",
      "",
      "```",
      `${viewHierarchy}`,
      "```",
      "",
    ];

    if (isSnapshotImageAttached) {
      context.push(
        "### Snapshot Image",
        "",
        "A snapshot image is attached for visual reference.",
        "",
      );
    } else {
      context.push(
        "### Snapshot Image",
        "",
        "No snapshot image is attached for this intent.",
        "",
      );
    }

    if (previousSteps.length > 0) {
      context.push(
        "### Previous Steps",
        "",
        ...previousSteps
          .map((previousStep, index) => {
            const stepDetails = [
              `#### Step ${index + 1}`,
              `- Screen Name : "${previousStep.screenDescription}"`,
              `- Intent: "${previousStep.step}"`,
            ];

            if (previousStep.review) {
              for (const sectionType of Object.keys(
                previousStep.review,
              ) as PilotReviewSectionType[]) {
                const sectionReview = previousStep.review[sectionType];
                if (sectionReview) {
                  stepDetails.push(
                    `- ${this.getSectionName(sectionType)} Review:`,
                    `  - Summary: ${sectionReview.summary}`,
                  );
                  if (sectionReview.findings?.length) {
                    stepDetails.push(
                      `  - Findings:`,
                      ...sectionReview.findings.map(
                        (finding) => `    - ${finding}`,
                      ),
                    );
                  }
                  stepDetails.push(`  - Score: ${sectionReview.score}`);
                }
              }
            }

            stepDetails.push("");
            return stepDetails;
          })
          .flat(),
        "",
      );
    }

    return context;
  }

  private getSectionName(sectionType: PilotReviewSectionType): string {
    switch (sectionType) {
      case "ux":
        return "UX";
      case "a11y":
        return "Accessibility";
      case "i18n":
        return "Internationalization";
      default:
        throw new Error(`Invalid review section: ${sectionType}`);
    }
  }

  private createInstructions(
    goal: string,
    isSnapshotImageAttached: boolean,
  ): string[] {
    return [
      "## Instructions",
      "",
      `Your tasks are as follows:`,
      "",
      `1. **Next Action Prediction**: Generate a one-line string that precisely describes the next action the user should take to move closer to their goal: "${goal}"`,
      "",
      `2. **Thought Process**: Provide a detailed description (which can be more than one line) of your thought process while determining the next action.`,
      "",
      `3. **Review Reports**: Create comprehensive review reports for each applicable section (e.g., UX, Accessibility, Internationalization) that include a summary, findings, and a score.`,
      "",
      "### Please follow these steps carefully:",
      "",
      ...this.createStepByStepInstructions(isSnapshotImageAttached).map(
        (instruction, index) => `${index + 1}. ${instruction}`,
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
      `<SCREENDESCRIPTION>
Registration Page.
</SCREENDESCRIPTION>
<THOUGHTS>
To complete the registration process, tapping on the 'Submit' button is necessary.
</THOUGHTS>
<ACTION>
Tap on the 'Submit' button, which has the ID 'btn_submit' and is located at the bottom of the registration form.
</ACTION>

<UX>
<SUMMARY>
The 'Submit' button (ID: btn_submit) may not be clearly visible to users, potentially hindering the registration process.
</SUMMARY>
<FINDINGS>
  - The button is positioned below multiple input fields, requiring excessive scrolling - Position the 'Submit' button prominently or make it sticky on the screen.
  - It uses a color that blends with the background - Use a contrasting color to make the button stand out.
  - The button label uses a small font size, which may be hard to read - Increase the font size of the label to improve readability.
</FINDINGS>
<SCORE>
6/10
</SCORE>
</UX>
<ACCESSIBILITY>
<SUMMARY>
The 'Submit' button (ID: btn_submit) lacks essential accessibility features.
</SUMMARY>
<FINDINGS>
  - Missing 'aria-label' or accessible name for screen readers. - Add an 'aria-label' with an appropriate description.
  - The touch target size is smaller than recommended. - Increase the touch target size to at least 44x44 pixels.
  - The contrast ratio between the text and background is insufficient. - Adjust colors to meet contrast ratio guidelines.
</FINDINGS>
<SCORE>
5/10
</SCORE>
</ACCESSIBILITY>
<INTERNATIONALIZATION>
<SUMMARY>
The 'Submit' button may not be properly localized for all supported languages.
</SUMMARY>
<FINDINGS>
  - The button text is hard-coded in English - Use localization files to support multiple languages.
  - Layout may break for languages with longer text strings - Ensure dynamic resizing or text wrapping is implemented.
  - Missing support for right-to-left languages - Adjust layout to support RTL languages where necessary.
</FINDINGS>
<SCORE>
4/10
</SCORE>
</INTERNATIONALIZATION>`,

      "",
      "#### Example of Success:",
      "",
      `<SCREENDESCRIPTION>
Goal Page Name.
</SCREENDESCRIPTION>
<THOUGHTS>
All actions required to achieve the goal have been completed successfully.
<SUMMARY>
An overall summary of the actions taken and reviews conducted during the previous steps.
</SUMMARY>
</THOUGHTS>
<ACTION>
success
</ACTION>
<UX>
<SUMMARY>
An overall UX review summary based on the previous steps' reviews.
</SUMMARY>
<FINDINGS>
  - Summary of UX findings from previous steps.
</FINDINGS>
<SCORE>
7/10 - This is an overall score for the entire flow.
</SCORE>
</UX>
<ACCESSIBILITY>
<SUMMARY>
An overall accessibility review summary based on the previous steps' reviews.
</SUMMARY>
<FINDINGS>
  - Summary of accessibility findings from previous steps.
</FINDINGS>
<SCORE>
6/10 - This is an overall score for the entire flow.
</SCORE>
</ACCESSIBILITY>
<INTERNATIONALIZATION>
<SUMMARY>
An overall internationalization review summary based on the previous steps' reviews.
</SUMMARY>
<FINDINGS>
  - Summary of internationalization findings from previous steps.
</FINDINGS>
<SCORE>
5/10 - This is an overall score for the entire flow.
</SCORE>
</INTERNATIONALIZATION>`,

      "",
      "#### Additional Example:",
      "",
      `<SCREENDESCRIPTION>
User Profile Screen.
</SCREENDESCRIPTION>
<THOUGHTS>
To view the user profile, selecting the 'Profile' icon (ID: icon_profile) is required.
</THOUGHTS>
<ACTION>
Select the 'Profile' icon (ID: icon_profile)
</ACTION>
<UX>
<SUMMARY>
The 'Profile' icon (ID: icon_profile) might not be immediately recognized by all users.
</SUMMARY>
<FINDINGS>
  - Uses an uncommon symbol instead of the standard user silhouette - Replace with the standard user silhouette icon.
  - Lacks a text label, which may confuse some users - Add a text label or tooltip that says 'Profile'.
</FINDINGS>
<SCORE>
5/10
</SCORE>
</UX>
<ACCESSIBILITY>
<SUMMARY>
The 'Profile' icon (ID: icon_profile) has accessibility issues that could affect users with disabilities.
</SUMMARY>
<FINDINGS>
  - No 'aria-label' provided for screen readers - Add an 'aria-label' with the text 'User Profile'.
  - The icon is not reachable via keyboard navigation - Ensure the icon can be focused and activated via keyboard.
</FINDINGS>
<SCORE>
4/10
</SCORE>
</ACCESSIBILITY>
<INTERNATIONALIZATION>
<SUMMARY>
The 'Profile' icon may not be properly adapted for different locales.
</SUMMARY>
<FINDINGS>
  - Iconography may not be universally recognized - Consider using culturally neutral icons.
  - No localization for the tooltip text - Ensure tooltips and labels are localized.
  - Date and time formats on the profile screen may not match user locale - Use locale-aware date and time formats.
</FINDINGS>
<SCORE>
6/10
</SCORE>
</INTERNATIONALIZATION>`,

      "",
      "#### Example of Throwing an Informative Error:",
      "",
      "```",
      "Error: Unable to determine the next action due to insufficient information in the view hierarchy.",
      "```",
      "",
      "Please provide your response below:",
    ];
  }

  private createStepByStepInstructions(
    isSnapshotImageAttached: boolean,
  ): string[] {
    const steps = [
      "Analyze the provided goal, view hierarchy, and previous steps to understand the user's progress and available actions.",
      `Consider the elements present in the view hierarchy${isSnapshotImageAttached ? " and the snapshot image" : ""} to determine possible next actions.`,
      "Determine the optimal next action the user should take to move closer to their goal.",
      "Ensure the action is directly related to available elements in the view hierarchy.",
      "Make sure to create a unique screen name enclosed with <SCREENDESCRIPTION> blocks according to the snapshot and view.",
      "Generate a one-line string that precisely describes this next action, enclosed within `<ACTION>` tags.",
      "Provide a detailed description of your thought process enclosed within `<THOUGHTS>` tags.",
      "If the goal is achieved, add a `<SUMMARY>` block inside the `<THOUGHTS>` section, summarizing the overall flow and findings. Also, provide comprehensive overall UX, Accessibility, and Internationalization reviews with total scores, given all the screens seen in previous steps, inside the respective review sections.",
      "For each applicable review section (`UX`, `Accessibility`, `Internationalization`), create a comprehensive report enclosed within corresponding tags (e.g., `<UX>`, `<ACCESSIBILITY>`, `<INTERNATIONALIZATION>`), including a summary, findings, and a score out of 10.",
      "Ensure each section is clearly labeled and formatted as shown in the examples.",
      "If you cannot determine the next action due to ambiguity or missing information, throw an informative error explaining the problem in one sentence.",
    ];
    return steps;
  }
}
