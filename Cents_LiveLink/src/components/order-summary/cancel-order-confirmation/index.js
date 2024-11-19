import React from "react";
import isEmpty from "lodash/isEmpty";

import {orderChoices} from "../../../constants/order";

import CurrentOrAllRecurringOrdersChoice from "../../common/CurrentOrAllRecurringOrdersChoice";
import ConfirmCancelOrderPopup from "./ConfirmCancelOrderPopup";

const CancelOrderConfirmation = props => {
  const {isOpen, toggle, orderDetails, handleCancelOrder, loading} = props;

  const handleOrderCancellation = async cancelationChoice => {
    let isCancelSubscription;
    if (Object.values(orderChoices).includes(cancelationChoice)) {
      isCancelSubscription = cancelationChoice === orderChoices.currentAndFutureOrders;
    }
    handleCancelOrder(isCancelSubscription, toggle);
  };

  return isEmpty(orderDetails?.subscription) ||
    orderDetails?.subscription?.recurringSubscription?.deletedAt ? (
    <ConfirmCancelOrderPopup
      isOpen={isOpen}
      toggle={toggle}
      loading={loading}
      handleCancelOrder={handleOrderCancellation}
    />
  ) : (
    <CurrentOrAllRecurringOrdersChoice
      isOpen={isOpen}
      toggle={toggle}
      header="Cancel Order"
      dockProps={{loading}}
      onSubmit={handleOrderCancellation}
    />
  );
};

export default CancelOrderConfirmation;
