import React, {useEffect, useState} from "react";
import isEmpty from "lodash/isEmpty";
import {Image, Text} from "rebass/styled-components";
import {Elements} from "@stripe/react-stripe-js";
import {loadStripe} from "@stripe/stripe-js";
import {Downgraded, useHookstate} from "@hookstate/core";
import {toast} from "react-toastify";
import {useHistory} from "react-router-dom";

// Assets
import {IllustrationDelivery} from "../../../../../assets/images";

// APIs
import {submitPickupOrder} from "../../../../../api/online-order";

// Components
import OrderScreenWrapper from "../common/order-screen-wrapper";
import DeliveryDetails from "./delivery-details";
import LaundryPreferences from "./laundry-preferences";
// import ContactInfo from "./contact-info";
import Payment from "./payment";
import Summary from "./summary";
import AddPaymentMethod from "../../../../payment/AddPaymentMethod";
import {Loader} from "../../../../common";
import ToastError from "../../../../common/ToastError";
import ApplyPromo from "./apply-promo";
import AddDeliveryTip from "./add-delivery-tip";

// Utils/Config
import {STRIPE_PUBLIC_KEY} from "../../../../../utils/config";
import {addNewCard, saveCardToState} from "../../../../../utils/payment";
import {
  deliveryProviders,
  onDemandDeliveryTypes,
  orderDeliveryFields,
  orderDeliverySubFields,
  orderFields,
} from "../../../constants";
import {ORDER_TYPES, RETURN_METHODS} from "../../../../../constants/order";

// Global state
import {onlineOrderState} from "../../../../../state/online-order";
import OrderValidator, {
  ORDER_VALIDATOR_CALLED_FROM,
} from "../../../../../services/order-validator";

const stripePromise = loadStripe(STRIPE_PUBLIC_KEY);

