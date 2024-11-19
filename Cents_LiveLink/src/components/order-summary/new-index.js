import React, {useEffect, useMemo, useState} from "react";
import {useParams} from "react-router-dom";
import {Box, Flex, Text} from "rebass/styled-components";
import {toast} from "react-toastify";
import {Elements} from "@stripe/react-stripe-js";
import {loadStripe} from "@stripe/stripe-js";
import get from "lodash/get";
import isEmpty from "lodash/isEmpty";
import {withLDConsumer} from "launchdarkly-react-client-sdk";

// APIs and Hooks
import {
  cancelOrder,
  fetchOrderDetail,
  removeCredits,
  removePromo,
  updatePaymentMethodIntent,
  updateTip,
} from "../../api";
import {processPayment} from "../../api/payment";
import {addCustomerPaymentMethod} from "../../api/customer";
import {fetchAvailableDeliverySettings} from "../../api/online-order";
import useToggle from "../../hooks/useToggle";
import useRecaptchaToken from "../../hooks/useRecaptchaToken";

// Utils
import {STRIPE_PUBLIC_KEY} from "../../utils/config";
import {
  getDeliveryAcknowledgementKey,
  getDeliveryAfterProcessingAcknowledgementKey,
  getSkipRecurringPickupAcknowledgementKey,
} from "../../utils/common";
import {getLocalStorageItemWithExpiry, initPaymentDetails} from "./utils";
import {ORDER_TYPES, RETURN_METHODS} from "./constants";
import {
  COMPLETED_OR_CANCELED_ORDER_STATUSES,
  ORDER_DELIVERY_UPDATABLE_STATUSES,
} from "../../constants/order";

// Components
import {Layout, Loader, WithOrderStoreTheme} from "./../common";
import Timeline from "./Timeline";
import DetailsDrawer from "./details-drawer";
import ApplyPromo from "./ApplyPromo";
import ApplyCredit from "./ApplyCredit";
import PaymentMethodList from "../payment/PaymentMethodList";
import AddPaymentMethod from "../payment/AddPaymentMethod";
import StoreInfo from "./StoreInfo";
import DeliveryMethod from "./delivery-method";
import ToastError from "../common/ToastError";
import CancelOrderConfirmation from "./cancel-order-confirmation";
import ManageOrder from "../manage-order";
import DeliveryScheduledPopup from "./delivery-scheduled-popup";
import CADriverFeeInfoPopup from "../common/CA-driver-fee-info-popup";
import ScheduleDeliveryAfterProcessingPopup from "./ScheduleDeliveryAfterProcessingPopup";
import SkipRecurringPickupPopup from "./skip-recurring-pickup-popup";
import {canUpdateOrderDelivery} from "../../utils";
import {fetchBusinessSettings} from "../../api/business.js";

const stripePromise = loadStripe(STRIPE_PUBLIC_KEY);

