import React from "react";
import {render} from "@testing-library/react";

import OnlineOrderFooter from "../../../../components/order-summary/footer/OnlineOrderFooter";
import {DELIVERY_TRACKING_ORDER_STATUSES, ORDER_TYPES} from "../../../../constants/order";
import {PAYMENT_STATUSES} from "../../../../components/order-summary/constants";

const renderOnlineOrderFooter = props => {
  const {getByText, container} = render(<OnlineOrderFooter {...props} />);

  return {getByText, container};
};

describe("OnlineOrderFooter Component", () => {
  describe("Pickup is Canceled", () => {
    const orderDetails = {
      orderType: ORDER_TYPES.online,
      pickup: {status: DELIVERY_TRACKING_ORDER_STATUSES.canceled},
      refundableAmount: 10,
    };
    it("should match snapshot", () => {
      expect(render(<OnlineOrderFooter orderDetails={orderDetails} />)).toMatchSnapshot();
    });

    it("should show how much amount is credited back", () => {
      const {getByText} = renderOnlineOrderFooter({orderDetails});

      expect(getByText("Account Credited")).toBeInTheDocument();
      expect(getByText("$10.00")).toBeInTheDocument();
    });
  });

  describe("Pickup is not CANCELED", () => {
    const orderDetails = {
      orderType: ORDER_TYPES.online,
      pickup: {status: DELIVERY_TRACKING_ORDER_STATUSES.completed},
      isIntakeComplete: false,
    };
    describe("if intake is not completed", () => {
      it("should render nothing", () => {
        const {container} = renderOnlineOrderFooter({orderDetails});
        expect(container.childElementCount).toEqual(0);
      });
    });

    describe("if intake is completed", () => {
      const orderDetails = {
        orderType: ORDER_TYPES.online,
        pickup: {status: DELIVERY_TRACKING_ORDER_STATUSES.completed},
        isIntakeComplete: true,
      };
      describe("paymentStatus is balanceDue", () => {
        it("should match snapshot", () => {
          expect(
            render(
              <OnlineOrderFooter
                orderDetails={{
                  ...orderDetails,
                  balanceDue: 10,
                  paymentStatus: PAYMENT_STATUSES.balanceDue,
                }}
              />
            )
          ).toMatchSnapshot();
        });
        it("should show balance due", () => {
          const {getByText} = renderOnlineOrderFooter({
            orderDetails: {
              ...orderDetails,
              balanceDue: 12,
              paymentStatus: PAYMENT_STATUSES.balanceDue,
            },
          });

          expect(getByText("Total Due")).toBeInTheDocument();
          expect(getByText("$12.00")).toBeInTheDocument();
        });
      });

      describe("paymentStatus is pending", () => {
        it("should match snapshot", () => {
          expect(
            render(
              <OnlineOrderFooter
                orderDetails={{
                  ...orderDetails,
                  netOrderTotal: 15,
                  paymentStatus: PAYMENT_STATUSES.pending,
                }}
              />
            )
          ).toMatchSnapshot();
        });
        it("should show balance due", () => {
          const {getByText} = renderOnlineOrderFooter({
            orderDetails: {
              ...orderDetails,
              netOrderTotal: 15,
              paymentStatus: PAYMENT_STATUSES.pending,
            },
          });

          expect(getByText("Order Total")).toBeInTheDocument();
          expect(getByText("$15.00")).toBeInTheDocument();
        });
      });

      describe("paymentStatus is paid", () => {
        it("should match snapshot", () => {
          expect(
            render(
              <OnlineOrderFooter
                orderDetails={{
                  ...orderDetails,
                  netOrderTotal: 15,
                  paymentStatus: PAYMENT_STATUSES.paid,
                }}
              />
            )
          ).toMatchSnapshot();
        });
        it("should show balance due", () => {
          const {getByText} = renderOnlineOrderFooter({
            orderDetails: {
              ...orderDetails,
              netOrderTotal: 15,
              paymentStatus: PAYMENT_STATUSES.paid,
            },
          });

          expect(getByText("Total Paid")).toBeInTheDocument();
          expect(getByText("$15.00")).toBeInTheDocument();
        });
      });
    });
  });
});
