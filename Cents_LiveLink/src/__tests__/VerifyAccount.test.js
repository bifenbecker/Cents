import React from "react";
import {render} from "@testing-library/react";
import {VerifyAccount} from "../components";

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useLocation: () => ({
    pathname: "http://localhost:3000/verify-account",
  }),
}));

describe("Testing VerifyAccount Route", () => {
  it("Test verify account UI snapshot", async () => {
    expect(render(<VerifyAccount />)).toMatchSnapshot();
  });
});
