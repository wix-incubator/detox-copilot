import {PilotStepCreator} from '@/actions/PilotStepCreator';
import {PilotPromptCreator} from '@/utils/PilotPromptCreator';
import {SnapshotManager} from '@/utils/SnapshotManager';
import {PromptHandler} from '@/types';
import * as crypto from 'crypto';

jest.mock('fs');
jest.mock('crypto');

const GOAL = 'tap button';
const VIEW_HIERARCHY = '<view></view>';
const PROMPT_RESULT = `
        These are my thoughts:
        <THOUGHTS>
        I think this is great
        </THOUGHTS>
        This is the action the copilot should perform:
         <ACTION>
         Tap on GREAT button
        </ACTION>
        <ACTION>
         Tap on WOW button
        </ACTION>`;
const CODE_EVALUATION_RESULT = 'success';
const SNAPSHOT_DATA = 'snapshot_data';
const VIEW_HIERARCHY_HASH = 'hash';



describe('StepPerformer', () => {
    let stepPerformer: PilotStepCreator;
    let mockContext: jest.Mocked<any>;
    let mockPromptCreator: jest.Mocked<PilotPromptCreator>;
    let mockSnapshotManager: jest.Mocked<SnapshotManager>;
    let mockPromptHandler: jest.Mocked<PromptHandler>;

    beforeEach(() => {
        jest.resetAllMocks();

       
        mockContext = {} as jest.Mocked<any>;

        // Create mock instances of dependencies
        mockPromptCreator = {
            createPrompt: jest.fn(),
            createBasePrompt: jest.fn(),
            createContext: jest.fn(),
            createAPIInfo: jest.fn(),
        } as unknown as jest.Mocked<PilotPromptCreator>;


        mockSnapshotManager = {
            captureSnapshotImage: jest.fn(),
            captureViewHierarchyString: jest.fn(),
        } as unknown as jest.Mocked<SnapshotManager>;

        mockPromptHandler = {
            runPrompt: jest.fn(),
            isSnapshotImageSupported: jest.fn(),
        } as jest.Mocked<PromptHandler>;

       
        

        stepPerformer = new PilotStepCreator(
            mockPromptCreator,
            mockSnapshotManager,
            mockPromptHandler,
        );
    });

    interface SetupMockOptions {
        isSnapshotSupported?: boolean;
        snapshotData?: string | null;
        viewHierarchy?: string;
        promptResult?: any;
    }

    const setupMocks = ({
                            isSnapshotSupported = true,
                            snapshotData = SNAPSHOT_DATA,
                            viewHierarchy = VIEW_HIERARCHY,
                            promptResult  = PROMPT_RESULT,
                        }: SetupMockOptions = {}) => {
        mockPromptHandler.isSnapshotImageSupported.mockReturnValue(isSnapshotSupported);
        mockSnapshotManager.captureSnapshotImage.mockResolvedValue(
            snapshotData != null ? snapshotData : undefined,
        );
        mockSnapshotManager.captureViewHierarchyString.mockResolvedValue(viewHierarchy);
        mockPromptCreator.createPrompt.mockReturnValue('generated prompt');
        mockPromptHandler.runPrompt.mockResolvedValue(promptResult);
        const viewHierarchyHash = 'hash';
        (crypto.createHash as jest.Mock).mockReturnValue({
            update: jest.fn().mockReturnValue({
                digest: jest.fn().mockReturnValue(viewHierarchyHash),
            }),
        });

    };

    it('should perform an intent successfully with snapshot image support', async () => {
        setupMocks();

        const result = await stepPerformer.createStep(GOAL);

        expect(result).toEqual({thoughts: "I think this is great", action: 'Tap on GREAT button'});
        expect(mockPromptCreator.createPrompt).toHaveBeenCalledWith(
            GOAL,
            VIEW_HIERARCHY,
            true,
            [],
        );
        expect(mockPromptHandler.runPrompt).toHaveBeenCalledWith('generated prompt', SNAPSHOT_DATA);
  
    });

    it('should perform an intent successfully without snapshot image support', async () => {
        setupMocks({isSnapshotSupported: false});

        const result = await stepPerformer.createStep(GOAL);

        expect(result).toEqual({thoughts: "I think this is great", action: 'Tap on GREAT button'});
        expect(mockPromptCreator.createPrompt).toHaveBeenCalledWith(
            GOAL,
            VIEW_HIERARCHY,
            false,
            [],
        );
        expect(mockPromptHandler.runPrompt).toHaveBeenCalledWith('generated prompt', undefined);
    
    });

    it('should perform an intent with undefined snapshot', async () => {
        setupMocks({snapshotData: null});

        const result = await stepPerformer.createStep(GOAL);

        expect(result).toEqual({thoughts: "I think this is great", action: 'Tap on GREAT button'});
        expect(mockPromptCreator.createPrompt).toHaveBeenCalledWith(
            GOAL,
            VIEW_HIERARCHY,
            false,
            [],
        );
        expect(mockPromptHandler.runPrompt).toHaveBeenCalledWith('generated prompt', undefined);
    });

    it('should perform an intent successfully with previous intents', async () => {
        const intent = 'current intent';
        const previousIntents = [{
            step: 'previous intent',
            code: 'previous code',
            result: 'previous result',
        }];

        setupMocks();

        const thisCacheKey = JSON.stringify({
            step: intent,
            previous: previousIntents,
            viewHierarchyHash: VIEW_HIERARCHY_HASH
        });
        const result = await stepPerformer.createStep(intent, previousIntents);

        expect(result).toEqual({thoughts: "I think this is great", action: 'Tap on GREAT button'});
        expect(mockPromptCreator.createPrompt).toHaveBeenCalledWith(
            intent,
            VIEW_HIERARCHY,
            true,
            previousIntents,
        );
        expect(mockPromptHandler.runPrompt).toHaveBeenCalledWith('generated prompt', SNAPSHOT_DATA);
    });

});
