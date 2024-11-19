import React, {useMemo} from "react";

import {PAYMENT_STATUSES} from "../constants";
import {DELIVERY_TRACKING_ORDER_STATUSES} from "../../../constants/order";

import AmountInfo from "./AmountInfo";

const OnlineOrderFooter = props => {
  const {orderDetails} = props;

  const pickup = useMemo(() => orderDetails?.pickup, [orderDetails]);

  const getLabel = () => {
    return orderDetails?.paymentStatus === PAYMENT_STATUSES.pending
      ? "Order Total"
      : orderDetails?.paymentStatus === PAYMENT_STATUSES.balanceDue
      ? "Total Due"
      : "Total Paid";
  };

  switch (pickup.status) {
    case DELIVERY_TRACKING_ORDER_STATUSES.canceled:
      return (
        <AmountInfo amount={orderDetails.refundableAmount} label="Account Credited" />
      );

    case DELIVERY_TRACKING_ORDER_STATUSES.completed:
    default:
      return orderDetails.isIntakeComplete ? (
        <AmountInfo
          amount={
            orderDetails?.paymentStatus === PAYMENT_STATUSES.balanceDue
              ? orderDetails.balanceDue
              : orderDetails.netOrderTotal
          }
          label={getLabel()}
        />
      ) : null;
  }
};

export default OnlineOrderFooter;
