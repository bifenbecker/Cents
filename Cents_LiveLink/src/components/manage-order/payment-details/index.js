import React from "react";
import Payment from "../../online-order/business/online-order-form/finishing-up/payment/index";
import {actionTypes} from "../reducer";

const PaymentSection = props => {
  const {
    customer,
    onShowNewPaymentMethod,
    showPaymentMethods,
    customerPaymentMethods,
    dispatch,
    paymentToken,
    hasSubscription,
  } = props;

  const onPaymentSelection = (newPaymentToken, choice) => {
    dispatch({
      type: actionTypes.UPDATE_PAYMENT_METHOD,
      payload: {
        paymentToken: newPaymentToken,
        choice,
      },
    });
  };

  return (
    <>
      <Payment
        isLastWrapper
        customer={customer}
        onPaymentSelection={onPaymentSelection}
        onShowNewPaymentMethod={onShowNewPaymentMethod}
        showPaymentMethods={showPaymentMethods}
        customerPaymentMethods={customerPaymentMethods}
        paymentToken={paymentToken}
        shouldAskForRecurringChoiceModal={hasSubscription}
      />
    </>
  );
};

export default PaymentSection;
