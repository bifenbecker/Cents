import React from "react";
import {render, fireEvent} from "@testing-library/react";

import ReturnDeliveryConfirmationPopup from "../../../../components/common/return-delivery-confirmation-popup/index.js";

const toggle = jest.fn();
const onScheduleLaterClick = jest.fn();
const turnAroundInHours = 12;
const onScheduleNowClick = jest.fn();

const renderReturnDeliveryConfirmationPopup = () => {
  const {container, queryByText, queryByAltText} = render(
    <ReturnDeliveryConfirmationPopup
      {...{
        isOpen: true,
        toggle,
        onScheduleLaterClick,
        turnAroundInHours,
        onScheduleNowClick,
      }}
    />
  );

  return {container, queryByText, queryByAltText};
};

describe("ReturnDeliveryConfirmationPopup Component", () => {
  it("should match snapshot", () => {
    const {container} = renderReturnDeliveryConfirmationPopup();
    expect(container).toMatchSnapshot();
  });

  it("should call toggle when back button is clicked", () => {
    const {queryByAltText} = renderReturnDeliveryConfirmationPopup();
    const backImg = queryByAltText("Dock Close");
    expect(backImg).toBeInTheDocument();

    fireEvent.click(backImg);
    expect(toggle).toBeCalled();
  });

  it("should have `Text me when it's ready` section", () => {
    const {queryByText, queryByAltText} = renderReturnDeliveryConfirmationPopup();

    expect(queryByText("Text me when it's ready (est. 12 hrs)")).toBeInTheDocument();
    expect(queryByAltText("Turnaround time without hand")).toBeInTheDocument();
    expect(queryByText("Schedule Delivery Later")).toBeInTheDocument();
  });

  it("should call onScheduleLaterClick function", () => {
    const {queryByText} = renderReturnDeliveryConfirmationPopup();

    const button = queryByText("Schedule Delivery Later");
    fireEvent.click(button);

    expect(onScheduleLaterClick).toBeCalled();
  });

  it("should have `I'll schedule my return delivery now` section", () => {
    const {queryByText, queryByAltText} = renderReturnDeliveryConfirmationPopup();

    expect(queryByText("I'll schedule my return delivery now")).toBeInTheDocument();
    expect(queryByAltText("Blue Van")).toBeInTheDocument();
    expect(queryByText("Schedule Delivery Now")).toBeInTheDocument();
  });

  it("should call onScheduleNowClick function", () => {
    const {queryByText} = renderReturnDeliveryConfirmationPopup();

    const button = queryByText("Schedule Delivery Now");
    fireEvent.click(button);

    expect(onScheduleNowClick).toBeCalled();
  });
});
