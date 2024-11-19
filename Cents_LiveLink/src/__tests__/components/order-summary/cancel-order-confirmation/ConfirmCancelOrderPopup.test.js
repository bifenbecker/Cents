import React from "react";
import {fireEvent, render} from "@testing-library/react";

import ConfirmCancelOrderPopup from "../../../../components/order-summary/cancel-order-confirmation/ConfirmCancelOrderPopup";

const renderConfirmCancelOrderPopup = props => {
  const {getByText, container} = render(<ConfirmCancelOrderPopup {...props} />);

  return {getByText, container};
};

const toggle = jest.fn();
const handleCancelOrder = jest.fn();

describe("ConfirmCancelOrderPopup Component", () => {
  it("should match snapshot", () => {
    const {container} = renderConfirmCancelOrderPopup({
      isOpen: true,
      loading: false,
      toggle,
      handleCancelOrder,
    });

    expect(container).toMatchSnapshot();
  });

  it("should call toggle function", () => {
    const {getByText} = renderConfirmCancelOrderPopup({
      isOpen: true,
      loading: false,
      toggle,
      handleCancelOrder,
    });

    const button = getByText("Cancel");
    expect(button).toBeInTheDocument();

    fireEvent.click(button);
    expect(toggle).toBeCalled();
  });

  it("should call toggle function", () => {
    const {getByText} = renderConfirmCancelOrderPopup({
      isOpen: true,
      loading: false,
      toggle,
      handleCancelOrder,
    });

    const button = getByText("Cancel");
    expect(button).toBeInTheDocument();

    fireEvent.click(button);
    expect(toggle).toBeCalled();
  });

  it("should call handleCancelOrder function", () => {
    const {getByText} = renderConfirmCancelOrderPopup({
      isOpen: true,
      loading: false,
      toggle,
      handleCancelOrder,
    });

    const button = getByText("CONFIRM");
    expect(button).toBeInTheDocument();

    fireEvent.click(button);
    expect(handleCancelOrder).toBeCalled();
  });
});
