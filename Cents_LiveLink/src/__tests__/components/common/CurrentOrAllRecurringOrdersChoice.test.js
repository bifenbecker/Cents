import React from "react";
import {fireEvent, render} from "@testing-library/react";

import CurrentOrAllRecurringOrdersChoice from "../../../components/common/CurrentOrAllRecurringOrdersChoice";
import {orderChoicesDisplay, orderChoices} from "../../../constants/order";

const onSubmit = jest.fn();
const toggle = jest.fn();

const renderCurrentOrAllRecurringOrdersChoice = () => {
  const {getByText, container, getByAltText} = render(
    <CurrentOrAllRecurringOrdersChoice
      {...{
        isOpen: true,
        toggle,
        header: "Some Header",
        onSubmit,
      }}
    />
  );

  return {getByText, getByAltText, container};
};

describe("CurrentOrAllRecurringOrdersChoice Component", () => {
  it("should match snaphot", () => {
    const {container} = renderCurrentOrAllRecurringOrdersChoice();

    expect(container).toMatchSnapshot();
  });

  it("should render header", () => {
    const {getByText} = renderCurrentOrAllRecurringOrdersChoice();

    expect(getByText("Some Header")).toBeInTheDocument();
  });

  it("should trigger toggle when close icon is clicked", () => {
    const {getByAltText} = renderCurrentOrAllRecurringOrdersChoice();

    const closeIcon = getByAltText("Dock Close");
    expect(closeIcon).toBeInTheDocument();

    fireEvent.click(closeIcon);

    expect(toggle).toBeCalled();
  });

  it("should call onSubmit with currentAndFutureOrders as selected choice", () => {
    const {getByText} = renderCurrentOrAllRecurringOrdersChoice();
    fireEvent.click(getByText(orderChoicesDisplay.currentAndFutureOrders));
    const button = getByText("Ok");
    fireEvent.click(button);

    expect(onSubmit).toHaveBeenCalled();
    expect(onSubmit).toHaveBeenCalledWith(orderChoices.currentAndFutureOrders);
  });

  it("should call onSubmit with currentOrder as selected choice", () => {
    const {getByText} = renderCurrentOrAllRecurringOrdersChoice();
    fireEvent.click(getByText(orderChoicesDisplay.currentOrder));
    const button = getByText("Ok");
    fireEvent.click(button);

    expect(onSubmit).toHaveBeenCalled();
    expect(onSubmit).toHaveBeenCalledWith(orderChoices.currentOrder);
  });
});
