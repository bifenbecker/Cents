import React, {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from "react";
import {toast} from "react-toastify";
import {useParams} from "react-router-dom";
import isEmpty from "lodash/isEmpty";
import pick from "lodash/pick";
import {Elements} from "@stripe/react-stripe-js";
import {loadStripe} from "@stripe/stripe-js";

import {
  fetchCustomerInfo,
  fetchGeneralDeliverySettings,
  fetchOnDemandDeliverySettings,
  fetchOwnDriverDeliverySettings,
  fetchServicesAndModifiers,
} from "../../api/online-order";
import {fetchOrderDeliveries, manageOrder} from "../../api/order";

import {manageOrderPayload, orderDeliveryPayload} from "./reducer/reducer-fuctions";
import {ORDER_DELIVERY_TYPES, ORDER_TYPES, RETURN_METHODS} from "../../constants/order";
import reducer, {actionTypes, initialState} from "./reducer";
import {canUpdateOrderDelivery} from "../../utils";
import {addNewCard, saveCardToState} from "../../utils/payment";
import {deliveryProviders, onDemandDeliveryTypes} from "../online-order/constants";

import {ScreenWrapper, ToastError} from "../common";
import PickupAndDeliveryDetails from "./pickup-and-delivery-details";
import PreferencesAndNotes from "./preferences-and-notes";
import PaymentSection from "./payment-details";
import AddPaymentMethod from "../payment/AddPaymentMethod";
import AddDeliveryTip from "../online-order/business/online-order-form/finishing-up/add-delivery-tip";
import ServiceAndModifiers from "./services-and-modifiers";

import {STRIPE_PUBLIC_KEY} from "../../utils/config";
import {fetchSubscriptions} from "../../api/subscriptions";

import {getLuxonWeekDayFromMillis} from "../../utils/date";
import OrderValidator, {
  ORDER_VALIDATOR_CALLED_FROM,
} from "../../services/order-validator";
import useIsDoorDashServiceable from "../../hooks/api/useIsDoordashServiceable";
import {initPaymentDetails} from "../order-summary/utils";

const stripePromise = loadStripe(STRIPE_PUBLIC_KEY);

const ManageOrder = props => {
  const {
    onClose,
    order,
    onOrderUpdate,
    shouldShowDeliveryWindows,
    setShouldShowDeliverWindows,
    deliverySettings,
  } = props;
  const {orderToken} = useParams();
  const doordashStores = useMemo(() => {
    return process.env.REACT_APP_DOORDASH_STORES?.split(",");
  }, []);

  const [
    {
      manageOrderState,
      addressToValidate,
      selectedAddressId,
      customerAddresses,
      initLoading,
      ownDriverDeliverySettingsLoading,
      generalDeliverySettings,
      ownDriverDeliverySettings,
      onDemandDeliverySettings,
      serviceableByOnDemand,
      showAddressSelection,
      showDeliveryWindows,
      errorToastMessage,
      error,
      loading,
      customerInfo,
      services,
      subscriptionsList,
      initialAddressValidation,
    },
    dispatch,
  ] = useReducer(reducer, initialState);

  const [showNewPaymentMethod, setShowNewPaymentMethod] = useState();
  const [showPaymentMethodList, setShowPaymentMethodList] = useState();
  const [customerPaymentMethods, setCustomerPaymentMethods] = useState(
    customerInfo.paymentMethods || []
  );
  const [showDeliveryTipModal, setShowDeliveryTipModal] = useState(false);
  const mounted = useRef(false);
  const selectedAddress = useMemo(
    () => customerAddresses.find(({id}) => id === selectedAddressId) || {},
    [customerAddresses, selectedAddressId]
  );

  const {
    loading: checkingDoorDashServiceability,
    isDoorDashServiceable,
  } = useIsDoorDashServiceable();

  const canShowPickupDeliveryDetails = useMemo(() => {
    switch (order.orderType) {
      // For service orders(walk-in), show delivery details after intake is completed
      case ORDER_TYPES.service:
        return (
          !!generalDeliverySettings.turnAroundInHours &&
          order?.isIntakeComplete &&
          ((onDemandDeliverySettings?.active &&
            onDemandDeliverySettings?.doorDashEnabled) ||
            deliverySettings?.ownDriverDeliverySettings?.active) &&
          deliverySettings?.generalDeliverySettings?.deliveryEnabled
        );
      // For online orders, show if there is turnAroundInHours(which will be there all the time)
      case ORDER_TYPES.online:
        return (
          !!generalDeliverySettings.turnAroundInHours &&
          ((onDemandDeliverySettings?.active &&
            onDemandDeliverySettings?.doorDashEnabled) ||
            deliverySettings?.ownDriverDeliverySettings?.active) &&
          deliverySettings?.generalDeliverySettings?.deliveryEnabled
        );

      // For residential orders, never show delivery details
      case ORDER_TYPES.residential:
      default:
        return false;
    }
  }, [
    order?.orderType,
    order?.isIntakeComplete,
    generalDeliverySettings?.turnAroundInHours,
    onDemandDeliverySettings?.active,
    onDemandDeliverySettings?.doorDashEnabled,
    deliverySettings?.ownDriverDeliverySettings?.active,
    deliverySettings?.generalDeliverySettings?.deliveryEnabled,
  ]);

  const fetchOwnDriverSettings = useCallback(async (storeId, params) => {
    try {
      dispatch({type: actionTypes.SET_OWN_DELIVERY_SETTINGS_LOADING, payload: true});
      const res = await fetchOwnDriverDeliverySettings(storeId, params);
      if (res?.data?.success) {
        return res?.data?.ownDriverDeliverySettings;
      }
    } catch (error) {
      toast.error(
        <ToastError message={"Error while fetching own demand delivery settings"} />
      );
      console.error(error?.response?.data?.error || error?.message);
    } finally {
      dispatch({type: actionTypes.SET_OWN_DELIVERY_SETTINGS_LOADING, payload: false});
    }
  }, []);

  const checkOnDemandServicability = useCallback(
    async address => {
      return isDoorDashServiceable({
        address,
        timeZone: manageOrderState.timeZone,
        onDemandDeliverySettings,
      });
    },
    [isDoorDashServiceable, onDemandDeliverySettings, manageOrderState.timeZone]
  );

  const validateServiceabilityOfAddress = useCallback(
    async address => {
      try {
        dispatch({type: actionTypes.SET_LOADING, payload: true});

        const {postalCode: zipCode} = address || {};
        const ownDeliverySettings = await fetchOwnDriverSettings(
          manageOrderState.storeId,
          {zipCode}
        );

        const serviceableByDoorDash =
          onDemandDeliverySettings?.active &&
          (onDemandDeliverySettings?.doorDashEnabled ||
            doordashStores?.includes(manageOrderState.storeId.toString())) &&
          (await checkOnDemandServicability(address));
        const serviceableByOwnNetwork = ownDeliverySettings?.active;

        if (serviceableByOwnNetwork || serviceableByDoorDash) {
          // This will add the validated address to selectedAddress,
          // adds to pickup or return object depending on the status
          // and removes it from the addressToValidate state.
          dispatch({
            type: actionTypes.SAVE_ADDRESS_SELECTION,
            payload: {
              ownDriverDeliverySettings: ownDeliverySettings,
              address,
              serviceableByOnDemand: serviceableByDoorDash,
              shouldShowDeliveryWindows,
            },
          });
          setShouldShowDeliverWindows(false);

          // toast.success("This address is serviceable by the store");
        } else {
          dispatch({type: actionTypes.VALIDATE_ADDRESS_ERROR, payload: address.id});
          toast.error(
            <ToastError
              message={`${manageOrderState.storeName} cannot deliver to this address. Please choose a different address`}
            />
          );
        }
      } catch (error) {
        dispatch({type: actionTypes.SET_LOADING, payload: false});
        toast.error(
          <ToastError
            message={"Something went wrong while checking for address serviceability"}
          />
        );
      }
    },
    [
      fetchOwnDriverSettings,
      manageOrderState.storeId,
      manageOrderState.storeName,
      onDemandDeliverySettings,
      doordashStores,
      checkOnDemandServicability,
      shouldShowDeliveryWindows,
      setShouldShowDeliverWindows,
    ]
  );

  const getOrderDeliveryPayload = pickupOrDelivery => {
    return !isEmpty(pickupOrDelivery) &&
      (!pickupOrDelivery?.status || canUpdateOrderDelivery(pickupOrDelivery?.status))
      ? pick(pickupOrDelivery, orderDeliveryPayload)
      : {};
  };
  const shouldShowNewPaymentScreen = useMemo(() => {
    const {paymentToken, orderDelivery} = manageOrderState || {};
    return (
      !paymentToken &&
      orderDelivery?.delivery?.timingsId &&
      orderDelivery?.delivery?.centsCustomerAddressId
    );
  }, [manageOrderState]);

  const deliveryTipFor = useMemo(() => {
    const {
      returnMethod,
      orderDelivery: {pickup, delivery},
    } =
      manageOrderState && manageOrderState.orderDelivery
        ? manageOrderState
        : {orderDelivery: {}};
    const isReturnDeliveryTipRequired =
      returnMethod === RETURN_METHODS.delivery &&
      delivery?.deliveryProvider !== deliveryProviders.ownDriver &&
      !delivery?.courierTip &&
      (!delivery?.status || canUpdateOrderDelivery(delivery?.status));
    if (
      !isEmpty(pickup) &&
      pickup?.deliveryProvider !== deliveryProviders.ownDriver &&
      !pickup?.courierTip &&
      (!pickup?.status || canUpdateOrderDelivery(pickup?.status))
    ) {
      return isReturnDeliveryTipRequired
        ? onDemandDeliveryTypes.pickupAndDelivery
        : onDemandDeliveryTypes.pickup;
    }
    return isReturnDeliveryTipRequired ? onDemandDeliveryTypes.delivery : null;
  }, [manageOrderState]);

  const setDeliveryTip = tip => {
    dispatch({
      type: actionTypes.UPDATE_COURIER_TIP,
      payload: {
        field: deliveryTipFor,
        value: tip,
      },
    });
    updateOrder(tip);
  };

  const getPayload = pickupOrDelivery => {
    const payload = getOrderDeliveryPayload(pickupOrDelivery);
    if (!isEmpty(payload) && !payload.centsCustomerAddressId) {
      payload.centsCustomerAddressId = selectedAddressId;
    }
    if (!isEmpty(payload)) {
      const {timingsId, deliveryWindow, centsCustomerAddressId} = payload;
      if (timingsId && centsCustomerAddressId && deliveryWindow?.length) {
        return payload;
      }
    }
    return {};
  };

  const getPayloadInitialBody = tip => {
    const payload = {
      ...pick(manageOrderState || {}, manageOrderPayload),
      orderDelivery:
        order.orderType === ORDER_TYPES.residential
          ? {}
          : order.orderType === ORDER_TYPES.service
          ? {
              return: getPayload(manageOrderState?.orderDelivery?.delivery),
            }
          : {
              pickup: getPayload(manageOrderState?.orderDelivery?.pickup),
              return: getPayload(manageOrderState?.orderDelivery?.delivery),
            },
    };
    payload.isPickupCancelled = false;
    if (tip) {
      if (order.orderType !== ORDER_TYPES.residential) {
        if (tip) {
          if (deliveryTipFor === onDemandDeliveryTypes.pickupAndDelivery) {
            payload.orderDelivery.pickup.courierTip = tip / 2;
            payload.orderDelivery.return.courierTip = tip / 2;
          } else if (deliveryTipFor === onDemandDeliveryTypes.pickup) {
            payload.orderDelivery.pickup.courierTip = tip;
          } else if (deliveryTipFor === onDemandDeliveryTypes.delivery) {
            payload.orderDelivery.return.courierTip = tip;
          }
        }
        if (isEmpty(payload.orderDelivery.return)) {
          payload.returnMethod = RETURN_METHODS.inStorePickup;
          delete payload.orderDelivery.return;
        }
      }
    }

    return payload;
  };

  const updateOrder = async tip => {
    try {
      dispatch({type: actionTypes.SET_LOADING, payload: true});

      const body = getPayloadInitialBody(tip);

      // For Walk-in orders, we need not send pickup.
      if (isEmpty(body.orderDelivery.pickup)) {
        delete body.orderDelivery.pickup;
      }
      // For in store pickup orders, we need to remove the delivery, if not there.
      if (isEmpty(body.orderDelivery.return)) {
        delete body.orderDelivery.return;
      }
      // Add Subscription.
      if (!isEmpty(body?.subscription) && body?.subscription?.id) {
        body.subscription = {
          id: body.subscription.id,
          pickupTimingsId: body.subscription.pickupTimingsId,
          deliveryTimingsId: body.subscription.deliveryTimingsId,
          pickupWindow: body.subscription.pickupWindow || [],
          returnWindow: body.subscription.returnWindow || [],
          paymentToken: body.subscription.paymentToken,
          servicePriceId: body.subscription.servicePriceId,
          modifierIds: body.subscription.modifierIds,
          interval: Number(body.subscription.interval),
          weekday: Number(
            getLuxonWeekDayFromMillis(
              body.subscription?.pickupWindow?.[0],
              manageOrderState?.timeZone
            ) - 1
          ),
        };
      } else {
        delete body.subscription;
      }

      const res = await manageOrder(orderToken, body);
      if (res?.data?.success) {
        dispatch({type: actionTypes.API_SUCCESS});
        onOrderUpdate(res?.data?.order);
        onClose();
      }
    } catch (error) {
      toast.error(<ToastError message={"Error while updating your order"} />);
      dispatch({
        type: actionTypes.API_FAILURE,
        payload: error?.response?.data?.error || error?.message,
      });
    }
  };

  const shouldAskForTip = (pickupOrDelivery, returnProvider) => {
    const {status, courierTip, deliveryProvider, type} = pickupOrDelivery;
    // TOOD: Check if cancelled status is to be included. Also, ask for tip only if it is 0 or less.
    return (
      //status will be undefined if we are creating delivery
      ((!status && type === ORDER_DELIVERY_TYPES.return) ||
        canUpdateOrderDelivery(status)) &&
      !courierTip &&
      deliveryProvider === deliveryProviders.doorDash &&
      (!returnProvider ||
        (type === ORDER_DELIVERY_TYPES.return &&
          returnProvider === RETURN_METHODS.delivery))
    );
  };

  const submitManageOrder = () => {
    if (shouldShowNewPaymentScreen && order.orderType !== ORDER_TYPES.residential) {
      setShowNewPaymentMethod(true);
      return;
    }
    const {pickup, delivery} = manageOrderState?.orderDelivery || {};
    let validityError;
    if (order.orderType !== ORDER_TYPES.residential) {
      const orderValidator = new OrderValidator(manageOrderState, {
        intakeCompletedAt: order.intakeCompletedAt,
        orderType: order.orderType,
        timeZone: manageOrderState?.timeZone,
        isProcessingCompleted: order.isProcessingCompleted,
        turnAroundInHours: generalDeliverySettings?.turnAroundInHours,
        bufferTimeInHours:
          deliverySettings?.ownDriverDeliverySettings?.deliveryWindowBufferInHours ||
          deliverySettings?.ownDriverDeliverySettings?.ownDeliverySettings
            ?.deliveryWindowBufferInHours,
      });
      validityError = orderValidator.invalidErrorMessage(
        ORDER_VALIDATOR_CALLED_FROM.MANAGE_ORDER
      );
    }
    if (validityError) {
      toast.error(<ToastError message={validityError} />);
      dispatch({
        type: actionTypes.API_FAILURE,
        payload: validityError,
      });
    } else {
      shouldAskForTip(pickup) || shouldAskForTip(delivery, manageOrderState.returnMethod)
        ? setShowDeliveryTipModal(true)
        : updateOrder();
    }
  };

  // WRITE ALL USE_EFFECTS HERE!
  // Please don't change the order of them.

  useEffect(() => {
    (async () => {
      if (!mounted.current) {
        try {
          dispatch({type: actionTypes.SET_INIT_LOADING, payload: true});
          const [
            generalDeliverySettingsRes,
            onDemandDeliverySettingsRes,
            customerInfoRes,
            pickupAndDeliverySettingRes,
            servicesRes,
            subscriptionsListRes,
          ] = await Promise.all([
            fetchGeneralDeliverySettings(order.store.id),
            fetchOnDemandDeliverySettings(order.store.id),
            fetchCustomerInfo(order.store.id),
            fetchOrderDeliveries(orderToken),
            order?.orderType === ORDER_TYPES.online && !order?.isIntakeComplete
              ? fetchServicesAndModifiers(order?.store?.id, order?.pickup?.postalCode)
              : null,
            fetchSubscriptions(),
          ]);

          const paymentDetails = initPaymentDetails(
            customerInfoRes?.data?.customer?.paymentMethods || [],
            order?.latestPayment
          );
          setCustomerPaymentMethods(paymentDetails?.customerPaymentMethods || []);

          dispatch({
            type: actionTypes.SET_INIT_STATE,
            payload: {
              order,
              customerInfo: customerInfoRes?.data?.customer,
              generalDeliverySettings:
                generalDeliverySettingsRes?.data?.generalDeliverySettings,
              onDemandDeliverySettings:
                onDemandDeliverySettingsRes?.data?.onDemandDeliverySettings,
              pickup: pickupAndDeliverySettingRes?.data?.pickup,
              delivery: pickupAndDeliverySettingRes?.data?.delivery,
              services: servicesRes?.data?.services || [],
              servicePriceId: order.orderItems[0].servicePriceId,
              modifierIds:
                order.orderItems[0]?.modifierLineitems?.map(modifier => {
                  return modifier?.serviceModifierId
                    ? modifier.serviceModifierId
                    : modifier;
                }) || [],
              subscriptionsList: subscriptionsListRes?.data?.subscriptions || [],
              paymentToken: paymentDetails?.currentPaymentMethod?.paymentMethodToken,
            },
          });
        } catch (error) {
          toast.error(
            <ToastError
              message={"Error while fetching own demand or general delivery settings"}
            />
          );
          dispatch({type: actionTypes.SET_INIT_LOADING, payload: false});
        } finally {
          dispatch({type: actionTypes.SET_LOADING, payload: false});
        }
      }
    })();
  }, [customerInfo?.paymentMethods, order, orderToken]);

  useEffect(() => {
    if (addressToValidate?.postalCode && canShowPickupDeliveryDetails) {
      validateServiceabilityOfAddress(addressToValidate);
    }
  }, [addressToValidate, canShowPickupDeliveryDetails, validateServiceabilityOfAddress]);

  useEffect(() => {
    if (errorToastMessage) {
      toast.error(<ToastError message={errorToastMessage} />);
      dispatch({type: actionTypes.SET_ERROR_TOAST_MESSAGE, payload: null});
    }
  }, [errorToastMessage]);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const saveNewCard = async paymentData => {
    dispatch({type: actionTypes.SET_LOADING, payload: true});
    addNewCard(
      paymentData,
      !isEmpty(selectedAddress) ? selectedAddress : customerAddresses[0],
      customerInfo.id,
      response => {
        const paymentDetails = initPaymentDetails(response || [], order?.latestPayment);
        setCustomerPaymentMethods(paymentDetails?.customerPaymentMethods || []);

        dispatch({
          type: actionTypes.CHANGE_MANAGE_ORDER_STATE,
          payload: {
            field: "paymentToken",
            value: paymentData?.payment?.id,
          },
        });
        setShowPaymentMethodList(true);
        setShowNewPaymentMethod(false);
        dispatch({type: actionTypes.SET_LOADING, payload: false});
      },
      error => {
        setShowNewPaymentMethod(false);
        toast.error(<ToastError message={error} />);
        dispatch({type: actionTypes.SET_LOADING, payload: false});
      }
    );
  };

  /**
   * Add the new card to the customerPaymentMethods state
   *
   * @param {Object} paymentData
   */
  const addNewCardToState = paymentData => {
    saveCardToState(
      paymentData,
      customerInfo.id,
      customerPaymentMethods,
      paymentMethods => {
        setCustomerPaymentMethods(paymentMethods);
        dispatch({
          type: actionTypes.CHANGE_MANAGE_ORDER_STATE,
          payload: {
            field: "paymentToken",
            value: paymentData?.payment?.id,
          },
        });
        dispatch({
          type: actionTypes.UPDATE_CUSTOMER_INFO,
          payload: {
            ...customerInfo,
            paymentMethods: paymentMethods,
          },
        });
        setShowPaymentMethodList(true);
        setShowNewPaymentMethod(false);
      }
    );
  };

  return (
    <>
      {showNewPaymentMethod ? (
        <Elements stripe={stripePromise}>
          <AddPaymentMethod
            goBack={() => {
              window.scrollTo(0, 0);
              setShowNewPaymentMethod(false);
              setShowPaymentMethodList(true);
            }}
            onSave={paymentInfo => {
              if (paymentInfo.rememberPaymentMethod) {
                saveNewCard(paymentInfo);
              } else {
                addNewCardToState(paymentInfo);
              }
            }}
            isDockModal
            isOpen={showNewPaymentMethod}
          />
        </Elements>
      ) : (
        <ScreenWrapper
          header={`Manage Order #${order.orderCodeWithPrefix}`}
          disableSubmit={
            order?.orderType === ORDER_TYPES.residential && order?.isIntakeComplete
          }
          onClose={onClose}
          error={error}
          loading={
            loading ||
            initLoading ||
            ownDriverDeliverySettingsLoading ||
            (canShowPickupDeliveryDetails && initialAddressValidation) ||
            checkingDoorDashServiceability
          }
          submitText="UPDATE MY ORDER"
          onSubmit={submitManageOrder}
          enableHeaderShadow
        >
          {canShowPickupDeliveryDetails ? (
            <PickupAndDeliveryDetails
              generalDeliverySettings={generalDeliverySettings}
              onDemandDeliverySettings={onDemandDeliverySettings}
              ownDriverDeliverySettings={ownDriverDeliverySettings}
              selectedAddress={selectedAddress}
              customerAddresses={customerAddresses}
              manageOrderState={manageOrderState}
              orderStatus={order?.status}
              intakeCompletedAt={order?.intakeCompletedAt}
              isProcessingCompleted={order?.isProcessingCompleted}
              showAddressSelection={showAddressSelection}
              showDeliveryWindows={showDeliveryWindows}
              serviceableByOnDemand={serviceableByOnDemand}
              subscriptionsList={subscriptionsList.filter(
                sub => sub?.recurringSubscriptionId !== manageOrderState?.subscription?.id
              )}
              dispatch={dispatch}
              shouldShowDeliveryWindows={shouldShowDeliveryWindows}
            />
          ) : null}
          <PreferencesAndNotes
            customerNotes={manageOrderState.customerNotes}
            orderNotes={manageOrderState.orderNotes}
            businessId={order?.store?.businessId}
            isIntakeComplete={order?.isIntakeComplete}
            dispatch={dispatch}
            customer={{
              notes: manageOrderState.customerNotes,
              hangDryInstructions: manageOrderState.hangDryInstructions,
              isHangDrySelected: manageOrderState.isHangDrySelected,
              storeCustomerId: order?.customer?.storeCustomerId,
            }}
            fromManageOrder={true}
          />
          {manageOrderState.orderType === ORDER_TYPES.online &&
          !order?.isIntakeComplete ? (
            <ServiceAndModifiers
              services={services}
              servicePriceId={manageOrderState.servicePriceId}
              modifierIds={manageOrderState.modifierIds}
              dispatch={dispatch}
              shouldShowCurrentOrRecurringChoice={
                !isEmpty(manageOrderState?.subscription) &&
                !manageOrderState?.subscription.deletedAt
              }
              postalCode={order?.pickup?.postalCode}
              storeId={manageOrderState.storeId}
            />
          ) : null}

          {order.orderType !== ORDER_TYPES.residential ? (
            <PaymentSection
              customer={customerInfo}
              onShowNewPaymentMethod={() => {
                setShowNewPaymentMethod(true);
              }}
              showPaymentMethods={showPaymentMethodList}
              dispatch={dispatch}
              customerPaymentMethods={customerPaymentMethods}
              paymentToken={manageOrderState.paymentToken}
              hasSubscription={
                !isEmpty(manageOrderState?.subscription) &&
                order.orderType === ORDER_TYPES.online &&
                !manageOrderState?.subscription.deletedAt
              }
            />
          ) : null}

          <AddDeliveryTip
            deliveryTip={manageOrderState?.orderDelivery?.delivery?.courierTip}
            onAddDeliveryTip={setDeliveryTip}
            deliveryTipFor={deliveryTipFor}
            showDeliveryTipModal={showDeliveryTipModal}
            setShowDeliveryTipModal={setShowDeliveryTipModal}
          />
        </ScreenWrapper>
      )}
    </>
  );
};

export default ManageOrder;
