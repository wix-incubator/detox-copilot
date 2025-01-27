const originalConsole = { ...console };
import logger from "@/utils/logger";

beforeAll(() => {
  console.log = jest.fn();
  console.info = jest.fn();
  console.warn = jest.fn();
  console.error = jest.fn();
  console.debug = jest.fn();
  process.stdout.write = jest.fn();
  process.stderr.write = jest.fn();
  jest.spyOn(logger, "writeLogsToFile").mockImplementation(() => {});
});

afterAll(() => {
  console.log = originalConsole.log;
  console.info = originalConsole.info;
  console.warn = originalConsole.warn;
  console.error = originalConsole.error;
  console.debug = originalConsole.debug;
});
