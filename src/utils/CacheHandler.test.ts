import * as fs from 'fs';
import * as path from 'path';
import { CacheHandler } from './CacheHandler';
jest.mock('fs');

const CACHE_FILE_NAME = 'test_cache.json';
const CACHE_FILE_PATH = path.resolve(process.cwd(), CACHE_FILE_NAME);

describe('CacheHandler', () => {
    let cacheHandler: CacheHandler;

    beforeEach(() => {
        jest.resetAllMocks();
        cacheHandler = new CacheHandler(CACHE_FILE_NAME);
    });

    it('should load cache from file successfully if the file exists and is valid', () => {
        const cacheData = { 'cacheKey': 'value' };
        (fs.existsSync as jest.Mock).mockReturnValue(true);
        (fs.readFileSync as jest.Mock).mockReturnValueOnce(JSON.stringify(cacheData));

        cacheHandler.loadCacheFromFile();

        expect (fs.existsSync as jest.Mock).toHaveBeenCalledWith(CACHE_FILE_PATH);
        expect (fs.readFileSync as jest.Mock).toHaveBeenCalledWith(CACHE_FILE_PATH, 'utf-8');
        expect(cacheHandler['cache'].get('cacheKey')).toBe('value');
    });

    it('should save cache to file successfully', () => {
        const cacheData = { 'cacheKey': 'value' };
        cacheHandler['cache'] = new Map(Object.entries(cacheData));
        const writeFileSyncMock = (fs.writeFileSync as jest.Mock).mockImplementation(() => {});

        cacheHandler.saveCacheToFile();

        expect(writeFileSyncMock).toHaveBeenCalledWith(
            cacheHandler['cacheFilePath'],
            JSON.stringify(cacheData, null, 2),
            { flag: 'w+' }
        );
    });

    describe('addToTemporaryCache', () => {
        it('should add a value to the temporary cache using addToTemporaryCache', () => {
            cacheHandler.addToTemporaryCache('some_key', 'some_value');

            expect(cacheHandler['temporaryCache'].get('some_key')).toBe('some_value');
        });

        it('should update an existing value in the temporary cache using addToTemporaryCache', () => {
            cacheHandler.addToTemporaryCache('some_key', 'initial_value');
            cacheHandler.addToTemporaryCache('some_key', 'updated_value');

            // Use `get` to isolate the tests of the getSthFromCache method
            expect(cacheHandler['temporaryCache'].get('some_key')).toBe('updated_value');
        });
    });

    describe('getStepFromCache', () => {
        it('should retrieve a value from cache using getStepFromCache', () => {
            cacheHandler['cache'].set('some_key', 'value');  // Directly manipulating internal cache for testing

            const result = cacheHandler.getStepFromCache('some_key');

            expect(result).toBe('value');
        });

        it('should return undefined if the key does not exist in cache', () => {
            const result = cacheHandler.getStepFromCache('non_existent_key');

            expect(result).toBeUndefined();
        });
    });

    describe('flushTemporaryCache', () => {
        it('should move all temporary cache entries to the main cache', () => {
            cacheHandler.addToTemporaryCache('some_key', 'value');
        });
    });

});
