import {
    TestingFrameworkAPICatalog,
    TestingFrameworkAPICatalogCategory,
    TestingFrameworkAPICatalogItem
} from '@/types';

export class APIFormatter {
    constructor(private apiCatalog: TestingFrameworkAPICatalog) {}

    /**
     * Formats API method
     */
    formatAPIMethod(method: TestingFrameworkAPICatalogItem): string {
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
                ...method.guidelines.map(g => `- ${g}`),
                ""
            );
        }

        return methodInfo.join('\n');
    }

    /**
     * Formats API category with its methods
     */
    formatAPICategory(category: TestingFrameworkAPICatalogCategory): string {
        return [
            `### ${category.title}`,
            "",
            ...category.items.map(item => this.formatAPIMethod(item))
        ].join('\n');
    }

    /**
     * Formats all API methods grouped by categories
     */
    formatAPIInfo(): string {
        return this.apiCatalog.categories
            .map(category => this.formatAPICategory(category))
            .join('\n');
    }
}
