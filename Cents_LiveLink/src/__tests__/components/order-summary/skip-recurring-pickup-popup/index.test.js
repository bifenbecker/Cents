import React from "react";
import {fireEvent, render, waitFor, act} from "@testing-library/react";

import SkipRecurringPickupPopup from "../../../../components/order-summary/skip-recurring-pickup-popup";

import {orderToken, orderId, timeZone} from "../../../../mocks/factories/order";
import {
  onDemandPickup,
  ownDriverPickup,
} from "../../../../mocks/factories/orderDeliveries";
import {shiftDetails} from "../../../../components/order-summary/utils";
import {
  getParsedLocalStorageData,
  getSkipRecurringPickupAcknowledgementKey,
} from "../../../../utils/common";

const toggle = jest.fn();
const onChangeTimingsClick = jest.fn();
const handleCancelOrder = jest.fn();

const renderSkipRecurringPickupPopup = props => {
  const {getByText, getByAltText, container} = render(
    <SkipRecurringPickupPopup
      {...props}
      isOpen
      orderToken={orderToken}
      orderId={orderId}
      timeZone={timeZone}
      toggle={toggle}
      onChangeTimingsClick={onChangeTimingsClick}
      handleCancelOrder={handleCancelOrder}
    />
  );

  return {getByText, getByAltText, container};
};

