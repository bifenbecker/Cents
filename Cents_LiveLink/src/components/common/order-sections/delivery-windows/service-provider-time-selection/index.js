import React, {useContext, useEffect, useMemo, useReducer, useRef, useState} from "react";
import {Box, Button, Text} from "rebass/styled-components";
import {Button as MiUiButton, Grid, Container} from "@material-ui/core";
import {toast} from "react-toastify";
import PropTypes from "prop-types";
import isEmpty from "lodash/isEmpty";
import {useParams} from "react-router-dom";

import WindowsSelectionDispatch from "./context";

import styles from "./index.styles";

import {INTERVAL_DISPLAY} from "../../../../../constants/subscriptions";
import {getCurrentTimezone, getTimeFromMilliSeconds} from "../../../../../utils/date";
import {canUpdateOrderDelivery} from "../../../../../utils";
import {
  DELIVERY_PROVIDERS,
  DELIVERY_TRACKING_ORDER_STATUSES,
  INITIAL_PICKUP_AND_DELIVERY_STATE,
  ORDER_DELIVERY_TYPES,
  ORDER_TYPES,
  RETURN_METHODS,
  SCHEDULE_BUTTONS,
} from "../../../../../constants/order";
import {
  buildOnSubmitPayload,
  fetchOwnDriverDeliveryFee,
  getDeliveryProviderFromOrderDelivery,
  getDoodashDeliveryEstimates,
} from "./utils";
import reducerFactory from "./reducer";
import {
  initAction,
  rescheduleDeliveryAction,
  setCurrentTabAction,
  setErrorToastMessageAction,
  setIsPickupAction,
  setOwnDriverWindowsApiLoadingAction,
  setPickupOrReturnWindowsAction,
  toggleInstorePickupAction,
  toggleTurnaroundTimePopupAction,
  updateReturnMethodAction,
  setAllPickupDayWiseWindows,
  setAllReturnDayWiseWindows,
  resetAllDayWiseWindows,
} from "./actions";
import PickupDayWiseWindowsService from "../../../../../services/order-delivery-day-wise-windows-service/pickup";
import DeliveryDayWiseWindowsService from "../../../../../services/order-delivery-day-wise-windows-service/delivery";

