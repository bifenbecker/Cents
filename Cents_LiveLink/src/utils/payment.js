import {toast} from "react-toastify";
import ToastError from "../components/common/ToastError";
import {
  AmexIcon,
  CreditCardIcon,
  DinersIcon,
  DiscoverIcon,
  JcbIcon,
  MastercardIcon,
  VisaIcon,
} from "../assets/images";
import {addCustomerPaymentMethod} from "../api/customer";
import {CENTS_IN_DOLLAR} from "constants/order";

const creditCardBrands = {
  amex: AmexIcon,
  diners: DinersIcon,
  discover: DiscoverIcon,
  jcb: JcbIcon,
  mastercard: MastercardIcon,
  visa: VisaIcon,
};

export const priceToDollars = price =>
  Math.ceil(Math.abs(Number(price))) / CENTS_IN_DOLLAR;

export const getCreditCardBrandIcon = brand => {
  return brand ? creditCardBrands[brand] : CreditCardIcon;
};

export const saveCardToState = (
  paymentData,
  customerId,
  customerPaymentMethods,
  setDataToState
) => {
  let newPaymentMethod = {};

  newPaymentMethod.last4 = paymentData.payment.card.last4;
  newPaymentMethod.brand = paymentData.payment.card.brand;
  newPaymentMethod.type = paymentData.payment.card.funding;
  newPaymentMethod.centsCustomerId = customerId;
  newPaymentMethod.provider = "stripe";
  newPaymentMethod.paymentMethodToken = paymentData.payment.id;
  newPaymentMethod.notSaved = true;

  let paymentMethods = [...customerPaymentMethods];
  paymentMethods.push(newPaymentMethod);

  setDataToState(paymentMethods);
};

export const addNewCard = async (
  paymentData,
  selectedAddress,
  customerId,
  onApiSuccess,
  onApiFailure
) => {
  let address = null;

  if (selectedAddress?.address1) {
    const {
      address1,
      address2,
      city,
      firstLevelSubdivisionCode,
      postalCode,
    } = selectedAddress;
    address = {
      address1,
      address2,
      city,
      firstLevelSubdivisionCode,
      postalCode,
    };
  }

  try {
    const data = {
      payment: {
        provider: "stripe",
        type: paymentData.payment.card.funding,
        token: paymentData.payment.id,
      },
      rememberPaymentMethod: paymentData.rememberPaymentMethod,
      centsCustomerId: customerId,
      address,
    };
    const newCardResponse = await addCustomerPaymentMethod(data);
    onApiSuccess(newCardResponse.data.output.paymentMethods);
  } catch (error) {
    toast.error(
      <ToastError
        message={
          error.response.data.error || "Something went wrong while adding your card."
        }
      />
    );
    onApiFailure(error.response.data.error);
  }
};
