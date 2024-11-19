import React, {useState} from "react";
import {Flex, Text, Image, Button} from "rebass/styled-components";
import {
  useStripe,
  useElements,
  CardNumberElement,
  CardCvcElement,
  CardExpiryElement,
} from "@stripe/react-stripe-js";
import Switch from "@material-ui/core/Switch";

// Assets
import {
  IconBack,
  CentsBlueSmall,
  CreditCardIcon,
  CvcIcon,
  ExpiryIcon,
  RememberMeIcon,
} from "../../assets/images";
import {DockModal, Loader} from "../common";

// Hooks
import useRecaptchaToken from "../../hooks/useRecaptchaToken";

const AddPaymentMethod = (props) => {
  const {isDockModal, goBack, isOpen} = props;
  const stripe = useStripe();
  const elements = useElements();

  const options = {
    style: {
      base: {
        fontSize: "16px",
        color: "#424770",
        letterSpacing: "0.025em",
        "::placeholder": {
          color: "#aab7c4",
        },
      },
      invalid: {
        color: "#9e2146",
      },
    },
  };
  const [rememberMeChecked, setRememberMeChecked] = useState(true);
  const [paymentTokenError, setPaymentTokenError] = useState();
  const [loading, setLoading] = useState(false);
  const recaptchaToken = useRecaptchaToken("AddPaymentMethod");

  /**
   * Reset the token errors when changed
   */
  const resetErrorMessage = () => {
    setPaymentTokenError(null);
  };

  /**
   * Convert card element data into a Stripe PaymentMethod
   */
  const capturePaymentToken = async () => {
    if (!stripe || !elements) {
      // Stripe.js has not loaded yet. Make sure to disable
      // form submission until Stripe.js has loaded.
      return;
    }

    if (!recaptchaToken) {
      return setPaymentTokenError(
        "You are not authorized to perform this action. Please log out and try again."
      );
    }

    try {
      setLoading(true);

      const cardElement = elements.getElement(CardNumberElement);
      const payload = await stripe.createPaymentMethod({
        type: "card",
        card: cardElement,
      });

      if (payload.error) {
        setLoading(false);
        return setPaymentTokenError(payload.error.message);
      }

      const returnData = {
        payment: payload.paymentMethod,
        rememberPaymentMethod: rememberMeChecked,
      };

      props.onSave(returnData);
    } catch (error) {
      setPaymentTokenError(
        error?.response?.data?.error || "Something went wrong while saving the card"
      );
      setLoading(false);
    }
  };

  const renderHeader = () => {
    return (
      <Flex {...styles.headerRowContainer}>
        <Flex {...styles.headerColumnContainer}>
          <Image {...styles.svgImage} onClick={goBack} src={IconBack} />
          <Text {...styles.headerRowText}>Payment</Text>
        </Flex>
      </Flex>
    );
  };

  const renderPaymentHeader = () => {
    return (
      <Flex {...styles.paymentHeaderContainer}>
        <Image {...styles.roundedCornerIcon} src={CentsBlueSmall} />
        <Text {...styles.paymentHeaderText}>Powered by Cents</Text>
        <Text {...styles.paymentSubheaderText}>Full Service Laundry</Text>
      </Flex>
    );
  };

  const renderPaymentMethodForm = () => {
    return (
      <Flex {...styles.paymentFormContainer}>
        <Flex {...styles.paymentFormRow}>
          <Flex {...styles.paymentFormRowLabel}>
            <Image src={CreditCardIcon} {...styles.formIcon} />
            <Text {...styles.paymentFormRowLabelText}>Card</Text>
          </Flex>
          <Flex {...styles.paymentFormRowElement}>
            <CardNumberElement options={options} onChange={resetErrorMessage} />
          </Flex>
        </Flex>
        <Flex {...styles.paymentFormRow}>
          <Flex {...styles.paymentFormHalfRow}>
            <Flex {...styles.paymentFormRowLabel}>
              <Image src={ExpiryIcon} {...styles.formIcon} />
              <Text {...styles.paymentFormRowLabelText}>Expiry</Text>
            </Flex>
            <Flex {...styles.paymentFormRowElement}>
              <CardExpiryElement options={options} onChange={resetErrorMessage} />
            </Flex>
          </Flex>
          <Flex {...styles.paymentFormHalfRow}>
            <Flex {...styles.paymentFormRowLabel}>
              <Image src={CvcIcon} {...styles.formIcon} />
              <Text {...styles.paymentFormRowLabelText}>CVC</Text>
            </Flex>
            <Flex {...styles.paymentFormRowElement}>
              <CardCvcElement options={options} onChange={resetErrorMessage} />
            </Flex>
          </Flex>
        </Flex>
        <Flex {...styles.rememberMeRow}>
          <Flex {...styles.paymentFormRowLabel}>
            <Image src={RememberMeIcon} {...styles.formIcon} />
            <Text {...styles.paymentFormRowLabelText}>Remember me</Text>
          </Flex>
          <Switch
            color="primary"
            onChange={() => {
              setRememberMeChecked(!rememberMeChecked);
            }}
            value={rememberMeChecked}
            checked={rememberMeChecked}
          />
        </Flex>
        {paymentTokenError && (
          <Flex {...styles.errorContainer}>
            <Text variant="errorMessage">{paymentTokenError}</Text>
          </Flex>
        )}
      </Flex>
    );
  };

  const renderFooter = () => {
    return (
      <Flex {...styles.saveButtonContainer}>
        <Button variant="primary" {...styles.saveButton} onClick={capturePaymentToken}>
          SAVE
        </Button>
      </Flex>
    );
  };

  return isDockModal ? (
    <DockModal
      header={"Payment"}
      isOpen={isOpen}
      toggle={goBack}
      loading={loading}
      size={1}
      provideBackOption
    >
      <Flex {...styles.screenContainer} height="calc( 100% - 67px )">
        <Flex {...styles.bodyContainer}>
          {renderPaymentHeader()}
          {renderPaymentMethodForm()}
        </Flex>
        {renderFooter()}
      </Flex>
    </DockModal>
  ) : (
    <Flex {...styles.screenContainer}>
      <Flex {...styles.bodyContainer}>
        {loading && <Loader />}
        {renderHeader()}
        {renderPaymentHeader()}
        {renderPaymentMethodForm()}
      </Flex>
      {renderFooter()}
    </Flex>
  );
};