import {ReturnDeliveryConfirmationPopup, ToastError} from "../../../.";
import FooterTimeWindow from "./FooterTimeWindow";
import DeliveryWindowsSelection from "./DeliveryWindowsSelection";
import ScheduleReturnDeliveryCard from "./ScheduleReturnDeliveryCard";
import {RecommendedWindows} from "components/online-order/business/schedule/RecommendedWindows";

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
    deliveryFee: {
      ownDriver: {deliveryFeeInCents: null},
    },
  },
  showTurnAroundTimePopup: false,
  pickupDayWiseWindows: [],
  returnDayWiseWindows: [],
  fetchingOwnDriverWindows: false,
  errorToastMessage: null,
  currentOrderDelivery: {},
  allPickupDayWiseWindows: {},
  allReturnDayWiseWindows: {},
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
    skipInitialValidation,
    isAllWindowsRequirement = false,
  } = props;
  const mounted = useRef(false);
  const timeout = useRef();

  const {businessId} = useParams();

  const [animateParent, setAnimateParent] = useState(false);
  const [showRecommendedWindows, setShowRecommendedWindows] = useState(true);

  const [state, dispatch] = useReducer(reducerFactory, initState);
  const {
    orderDelivery: {pickup, delivery, deliveryFee},
    fetchingOwnDriverWindows,
  } = state;
  const isNotServiceOrder = state.orderType !== ORDER_TYPES.service;

  const isInStorePickup = useMemo(() => {
    return state.returnMethod === RETURN_METHODS.inStorePickup;
  }, [state.returnMethod]);

  const tabs = [
    {
      id: DELIVERY_PROVIDERS.ownDriver,
      title: `Standard ${state.isPickup ? "Pickup" : "Delivery"}`,
      isAvailable: !!ownDeliveryStore?.storeId && ownDeliveryStore.active,
    },
    {
      id: DELIVERY_PROVIDERS.doorDash,
      title: "On Demand",
      isAvailable:
        !!onDemandDeliveryStore?.storeId &&
        onDemandDeliveryStore?.active &&
        onDemandDeliveryStore?.doorDashEnabled,
    },
  ].filter((t) => t.isAvailable);

  const autoScheduleReturnDelivery = useMemo(() => {
    return ownDeliveryStore?.autoScheduleReturnEnabled;
  }, [ownDeliveryStore]);

  const canUpdatePickup = useMemo(() => canUpdateOrderDelivery(pickup?.status), [pickup]);

  const selectedOrderDelivery = useMemo(() => {
    return state.isPickup ? pickup : delivery;
  }, [pickup, delivery, state.isPickup]);

  const currentTabId = useMemo(() => {
    return selectedOrderDelivery?.deliveryProvider;
  }, [selectedOrderDelivery]);

  const showFooterTimeWindow = useMemo(() => {
    if (autoScheduleReturnDelivery) return true;

    const isNotServiceOrder = state.orderType !== ORDER_TYPES.service;
    const isReturn = !state.isPickup;
    const returnExists = state.returnMethod;
    const pickupNotCompleted =
      orderDelivery?.pickup?.status !== DELIVERY_TRACKING_ORDER_STATUSES.completed;

    return isNotServiceOrder && (isReturn || returnExists) && pickupNotCompleted;
  }, [
    autoScheduleReturnDelivery,
    state.orderType,
    state.isPickup,
    state.returnMethod,
    orderDelivery?.pickup?.status,
  ]);

  const {orderToken} = useParams();

  useEffect(() => {
    if (mounted.current && forceOrderDeliveryType) {
      dispatch(setIsPickupAction(forceOrderDeliveryType));
      setForceOrderDeliveryType();
    }
  }, [forceOrderDeliveryType, setForceOrderDeliveryType]);

  useEffect(() => {
    // only call delivery fee api if own delivery is available

    const deliveryFeeInCents =
      state?.orderDelivery?.deliveryFee?.ownDriver?.deliveryFeeInCents;

    if (ownDeliveryStore?.storeId) {
      const isReturnOnlyDelivery = !state.isPickup && isEmpty(orderDelivery.pickup);
      fetchOwnDriverDeliveryFee({
        dispatch,
        storeId: ownDeliveryStore.storeId,
        ...(isReturnOnlyDelivery && {orderToken}),
        onError: (err) => toast.error(<ToastError message={err} />),
      });
    }
  }, [ownDeliveryStore.storeId, state.isPickup]);

  const storeSettings = useMemo(() => {
    return currentTabId === DELIVERY_PROVIDERS.ownDriver
      ? ownDeliveryStore
      : onDemandDeliveryStore;
  }, [currentTabId, onDemandDeliveryStore, ownDeliveryStore]);

  useEffect(() => {
    if (!mounted.current) {
      const intakeCompletedAtInMillis = intakeCompletedAt
        ? new Date(intakeCompletedAt).getTime()
        : null;
      dispatch(
        initAction({
          orderDelivery,
          timeZone: storeTimeZone,
          returnMethod: defaultReturnMethod,
          ownDriverDeliverySettings: ownDeliveryStore,
          onDemandDeliverySettings: onDemandDeliveryStore,
          turnAroundInHours: initTurnAroundInHours,
          orderType: initOrderType,
          isProcessingCompleted: initIsProcessingCompleted,
          intakeCompletedAtInMillis,
          currentOrderDelivery: orderDelivery || {pickup: {}, delivery: {}},
          skipInitialValidation,
        })
      );
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
    skipInitialValidation,
  ]);

  useEffect(() => {
    if (state.errorToastMessage) {
      toast.error(<ToastError message={state.errorToastMessage} />);
      dispatch(setErrorToastMessageAction({value: null}));
    }
  }, [state.errorToastMessage]);

  // Fetching or setting pickup day wise windows.
  useEffect(() => {
    const {pickup: initPickup} = state.orderDelivery || {pickup: {}};
    const hasStandardDeliverySettings =
      !!ownDeliveryStore?.storeId && ownDeliveryStore.active;
    const isPickupUpdatable =
      initOrderType === ORDER_TYPES.online &&
      (!initPickup?.status || canUpdateOrderDelivery(initPickup?.status));
    const pickupProvider = getDeliveryProviderFromOrderDelivery({
      pickupOrReturn: {
        status: initPickup.status,
        deliveryProvider:
          initPickup?.deliveryProvider || orderDelivery?.pickup?.deliveryProvider,
      },
      type: ORDER_DELIVERY_TYPES.pickup,
      hasStandardDeliverySettings,
    });

    if (
      isAllWindowsRequirement &&
      !state.allPickupDayWiseWindows?.ownDriver?.length &&
      !state.allPickupDayWiseWindows?.onDemand?.length &&
      isPickupUpdatable &&
      pickupProvider
    ) {
      const pickupWindowsService = new PickupDayWiseWindowsService({
        timeZone: storeTimeZone,
        orderType: initOrderType,
        pickup,
        currentDayWiseWindows: state.pickupDayWiseWindows,
        onError: (err) => toast.error(<ToastError message={err} />),
        onDayWiseWindowsUpdate: (dayWiseWindows) =>
          dispatch(
            setPickupOrReturnWindowsAction({
              type: ORDER_DELIVERY_TYPES.pickup,
              dayWiseWindows: dayWiseWindows.length
                ? dayWiseWindows
                : state.pickupDayWiseWindows,
              orderType: initOrderType,
            })
          ),
        allWindowsUpdate: (dayWiseWindows) =>
          dispatch(
            setAllPickupDayWiseWindows(!isEmpty(dayWiseWindows) ? dayWiseWindows : null)
          ),
        rescheduleDelivery: (type) => dispatch(rescheduleDeliveryAction({type})),
      });
      pickupWindowsService.getOwnDriverDayWiseWindows({
        storeId: ownDeliveryStore?.storeId,
        zipCode: customerAddress?.postalCode,
        onLoading: (value) => dispatch(setOwnDriverWindowsApiLoadingAction({value})),
        currentOrderDelivery: state.currentOrderDelivery?.pickup,
        bufferTimeInHours:
          ownDeliveryStore?.deliveryWindowBufferInHours ||
          ownDeliveryStore?.ownDeliverySettings?.deliveryWindowBufferInHours,
      });
      pickupWindowsService.getOnDemandDayWiseWindows({
        initialDayWiseWindows: onDemandDeliveryStore?.dayWiseWindows,
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
    currentTabId,
    state.pickupDayWiseWindows,
    customerAddress,
    state.allPickupDayWiseWindows,
    state.orderDelivery,
    state.currentOrderDelivery?.pickup,
    isAllWindowsRequirement,
    pickup,
  ]);

  useEffect(() => {
    if (setLoading) {
      setLoading(
        state.loading ||
          state.fetchingPickupEstimates ||
          state.fetchingDeliveryEstimates ||
          state.fetchingOwnDriverWindows
      );
    }
  }, [
    setLoading,
    state.loading,
    state.fetchingPickupEstimates,
    state.fetchingDeliveryEstimates,
    state.fetchingOwnDriverWindows,
  ]);

  // Fetching or setting return day wise windows.
  useEffect(() => {
    if (state.returnMethod === RETURN_METHODS.delivery) {
      const hasStandardDeliverySettings =
        !!ownDeliveryStore?.storeId && ownDeliveryStore.active;
      const returnProvider = getDeliveryProviderFromOrderDelivery({
        pickupOrReturn: {
          status: delivery.status,
          deliveryProvider: delivery.deliveryProvider,
        },
        type: ORDER_DELIVERY_TYPES.return,
        returnMethod: state.returnMethod,
        hasStandardDeliverySettings,
      });

      if (
        returnProvider &&
        isAllWindowsRequirement &&
        !state.allReturnDayWiseWindows?.ownDriver?.length &&
        state.allReturnDayWiseWindows?.ownDriver !== null &&
        !state.allReturnDayWiseWindows?.onDemand &&
        state.allReturnDayWiseWindows?.onDemand !== null &&
        !fetchingOwnDriverWindows
      ) {
        const pickupWindowsService = new DeliveryDayWiseWindowsService({
          timeZone: storeTimeZone,
          orderType: initOrderType,
          pickupWindow: pickup?.deliveryWindow,
          delivery,
          currentDayWiseWindows: state.returnDayWiseWindows,
          isProcessingCompleted: state.isProcessingCompleted,
          intakeCompletedAtInMillis: state.intakeCompletedAtInMillis,
          turnAroundInHours: state.turnAroundInHours,
          onError: (err) => toast.error(<ToastError message={err} />),
          onDayWiseWindowsUpdate: (dayWiseWindows) =>
            dispatch(
              setPickupOrReturnWindowsAction({
                type: ORDER_DELIVERY_TYPES.return,
                dayWiseWindows: dayWiseWindows.length
                  ? dayWiseWindows
                  : state.returnDayWiseWindows,
                orderType: initOrderType,
              })
            ),
          allWindowsUpdate: (dayWiseWindows) =>
            dispatch(
              setAllReturnDayWiseWindows(!isEmpty(dayWiseWindows) ? dayWiseWindows : null)
            ),
          rescheduleDelivery: (type) => dispatch(rescheduleDeliveryAction({type})),
        });
        pickupWindowsService.getOwnDriverDayWiseWindows({
          storeId: ownDeliveryStore?.storeId,
          zipCode: customerAddress?.postalCode,
          onLoading: (value) => dispatch(setOwnDriverWindowsApiLoadingAction({value})),
          currentOrderDelivery: state.currentOrderDelivery?.pickup,
          bufferTimeInHours:
            ownDeliveryStore?.deliveryWindowBufferInHours ||
            ownDeliveryStore?.ownDeliverySettings?.deliveryWindowBufferInHours,
        });
        pickupWindowsService.getOnDemandDayWiseWindows({
          initialDayWiseWindows: onDemandDeliveryStore?.dayWiseWindows,
        });
      }

      // if (returnProvider) {
      //   const returnWindowsService = new DeliveryDayWiseWindowsService({
      //     timeZone: storeTimeZone,
      //     orderType: initOrderType,
      //     pickupWindow: pickup?.deliveryWindow,
      //     delivery,
      //     currentDayWiseWindows: state.returnDayWiseWindows,
      //     isProcessingCompleted: state.isProcessingCompleted,
      //     intakeCompletedAtInMillis: state.intakeCompletedAtInMillis,
      //     turnAroundInHours: state.turnAroundInHours,
      //     onError: (err) => toast.error(<ToastError message={err} />),
      //     onDayWiseWindowsUpdate: (dayWiseWindows) =>
      //       dispatch(
      //         setPickupOrReturnWindowsAction({
      //           type: ORDER_DELIVERY_TYPES.return,
      //           dayWiseWindows: dayWiseWindows.length
      //             ? dayWiseWindows
      //             : state.returnDayWiseWindows,
      //           orderType: initOrderType,
      //         })
      //       ),
      //     rescheduleDelivery: (type) => dispatch(rescheduleDeliveryAction({type})),
      //   });
      //   if (
      //     !autoScheduleReturnDelivery &&
      //     returnProvider === DELIVERY_PROVIDERS.doorDash
      //   ) {
      //     returnWindowsService.getOnDemandDayWiseWindows({
      //       initialDayWiseWindows: onDemandDeliveryStore?.dayWiseWindows,
      //     });
      //   } else if (
      //     autoScheduleReturnDelivery || // auto-scheduled return delivery windows should only be own-drivers
      //     currentTabId === DELIVERY_PROVIDERS.ownDriver
      //   ) {
      //     returnWindowsService.getOwnDriverDayWiseWindows({
      //       storeId: ownDeliveryStore?.storeId,
      //       zipCode: customerAddress?.postalCode,
      //       onLoading: (value) => dispatch(setOwnDriverWindowsApiLoadingAction({value})),
      //       currentOrderDelivery: state.currentOrderDelivery?.delivery,
      //       bufferTimeInHours: ownDeliveryStore?.deliveryWindowBufferInHours,
      //     });
      //   }
      // }
    }
  }, [
    delivery.status,
    pickup.deliveryWindow,
    delivery.deliveryProvider,
    state.returnDayWiseWindows,
    state.returnMethod,
    currentTabId,
    ownDeliveryStore,
    onDemandDeliveryStore,
    state.intakeCompletedAtInMillis,
    state.timeZone,
    state.isProcessingCompleted,
    state.turnAroundInHours,
    state.pickupDayWiseWindows,
    state.currentOrderDelivery?.pickup,
    state.currentOrderDelivery.delivery,
    delivery,
    storeTimeZone,
    initOrderType,
    pickup,
    customerAddress?.postalCode,
    autoScheduleReturnDelivery,
    state.allPickupDayWiseWindows?.ownDriver,
    state.allPickupDayWiseWindows?.onDemand,
    isAllWindowsRequirement,
  ]);

  const onTabChange = (newTab) => {
    if (newTab?.id !== currentTabId) {
      dispatch(setCurrentTabAction(newTab));
    }
  };

  const toggleShowTurnAroundTimePopup = () => {
    dispatch(toggleTurnaroundTimePopupAction());
  };

  const onSubmit = () => {
    if (state.isPickup && !state.returnMethod) {
      toggleShowTurnAroundTimePopup();
    } else {
      onServiceProviderTimeChange(
        buildOnSubmitPayload({
          pickup,
          delivery,
          storeSettings,
          returnMethod: state.returnMethod,
          onDemandDeliveryStore,
          orderType: initOrderType,
          deliveryFee,
        })
      );
    }
  };

  const handleInstorePickup = () => {
    dispatch(
      updateReturnMethodAction({
        returnMethod: RETURN_METHODS.inStorePickup,
        toggleTurnAroundTimePopup: true,
      })
    );
    onServiceProviderTimeChange(
      buildOnSubmitPayload({
        pickup,
        delivery,
        storeSettings,
        returnMethod: RETURN_METHODS.inStorePickup,
        onDemandDeliveryStore,
        orderType: initOrderType,
        deliveryFee,
      })
    );
  };

  const handleSetDelivery = (toggleTurnAroundTimePopup) => {
    dispatch(
      updateReturnMethodAction({
        returnMethod: RETURN_METHODS.delivery,
        toggleTurnAroundTimePopup,
      })
    );
  };

  const onNewSubscriptionClickHandler = () => {
    onNewSubscriptionClick(
      buildOnSubmitPayload({
        pickup,
        delivery,
        storeSettings,
        returnMethod: state.returnMethod,
        onDemandDeliveryStore,
        orderType: initOrderType,
        deliveryFee,
      })
    );
  };

  const onViewSubscriptionClickHandler = () => {
    onViewSubscriptionClick(
      buildOnSubmitPayload({
        pickup,
        delivery,
        storeSettings,
        returnMethod: state.returnMethod,
        onDemandDeliveryStore,
        orderType: initOrderType,
        deliveryFee,
      })
    );
  };

  const deliverToMeClickHandler = () => {
    dispatch(toggleInstorePickupAction());
  };

  const getSubmitButtonText = () => {
    const hasPickup = isNotServiceOrder && (!pickup.status || canUpdatePickup);
    const hasDelivery =
      state.returnMethod &&
      (!delivery.status || canUpdateOrderDelivery(delivery?.status)) &&
      !isInStorePickup;

    if (!hasPickup || !hasDelivery) {
      return `SCHEDULE ${!hasPickup ? "DELIVERY" : "PICKUP"}`;
    }

    return "SCHEDULE PICKUP AND DELIVERY";
  };

  const getProcessingCompletedTime = useMemo(() => {
    const timeDiff = getTimeFromMilliSeconds(
      pickup?.deliveryWindow?.[0],
      state.timeZone
    ).plus({
      hours: state.turnAroundInHours,
    });

    return {
      day: timeDiff?.weekdayLong,
      time: timeDiff.toFormat("hh:mma"),
    };
  }, [state.turnAroundInHours, pickup, state.timeZone]);

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
    ? `animated slide-in-${state.isPickup ? "left" : "right"}`
    : "";

  // This effect should be the last one to be triggered
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  useEffect(() => {
    if (autoScheduleReturnDelivery) {
      onDeliveryTypeChange("Pickup and Delivery");
    } else {
      onDeliveryTypeChange(state.isPickup ? "Pickup" : "Delivery");
    }
  }, [state.isPickup, onDeliveryTypeChange, autoScheduleReturnDelivery]);

  const toScheduleStart = () => {
    history.push(`/order/business/${businessId}`);
  };

  const closeView = () => {
    toScheduleStart();
  };

  return (
    <WindowsSelectionDispatch.Provider value={{state, dispatch}}>
      <Container className="schedule-content">
        {showSubscriptionBanner ? (
          <Box {...styles.recurringContainer}>
            {subscription?.interval ? (
              <>
                <Text {...styles.recurringText}>
                  {INTERVAL_DISPLAY[subscription?.interval]?.toUpperCase()}
                </Text>
                <Text
                  {...styles.subscriptionCTA}
                  onClick={onViewSubscriptionClickHandler}
                >
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
        <div className={`recommended-wrapper ${showRecommendedWindows ? "show" : ""}`}>
          <RecommendedWindows
            setShowRecommendedWindows={setShowRecommendedWindows}
            customerAddress={customerAddress}
            setLoading={setLoading}
          />
        </div>
        <div className={`available-wrapper ${!showRecommendedWindows ? "show" : ""}`}>
          <DeliveryWindowsSelection
            tabs={tabs}
            onTabChange={onTabChange}
            state={state}
            isInStorePickup={isInStorePickup}
            initIsProcessingCompleted={initIsProcessingCompleted}
            storeSettings={storeSettings}
            getProcessingCompletedTime={getProcessingCompletedTime}
            currentTabId={currentTabId}
            selectedOrderDelivery={selectedOrderDelivery}
            customerAddress={customerAddress}
            setLoading={setLoading}
            canUpdatePickup={canUpdatePickup}
            ownDeliveryStore={ownDeliveryStore}
            onDemandDeliveryStore={onDemandDeliveryStore}
            shouldShowDeliveryWindows={shouldShowDeliveryWindows}
            turnAroundInHours={state?.turnAroundInHours}
            autoScheduleReturnDelivery={autoScheduleReturnDelivery}
          />
        </div>

        {state.error && (
          <Text variant="errorMessage" {...styles.footer.errorMessage}>
            {state.error}
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
            {showFooterTimeWindow ? (
              <FooterTimeWindow
                isInStorePickup={isInStorePickup}
                state={state}
                isNotServiceOrder={isNotServiceOrder}
                autoScheduleReturnDelivery={autoScheduleReturnDelivery}
                onDeliveryWindowsToggle={showParentAnimation}
              />
            ) : null}
            <Grid container className="schedule-controls">
              <MiUiButton
                onClick={onSubmit}
                disabled={
                  (isNotServiceOrder &&
                    (!pickup.status || canUpdatePickup) &&
                    !pickup?.timingsId) ||
                  (state.returnMethod === RETURN_METHODS.delivery && !delivery?.timingsId)
                }
                color="primary"
                variant="contained"
                className="schedule-button"
              >
                {SCHEDULE_BUTTONS.setPickup}
              </MiUiButton>
            </Grid>
          </>
        )}
        {state.showTurnAroundTimePopup ? (
          <ReturnDeliveryConfirmationPopup
            isOpen={state.showTurnAroundTimePopup}
            toggle={toggleShowTurnAroundTimePopup}
            onScheduleNowClick={() => handleSetDelivery(true)}
            onScheduleLaterClick={handleInstorePickup}
            turnAroundInHours={state?.turnAroundInHours}
          />
        ) : null}
      </Container>
    </WindowsSelectionDispatch.Provider>
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
