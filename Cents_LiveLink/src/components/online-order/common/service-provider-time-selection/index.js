import React, {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from "react";
import {Box, Button, Text} from "rebass/styled-components";
import {DateTime} from "luxon";
import {toast} from "react-toastify";
import PropTypes from "prop-types";

import styles from "./index.styles";

import {getUberAuthenticationToken} from "../../../../api/uber";
import {deliveryProviders} from "../../constants";
import {INTERVAL_DISPLAY} from "../../../../constants/subscriptions";
import {getCurrentTimezone} from "../../../../utils/date";
import {canUpdateOrderDelivery} from "../../../../utils";

import {
  DELIVERY_PROVIDERS,
  DELIVERY_TRACKING_ORDER_STATUSES,
  INITIAL_PICKUP_AND_DELIVERY_STATE,
  ORDER_DELIVERY_TYPES,
  ORDER_TYPES,
  RETURN_METHODS,
} from "../../../../constants/order";
import {getTimeFromMilliSeconds} from "../../utils";
import {
  buildOnSubmitPayload,
  getAutoScheduledDelivery,
  getDoodashDeliveryEstimates,
  isSameDay,
} from "./utils";
import {buildDeliveryOptions} from "./reducer-functions";
import reducerFactory from "./reducer";
import windowSelectionActions from "./actions";
import {PillTabs, ReturnDeliveryConfirmationPopup, ToastError} from "../../../common";
import FooterTimeWindow from "./FooterTimeWindow";
import DeliveryWindowsSelection from "./DeliveryWindowsSelection";
import ScheduleReturnDeliveryCard from "./ScheduleReturnDeliveryCard";

const initState = {
  error: null,
  timeZone: null,
  loading: false,
  isPickup: true,
  uberAuthToken: null,
  returnMethod: null,
  ownDriverDeliverySettings: null,
  onDemandDeliverySettings: null,
  intakeCompletedAtInMillis: null,
  isDeliveryWindowSelectedManually: false,
  turnAroundInHours: 0,
  fetchingPickupEstimates: false,
  fetchingDeliveryEstimates: false,
  orderType: null,
  isProcessingCompleted: false,
  currentOrderDelivery: {},
  currentReturnMethod: null,
  orderDelivery: {
    pickup: {
      ...INITIAL_PICKUP_AND_DELIVERY_STATE,
      type: ORDER_DELIVERY_TYPES.pickup,
    },
    delivery: {
      ...INITIAL_PICKUP_AND_DELIVERY_STATE,
      type: ORDER_DELIVERY_TYPES.return,
    },
  },
  showTurnAroundTimePopup: false,
};

const ServiceProviderTimeSelection = (props) => {
  const {
    orderType: initOrderType,
    setLoading,
    returnMethod: defaultReturnMethod = null,
    orderDelivery,
    customerAddress,
    ownDeliveryStore,
    turnAroundInHours: initTurnAroundInHours,
    onDeliveryTypeChange,
    onDemandDeliveryStore,
    timeZone: storeTimeZone,
    intakeCompletedAt,
    isProcessingCompleted: initIsProcessingCompleted,
    onServiceProviderTimeChange,
    subscription,
    showSubscriptionBanner,
    onViewSubscriptionClick,
    onNewSubscriptionClick,
    forceOrderDeliveryType,
    setForceOrderDeliveryType,
    shouldShowDeliveryWindows,
  } = props;

  const mounted = useRef(false);
  const timeout = useRef();

  const [animateParent, setAnimateParent] = useState(false);

  const [
    {
      error,
      loading,
      isPickup,
      timeZone,
      orderType,
      returnMethod,
      orderDelivery: {pickup, delivery},
      currentOrderDelivery,
      isProcessingCompleted,
      intakeCompletedAtInMillis,
      turnAroundInHours,
      fetchingPickupEstimates,
      fetchingDeliveryEstimates,
      showTurnAroundTimePopup,
    },
    dispatch,
  ] = useReducer(reducerFactory, initState);

  const isNotServiceOrder = orderType !== ORDER_TYPES.service;

  const isInStorePickup = useMemo(() => {
    return returnMethod === RETURN_METHODS.inStorePickup;
  }, [returnMethod]);

  const tabs = [
    {
      id: deliveryProviders.ownDriver,
      title: `Standard ${isPickup ? "Pickup" : "Delivery"}`,
      isAvailable: !!ownDeliveryStore?.storeId && ownDeliveryStore.active,
    },
    {
      id: deliveryProviders.doorDash,
      title: "On Demand",
      isAvailable:
        !!onDemandDeliveryStore?.storeId &&
        onDemandDeliveryStore.active &&
        onDemandDeliveryStore?.doorDashEnabled,
    },
  ].filter((t) => t.isAvailable);

  const canUpdatePickup = useMemo(() => canUpdateOrderDelivery(pickup?.status), [pickup]);

  const selectedOrderDelivery = useMemo(() => {
    return isPickup ? pickup : delivery;
  }, [pickup, delivery, isPickup]);

  const currentTabId = useMemo(() => {
    return selectedOrderDelivery?.deliveryProvider;
  }, [selectedOrderDelivery]);

  useEffect(() => {
    if (mounted.current && forceOrderDeliveryType) {
      dispatch({
        type: windowSelectionActions.SET_IS_PICKUP,
        payload: {
          isPickup: forceOrderDeliveryType === ORDER_DELIVERY_TYPES.pickup,
        },
      });
      setForceOrderDeliveryType();
    }
  }, [forceOrderDeliveryType, setForceOrderDeliveryType]);

  useEffect(() => {
    if (
      !pickup.doorDashEstimate &&
      pickup.deliveryWindow?.length &&
      pickup.deliveryProvider === DELIVERY_PROVIDERS.doorDash
    ) {
      getDoodashDeliveryEstimates({
        deliveryWindow: pickup.deliveryWindow,
        type: "pickup",
        dispatch,
        customerAddress,
        storeId: onDemandDeliveryStore.storeId,
        onError: (err) => toast.error(<ToastError message={err} />),
      });
    }
  }, [
    customerAddress,
    pickup.deliveryWindow,
    pickup.deliveryProvider,
    pickup.doorDashEstimate,
    onDemandDeliveryStore.storeId,
  ]);

  useEffect(() => {
    if (
      !delivery.doorDashEstimate &&
      delivery.deliveryWindow?.length &&
      delivery.deliveryProvider === DELIVERY_PROVIDERS.doorDash
    ) {
      getDoodashDeliveryEstimates({
        deliveryWindow: delivery.deliveryWindow,
        type: "delivery",
        dispatch,
        customerAddress,
        storeId: onDemandDeliveryStore.storeId,
        onError: (err) => toast.error(<ToastError message={err} />),
      });
    }
  }, [
    customerAddress,
    delivery.deliveryWindow,
    delivery.deliveryProvider,
    delivery.doorDashEstimate,
    onDemandDeliveryStore.storeId,
  ]);

  const storeSettings = useMemo(() => {
    return currentTabId === deliveryProviders.ownDriver
      ? ownDeliveryStore
      : onDemandDeliveryStore;
  }, [currentTabId, onDemandDeliveryStore, ownDeliveryStore]);

  useEffect(() => {
    if (!mounted.current) {
      dispatch({
        type: windowSelectionActions.INIT,
        payload: {
          orderDelivery,
          timeZone: storeTimeZone,
          returnMethod: defaultReturnMethod,
          ownDriverDeliverySettings: ownDeliveryStore,
          onDemandDeliverySettings: onDemandDeliveryStore,
          turnAroundInHours: initTurnAroundInHours,
          orderType: initOrderType,
          isProcessingCompleted: initIsProcessingCompleted,
          intakeCompletedAtInMillis: intakeCompletedAt
            ? new Date(intakeCompletedAt).getTime()
            : null,
        },
      });
    }
  }, [
    initOrderType,
    orderDelivery,
    storeTimeZone,
    defaultReturnMethod,
    ownDeliveryStore,
    onDemandDeliveryStore,
    intakeCompletedAt,
    initTurnAroundInHours,
    initIsProcessingCompleted,
  ]);

  useEffect(() => {
    if (setLoading) {
      setLoading(loading || fetchingPickupEstimates || fetchingDeliveryEstimates);
    }
  }, [setLoading, loading, fetchingPickupEstimates, fetchingDeliveryEstimates]);

  const onTabChange = (newTab) => {
    if (newTab?.id !== currentTabId) {
      dispatch({type: windowSelectionActions.SET_CURRENT_TAB, payload: newTab});
    }
  };

  const authenticateWithUber = useCallback(async () => {
    try {
      dispatch({type: windowSelectionActions.API_STARTED});
      const uberAuthentication = await getUberAuthenticationToken();
      dispatch({
        type: windowSelectionActions.SET_UBER_AUTH_TOKEN,
        payload: uberAuthentication.data.uberToken,
      });
    } catch (error) {
      dispatch({
        type: windowSelectionActions.API_FAILED,
        payload: error?.response?.data?.error || "Could not authenticate uber",
      });
    }
  }, []);

  // TODO: Do we need this now?
  useEffect(() => {
    if (onDemandDeliveryStore.active) {
      authenticateWithUber();
    }
  }, [authenticateWithUber, onDemandDeliveryStore.active]);

  const latestDeliveryStartTime = useMemo(() => {
    // If processing is completed, current time is enough to set as latest delivery time.
    if (isProcessingCompleted) {
      return DateTime.local().setZone(timeZone);
    }

    const minTime = pickup?.deliveryWindow?.[0] || intakeCompletedAtInMillis || null;

    if (minTime) {
      const minTimeObject = getTimeFromMilliSeconds(minTime, timeZone);
      const minTimeWithTurnAround = minTimeObject.plus({hours: turnAroundInHours});

      const {
        deliveryWindow: [startTime],
      } = getAutoScheduledDelivery(
        minTimeObject,
        {},
        {
          ...buildDeliveryOptions({
            orderType,
            orderDelivery: {
              pickup,
              delivery,
            },
            isDeliveryWindowSelectedManually: true,
            ownDriverDeliverySettings: ownDeliveryStore,
            onDemandDeliverySettings: onDemandDeliveryStore,
            timeZone,
            turnAroundInHours,
          }),
          isAutoScheduleDelivery: true,
        }
      ) || {deliveryWindow: []};

      if (!startTime) {
        return null;
      }

      const startTimeForAutoScheduledWindow = getTimeFromMilliSeconds(
        startTime,
        timeZone
      );

      const latestTime = isSameDay(
        startTimeForAutoScheduledWindow,
        minTimeWithTurnAround,
        timeZone
      )
        ? minTimeWithTurnAround
        : startTimeForAutoScheduledWindow.startOf("day");

      return latestTime > DateTime.local().setZone(timeZone)
        ? latestTime
        : DateTime.local().setZone(timeZone);
    } else {
      return null;
    }
  }, [
    pickup,
    delivery,
    timeZone,
    orderType,
    ownDeliveryStore,
    turnAroundInHours,
    onDemandDeliveryStore,
    isProcessingCompleted,
    intakeCompletedAtInMillis,
  ]);

  const toggleShowTurnAroundTimePopup = () => {
    dispatch({
      type: windowSelectionActions.TOGGLE_TURNAROUND_TIME_POPUP,
    });
  };

  const onSubmit = () => {
    if (isPickup && !returnMethod) {
      toggleShowTurnAroundTimePopup();
    } else {
      onServiceProviderTimeChange(
        buildOnSubmitPayload({
          pickup,
          delivery,
          storeSettings,
          returnMethod,
          onDemandDeliveryStore,
          ownDeliveryStore,
        })
      );
    }
  };

  const handleInstorePickup = () => {
    dispatch({
      type: windowSelectionActions.UPDATE_RETURN_METHOD,
      payload: {
        returnMethod: RETURN_METHODS.inStorePickup,
        toggleTurnAroundTimePopup: true,
      },
    });
    onServiceProviderTimeChange(
      buildOnSubmitPayload({
        pickup,
        delivery,
        storeSettings,
        returnMethod: RETURN_METHODS.inStorePickup,
        onDemandDeliveryStore,
        ownDeliveryStore,
      })
    );
  };

  const handleSetDelivery = (toggleTurnAroundTimePopup) => {
    dispatch({
      type: windowSelectionActions.UPDATE_RETURN_METHOD,
      payload: {
        returnMethod: RETURN_METHODS.delivery,
        toggleTurnAroundTimePopup,
      },
    });
  };

  const onNewSubscriptionClickHandler = () => {
    onNewSubscriptionClick(
      buildOnSubmitPayload({
        pickup,
        delivery,
        storeSettings,
        returnMethod,
        onDemandDeliveryStore,
        ownDeliveryStore,
      })
    );
  };

  const onViewSubscriptionClickHandler = () => {
    onViewSubscriptionClick(
      buildOnSubmitPayload({
        pickup,
        delivery,
        storeSettings,
        returnMethod,
        onDemandDeliveryStore,
        ownDeliveryStore,
      })
    );
  };

  const deliverToMeClickHandler = () => {
    dispatch({
      type: windowSelectionActions.TOGGLE_IN_STORE_PICKUP,
      payload: {
        dayWiseWindows: storeSettings?.dayWiseWindows || [],
        turnAroundInHours,
      },
    });
  };

  const getSubmitButtonText = () => {
    const hasPickup = isNotServiceOrder && (!pickup.status || canUpdatePickup);
    const hasDelivery =
      returnMethod &&
      (!delivery.status || canUpdateOrderDelivery(delivery?.status)) &&
      !isInStorePickup;

    if (!hasPickup || !hasDelivery) {
      return `SCHEDULE ${!hasPickup ? "DELIVERY" : "PICKUP"}`;
    }

    return "SCHEDULE PICKUP AND DELIVERY";
  };

  const getProcessingCompletedTime = useMemo(() => {
    const timeDiff = getTimeFromMilliSeconds(pickup?.deliveryWindow?.[0], timeZone).plus({
      hours: turnAroundInHours,
    });

    return {
      day: timeDiff?.weekdayLong,
      time: timeDiff.toFormat("hh:mma"),
    };
  }, [turnAroundInHours, pickup, timeZone]);

  const showParentAnimation = () => {
    if (timeout.current) {
      clearInterval(timeout.current);
    }
    setAnimateParent(true);
    timeout.current = setTimeout(() => {
      setAnimateParent(false);
    }, 1000);
  };

  const parentClassName = animateParent
    ? `animated slide-in-${isPickup ? "left" : "right"}`
    : "";

  // This effect should be the last one to be triggered
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  useEffect(() => {
    onDeliveryTypeChange(isPickup ? "Pickup" : "Delivery");
  }, [isPickup, onDeliveryTypeChange]);

  return (
    <Box {...styles.parentContainer}>
      {showSubscriptionBanner ? (
        <Box {...styles.recurringContainer}>
          {subscription?.interval ? (
            <>
              <Text {...styles.recurringText}>
                {INTERVAL_DISPLAY[subscription?.interval]?.toUpperCase()}
              </Text>
              <Text {...styles.subscriptionCTA} onClick={onViewSubscriptionClickHandler}>
                view recurring order
              </Text>
            </>
          ) : (
            <Text {...styles.subscriptionCTA} onClick={onNewSubscriptionClickHandler}>
              Make recurring
            </Text>
          )}
        </Box>
      ) : null}
      <Box {...styles.scrollableContainer}>
        <Box
          {...styles.contentContainer}
          height={isPickup ? "100%" : "113%"}
          className={parentClassName}
        >
          {tabs.length > 1 && (isPickup || !isInStorePickup) ? (
            <PillTabs
              tabs={tabs}
              currentTabId={currentTabId}
              onTabChange={onTabChange}
              wrapperStyle={{mb: "24px", fontSize: ["14px", "16px"]}}
            />
          ) : null}
          <DeliveryWindowsSelection
            isInStorePickup={isInStorePickup}
            initIsProcessingCompleted={initIsProcessingCompleted}
            returnMethod={returnMethod}
            dispatch={dispatch}
            storeSettings={storeSettings}
            turnAroundInHours={turnAroundInHours}
            handleSetDelivery={handleSetDelivery}
            getProcessingCompletedTime={getProcessingCompletedTime}
            currentTabId={currentTabId}
            isPickup={isPickup}
            selectedOrderDelivery={selectedOrderDelivery}
            pickup={pickup}
            latestDeliveryStartTime={latestDeliveryStartTime}
            timeZone={timeZone}
            isProcessingCompleted={isProcessingCompleted}
            currentOrderDelivery={currentOrderDelivery}
            customerAddress={customerAddress}
            setLoading={setLoading}
            initOrderType={initOrderType}
            canUpdatePickup={canUpdatePickup}
            shouldShowDeliveryWindows={shouldShowDeliveryWindows}
          />
        </Box>

        <Box
          {...styles.footer}
          sx={
            initIsProcessingCompleted && isInStorePickup
              ? {...styles.footer.sx, boxShadow: "none"}
              : {...styles.footer.sx}
          }
        >
          {error && (
            <Text variant="errorMessage" {...styles.footer.errorMessage}>
              {error}
            </Text>
          )}
          {initIsProcessingCompleted && isInStorePickup ? (
            <>
              <ScheduleReturnDeliveryCard onDeliverToMeClick={deliverToMeClickHandler} />
              <Button {...styles.button} onClick={onSubmit}>
                I’ll pick up in store
              </Button>
            </>
          ) : (
            <>
              {orderType !== ORDER_TYPES.service &&
              !(isPickup && !returnMethod) &&
              orderDelivery?.pickup?.status !==
                DELIVERY_TRACKING_ORDER_STATUSES.completed ? (
                <FooterTimeWindow
                  isInStorePickup={isInStorePickup}
                  isPickup={isPickup}
                  timeZone={timeZone}
                  delivery={delivery}
                  pickup={pickup}
                  isNotServiceOrder={isNotServiceOrder}
                  dispatch={dispatch}
                  onDeliveryWindowsToggle={showParentAnimation}
                />
              ) : null}
              <Button
                {...styles.button}
                onClick={onSubmit}
                disabled={
                  (isNotServiceOrder &&
                    (!pickup.status || canUpdatePickup) &&
                    !pickup?.timingsId) ||
                  (returnMethod === RETURN_METHODS.delivery && !delivery?.timingsId)
                }
              >
                {getSubmitButtonText()}
              </Button>
            </>
          )}
        </Box>
      </Box>

      <ReturnDeliveryConfirmationPopup
        isOpen={showTurnAroundTimePopup}
        toggle={toggleShowTurnAroundTimePopup}
        onClick={() => handleSetDelivery(true)}
        handleGotIt={handleInstorePickup}
        day={getProcessingCompletedTime?.day}
        time={getProcessingCompletedTime?.time}
      />
    </Box>
  );
};

ServiceProviderTimeSelection.propTypes = {
  orderType: PropTypes.oneOf([...Object.values(ORDER_TYPES)]),
  onServiceProviderTimeChange: PropTypes.func.isRequired,
  orderDelivery: PropTypes.object.isRequired,
  ownDeliveryStore: PropTypes.object,
  onDemandDeliveryStore: PropTypes.object,
  setLoading: PropTypes.func,
  customerAddress: PropTypes.object.isRequired,
  turnAroundInHours: PropTypes.number.isRequired,
  intakeCompletedAt: PropTypes.string,
  isProcessingCompleted: PropTypes.bool,
  timeZone: PropTypes.string,
  showSubscriptionBanner: PropTypes.bool,
  onViewSubscriptionClick: PropTypes.func,
  onNewSubscriptionClick: PropTypes.func,
};

ServiceProviderTimeSelection.defaultProps = {
  orderType: ORDER_TYPES.online,
  ownDeliveryStore: {},
  onDemandDeliveryStore: {},
  setLoading: undefined,
  isProcessingCompleted: false,
  showSubscriptionBanner: false,
  timeZone: getCurrentTimezone(),
  onViewSubscriptionClick: () => {},
  onNewSubscriptionClick: () => {},
};

export default ServiceProviderTimeSelection;
