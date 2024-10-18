export function extractCodeBlock(text: string): string {
    const regex = /```(?:\w*\s)?([\s\S]*?)```/;
    const match = text.match(regex);

    return (match ? match[1] : text).trim();
}
