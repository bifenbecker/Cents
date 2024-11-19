import {Elements} from "@stripe/react-stripe-js";
import {loadStripe} from "@stripe/stripe-js";

import {PaymentDataType} from "./ChooseAmount";
import AddPaymentMethod from "../../../../../components/payment/AddPaymentMethod";
import {STRIPE_PUBLIC_KEY} from "../../../../../utils";

type StripeElementsProps = {
  showNewPaymentMethod?: boolean;
  onPaymentSave?: (paymentInfo: PaymentDataType) => void;
  onPaymentCancel?: () => void;
};

const stripePromise = loadStripe(STRIPE_PUBLIC_KEY as string);

const StripeElements = ({
  showNewPaymentMethod,
  onPaymentSave,
  onPaymentCancel,
}: StripeElementsProps) => {
  return showNewPaymentMethod ? (
    // @ts-ignore: version conflict between stripe and react
    <Elements stripe={stripePromise}>
      <AddPaymentMethod
        goBack={onPaymentCancel}
        onSave={onPaymentSave}
        isDockModal
        isOpen={showNewPaymentMethod}
      />
    </Elements>
  ) : null;
};

export default StripeElements;
