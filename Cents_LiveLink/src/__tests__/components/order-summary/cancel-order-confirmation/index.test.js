import React from "react";
import {fireEvent, render} from "@testing-library/react";

import CancelOrderConfirmation from "../../../../components/order-summary/cancel-order-confirmation/index";
import {orderChoicesDisplay} from "../../../../constants/order";

const renderCancelOrderConfirmation = props => {
  const {getByText, container} = render(<CancelOrderConfirmation {...props} />);

  return {getByText, container};
};

const toggle = jest.fn();
const handleCancelOrder = jest.fn();

describe("CancelOrderConfirmation component", () => {
  describe("when it's not recurring subscription", () => {
    const props = {
      orderDetails: {subscription: {}},
      isOpen: true,
      loading: false,
      toggle,
      handleCancelOrder,
    };

    it("should match snapshot", () => {
      const {container} = renderCancelOrderConfirmation(props);

      expect(container).toMatchSnapshot();
    });

    it("should render confirm cancel order popup", () => {
      const {getByText} = renderCancelOrderConfirmation(props);
      const txt = /Are you sure you want to cancel this order?/;
      expect(getByText(txt)).toBeInTheDocument();
    });

    it("should render confirm cancel order popup even if the susbscription is deleted", () => {
      const {getByText} = renderCancelOrderConfirmation({
        ...props,
        orderDetails: {
          subscription: {
            id: 10,
            recurringSubscription: {deletedAt: new Date().toISOString()},
          },
        },
      });
      const txt = /Are you sure you want to cancel this order?/;
      expect(getByText(txt)).toBeInTheDocument();
    });

    it("should call handleCancelOrder without canceling subscription option", () => {
      const {getByText} = renderCancelOrderConfirmation(props);
      const button = getByText("CONFIRM");
      fireEvent.click(button);

      expect(handleCancelOrder).toHaveBeenCalled();
      expect(handleCancelOrder).toHaveBeenCalledWith(undefined, toggle);
    });
  });

  describe("when it's recurring subscription", () => {
    const props = {
      orderDetails: {subscription: {id: 10}},
      isOpen: true,
      loading: false,
      toggle,
      handleCancelOrder,
    };

    it("should match snapshot", () => {
      const {container} = renderCancelOrderConfirmation(props);

      expect(container).toMatchSnapshot();
    });

    it("should render recurring order choices popup", () => {
      const {getByText} = renderCancelOrderConfirmation(props);
      expect(getByText(orderChoicesDisplay.currentOrder)).toBeInTheDocument();
      expect(getByText(orderChoicesDisplay.currentAndFutureOrders)).toBeInTheDocument();
    });

    it("should call handleCancelOrder along with subscription cancelation currentAndFutureOrders is selected", () => {
      const {getByText} = renderCancelOrderConfirmation(props);
      fireEvent.click(getByText(orderChoicesDisplay.currentAndFutureOrders));
      const button = getByText("Ok");
      fireEvent.click(button);

      expect(handleCancelOrder).toHaveBeenCalled();
      expect(handleCancelOrder).toHaveBeenCalledWith(true, toggle);
    });

    it("should call handleCancelOrder along with subscription cancelation currentOrder is selected", () => {
      const {getByText} = renderCancelOrderConfirmation(props);
      fireEvent.click(getByText(orderChoicesDisplay.currentOrder));
      const button = getByText("Ok");
      fireEvent.click(button);

      expect(handleCancelOrder).toHaveBeenCalled();
      expect(handleCancelOrder).toHaveBeenCalledWith(false, toggle);
    });
  });
});
