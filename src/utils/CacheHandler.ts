import fs from 'fs';
import path from 'path';

export class CacheHandler {
    private cache: Map<string, any> = new Map();
    private temporaryCache: Map<string, any> = new Map();
    private readonly cacheFilePath: string;

    constructor(cacheFileName: string = 'detox_copilot_cache.json') {
        this.cacheFilePath = path.resolve(process.cwd(), cacheFileName);
    }

    public loadCacheFromFile(): void {
        try {
            if (fs.existsSync(this.cacheFilePath)) {
                const readFileSync = fs.readFileSync;
                const data = fs.readFileSync(this.cacheFilePath, 'utf-8');
                const json = JSON.parse(data);
                this.cache = new Map(Object.entries(json));
            } else {
                this.cache.clear(); // Ensure cache is empty if file doesn't exist
            }
        } catch (error) {
            console.warn('Error loading cache from file:', error);
            this.cache.clear(); // Clear cache on error to avoid stale data
        }
    }

    private saveCacheToFile(): void {
        try {
            const json = Object.fromEntries(this.cache);
            fs.writeFileSync(this.cacheFilePath, JSON.stringify(json, null, 2), { flag: 'w+' });
        } catch (error) {
            console.error('Error saving cache to file:', error);
        }
    }

    public getStepFromCache(key: string): any | undefined {
        return this.cache.get(key);
    }

    public addToTemporaryCache(key: string, value: any): void {
        this.temporaryCache.set(key, value);
    }

    public flushTemporaryCache(): void {
        this.temporaryCache.forEach((value, key) => {
            this.cache.set(key, value);
        });
        this.saveCacheToFile();
        this.clearTemporaryCache();
    }

    public clearTemporaryCache(): void {
        this.temporaryCache.clear();
    }
}
