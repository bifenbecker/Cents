import React, {useState, useEffect} from "react";
import {Box, Flex, Image, Text} from "rebass/styled-components";
import {Elements} from "@stripe/react-stripe-js";
import {loadStripe} from "@stripe/stripe-js";

// Assets
import {RightChevronIcon, PaymentRequired} from "../../../../../../assets/images";
import {sectionStyles} from "../styles";

// Utils
import {getCreditCardBrandIcon} from "../../../../../../utils/payment";
import {STRIPE_PUBLIC_KEY} from "../../../../../../utils/config";

// Components
import PaymentMethodList from "../../../../../payment/PaymentMethodList";

const stripePromise = loadStripe(STRIPE_PUBLIC_KEY);

const Payment = props => {
  const {
    customer,
    onPaymentSelection,
    onShowNewPaymentMethod,
    showPaymentMethods,
    customerPaymentMethods,
    paymentToken,
    isLastWrapper,
    shouldAskForRecurringChoiceModal,
    showHeader = true,
  } = props;
  const [paymentMethods, setPaymentMethods] = useState(() =>
    customerPaymentMethods
      ? customerPaymentMethods
      : customer
      ? customer.paymentMethods
      : null
  );
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState({});

  useEffect(() => {
    if (customerPaymentMethods?.length && paymentToken) {
      const newState =
        customerPaymentMethods.find(pm => pm.paymentMethodToken === paymentToken) || {};

      Object.keys(newState).length && setSelectedPaymentMethod(newState);
    }
  }, [customerPaymentMethods, paymentToken]);

  const [showPaymentMethodList, setShowPaymentMethodList] = useState(
    !!showPaymentMethods
  );

  useEffect(() => {
    const pmList = customerPaymentMethods
      ? customerPaymentMethods
      : customer
      ? customer.paymentMethods
      : null;
    setPaymentMethods(pmList);
    setSelectedPaymentMethod(
      pmList?.length > 0 && paymentToken
        ? pmList.find(pm => pm.paymentMethodToken === paymentToken)
        : null
    );
  }, [customer, customerPaymentMethods, paymentToken]);

  return (
    <Box>
      {showHeader && <Box {...styles.section.header}>Payment</Box>}
      <Flex
        {...styles.section.link.wrapper}
        {...(isLastWrapper ? styles.section.link.lastWrapper : {})}
        onClick={() => {
          if (paymentMethods?.length) {
            setShowPaymentMethodList(true);
          } else {
            onShowNewPaymentMethod();
          }
        }}
      >
        <Box width="34px" mr="12px">
          <Image src={getCreditCardBrandIcon(selectedPaymentMethod?.brand)} />
        </Box>
        <Flex {...styles.section.link.dataWrapper}>
          <Box {...styles.section.link.data}>
            Payment Method
            <Text {...styles.section.link.dataSubText}>
              {selectedPaymentMethod?.last4 ? (
                `.... ${selectedPaymentMethod?.last4}`
              ) : (
                <i>Add payment method</i>
              )}
            </Text>
          </Box>
          <Flex {...styles.section.link.imagesConatiner}>
            {!selectedPaymentMethod?.last4 ? (
              <Image src={PaymentRequired} {...styles.section.link.paymentRequired} />
            ) : null}
            <Image src={RightChevronIcon} {...styles.section.link.rightChevron} />
          </Flex>
        </Flex>
      </Flex>
      <Elements stripe={stripePromise}>
        <PaymentMethodList
          isDockOpen={showPaymentMethodList}
          onClose={() => {
            setShowPaymentMethodList(!showPaymentMethodList);
          }}
          customer={customer}
          onSave={(pm, paymentMethods, choice = null) => {
            setSelectedPaymentMethod(pm);
            setPaymentMethods(paymentMethods);
            setShowPaymentMethodList(false);
            onPaymentSelection(pm.paymentMethodToken, choice);
          }}
          newOrder={true}
          paymentMethodList={paymentMethods}
          paymentMethod={selectedPaymentMethod}
          onNewPaymentMethod={() => {
            onShowNewPaymentMethod();
          }}
          shouldAskForRecurringChoiceModal={shouldAskForRecurringChoiceModal}
        />
      </Elements>
    </Box>
  );
};

const styles = {
  section: sectionStyles,
};

export default Payment;