const FinishingUp = (props) => {
  const {
    services,
    generalDeliverySettings,
    onDemandDeliverySettings,
    ownDriverDeliverySettings,
    customer,
    subscriptions,
    dryCleaningEnabled,
    businessId,
  } = props;
  const history = useHistory();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState();
  const [showNewPaymentMethod, setShowNewPaymentMethod] = useState();
  const [showPaymentMethodList, setShowPaymentMethodList] = useState();
  const [customerPaymentMethods, setCustomerPaymentMethods] = useState(
    customer?.paymentMethods || []
  );
  const [showDeliveryTipModal, setShowDeliveryTipModal] = useState(false);

  const customerAddressState = useHookstate(onlineOrderState.customerAddressInfo);
  const customerAddress = customerAddressState.attach(Downgraded).value;
  const paymentMethodToken = useHookstate(onlineOrderState.paymentToken);
  const promoCode = useHookstate(onlineOrderState.promoCode);
  const pickupCourierTip = useHookstate(
    onlineOrderState?.orderDelivery?.pickup?.courierTip
  );
  const deliveryCourierTip = useHookstate(
    onlineOrderState?.orderDelivery?.delivery?.courierTip
  );
  const orderDeliveryState = useHookstate(onlineOrderState?.orderDelivery);
  const returnMethod = useHookstate(onlineOrderState?.returnMethod);
  const postalCode = useHookstate(onlineOrderState?.customerAddressInfo?.postalCode);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  /**
   * Store the payment method to the customer's payment methods on file
   *
   * @param {Object} paymentData
   */
  const saveNewCard = async (paymentData) => {
    setLoading(true);
    addNewCard(
      paymentData,
      customerAddress,
      customer.id,
      (response) => {
        setCustomerPaymentMethods(response);
        paymentMethodToken.set(paymentData.payment.id);
        setShowPaymentMethodList(true);
        setShowNewPaymentMethod(false);
        setLoading(false);
      },
      () => {
        setShowNewPaymentMethod(false);
        setLoading(false);
      }
    );
  };

  /**
   * Add the new card to the customerPaymentMethods state
   *
   * @param {Object} paymentData
   */
  const addNewCardToState = (paymentData) => {
    saveCardToState(
      paymentData,
      customer.id,
      customerPaymentMethods,
      (paymentMethods) => {
        paymentMethodToken.set(paymentData.payment.id);
        setCustomerPaymentMethods(paymentMethods);
        setShowPaymentMethodList(true);
        setShowNewPaymentMethod(false);
      }
    );
  };

  /**
   * Dynamically show delivery driver tip options based on deliveryProvider
   */
  const submitOnlineOrderForm = () => {
    if (!paymentMethodToken.get()) {
      setShowNewPaymentMethod(true);
      return;
    }
    const deliveryProviderSelected = [
      orderDeliveryState?.pickup?.deliveryProvider.get(),
      orderDeliveryState?.delivery?.deliveryProvider.get(),
    ];
    if (
      deliveryProviderSelected.every(
        (provider) => provider === deliveryProviders.ownDriver
      ) ||
      (returnMethod.get() === RETURN_METHODS.inStorePickup &&
        deliveryProviderSelected[0] === deliveryProviders.ownDriver)
    ) {
      submitOrder();
    } else {
      if (!(Number(pickupCourierTip.get()) > 0 || Number(deliveryCourierTip.get()) > 0)) {
        setShowDeliveryTipModal(true);
      } else {
        submitOrder();
      }
    }
  };

  const submitOrder = async () => {
    setError();
    try {
      const turnAroundInHours = dryCleaningEnabled
        ? onlineOrderState?.turnAroundInHours?.value
        : generalDeliverySettings?.turnAroundInHours;

      const orderDetails = {
        orderDelivery: {pickup: {}, delivery: {}},
        zipCode: postalCode.get(),
        turnAroundInHours,
      };
      let validityError;
      orderFields.forEach((key) => {
        orderDetails[key] = onlineOrderState[key].value;
      });

      orderDeliveryFields.forEach((field) => {
        orderDeliverySubFields.forEach((subField) => {
          orderDetails.orderDelivery[field][subField] =
            onlineOrderState?.orderDelivery[field][subField].value;
        });
      });
      const orderValidator = new OrderValidator(orderDetails, {
        orderType: ORDER_TYPES.online,
        timeZone: onlineOrderState?.addressTimeZone?.value,
        turnAroundInHours,
        bufferTimeInHours:
          ownDriverDeliverySettings?.deliveryWindowBufferInHours ||
          ownDriverDeliverySettings?.ownDeliverySettings?.deliveryWindowBufferInHours,
      });
      validityError = orderValidator.invalidErrorMessage(
        ORDER_VALIDATOR_CALLED_FROM.CREATE_ONLINE_ORDER
      );

      if (validityError && !validityError.includes("unless a service is selected")) {
        setError(validityError);
      } else {
        setShowDeliveryTipModal(false);
        setLoading(true);
        const subscription = onlineOrderState.subscription.get();
        const orderResponse = await submitPickupOrder(onlineOrderState.storeId.value, {
          ...orderDetails,
          ...(isEmpty(subscription)
            ? {}
            : {
                subscription: {
                  ...subscription,
                  servicePriceId: orderDetails.servicePriceId,
                  modifierIds: orderDetails.serviceModifierIds,
                  // paymentToken: orderDetails.paymentToken,
                },
              }),
        });
        toast.success("Your order's in!");
        history.push(`/order-summary/${orderResponse?.data?.order}`);
      }
    } catch (err) {
      console.log(err);
      toast.error(
        <ToastError
          message={err?.response?.data?.error || "Could not submit the order!"}
        />
      );
    } finally {
      setLoading(false);
    }
  };

  const getDeliveryTipFor = () => {
    const pickupDeliveryProvider = orderDeliveryState?.pickup?.deliveryProvider.get();
    const returnDeliveryProvider = orderDeliveryState?.delivery?.deliveryProvider.get();
    if (pickupDeliveryProvider !== deliveryProviders.ownDriver) {
      if (
        returnDeliveryProvider !== deliveryProviders.ownDriver &&
        onlineOrderState?.returnMethod.get() === RETURN_METHODS.delivery
      ) {
        return onDemandDeliveryTypes.pickupAndDelivery;
      }
      return onDemandDeliveryTypes.pickup;
    }
    return onDemandDeliveryTypes.delivery;
  };

  const setDeliveryTip = (tip) => {
    const deliveryTipFor = getDeliveryTipFor();
    if (deliveryTipFor === onDemandDeliveryTypes.pickupAndDelivery) {
      pickupCourierTip.set((tip / 2).toFixed(2));
      deliveryCourierTip.set((tip / 2).toFixed(2));
    } else {
      deliveryTipFor === onDemandDeliveryTypes.pickup
        ? pickupCourierTip.set(tip)
        : deliveryCourierTip.set(tip);
    }
    setShowDeliveryTipModal(false);
    submitOrder();
  };

  return (
    <>
      {!showNewPaymentMethod && (
        <OrderScreenWrapper
          header="Finishing up"
          submitText="SUBMIT ORDER"
          onSubmit={submitOnlineOrderForm}
          error={error}
          showPoweredByCents
          loading={loading}
          businessId={businessId}
        >
          {loading && <Loader />}
          <Image src={IllustrationDelivery} pt={2} />

          <DeliveryDetails
            generalDeliverySettings={generalDeliverySettings}
            onDemandDeliverySettings={onDemandDeliverySettings}
            ownDriverDeliverySettings={ownDriverDeliverySettings}
            subscriptions={subscriptions}
            businessId={businessId}
          />
          <LaundryPreferences />
          {/* <ContactInfo /> */}
          <Payment
            customer={customer}
            customerPaymentMethods={customerPaymentMethods}
            onPaymentSelection={(paymentToken) => {
              paymentMethodToken.set(paymentToken);
            }}
            onShowNewPaymentMethod={() => {
              setShowNewPaymentMethod(true);
            }}
            showPaymentMethods={showPaymentMethodList}
            paymentToken={onlineOrderState.paymentToken.value}
          />
          <ApplyPromo
            promoCode={promoCode.get()}
            onAddPromo={(promo) => {
              promoCode.set(promo);
            }}
          />

          <AddDeliveryTip
            deliveryTip={orderDeliveryState.pickup.courierTip.get()}
            onAddDeliveryTip={setDeliveryTip}
            deliveryTipFor={getDeliveryTipFor()}
            isNewOrder
            showDeliveryTipModal={showDeliveryTipModal}
            setShowDeliveryTipModal={setShowDeliveryTipModal}
          />

          <Summary services={services} />
          <Text {...styles.noteText}>
            Your card will be charged when your order is ready for delivery or when you
            pick up in store. You will receive a text message with a link to view your
            order.
          </Text>
        </OrderScreenWrapper>
      )}
      {showNewPaymentMethod && (
        <Elements stripe={stripePromise}>
          <AddPaymentMethod
            goBack={() => {
              window.scrollTo(0, 0);
              setShowNewPaymentMethod(false);
              setShowPaymentMethodList(true);
            }}
            onSave={(paymentInfo) => {
              if (paymentInfo.rememberPaymentMethod) {
                saveNewCard(paymentInfo);
              } else {
                addNewCardToState(paymentInfo);
              }
            }}
          />
        </Elements>
      )}
    </>
  );
};

const styles = {
  noteText: {
    m: "18px",
    fontSize: "12px",
    color: "TEXT_GREY",
    fontFamily: "secondary",
  },
};

export default FinishingUp;
