// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import "@testing-library/jest-dom/extend-expect";
import LocalStorageMock from "./mocks/local-storage-mock.js";

import {server} from "./mocks/server.js";

beforeAll(() => {
  global.localStorage = new LocalStorageMock();
  global.sessionStorage = new LocalStorageMock();
  server.listen();
});
// if you need to add a handler after calling setupServer for some specific test
// this will remove that handler for the rest of them
// (which is important for test isolation):
afterEach(() => server.resetHandlers());
afterAll(() => {
  global.localStorage.clear();
  global.sessionStorage.clear();
  server.close();
});
