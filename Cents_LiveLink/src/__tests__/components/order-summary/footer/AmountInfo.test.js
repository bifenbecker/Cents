import React from "react";
import {render} from "@testing-library/react";

import AmountInfo from "../../../../components/order-summary/footer/AmountInfo";

const renderAmountInfo = props => {
  const {getByText} = render(<AmountInfo {...props} />);

  return {getByText};
};

describe("AmountInfo Component", () => {
  it("should match snapshot", () => {
    expect(render(<AmountInfo label="Total Paid" amount={10} />)).toMatchSnapshot();
  });

  it("should convert the amount to dollars while displaying", () => {
    const {getByText} = renderAmountInfo({label: "Total Paid", amount: 10.3});

    expect(getByText("$10.30")).toBeInTheDocument();
  });
});
