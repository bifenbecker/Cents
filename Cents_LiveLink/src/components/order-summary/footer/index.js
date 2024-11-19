import React, {useMemo} from "react";
import {Flex, Button} from "rebass/styled-components";

import {toDollars} from "../utils";
import {ORDER_STATUSES, ORDER_TYPES} from "../constants";

import OnlineOrderFooter from "./OnlineOrderFooter";
import AmountInfo from "./AmountInfo";

const Footer = props => {
  const {
    orderDetails,
    drawerOpen,
    paymentMethod,
    onAddPaymentMethod,
    onPayForOrder,
    toggleStoreInfo,
  } = props;

  const isOnlineOrder = orderDetails?.orderType === ORDER_TYPES.online;

  const checkoutLabel = useMemo(() => {
    const cardOnFile = paymentMethod ? true : false;

    return cardOnFile ? "PAY" : "Enter card & pay";
  }, [paymentMethod]);

  /**
   * Determines the proper view and parent function to run
   *
   * 1) if the drawer is not open, we return the function to open the order drawer;
   * 2) if card on file/payment method selected, we return a function that processes the payment;
   * 3) if not, we return a function that displays the AddPaymentMethod component where customer adds payment method.
   *
   */
  const onCheckoutClick = () => {
    return paymentMethod ? onPayForOrder() : onAddPaymentMethod();
  };

  return (
    <Flex {...styles.wrapper}>
      {drawerOpen ? (
        orderDetails.status === ORDER_STATUSES.CANCELLED ? (
          <AmountInfo amount={orderDetails.refundableAmount} label="Account Credited" />
        ) : isOnlineOrder ? (
          <OnlineOrderFooter
            orderDetails={orderDetails}
            toggleStoreInfo={toggleStoreInfo}
          />
        ) : Number(orderDetails.balanceDue) > 0 ? (
          <Flex {...styles.buttonWrapper}>
            <Button
              variant="primary"
              {...styles.checkoutBtn}
              onClick={e => onCheckoutClick(e)}
            >
              {checkoutLabel} {toDollars(orderDetails.balanceDue)}
            </Button>
          </Flex>
        ) : (
          <AmountInfo amount={orderDetails.netOrderTotal} label="Total Paid" />
        )
      ) : null}
    </Flex>
  );
};

const styles = {
  wrapper: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "column",
    padding: "0 18px",
    mt: "5px",
  },
  buttonWrapper: {
    width: ["100%", "100%", "100%", "50%"],
    height: "100%",
    alignItems: "center",
  },
  checkoutBtn: {
    width: "100%",
    fontSize: "1.25rem",
    py: "1rem",
    height: "56px",
  },
  poweredByCents: {
    fontFamily: "Roboto Bold",
    width: "100%",
    color: "TEXT_GREY",
    textAlign: "center",
    py: ["0.6rem", "0.75rem"],
    fontSize: "0.75rem",
  },
};

export default Footer;