const styles = {
  screenContainer: {
    sx: {
      fontFamily: "primary",
      height: "calc(var(--app-height))",
      justifyContent: "space-between",
      flexDirection: "column",
    },
  },
  bodyContainer: {
    sx: {
      fontFamily: "primary",
      justifyContent: "space-between",
      flexDirection: "column",
    },
  },
  headerRowContainer: {
    sx: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      width: "100%",
      height: "67px",
    },
  },
  headerRowText: {
    sx: {
      fontSize: 18,
    },
  },
  svgImage: {
    sx: {
      position: "absolute",
      left: 20,
    },
  },
  headerColumnContainer: {
    sx: {
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      margin: "auto",
    },
  },
  paymentHeaderContainer: {
    bg: "primary",
    sx: {
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      width: "100%",
    },
    py: 15,
  },
  roundedCornerIcon: {
    sx: {
      borderRadius: "50%",
    },
  },
  paymentHeaderText: {
    sx: {
      color: "WHITE",
    },
    py: "6px",
  },
  paymentSubheaderText: {
    sx: {
      color: "WHITE",
      fontSize: "12px",
    },
  },
  paymentFormContainer: {
    sx: {
      flexDirection: "column",
      alignItems: "flex-start",
      justifyContent: "flex-start",
      width: "100%",
    },
    p: "6px",
  },
  paymentFormRow: {
    sx: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "flex-start",
      width: "100%",
      borderBottom: "1px solid",
      borderBottomColor: "DISABLED_TEXT_GREY",
    },
    p: "4px",
  },
  paymentFormRowLabel: {
    sx: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "flex-start",
    },
    pr: "6px",
  },
  paymentFormRowLabelText: {
    fontSize: "12px",
  },
  paymentFormRowElement: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "flex-start",
    width: "80%",
  },
  paymentFormHalfRow: {
    sx: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "flex-start",
      width: "50%",
    },
    p: "4px",
  },
  rememberMeRow: {
    sx: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      width: "100%",
      borderBottom: "1px solid",
      borderBottomColor: "DISABLED_TEXT_GREY",
    },
    p: "6px",
  },
  saveButtonContainer: {
    sx: {
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "column",
    },
    py: 40,
  },
  saveButton: {
    sx: {
      width: "80%",
    },
    py: 20,
  },
  errorContainer: {
    sx: {
      justifyContent: "center",
      alignItems: "center",
      width: "100%",
    },
    p: "10px",
  },
  errorText: {
    sx: {
      color: "ERROR_TEXT",
    },
  },
  formIcon: {
    pr: "6px",
  },
};

export default AddPaymentMethod;
