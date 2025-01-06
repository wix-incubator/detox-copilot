export const bazCategory = {
    title: 'Custom Actions',
    items: [
        {
            signature: 'swipe(direction: string)',
            description: 'Swipes in the specified direction.',
            example: 'await swipe("up");',
            guidelines: ['Use this method to scroll the screen.']
        }
    ]
};

export const barCategory1 = {
    title: 'Actions',
    items: [
        {
            signature: 'tapButton(id: string)',
            description: 'Taps the button with the specified ID.',
            example: 'await tapButton("submit");',
            guidelines: ['Use this method to tap buttons.']
        }
    ]
};

export const barCategory2 = {
    title: 'Actions',
    items: [
        {
            signature: 'swipe(direction: string)',
            description: 'Swipes in the specified direction.',
            example: 'await swipe("up");',
            guidelines: ['Use this method to scroll the screen.']
        }
    ]
};

export const dummyContext = {foo: jest.fn()};
export const dummyBarContext1 = {bar: jest.fn()};
export const dummyBarContext2 = {bar: jest.fn()};
