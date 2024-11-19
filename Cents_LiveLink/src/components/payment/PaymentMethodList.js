import React, {useState, useEffect, useCallback} from "react";
import {Box, Flex, Image, Text, Button} from "rebass/styled-components";
import {useStripe, Elements} from "@stripe/react-stripe-js";
import {loadStripe} from "@stripe/stripe-js";
import get from "lodash/get";

// Assets
import {ApplePayIcon, RightChevronIcon, GooglePayIcon} from "../../assets/images";

// Components
import {
  ToggleButton,
  FullScreenModalForm,
  DockModal,
  CurrentOrAllRecurringOrdersChoice,
} from "../common";
import AddPaymentMethod from "../payment/AddPaymentMethod";

// APIs
import {getCustomerPaymentMethods} from "../../api/customer";

// Utils
import {getCreditCardBrandIcon} from "../../utils/payment";
import {STRIPE_PUBLIC_KEY} from "../../utils/config";

// Hooks
import useRecaptchaToken from "../../hooks/useRecaptchaToken";

const stripePromise = loadStripe(STRIPE_PUBLIC_KEY);

const PaymentMethodList = props => {
  const {
    onClose,
    customer,
    paymentMethod,
    onSave,
    order,
    paymentMethodList,
    newOrder,
    onNewPaymentMethod,
    isDockOpen,
    shouldAskForRecurringChoiceModal,
  } = props;
  const stripe = useStripe();

  const [paymentRequest, setPaymentRequest] = useState(null);
  const [paymentMethods, setPaymentMethods] = useState(
    paymentMethodList ? paymentMethodList : null
  );
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(
    paymentMethod ? paymentMethod : null
  );
  const [selectedPaymentMethodToken, setSelectedPaymentMethodToken] = useState(
    paymentMethod ? paymentMethod.paymentMethodToken : null
  );
  const [showNewPaymentMethod, setShowNewPaymentMethod] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState();
  const [paymentRequestToken, setPaymentRequestToken] = useState();
  const [paymentRequestType, setPaymentRequestType] = useState();
  const ctaText = "Update payment method";
  const [showRecurringOrderChoiceModal, setShowRecurringOrderChoiceModal] = useState(
    false
  );
  const recaptchaToken = useRecaptchaToken("PaymentMethodList");

  useEffect(() => {
    setPaymentMethods(paymentMethodList ? paymentMethodList : null);
  }, [paymentMethodList]);

  useEffect(() => {
    setSelectedPaymentMethod(paymentMethod || null);
    setSelectedPaymentMethodToken(paymentMethod?.paymentMethodToken);
  }, [paymentMethod]);

  /**
   * Get the list of customer payment methods on file
   */
  const getPaymentMethods = useCallback(async () => {
    try {
      setLoading(true);
      const paymentMethodData = await getCustomerPaymentMethods(
        customer?.centsCustomerId
      );
      setPaymentMethods(paymentMethodData.data.paymentMethods);
    } catch (error) {
      setErrorMessage(get(error, "response.data.error", error.message));
      console.log(error);
    } finally {
      setLoading(false);
    }
  }, [customer?.centsCustomerId]);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (!paymentMethods) {
      getPaymentMethods();
    }
  }, [getPaymentMethods, paymentMethods]);

  useEffect(() => {
    if (stripe) {
      const totalToUse = order?.balanceDue ? order?.balanceDue : 150;
      const balanceDue = Number(totalToUse).toFixed(2);
      const stripeBalanceDue = Number(balanceDue * 100).toFixed(2);
      const finalStripeTotal = Number(stripeBalanceDue);
      const transactionLabel = order
        ? `${order.store.name} - ${order.customer.fullName}`
        : "Cents online order - PRE-AUTH ONLY";

      const pr = stripe.paymentRequest({
        country: "US",
        currency: "usd",
        total: {
          label: transactionLabel,
          amount: finalStripeTotal,
        },
        requestPayerName: true,
        requestPayerEmail: true,
      });

      // Check the availability of the Payment Request API.
      pr.canMakePayment().then(result => {
        if (result) {
          const browser = result.applePay ? "Apple Pay" : "Google Pay";
          setPaymentRequestType(browser);
          setPaymentRequest(pr);
        }
      });
    }
  }, [order, stripe]);

  /**
   * Store selected payment method information in state for an already-configured PaymentMethod
   *
   * @param {Object} paymentMethod
   */
  const selectPaymentMethod = paymentMethod => {
    setSelectedPaymentMethodToken(paymentMethod.paymentMethodToken);
    setSelectedPaymentMethod(paymentMethod);
  };

  /**
   * Format the newly saved card to fit within our API requirements
   *
   * @param {Object} paymentData
   */
  const formatNewCard = paymentData => {
    const newData = {
      paymentMethodToken: paymentData.payment.id,
      type: paymentData.payment.card.funding,
      provider: "stripe",
      centsCustomerId: customer.centsCustomerId,
      brand: paymentData.payment.card.brand,
      last4: paymentData.payment.card.last4,
    };
    const newArray = [...paymentMethods, newData];

    setSelectedPaymentMethod(newData);
    setPaymentMethods(newArray);
    setSelectedPaymentMethodToken(newData.paymentMethodToken);
  };

  /**
   * Listen for paymentRequest changes for when Apple/Google Pay card is selected
   */
  if (paymentRequest) {
    paymentRequest.on("paymentmethod", function(event) {
      const paymentData = event.paymentMethod;
      const newData = {
        paymentMethodToken: paymentData.id,
        type: paymentData.card.funding,
        provider: "stripe",
        centsCustomerId: customer.centsCustomerId,
        brand: paymentData.card.brand,
        last4: paymentData.card.last4,
      };
      setSelectedPaymentMethod(newData);
      setSelectedPaymentMethodToken(newData.paymentMethodToken);
      setPaymentRequestToken(newData.paymentMethodToken);
      event.complete("success");
    });
  }

  const submitClickHandler = () => {
    if (
      shouldAskForRecurringChoiceModal &&
      paymentMethod?.paymentMethodToken !== selectedPaymentMethodToken
    ) {
      setShowRecurringOrderChoiceModal(true);
    } else {
      onSave(selectedPaymentMethod, paymentMethods);
    }
  };

  const handleRecurringPaymentMethodUpdate = choice => {
    onSave(selectedPaymentMethod, paymentMethods, choice);
    setShowRecurringOrderChoiceModal(false);
  };

  /**
   * Render the list of payment methods
   */
  const renderPaymentMethods = () => {
    return (
      <Box
        width={["100%", "100%", "100%", "50%"]}
        m={newOrder ? "" : "auto"}
        px={"10px"}
        overflow={"scroll"}
        height={"100%"}
      >
        {paymentMethods?.length
          ? paymentMethods.map(method => (
              <ToggleButton
                key={method.paymentMethodToken}
                {...styles.button.wrapper}
                fontFamily={
                  selectedPaymentMethodToken === method.paymentMethodToken
                    ? "Roboto Bold"
                    : "Roboto Regular"
                }
                onChange={() => {
                  selectPaymentMethod(method);
                }}
                checked={selectedPaymentMethodToken === method.paymentMethodToken}
              >
                <Flex {...styles.button.content.wrapper}>
                  <Image
                    src={getCreditCardBrandIcon(method.brand)}
                    pr={"13px"}
                    width={"48px"}
                  />
                  <Text variant="blackText">•••• {method.last4}</Text>
                  {method.notSaved && (
                    <Text {...styles.italicText}> (only saved for this order)</Text>
                  )}
                </Flex>
              </ToggleButton>
            ))
          : null}
        {paymentRequest && (
          <ToggleButton
            {...styles.button.wrapper}
            checked={selectedPaymentMethodToken === paymentRequestToken}
            fontFamily={
              selectedPaymentMethodToken === paymentRequestToken
                ? "Roboto Bold"
                : "Roboto Regular"
            }
            onChange={() => {
              paymentRequest.show();
            }}
          >
            <Flex {...styles.button.content.wrapper}>
              <Image
                src={paymentRequestType === "Apple Pay" ? ApplePayIcon : GooglePayIcon}
                {...styles.button.content.image}
              />
              <Text variant="blackText">{paymentRequestType}</Text>
            </Flex>
          </ToggleButton>
        )}
        <ToggleButton
          {...styles.button.wrapper}
          {...styles.newCardButton.wrapper}
          onClick={() => {
            onNewPaymentMethod();
          }}
        >
          <Flex
            {...styles.button.content.wrapper}
            {...styles.newCardButton.content.wrapper}
          >
            <Text variant="blackText">Use a different card</Text>
            <Image src={RightChevronIcon} />
          </Flex>
        </ToggleButton>
      </Box>
    );
  };

  /**
   * If the parent component is from the new order/online order form, render inside the Dock
   */
  const renderNewOrderView = () => {
    return (
      <DockModal
        header="Payment Method"
        isOpen={isDockOpen}
        toggle={onClose}
        loading={loading}
      >
        <Flex {...styles.paymentMethodsBody}>
          {renderPaymentMethods()}
          <Flex {...styles.footer.wrapper}>
            <Button
              variant="primary"
              {...styles.footer.button}
              {...styles.ctaButtonText}
              disabled={!selectedPaymentMethod || !selectedPaymentMethodToken}
              onClick={() => {
                if (!recaptchaToken)
                  return setErrorMessage(
                    "Recaptcha verification failed. Please exit and try again."
                  );
                submitClickHandler();
              }}
            >
              {ctaText}
            </Button>
          </Flex>
          {errorMessage && <Text variant="errorMessage">{errorMessage}</Text>}
        </Flex>
      </DockModal>
    );
  };

  /**
   * If the parent component is not from the new order/online order form, render inside FullScreen
   */
  const renderExistingOrderView = () => {
    return (
      <>
        {!showNewPaymentMethod && (
          <FullScreenModalForm
            header="Payment Method"
            onClose={onClose}
            btnLabel={ctaText}
            loading={loading}
            onSubmit={() => {
              if (!recaptchaToken)
                return setErrorMessage(
                  "Recaptcha verification failed. Please exit and try again."
                );
              submitClickHandler();
            }}
            footerBtnStyles={styles.ctaButtonText}
          >
            {renderPaymentMethods()}
            {errorMessage && <Text variant="errorMessage">{errorMessage}</Text>}
          </FullScreenModalForm>
        )}
        {showNewPaymentMethod && (
          <Elements stripe={stripePromise}>
            <AddPaymentMethod
              goBack={() => {
                window.scrollTo(0, 0);
                setShowNewPaymentMethod(false);
              }}
              onSave={paymentInfo => {
                formatNewCard(paymentInfo);
                setShowNewPaymentMethod(false);
              }}
            />
          </Elements>
        )}
      </>
    );
  };

  return (
    <>
      {newOrder ? renderNewOrderView() : renderExistingOrderView()}
      <CurrentOrAllRecurringOrdersChoice
        isOpen={showRecurringOrderChoiceModal}
        toggle={() => setShowRecurringOrderChoiceModal(false)}
        header="Edit Payment Method"
        onSubmit={handleRecurringPaymentMethodUpdate}
      />
    </>
  );
};

