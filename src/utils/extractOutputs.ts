export type OutputMapper = {[key:string]: string};

export function extractOutputs({text, outputsMapper}: {text:string, outputsMapper: OutputMapper}): {[tag:string]: string} {
    let outputs : { [key: string]: string } = {};
    Object.entries(outputsMapper).forEach(([tag, value]) => {
        const regex = new RegExp(`<${tag}>(.*?)<\/${tag}>`, 's');
        const match = text.match(regex);
        if (match) {
            outputs[value] = match[1].trim();
        }
    });
    return outputs;
}

