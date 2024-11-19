import React from "react";
import {fireEvent, render} from "@testing-library/react";

import Footer from "../../../../components/order-summary/footer";
import {
  ORDER_STATUSES,
  PAYMENT_STATUSES,
} from "../../../../components/order-summary/constants";
import {DELIVERY_TRACKING_ORDER_STATUSES, ORDER_TYPES} from "../../../../constants/order";

const renderFooter = props => {
  const {getByText, container} = render(<Footer {...props} />);

  return {getByText, container};
};

describe("Footer Component", () => {
  describe("Drawer is not open", () => {
    it("should show nothing", () => {
      const {container} = renderFooter({drawerOpen: false});
      expect(container.firstChild).toBeEmptyDOMElement();
    });
  });

  describe("Drawer is open", () => {
    describe("Order is CANCELLED", () => {
      const orderDetails = {status: ORDER_STATUSES.CANCELLED, refundableAmount: 10};
      it("should match snapshot", () => {
        expect(
          render(
            <Footer
              {...{
                drawerOpen: true,
                orderDetails,
              }}
            />
          )
        ).toMatchSnapshot();
      });

      it("should show how much amount is credited back", () => {
        const {getByText} = renderFooter({drawerOpen: true, orderDetails});

        expect(getByText("Account Credited")).toBeInTheDocument();
        expect(getByText("$10.00")).toBeInTheDocument();
      });
    });

    describe("Order is of type ONLINE", () => {
      const orderDetails = {
        orderType: ORDER_TYPES.online,
        pickup: {status: DELIVERY_TRACKING_ORDER_STATUSES.completed},
        netOrderTotal: 5,
        isIntakeComplete: true,
        paymentStatus: PAYMENT_STATUSES.paid,
      };
      it("should match snapshot", () => {
        expect(
          render(
            <Footer
              {...{
                drawerOpen: true,
                orderDetails,
              }}
            />
          )
        ).toMatchSnapshot();
      });

      it("should show OnlineOrder footer details", () => {
        const {getByText} = renderFooter({
          drawerOpen: true,
          orderDetails,
        });

        expect(getByText("Total Paid")).toBeInTheDocument();
      });
    });

    describe("Order has balanceDue", () => {
      const orderDetails = {
        status: ORDER_STATUSES.COMPLETED,
        balanceDue: 6.78,
        netOrderTotal: 12,
      };

      describe("If there is a selected paymentMethod", () => {
        const paymentMethod = {
          brand: "visa",
          centsCustomerId: 1,
          id: 1,
          last4: "4242",
          paymentMethodToken: "pm_1IqHlhGuj5YLpJjFuq3ft1tty",
          provider: "stripe",
          type: "credit",
        };
        it("should match snapshot", () => {
          expect(
            render(
              <Footer
                {...{
                  drawerOpen: true,
                  orderDetails,
                  paymentMethod,
                }}
              />
            )
          ).toMatchSnapshot();
        });

        it("should have PAY button", () => {
          const {getByText} = renderFooter({
            drawerOpen: true,
            orderDetails,
            paymentMethod,
          });

          expect(getByText("PAY $6.78")).toBeInTheDocument();
        });

        it("should call onPayForOrder on PAY button click", () => {
          const onPayForOrder = jest.fn();
          const {getByText} = renderFooter({
            drawerOpen: true,
            orderDetails,
            paymentMethod,
            onPayForOrder,
          });

          const button = getByText("PAY $6.78");
          fireEvent.click(button);

          expect(onPayForOrder).toBeCalled();
        });
      });

      describe("If there is no selected paymentMethod", () => {
        it("should match snapshot", () => {
          expect(
            render(
              <Footer
                {...{
                  drawerOpen: true,
                  orderDetails,
                }}
              />
            )
          ).toMatchSnapshot();
        });

        it("should have PAY button", () => {
          const {getByText} = renderFooter({
            drawerOpen: true,
            orderDetails,
          });

          expect(getByText("Enter card & pay $6.78")).toBeInTheDocument();
        });

        it("should call onAddPaymentMethod on PAY button click", () => {
          const onAddPaymentMethod = jest.fn();
          const {getByText} = renderFooter({
            drawerOpen: true,
            orderDetails,
            onAddPaymentMethod,
          });

          const button = getByText("Enter card & pay $6.78");
          fireEvent.click(button);

          expect(onAddPaymentMethod).toBeCalled();
        });
      });
    });

    describe("Order does not have balanceDue", () => {
      const orderDetails = {
        status: ORDER_STATUSES.COMPLETED,
        balanceDue: 0,
        netOrderTotal: 12,
      };

      it("should match snapshot", () => {
        expect(
          <Footer
            {...{
              drawerOpen: true,
              orderDetails,
            }}
          />
        ).toMatchSnapshot();
      });

      it("should show how much amount is paid", () => {
        const {getByText} = renderFooter({drawerOpen: true, orderDetails});

        expect(getByText("Total Paid")).toBeInTheDocument();
        expect(getByText("$12.00")).toBeInTheDocument();
      });
    });
  });
});