const OrderSummary = ({ldClient}) => {
  let {orderToken} = useParams();
  const [businessSettings, setBusinessSettings] = useState();
  const [orderDetails, setOrderDetails] = useState();
  const [deliverySettings, setDeliverySettings] = useState();
  const [loading, setLoading] = useState(true);
  const [inlineLoading, setInlineLoading] = useState(false);
  const [loadingErrorMsg, setLoadingErrorMsg] = useState();
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState();
  const [showAddPaymentMethod, setShowAddPaymentMethod] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState();
  const [showDeliveryWindows, setShowDeliveryWindows] = useState(false);
  const [cancelOrderLoading, setCancelOrderLoading] = useState(false);
  const recaptchaToken = useRecaptchaToken("OrderSummary");

  const {isOpen: applyPromo, toggle: toggleApplyPromo} = useToggle();
  const {isOpen: applyCredit, toggle: toggleApplyCredit} = useToggle();
  const {isOpen: showStoreInfo, toggle: toggleStoreInfo} = useToggle();
  const {isOpen: updatePayment, toggle: toggleUpdatePayment} = useToggle();
  const {isOpen: openCancelOrderConfirmation, toggle: toggleCancelOrderConfirmation} =
    useToggle();
  const {isOpen: showManageOrder, toggle: toggleManageOrder} = useToggle();
  const {isOpen: openCADriverFeePopup, toggle: toggleCADriverFeePopup} = useToggle();
  const {isOpen: showDeliverySchedulePopup, toggle: toggleDeliverySchedulePopup} =
    useToggle();
  const {
    isOpen: showScheduleDeliveryAfterProcessingPopup,
    toggle: toggleScheduleDeliveryAfterProcessingPopup,
  } = useToggle();
  const {isOpen: showSkipRecurringPickupPopup, toggle: toggleSkipRecurringPickupPopup} =
    useToggle();

  useEffect(() => {
    (async () => {
      try {
        // Fetch order details.
        const res = await fetchOrderDetail(orderToken);
        const order = res?.data?.order;
        setOrderDetails(order);

        // Fetch active delivery settings of the store.
        const deliverySettingsRes = await fetchAvailableDeliverySettings(
          order?.store?.id
        );
        setDeliverySettings(deliverySettingsRes?.data);

        // Fetch and set customer payment methods.
        const {customerPaymentMethods, currentPaymentMethod} = initPaymentDetails(
          order?.paymentMethods || [],
          order?.latestPayment
        );
        setPaymentMethods(customerPaymentMethods);
        setSelectedPaymentMethod(currentPaymentMethod);
      } catch (error) {
        console.log(error);
        const errMsg = error.response?.data.error || error.message;
        setLoadingErrorMsg(errMsg);
      } finally {
        setLoading(false);
      }
    })();
  }, [orderToken]);

  useEffect(() => {
    if (!isEmpty(orderDetails?.delivery)) {
      const key = getDeliveryAcknowledgementKey(orderDetails?.orderId);
      if (
        ORDER_DELIVERY_UPDATABLE_STATUSES.includes(orderDetails?.delivery?.status) &&
        orderDetails?.isProcessingCompleted
      ) {
        let localStorageData = getLocalStorageItemWithExpiry(key);
        if (!localStorageData) {
          toggleDeliverySchedulePopup();
        }
      } else {
        localStorage.removeItem(key);
      }
    }
  }, [orderDetails, toggleDeliverySchedulePopup]);

  useEffect(() => {
    if (
      orderDetails?.orderType === ORDER_TYPES.online &&
      !isEmpty(orderDetails?.subscription) &&
      orderDetails?.subscription?.recurringSubscriptionId
    ) {
      const key = getSkipRecurringPickupAcknowledgementKey(orderDetails?.orderId);
      if (
        !orderDetails?.subscription?.recurringSubscription?.deletedAt &&
        canUpdateOrderDelivery(orderDetails?.pickup?.status)
      ) {
        let localStorageData = getLocalStorageItemWithExpiry(key);
        if (!localStorageData) {
          toggleSkipRecurringPickupPopup();
        }
      } else {
        localStorage.removeItem(key);
      }
    }
  }, [orderDetails, toggleSkipRecurringPickupPopup]);

  useEffect(() => {
    const key = getDeliveryAfterProcessingAcknowledgementKey(orderDetails?.orderId);
    if (
      orderDetails?.orderType === ORDER_TYPES.online &&
      !COMPLETED_OR_CANCELED_ORDER_STATUSES.includes(orderDetails?.status) &&
      (orderDetails?.returnMethod === RETURN_METHODS.inStorePickup ||
        !orderDetails?.returnMethod)
    ) {
      if (
        orderDetails?.isProcessingCompleted &&
        !showScheduleDeliveryAfterProcessingPopup
      ) {
        let localStorageData = getLocalStorageItemWithExpiry(key);
        if (!localStorageData) {
          toggleScheduleDeliveryAfterProcessingPopup();
        }
      } else {
        localStorage.removeItem(key);
      }
    } else {
      let localStorageData = getLocalStorageItemWithExpiry(key);
      if (localStorageData) {
        localStorage.removeItem(key);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderDetails]);

  useEffect(() => {
    // Fetch and set customer payment methods.
    const {customerPaymentMethods, currentPaymentMethod} = initPaymentDetails(
      orderDetails?.paymentMethods || [],
      orderDetails?.latestPayment
    );
    setPaymentMethods(customerPaymentMethods);
    setSelectedPaymentMethod(currentPaymentMethod);
  }, [orderDetails]);

  useEffect(() => {
    (async () => {
      try {
        const businessId = orderDetails?.store?.businessId;
        const response = businessId && (await fetchBusinessSettings(businessId));
        setBusinessSettings(response?.data?.businessSettings);
      } catch (error) {
        toast.error(
          <ToastError
            message={"Something went wrong while fetching business settings."}
          />
        );
      }
    })();
  }, [orderDetails?.store?.businessId]);

  const hasActiveServiceProviders = useMemo(
    () =>
      (deliverySettings?.onDemandDeliverySettings?.active ||
        deliverySettings?.ownDriverDeliverySettings?.active) &&
      deliverySettings?.generalDeliverySettings?.deliveryEnabled,
    [deliverySettings]
  );

  const toggleDeliveryMethod = useMemo(() => {
    return (
      hasActiveServiceProviders &&
      orderDetails?.status === "READY_FOR_PICKUP" &&
      !orderDetails?.returnMethod &&
      orderDetails?.orderType === ORDER_TYPES.service
    );
  }, [orderDetails, hasActiveServiceProviders]);

  /**
   * Register the user in LD so we can evaluate flags based on businessId
   *
   * @param {Number} businessId
   */
  const registerLaunchDarklyUser = (businessId) => {
    const user = {
      key: Number(businessId),
      custom: {
        businessId: Number(businessId),
      },
    };
    return ldClient?.identify(user, null, (data) => {
      return data;
    });
  };

  /**
   * Call LD user registration on initialization
   */
  useEffect(() => {
    registerLaunchDarklyUser(orderDetails?.store?.businessId);
  }, [ldClient, orderDetails?.store?.businessId]);

  const removePromoApiCall = async () => {
    try {
      setInlineLoading(true);
      const res = await removePromo(orderToken);
      if (res.data.success) {
        setOrderDetails(res.data.order);
        toast.success("Promo Removed!");
      }
    } catch (error) {
      toast.error(<ToastError message={"Error while removing promo"} />);
      console.error(get(error, "response.data.error", "Error while removing promo"));
    } finally {
      setInlineLoading(false);
    }
  };

  const removeCreditsApiCall = async () => {
    try {
      setInlineLoading(true);
      const res = await removeCredits(orderToken);
      if (res.data.success) {
        setOrderDetails(res.data.order);
      }
    } catch (error) {
      toast.error(<ToastError message={"Error while removing credit"} />);
      console.error(get(error, "response.data.error", "Error while removing credit"));
    } finally {
      setInlineLoading(false);
    }
  };

  const updateTipApiCall = async (data) => {
    try {
      setInlineLoading(true);
      const res = await updateTip(orderToken, data);
      if (res.data.success) {
        setOrderDetails(res.data.order);
      }
    } catch (error) {
      toast.error(<ToastError message={"Error while updating tip"} />);
      console.error(get(error, "response.data.error", "Error while updating tip"));
    } finally {
      setInlineLoading(false);
    }
  };

  const onShowDeliveryOptionsClick = () => {
    toggleManageOrder();
    setShowDeliveryWindows(true);
  };

  const handleCancelOrder = async (isCancelSubscription, toggle) => {
    try {
      setCancelOrderLoading(true);
      const res = await cancelOrder({token: orderToken, isCancelSubscription});
      setOrderDetails(res?.data?.orderDetails);
      toast.success("Order canceled!");
      toggle();
    } catch (err) {
      toast.error(
        <ToastError message={err?.response?.data?.error || "Could not cancel order."} />
      );
    } finally {
      setCancelOrderLoading(false);
    }
  };

  const updatePaymentMethod = async (pm, paymentMethods) => {
    try {
      if (!isEmpty(orderDetails?.latestPayment)) {
        setInlineLoading(true);
        await updatePaymentMethodIntent(orderToken, {
          paymentToken: pm.paymentMethodToken,
        });
        setOrderDetails((order) => ({
          ...order,
          latestPayment: {
            ...order?.latestPayment,
            paymentMethod: pm,
          },
        }));
      }
      const finalPaymentMethods = paymentMethods.filter((paymentMethod) => {
        return (
          !paymentMethod?.notSaved ||
          (paymentMethod?.notSaved &&
            paymentMethod?.paymentMethodToken === pm?.paymentMethodToken)
        );
      });

      setSelectedPaymentMethod(pm);
      setPaymentMethods(finalPaymentMethods);
      toggleUpdatePayment();
    } catch (error) {
      toast.error(
        <ToastError
          message={
            error?.response?.data?.error || "Something went wrong while updating payment"
          }
        />
      );
    } finally {
      setInlineLoading(false);
    }
  };

  /**
   * Store the payment method to the customer's profile and reset list of payment methods
   *
   * @param {Object} paymentMethodData
   */
  const savePaymentMethodForCustomer = async (paymentMethodData) => {
    try {
      setLoading(true);

      const data = {
        payment: {
          provider: "stripe",
          type: paymentMethodData.type,
          token: paymentMethodData.paymentMethodToken,
        },
        rememberPaymentMethod: paymentMethodData.rememberPaymentMethod,
        centsCustomerId: orderDetails.customer.centsCustomerId,
      };

      const newCardResponse = await addCustomerPaymentMethod(data);

      let paymentMethodToSelect = paymentMethodData.rememberPaymentMethod
        ? newCardResponse?.data?.output?.paymentMethods?.find(
            (pm) => pm?.paymentMethodToken === paymentMethodData?.paymentMethodToken
          )
        : {...paymentMethodData, notSaved: true};

      setPaymentMethods([...paymentMethods, paymentMethodData]);
      setSelectedPaymentMethod(paymentMethodToSelect);

      setShowAddPaymentMethod(false);
      toggleUpdatePayment();

      setLoading(false);
    } catch (error) {
      setLoading(false);
      toast.error(
        <ToastError
          message={
            error?.response?.data?.error ||
            "Something went wrong while adding your new card"
          }
        />
      );
    }
  };

  /**
   * Verify request is not malicious and use the incoming card details to process a payment for the order
   */
  const processPaymentForOrder = async () => {
    if (!recaptchaToken) {
      return toast.error(
        <ToastError
          message={"Malicious activity detected. Please reload and try again."}
        />
      );
    }

    try {
      setLoading(true);
      const data = {
        centsCustomerId: orderDetails.customer.centsCustomerId,
        serviceOrderId: orderDetails.orderId,
        storeCustomerId: orderDetails.customer.storeCustomerId,
        store: orderDetails.store,
        paymentMethodToken: selectedPaymentMethod.paymentMethodToken,
      };
      const paymentData = await processPayment(data);
      setOrderDetails(paymentData.data.order);
      toast.success("Order paid successfully!");
    } catch (error) {
      const errMsg = error.response?.data.error || error.message;
      console.log(errMsg);
      toast.error(<ToastError message={"Payment Failed! Please try again."} />);
    } finally {
      setLoading(false);
    }
  };

  return (
    <WithOrderStoreTheme orderToken={orderToken}>
      {(storeSettings) =>
        loading ? (
          <Loader />
        ) : applyPromo ? (
          <ApplyPromo
            onClose={toggleApplyPromo}
            orderToken={orderToken}
            setOrderDetails={setOrderDetails}
          />
        ) : applyCredit ? (
          <ApplyCredit
            onClose={toggleApplyCredit}
            orderToken={orderToken}
            setOrderDetails={setOrderDetails}
            balanceDue={orderDetails.balanceDue}
            availableCredits={orderDetails.customer.availableCredit}
            netOrderTotal={orderDetails?.netOrderTotal}
            isOnlineOrder={orderDetails?.orderType === ORDER_TYPES.online}
          />
        ) : showStoreInfo ? (
          <StoreInfo orderDetails={orderDetails} onClose={toggleStoreInfo} />
        ) : updatePayment ? (
          <Elements stripe={stripePromise}>
            <PaymentMethodList
              onClose={toggleUpdatePayment}
              customer={orderDetails.customer}
              onSave={updatePaymentMethod}
              paymentMethod={selectedPaymentMethod}
              order={orderDetails}
              paymentMethodList={paymentMethods}
              onNewPaymentMethod={() => {
                toggleUpdatePayment();
                setShowAddPaymentMethod(true);
              }}
            />
          </Elements>
        ) : showAddPaymentMethod ? (
          <Elements stripe={stripePromise}>
            <AddPaymentMethod
              goBack={() => {
                setShowAddPaymentMethod(false);
                if (paymentMethods.length > 0) toggleUpdatePayment();
              }}
              onSave={(paymentInfo) => {
                const paymentMethod = {
                  paymentMethodToken: paymentInfo.payment.id,
                  type: paymentInfo.payment.type,
                  brand: paymentInfo.payment.card.brand,
                  last4: paymentInfo.payment.card.last4,
                  notSaved: !paymentInfo.rememberPaymentMethod,
                  rememberPaymentMethod: paymentInfo.rememberPaymentMethod,
                };
                savePaymentMethodForCustomer(paymentMethod);
              }}
            />
          </Elements>
        ) : showManageOrder ? (
          <ManageOrder
            order={orderDetails}
            deliverySettings={deliverySettings}
            onClose={toggleManageOrder}
            onOrderUpdate={setOrderDetails}
            shouldShowDeliveryWindows={showDeliveryWindows}
            setShouldShowDeliverWindows={setShowDeliveryWindows}
          />
        ) : (
          <Layout
            logoUrl={storeSettings?.theme?.logoUrl}
            onManageOrderClick={toggleManageOrder}
            orderDetails={orderDetails}
            businessSettings={businessSettings}
          >
            {loadingErrorMsg ? (
              <Flex {...styles.errorMessage.wrapper}>
                <Text>{loadingErrorMsg}</Text>
              </Flex>
            ) : (
              <Flex {...styles.content.wrapper}>
                {inlineLoading && (
                  <Loader style={{height: "calc(var(--app-height) - 67px)"}} />
                )}
                <Timeline orderDetails={orderDetails} orderToken={orderToken} />
                <DeliveryScheduledPopup
                  orderToken={orderToken}
                  orderId={orderDetails?.orderId}
                  isOpen={showDeliverySchedulePopup}
                  toggle={toggleDeliverySchedulePopup}
                  orderDelivery={orderDetails?.delivery}
                  timeZone={orderDetails?.store?.timeZone}
                  onShowDeliveryOptionsClick={onShowDeliveryOptionsClick}
                />
                <SkipRecurringPickupPopup
                  orderToken={orderToken}
                  orderId={orderDetails?.orderId}
                  isOpen={showSkipRecurringPickupPopup}
                  toggle={toggleSkipRecurringPickupPopup}
                  orderDelivery={orderDetails?.pickup}
                  timeZone={orderDetails?.store?.timeZone}
                  onChangeTimingsClick={onShowDeliveryOptionsClick}
                  handleCancelOrder={handleCancelOrder}
                  loading={cancelOrderLoading}
                />
                {hasActiveServiceProviders && (
                  <ScheduleDeliveryAfterProcessingPopup
                    isOpen={showScheduleDeliveryAfterProcessingPopup}
                    toggle={toggleScheduleDeliveryAfterProcessingPopup}
                    orderToken={orderToken}
                    orderId={orderDetails?.orderId}
                    orderDelivery={orderDetails?.delivery}
                    onScheduleDeliveryClick={onShowDeliveryOptionsClick}
                  />
                )}
                <DeliveryMethod
                  isOpen={toggleDeliveryMethod}
                  setOrder={(order) => {
                    setOrderDetails(order);
                    if (order.returnMethod === RETURN_METHODS.delivery) {
                      toggleManageOrder();
                      return;
                    }
                  }}
                  orderToken={orderToken}
                />
                <CancelOrderConfirmation
                  isOpen={openCancelOrderConfirmation}
                  handleCancelOrder={handleCancelOrder}
                  toggle={toggleCancelOrderConfirmation}
                  orderDetails={orderDetails}
                  loading={cancelOrderLoading}
                />
                <Box {...styles.detailsDrawerWrapper}>
                  <DetailsDrawer
                    orderDetails={orderDetails}
                    storeSettings={storeSettings}
                    removeCredits={removeCreditsApiCall}
                    removePromo={removePromoApiCall}
                    toggleApplyPromo={toggleApplyPromo}
                    toggleApplyCredit={toggleApplyCredit}
                    toggleUpdatePayment={toggleUpdatePayment}
                    toggleStoreInfo={toggleStoreInfo}
                    updateTip={updateTipApiCall}
                    toggleCancelOrderConfirmation={toggleCancelOrderConfirmation}
                    toggleCADriverFeePopup={toggleCADriverFeePopup}
                    paymentMethod={selectedPaymentMethod}
                    onAddPaymentMethod={() => {
                      setShowAddPaymentMethod(true);
                    }}
                    onPayForOrder={() => {
                      processPaymentForOrder(selectedPaymentMethod, false);
                    }}
                  />
                </Box>
                <CADriverFeeInfoPopup
                  isOpen={openCADriverFeePopup}
                  close={toggleCADriverFeePopup}
                />
                <Flex {...styles.wrapper} height={"2.5rem"}>
                  <Text {...styles.poweredByCents}>Powered by Cents</Text>
                </Flex>
              </Flex>
            )}
          </Layout>
        )
      }
    </WithOrderStoreTheme>
  );
};

const styles = {
  wrapper: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "column",
    padding: "0 1rem",
    mt: "auto",
    bg: "WHITE",
    sx: {
      position: "fixed",

      bottom: 0,
    },
  },
  poweredByCents: {
    fontFamily: "Roboto Bold",
    width: "100%",
    color: "TEXT_GREY",
    textAlign: "center",
    py: ["0.6rem", "0.75rem"],
    fontSize: "0.75rem",
  },
  errorMessage: {
    wrapper: {
      p: 3,
      height: "calc(var(--app-height) - 67px)",
      textAlign: "center",
      justifyContent: "center",
      flexDirection: "column",
    },
  },
  content: {
    wrapper: {
      flexDirection: "column",
      // total height - stickyHeader - stickyBottom
      height: "calc(var(--app-height) - 67px - 7rem)",
      flexFlow: "column",
      bg: "WHITE",
    },
  },
  detailsDrawerWrapper: {
    width: "100%",
    height: "40px",
    flex: "0 1 40px",
    className: "bottom-drawer-wrapper",
    sx: {
      borderTopRightRadius: "8px",
      borderTopLeftRadius: "8px",
    },
  },
};

export default withLDConsumer()(OrderSummary);
