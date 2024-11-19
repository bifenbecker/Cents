import {useState, useEffect} from "react";
import {Flex, Text, Button, Heading} from "rebass/styled-components";
import {PaymentMethod} from "@stripe/stripe-js";

import Payment from "components/online-order/business/online-order-form/finishing-up/payment";
import {addNewCard, saveCardToState} from "utils/payment";
import {ICustomer, IPaymentMethods} from "types/customer";
import {DockModal, Loader} from "components/common";

import TogglePrice from "../togglePrice";
import {IAddCredit} from "../../types";

import styles from "./styles";
import StripeElements from "./StripeElements";

const DEFAULT_AMOUNT = 30;

interface IChooseAmountProps {
  customer: ICustomer | null;
  storeId: number | null;
  sendAmount: (data: IAddCredit) => void;
  showModal: boolean;
  toggleShowModal: (status: boolean) => void;
}

export interface PaymentDataType {
  payment: PaymentMethod;
  rememberPaymentMethod: boolean;
}

const ChooseAmount = ({
  sendAmount,
  showModal,
  toggleShowModal,
  customer,
  storeId,
}: IChooseAmountProps) => {
  const [amountState, setAmountState] = useState(DEFAULT_AMOUNT);
  const [customerPaymentMethods, setCustomerPaymentMethods] = useState(
    customer?.paymentMethods ?? []
  );
  const [paymentMethodTokenState, setPaymentMethodTokenState] = useState("");
  const [showNewPaymentMethod, setShowNewPaymentMethod] = useState(false);
  const [showPaymentMethodList, setShowPaymentMethodList] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (customer?.paymentMethods?.length) {
      setCustomerPaymentMethods(customer.paymentMethods);
      setPaymentMethodTokenState(customer.paymentMethods[0].paymentMethodToken);
    }
  }, [customer?.paymentMethods]);

  const sendAmountCredit = () => {
    if (amountState && storeId) {
      sendAmount({
        credits: amountState,
        paymentMethodToken: paymentMethodTokenState,
        storeId,
      });
      setAmountState(DEFAULT_AMOUNT);
      toggleShowModal(!showModal);
    }
  };

  const onPaymentSave = (paymentInfo: PaymentDataType) => {
    if (paymentInfo.rememberPaymentMethod) {
      setLoading(true);
      addNewCard(
        paymentInfo,
        customer?.addresses[0],
        customer?.id,
        (response: IPaymentMethods[]) => {
          setCustomerPaymentMethods(response);
          setPaymentMethodTokenState(paymentInfo.payment.id);
          setShowPaymentMethodList(true);
          setShowNewPaymentMethod(false);
          setLoading(false);
        },
        () => {
          setShowNewPaymentMethod(false);
          setLoading(false);
        }
      );
    } else {
      saveCardToState(
        paymentInfo,
        customer?.id,
        customerPaymentMethods,
        (paymentMethods: IPaymentMethods[]) => {
          setPaymentMethodTokenState(paymentInfo.payment.id);
          setCustomerPaymentMethods(paymentMethods);
          setShowPaymentMethodList(true);
          setShowNewPaymentMethod(false);
        }
      );
    }
  };

  const onPaymentCancel = () => {
    window.scrollTo(0, 0);
    setShowNewPaymentMethod(false);
    setShowPaymentMethodList(true);
  };

  return (
    <>
      <DockModal
        header="Add Funds"
        isOpen={showModal}
        toggle={() => {
          toggleShowModal(!showModal);
        }}
      >
        <Flex sx={styles.wrapperModal}>
          <Flex sx={styles.wrapperContent}>
            <Heading sx={styles.heading}>Choose amount</Heading>
            <Text sx={styles.normalText}>
              How much would you like to add to your credit balance? You can use your
              credit balance to pay for self-serve or full service laundry or
              over-the-counter items.
            </Text>
            <TogglePrice amount={amountState} setAmount={setAmountState} />
          </Flex>
          <Flex sx={styles.wrapperBottom}>
            <Payment
              isLastWrapper
              showHeader={false}
              customer={customerPaymentMethods[0]}
              onShowNewPaymentMethod={() => setShowNewPaymentMethod(true)}
              customerPaymentMethods={customerPaymentMethods}
              showPaymentMethods={showPaymentMethodList}
              onPaymentSelection={setPaymentMethodTokenState}
              paymentToken={paymentMethodTokenState}
            />
            <StripeElements
              showNewPaymentMethod={showNewPaymentMethod}
              onPaymentSave={onPaymentSave}
              onPaymentCancel={onPaymentCancel}
            />
            <Button
              disabled={!amountState}
              onClick={sendAmountCredit}
              sx={styles.saveButton}
            >
              ADD {amountState && `$${amountState}`}
            </Button>
          </Flex>
        </Flex>
      </DockModal>
      {loading && <Loader />}
    </>
  );
};

export default ChooseAmount;
