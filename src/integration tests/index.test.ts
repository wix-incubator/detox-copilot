import copilot from "@/index";
import { Copilot } from "@/Copilot";
import { PromptHandler, TestingFrameworkDriver } from "@/types";
import fs from 'fs';
import path from 'path';

jest.mock('fs');
jest.mock('path');

describe('Copilot Integration Tests', () => {
    let mockFrameworkDriver: jest.Mocked<TestingFrameworkDriver>;
    let mockPromptHandler: jest.Mocked<PromptHandler>;
    let mockFs: jest.Mocked<typeof fs>;
    let mockPath: jest.Mocked<typeof path>;

    beforeEach(() => {
        jest.clearAllMocks();

        mockFrameworkDriver = {
            captureSnapshotImage: jest.fn().mockResolvedValue('mock_snapshot'),
            captureViewHierarchyString: jest.fn().mockResolvedValue('<view><button>Login</button></view>'),
            apiCatalog: {
                context: {},
                categories: []
            }
        };

        mockPromptHandler = {
            runPrompt: jest.fn(),
            isSnapshotImageSupported: jest.fn().mockReturnValue(true)
        };

        mockFs = fs as jest.Mocked<typeof fs>;
        mockPath = path as jest.Mocked<typeof path>;

        mockFs.existsSync.mockReturnValue(false);
        mockFs.readFileSync.mockReturnValue('{}');
        mockFs.writeFileSync.mockImplementation(() => {});
        mockPath.resolve.mockImplementation((...paths) => paths.join('/'));
    });

    afterEach(() => {
        Copilot['instance'] = undefined;
    });

    describe('Initialization', () => {
        it('should throw an error when perform is called before initialization', async () => {
            await expect(() => copilot.perform('Some action')).rejects.toThrow();
        });

        it('should initialize successfully', () => {
            expect(() => copilot.init({
                frameworkDriver: mockFrameworkDriver,
                promptHandler: mockPromptHandler
            })).not.toThrow();
        });
    });

    describe('Single Step Operations', () => {
        beforeEach(() => {
            copilot.init({
                frameworkDriver: mockFrameworkDriver,
                promptHandler: mockPromptHandler
            });
        });

        it('should successfully perform an action', async () => {
            mockPromptHandler.runPrompt.mockResolvedValue('// No operation');

            await expect(copilot.perform('Tap on the login button')).resolves.not.toThrow();

            expect(mockFrameworkDriver.captureSnapshotImage).toHaveBeenCalled();
            expect(mockFrameworkDriver.captureViewHierarchyString).toHaveBeenCalled();
            expect(mockPromptHandler.runPrompt).toHaveBeenCalledWith(
                expect.stringContaining('Tap on the login button'),
                'mock_snapshot'
            );
        });

        it('should successfully perform an assertion', async () => {
            mockPromptHandler.runPrompt.mockResolvedValue('// No operation');

            await expect(copilot.perform('The welcome message should be visible')).resolves.not.toThrow();

            expect(mockFrameworkDriver.captureSnapshotImage).toHaveBeenCalled();
            expect(mockFrameworkDriver.captureViewHierarchyString).toHaveBeenCalled();
            expect(mockPromptHandler.runPrompt).toHaveBeenCalledWith(
                expect.stringContaining('The welcome message should be visible'),
                'mock_snapshot'
            );
        });

        it('should handle errors during action execution', async () => {
            mockPromptHandler.runPrompt.mockResolvedValue('throw new Error("Element not found");');

            await expect(copilot.perform('Tap on a non-existent button')).rejects.toThrow('Element not found');
        });

        it('should handle errors during assertion execution', async () => {
            mockPromptHandler.runPrompt.mockResolvedValue('throw new Error("Element not found");');

            await expect(copilot.perform('The welcome message should be visible')).rejects.toThrow('Element not found');
        });

        it('should handle errors during code evaluation', async () => {
            mockPromptHandler.runPrompt.mockResolvedValue('foobar');

            await expect(copilot.perform('The welcome message should be visible')).rejects.toThrow(/foobar is not defined/);
        });
    });

    describe('Multiple Step Operations', () => {
        beforeEach(() => {
            copilot.init({
                frameworkDriver: mockFrameworkDriver,
                promptHandler: mockPromptHandler
            });
        });

        it('should perform multiple steps using spread operator', async () => {
            mockPromptHandler.runPrompt
                .mockResolvedValueOnce('// Tap login button')
                .mockResolvedValueOnce('// Enter username')
                .mockResolvedValueOnce('// Enter password');

            const results = await copilot.perform(
                'Tap on the login button',
                'Enter username "testuser"',
                'Enter password "password123"'
            );

            expect(results).toHaveLength(3);
            expect(mockPromptHandler.runPrompt).toHaveBeenCalledTimes(3);
            expect(mockFrameworkDriver.captureSnapshotImage).toHaveBeenCalledTimes(3);
            expect(mockFrameworkDriver.captureViewHierarchyString).toHaveBeenCalledTimes(3);
        });

        it('should handle errors in multiple steps and stop execution', async () => {
            mockPromptHandler.runPrompt
                .mockResolvedValueOnce('// Tap login button')
                .mockResolvedValueOnce('throw new Error("Username field not found");')
                .mockResolvedValueOnce('throw new Error("Username field not found - second");')
                .mockResolvedValueOnce('// Enter password');

            await expect(copilot.perform(
                'Tap on the login button',
                'Enter username "testuser"',
                'Enter password "password123"'
            )).rejects.toThrow('Username field not found');

            expect(mockPromptHandler.runPrompt).toHaveBeenCalledTimes(3);
            expect(mockFrameworkDriver.captureSnapshotImage).toHaveBeenCalledTimes(2);
            expect(mockFrameworkDriver.captureViewHierarchyString).toHaveBeenCalledTimes(2);
        });
    });

    describe('Error Handling', () => {
        beforeEach(() => {
            copilot.init({
                frameworkDriver: mockFrameworkDriver,
                promptHandler: mockPromptHandler
            });
        });

        it('should throw error when PromptHandler fails', async () => {
            mockPromptHandler.runPrompt.mockRejectedValue(new Error('API error'));

            await expect(copilot.perform('Perform action')).rejects.toThrow('API error');
        });

        it('should throw error when captureSnapshotImage() fails', async () => {
            mockFrameworkDriver.captureSnapshotImage.mockRejectedValue(new Error('Snapshot error'));

            await expect(copilot.perform('Perform action')).rejects.toThrow('Snapshot error');
        });

        it('should throw error when captureViewHierarchyString() fails', async () => {
            mockFrameworkDriver.captureViewHierarchyString.mockRejectedValue(new Error('Hierarchy error'));

            await expect(copilot.perform('Perform action')).rejects.toThrow('Hierarchy error');
        });
    });

    describe('Context Management', () => {
        beforeEach(() => {
            copilot.init({
                frameworkDriver: mockFrameworkDriver,
                promptHandler: mockPromptHandler
            });
        });

        it('should reset context when reset is called', async () => {
            mockPromptHandler.runPrompt.mockResolvedValueOnce('// Login action');
            await copilot.perform('Log in to the application');

            copilot.reset();

            mockPromptHandler.runPrompt.mockResolvedValueOnce('// New action after reset');
            await copilot.perform('Perform action after reset');

            expect(mockPromptHandler.runPrompt).toHaveBeenCalledTimes(2);
            expect(mockPromptHandler.runPrompt.mock.calls[1][0]).not.toContain('Log in to the application');
        });

        it('should clear conversation history on reset', async () => {
            mockPromptHandler.runPrompt
                .mockResolvedValueOnce('// Action 1')
                .mockResolvedValueOnce('// Action 2');

            await copilot.perform('Action 1');
            await copilot.perform('Action 2');

            const lastCallArgsBeforeReset = mockPromptHandler.runPrompt.mock.calls[1][0];
            expect(lastCallArgsBeforeReset).toContain('Action 1');
            expect(lastCallArgsBeforeReset).toContain('Action 2');

            copilot.reset();

            mockPromptHandler.runPrompt.mockResolvedValueOnce('// New action');
            await copilot.perform('New action after reset');

            const lastCallArgsAfterReset = mockPromptHandler.runPrompt.mock.calls[2][0];
            expect(lastCallArgsAfterReset).not.toContain('Action 1');
            expect(lastCallArgsAfterReset).not.toContain('Action 2');
            expect(lastCallArgsAfterReset).toContain('New action after reset');
        });
    });

    describe('Caching Behavior', () => {
        beforeEach(() => {
            copilot.init({
                frameworkDriver: mockFrameworkDriver,
                promptHandler: mockPromptHandler
            });
        });

        it('should create cache file if it does not exist', async () => {
            mockFs.existsSync.mockReturnValue(false);
            mockPromptHandler.runPrompt.mockResolvedValue('// Perform action');

            await copilot.perform('Perform action');

            expect(mockFs.writeFileSync).toHaveBeenCalled();
        });

        it('should read from existing cache file', async () => {
            mockFs.existsSync.mockReturnValue(true);
            mockFs.readFileSync.mockReturnValue(JSON.stringify({
                '{"step":"Cached action","previous":[]}': '// Cached action code'
            }));

            await copilot.perform('Cached action');

            expect(mockFs.readFileSync).toHaveBeenCalled();
            expect(mockPromptHandler.runPrompt).not.toHaveBeenCalled();
        });

        it('should update cache file after performing new action', async () => {
            mockPromptHandler.runPrompt.mockResolvedValue('// New action code');

            await copilot.perform('New action');

            expect(mockFs.writeFileSync).toHaveBeenCalledWith(
                expect.any(String),
                expect.stringContaining('New action'),
                expect.any(Object)
            );
        });

        it('should handle fs.readFileSync errors', async () => {
            mockFs.existsSync.mockReturnValue(true);
            mockFs.readFileSync.mockImplementation(() => { throw new Error('Read error'); });
            mockPromptHandler.runPrompt.mockResolvedValue('// New action code');

            await copilot.perform('Action with read error');

            expect(mockPromptHandler.runPrompt).toHaveBeenCalled();
        });

        it('should handle fs.writeFileSync errors', async () => {
            mockFs.writeFileSync.mockImplementation(() => { throw new Error('Write error'); });
            mockPromptHandler.runPrompt.mockResolvedValue('// Action code');

            await expect(copilot.perform('Action with write error')).resolves.not.toThrow();
        });
    });

    describe('Feature Support', () => {
        beforeEach(() => {
            copilot.init({
                frameworkDriver: mockFrameworkDriver,
                promptHandler: mockPromptHandler
            });
        });

        it('should work without snapshot images when not supported', async () => {
            mockPromptHandler.isSnapshotImageSupported.mockReturnValue(false);
            mockPromptHandler.runPrompt.mockResolvedValue('// Perform action without snapshot');

            await copilot.perform('Perform action without snapshot support');

            expect(mockFrameworkDriver.captureSnapshotImage).not.toHaveBeenCalled();
            expect(mockFrameworkDriver.captureViewHierarchyString).toHaveBeenCalled();
            expect(mockPromptHandler.runPrompt).toHaveBeenCalledWith(
                expect.stringContaining('Perform action without snapshot support'),
                undefined
            );
        });
    });
});