describe("SkipRecurringPickupPopup Component", () => {
  afterEach(() => {
    global.localStorage.clear();
  });

  describe("When deliveryProvider is OWN DRIVER", () => {
    it("should match snaphot", () => {
      const {container} = renderSkipRecurringPickupPopup({
        orderDelivery: ownDriverPickup,
      });

      expect(container).toMatchSnapshot();
    });

    it("should render van icon when the delivery provider is own driver", () => {
      const {getByAltText} = renderSkipRecurringPickupPopup({
        orderDelivery: ownDriverPickup,
      });

      const imageAltText = "Van Image";
      const icon = getByAltText(imageAltText);

      expect(icon).toBeInTheDocument();
    });
  });

  describe("When deliveryProvider is ON DEMAND", () => {
    it("should match snaphot", () => {
      const {container} = renderSkipRecurringPickupPopup({
        orderDelivery: onDemandPickup,
      });

      expect(container).toMatchSnapshot();
    });

    it("should render car icon when the delivery provider is On demand", () => {
      const {getByAltText} = renderSkipRecurringPickupPopup({
        orderDelivery: onDemandPickup,
      });

      const imageAltText = "Car Image";
      const icon = getByAltText(imageAltText);

      expect(icon).toBeInTheDocument();
    });
  });

  it("should render header text", () => {
    const {getByText} = renderSkipRecurringPickupPopup({
      orderDelivery: ownDriverPickup,
    });

    expect(getByText("Laundry Pickup Reminder")).toBeInTheDocument();
  });

  it("should render `Choose a different time` text", () => {
    const {getByText} = renderSkipRecurringPickupPopup({
      orderDelivery: ownDriverPickup,
    });

    expect(getByText("Choose a different time")).toBeInTheDocument();
  });

  it("should render selected delivery window details", () => {
    const {getByText} = renderSkipRecurringPickupPopup({
      orderDelivery: ownDriverPickup,
    });
    const shiftInfo = shiftDetails(ownDriverPickup, timeZone);

    expect(getByText("Pickup scheduled for")).toBeInTheDocument();
    expect(
      getByText(`${shiftInfo?.startTime} - ${shiftInfo?.endTime}`)
    ).toBeInTheDocument();
    expect(
      getByText(`${shiftInfo?.day}, ${shiftInfo?.month} ${shiftInfo?.date}`)
    ).toBeInTheDocument();
  });

  it("should trigger toggle when `got it` button is clicked and store that the popup is acknowledged for a day", () => {
    const {getByText} = renderSkipRecurringPickupPopup({
      orderDelivery: ownDriverPickup,
    });

    const button = getByText("got it");
    expect(button).toBeInTheDocument();

    fireEvent.click(button);

    expect(toggle).toBeCalled();

    const parsedAcknowledgementData = getParsedLocalStorageData(
      getSkipRecurringPickupAcknowledgementKey(orderId)
    );
    expect(parsedAcknowledgementData).toHaveProperty("value");
    expect(parsedAcknowledgementData.value).toEqual(orderToken);
    expect(parsedAcknowledgementData).toHaveProperty("expiry");
    expect(parsedAcknowledgementData.expiry).toBeGreaterThan(new Date().getTime());
  });

  it("should trigger handleCancelOrder with no subscription cancelation when `skip this pickup` button is clicked", () => {
    const {getByText} = renderSkipRecurringPickupPopup({
      orderDelivery: ownDriverPickup,
    });

    const button = getByText("skip this pickup");
    expect(button).toBeInTheDocument();

    fireEvent.click(button);

    expect(handleCancelOrder).toBeCalledWith(false, toggle);
  });

  it("should trigger onChangeTimingsClick when `Choose a different time` is clicked", () => {
    const {getByText} = renderSkipRecurringPickupPopup({
      orderDelivery: ownDriverPickup,
    });

    const button = getByText("Choose a different time");
    expect(button).toBeInTheDocument();
    expect(
      getParsedLocalStorageData(getSkipRecurringPickupAcknowledgementKey(orderId))
    ).toEqual({});

    fireEvent.click(button);

    expect(toggle).toBeCalled();
    const parsedAcknowledgementData = getParsedLocalStorageData(
      getSkipRecurringPickupAcknowledgementKey(orderId)
    );
    expect(parsedAcknowledgementData).toBeDefined();
    expect(onChangeTimingsClick).toBeCalled();
  });

  it("should set fontSize of scheduled details text according to window width", async () => {
    const {getByText} = renderSkipRecurringPickupPopup({
      orderDelivery: ownDriverPickup,
    });

    const shiftInfo = shiftDetails(ownDriverPickup, timeZone);
    const headerTxt = "Pickup scheduled for";
    const contentTxt = `${shiftInfo?.startTime} - ${shiftInfo?.endTime}`;

    // width < 300
    act(() => {
      global.innerWidth = 250;
      global.dispatchEvent(new Event("resize"));
    });
    await waitFor(() => expect(getByText(headerTxt)).toHaveStyle({fontSize: "16px"}));
    await waitFor(() => expect(getByText(contentTxt)).toHaveStyle({fontSize: "16px"}));

    // 300 < width <= 340
    act(() => {
      global.innerWidth = 340;
      global.dispatchEvent(new Event("resize"));
    });
    await waitFor(() => expect(getByText(headerTxt)).toHaveStyle({fontSize: "20px"}));
    await waitFor(() => expect(getByText(contentTxt)).toHaveStyle({fontSize: "20px"}));

    // width > 340
    act(() => {
      global.innerWidth = 341;
      global.dispatchEvent(new Event("resize"));
    });
    await waitFor(() => expect(getByText(headerTxt)).toHaveStyle({fontSize: "24px"}));
    await waitFor(() => expect(getByText(contentTxt)).toHaveStyle({fontSize: "24px"}));
  });

  it("should set fontSize of date and day text according to window inner width", async () => {
    const {getByText} = renderSkipRecurringPickupPopup({
      orderDelivery: ownDriverPickup,
    });

    const shiftInfo = shiftDetails(ownDriverPickup, timeZone);
    const contentTxt = `${shiftInfo?.day}, ${shiftInfo?.month} ${shiftInfo?.date}`;

    // width < 300
    act(() => {
      global.innerWidth = 250;
      global.dispatchEvent(new Event("resize"));
    });
    await waitFor(() => expect(getByText(contentTxt)).toHaveStyle({fontSize: "12px"}));

    // 300 < width <= 320
    act(() => {
      global.innerWidth = 320;
      global.dispatchEvent(new Event("resize"));
    });
    await waitFor(() => expect(getByText(contentTxt)).toHaveStyle({fontSize: "16px"}));

    // width > 340
    act(() => {
      global.innerWidth = 341;
      global.dispatchEvent(new Event("resize"));
    });
    await waitFor(() => expect(getByText(contentTxt)).toHaveStyle({fontSize: "18px"}));
  });
});
