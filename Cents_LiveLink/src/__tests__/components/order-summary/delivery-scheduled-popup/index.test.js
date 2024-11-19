import React from "react";
import {fireEvent, render, waitFor} from "@testing-library/react";
import {act} from "react-dom/test-utils";

import DeliveryScheduledPopup from "../../../../components/order-summary/delivery-scheduled-popup";

import {
  ownDriverDelivery,
  onDemandDelivery,
} from "../../../../mocks/factories/orderDeliveries";
import {orderToken, orderId, timeZone} from "../../../../mocks/factories/order";
import {shiftDetails} from "../../../../components/order-summary/utils";
import {
  getDeliveryAcknowledgementKey,
  getParsedLocalStorageData,
} from "../../../../utils/common";

const onShowDeliveryOptionsClick = jest.fn();
const toggle = jest.fn();

const renderDeliveryScheduledPopup = props => {
  const {getByText, container, getByAltText, getByRole} = render(
    <DeliveryScheduledPopup
      {...{
        isOpen: true,
        toggle,
        onShowDeliveryOptionsClick,
        orderToken,
        orderId,
        orderDelivery: props.orderDelivery,
        timeZone,
      }}
    />
  );

  return {getByText, getByAltText, getByRole, container};
};

describe("DeliveryScheduledPopup Component", () => {
  describe("When deliveryProvider is OWN DRIVER", () => {
    it("should match snaphot", () => {
      const {container} = renderDeliveryScheduledPopup({
        orderDelivery: ownDriverDelivery,
      });

      expect(container).toMatchSnapshot();
    });

    it("should render van icon when the delivery provider is own driver", () => {
      const {getByAltText} = renderDeliveryScheduledPopup({
        orderDelivery: ownDriverDelivery,
      });

      const imageAltText = "Van Image";
      const icon = getByAltText(imageAltText);

      expect(icon).toBeInTheDocument();
    });
  });

  describe("When deliveryProvider is ON DEMAND", () => {
    it("should match snaphot", () => {
      const {container} = renderDeliveryScheduledPopup({
        orderDelivery: onDemandDelivery,
      });

      expect(container).toMatchSnapshot();
    });

    it("should render car icon when the delivery provider is On demand", () => {
      const {getByAltText} = renderDeliveryScheduledPopup({
        orderDelivery: onDemandDelivery,
      });

      const imageAltText = "Car Image";
      const icon = getByAltText(imageAltText);

      expect(icon).toBeInTheDocument();
    });
  });

  it("should render header text", () => {
    const {getByText} = renderDeliveryScheduledPopup({
      orderDelivery: ownDriverDelivery,
    });

    expect(getByText("Your laundry is ready!")).toBeInTheDocument();
  });

  it("should render see my delivery options text", () => {
    const {getByText} = renderDeliveryScheduledPopup({
      orderDelivery: ownDriverDelivery,
    });

    expect(getByText("See my delivery options")).toBeInTheDocument();
  });

  it("should render selected delivery window details", () => {
    const {getByText} = renderDeliveryScheduledPopup({
      orderDelivery: ownDriverDelivery,
    });
    const shiftInfo = shiftDetails(ownDriverDelivery, timeZone);

    expect(getByText("Delivery scheduled for")).toBeInTheDocument();
    expect(
      getByText(`${shiftInfo?.startTime} - ${shiftInfo?.endTime}`)
    ).toBeInTheDocument();
    expect(
      getByText(`${shiftInfo?.day}, ${shiftInfo?.month} ${shiftInfo?.date}`)
    ).toBeInTheDocument();
  });

  it("should trigger toggle with  when got it button is clicked", () => {
    const {getByText} = renderDeliveryScheduledPopup({
      orderDelivery: ownDriverDelivery,
    });

    const button = getByText("got it");
    fireEvent.click(button);

    expect(toggle).toBeCalled();

    const parsedAcknowledgementData = getParsedLocalStorageData(
      getDeliveryAcknowledgementKey(orderId)
    );
    expect(parsedAcknowledgementData).toHaveProperty("value");
    expect(parsedAcknowledgementData.value).toEqual(orderToken);
    expect(parsedAcknowledgementData).toHaveProperty("expiry");
    expect(parsedAcknowledgementData.expiry).toBeGreaterThan(new Date().getTime());
  });

  it("should call onShowDeliveryOptionsClick with currentOrder as selected choice", () => {
    const {getByText} = renderDeliveryScheduledPopup({
      orderDelivery: ownDriverDelivery,
    });
    fireEvent.click(getByText("See my delivery options"));

    expect(onShowDeliveryOptionsClick).toHaveBeenCalled();
  });

  it("should set fontSize of scheduled details text according to window width", async () => {
    const {getByText} = renderDeliveryScheduledPopup({
      orderDelivery: ownDriverDelivery,
    });

    const shiftInfo = shiftDetails(ownDriverDelivery, timeZone);
    const headerTxt = "Delivery scheduled for";
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
    const {getByText} = renderDeliveryScheduledPopup({
      orderDelivery: ownDriverDelivery,
    });

    const shiftInfo = shiftDetails(ownDriverDelivery, timeZone);
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