const styles = {
  button: {
    wrapper: {
      width: "100%",
      fontFamily: "Roboto Regular",
      height: ["3rem", "3.5rem"],
      mb: "20px",
    },
    content: {
      wrapper: {
        alignItems: "center",
      },
      image: {
        width: "36px",
        mr: "13px",
      },
    },
  },
  newCardButton: {
    wrapper: {
      sx: {border: "1px dashed black"},
    },
    content: {
      wrapper: {
        justifyContent: "space-between",
      },
    },
  },
  ctaButtonText: {
    sx: {
      textTransform: "uppercase",
    },
    fontSize: 16,
  },
  footer: {
    wrapper: {
      mt: "auto",
      height: "4rem",
      px: "2rem",
      alignItems: "center",
      justifyContent: "center",
      mb: "2rem",
      width: "100%",
    },
    button: {
      width: ["100%", "100%", "100%", "50%"],
      height: ["3.5rem", "4rem"],
      fontSize: [3, 4],
    },
  },
  paymentMethodsBody: {
    sx: {
      alignItems: "center",
      justifyContent: "space-between",
      flexDirection: "column",
      height: "85%",
    },
  },
  italicText: {
    sx: {
      fontStyle: "italic",
      fontSize: "12px",
      color: "TEXT_LIGHT_GREY",
      fontWeight: 500,
    },
    pl: "6px",
  },
};

export default PaymentMethodList;
