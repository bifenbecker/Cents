import React from "react";
import {render} from "@testing-library/react";
import ErrorCard from "../../../../components/online-order/business/ErrorCard";

describe("Testing ErrorCard Component", () => {
  it("Test errorCard UI snapshot", async () => {
    expect(render(<ErrorCard />)).toMatchSnapshot();
  });
});
