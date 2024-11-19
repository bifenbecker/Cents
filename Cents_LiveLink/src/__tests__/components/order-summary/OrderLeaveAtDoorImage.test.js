import React from "react";
import {fireEvent, render} from "@testing-library/react";

import OrderLeaveAtDoorImage from "../../../components/order-summary/OrderLeaveAtDoorImage";

const imageUrl = "https://cdn.filestackcontent.com/u1tDDno0S1qbHRVOIm47";
const toggle = jest.fn();

const renderOrderLeaveAtDoorImagePopup = () => {
  const {getByText, container, getByAltText} = render(
    <OrderLeaveAtDoorImage
      {...{
        isOpen: true,
        toggle,
        imageUrl,
      }}
    />
  );

  return {getByText, getByAltText, container};
};

describe("DeliveryScheduledPopup Component", () => {
  it("should match snaphot", () => {
    const {container} = renderOrderLeaveAtDoorImagePopup();

    expect(container).toMatchSnapshot();
  });

  it("should render header", () => {
    const {getByText} = renderOrderLeaveAtDoorImagePopup();

    expect(getByText("Your order has been left at your door")).toBeInTheDocument();
  });

  it("should render back icon in the header bar", () => {
    const {getByAltText} = renderOrderLeaveAtDoorImagePopup();

    const imageAltText = "Dock Close";
    const icon = getByAltText(imageAltText);

    expect(icon).toBeInTheDocument();
  });

  it("should trigger toggle function when back icon is clicked", () => {
    const {getByAltText} = renderOrderLeaveAtDoorImagePopup();

    const imageAltText = "Dock Close";
    const icon = getByAltText(imageAltText);

    fireEvent.click(icon);
    expect(toggle).toBeCalled();
  });

  it("should render image taken by the driver while delivering the order", () => {
    const {getByAltText} = renderOrderLeaveAtDoorImagePopup();

    const imageAltText = "Image At The Door";
    const image = getByAltText(imageAltText);

    expect(image).toBeInTheDocument();
  });

  it("should open the image taken by driver driver in a new tab when imagee is clicked", () => {
    const {getByAltText} = renderOrderLeaveAtDoorImagePopup();
    jest.spyOn(window, "open");

    const imageAltText = "Image At The Door";
    const image = getByAltText(imageAltText);

    fireEvent.click(image);
    expect(window.open).toHaveBeenCalledWith(imageUrl, "_blank");
  });
});
