import * as path from 'path';
import { build } from 'esbuild';

export async function bundleDriverUtils(): Promise<string> {
    try {
        const result = await build({
            entryPoints: [path.resolve(__dirname, './index.ts')],
            bundle: true,
            write: false,
            format: 'iife',
            globalName: 'driverUtils',
            platform: 'browser',
            target: 'es2015',
            minify: false,
            outfile: 'out.js',
        });

        if (!('outputFiles' in result) || !result.outputFiles?.[0]?.text) {
            throw new Error('No output generated from esbuild');
        }

        // Add a wrapper to handle default export
        const bundled = `
            (function(global) {
                ${result.outputFiles[0].text}
                // Handle ES module default export
                if (typeof driverUtils !== 'undefined' && driverUtils.default) {
                    global.driverUtils = driverUtils.default;
                }
            })(typeof window !== 'undefined' ? window : global);
        `;

        return bundled;
    } catch (error) {
        console.error('Bundling failed:', error);
        throw error;
    }
}
