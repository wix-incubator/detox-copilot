import { configureToMatchImageSnapshot } from 'jest-image-snapshot';

const toMatchImageSnapshot = configureToMatchImageSnapshot({
    customDiffConfig: { threshold: 0.1 },
    noColors: true
});

expect.extend({ toMatchImageSnapshot });
