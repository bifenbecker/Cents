import isEmpty from "lodash/isEmpty";
import {DateTime} from "luxon";

import {
  DELIVERY_PROVIDERS,
  ORDER_DELIVERY_TYPES,
  ORDER_TYPES,
  RETURN_METHODS,
} from "../../../../../constants/order";
import {canUpdateOrderDelivery, isValidDeliveryProvider} from "../../../../../utils";
import {
  getAutoScheduledDelivery,
  getEarliestDeliveryStartTime,
  initAutoSchedulePickup,
} from "./utils";
import OrderDeliveryValidator from "../../../../../services/order-delivery-validator";
import PickupAutoScheduler from "../../../../../services/order-delivery-auto-scheduler/pickup";
import ReturnAutoScheduler from "../../../../../services/order-delivery-auto-scheduler/delivery";
import OrderValidator from "../../../../../services/order-validator";

const uberEstimate = {
  totalDeliveryCost: null,
  estimateId: null,
  pickupAt: null,
};

export const getReturnDeliveryProvider = (
  pickup,
  delivery,
  ownDriverDeliverySettings,
  onDemandDeliverySettings
) => {
  let {deliveryProvider} = delivery || {};
  if (
    deliveryProvider &&
    (deliveryProvider === DELIVERY_PROVIDERS.ownDriver
      ? ownDriverDeliverySettings?.storeId
      : onDemandDeliverySettings?.dayWiseWindows?.length)
  ) {
    return deliveryProvider;
  }
  return getPickupDeliveryProvider(
    pickup,
    ownDriverDeliverySettings,
    onDemandDeliverySettings
  );
};

export const getPickupDeliveryProvider = (
  pickup,
  ownDriverDeliverySettings,
  onDemandDeliverySettings
) => {
  let {deliveryProvider} = pickup || {};
  if (
    deliveryProvider &&
    (deliveryProvider === DELIVERY_PROVIDERS.ownDriver
      ? ownDriverDeliverySettings?.storeId
      : onDemandDeliverySettings?.dayWiseWindows?.length)
  ) {
    return deliveryProvider;
  }
  return ownDriverDeliverySettings?.storeId
    ? DELIVERY_PROVIDERS.ownDriver
    : onDemandDeliverySettings?.dayWiseWindows?.length
    ? DELIVERY_PROVIDERS.doorDash
    : null;
};

const isPickupAvailable = (pickup, orderType) => {
  return (
    orderType === ORDER_TYPES.online &&
    (!pickup?.status || canUpdateOrderDelivery(pickup?.status))
  );
};

export const buildDeliveryOptions = (
  state,
  shouldAutoSelectOwnDriverDelivery = false
) => {
  const automaticReturnDeliveryProvider = getReturnDeliveryProvider(
    state?.orderDelivery?.pickup,
    state?.orderDelivery?.delivery,
    state.ownDriverDeliverySettings,
    state.onDemandDeliverySettings
  );
  const automaticPickupDeliveryProvider = getPickupDeliveryProvider(
    state?.orderDelivery?.pickup,
    state.ownDriverDeliverySettings,
    state.onDemandDeliverySettings
  );
  // Initially, when there is not return delivery set, use the pickup's deliveryProvider
  const isStandardReturn = state.isDeliveryWindowSelectedManually
    ? automaticReturnDeliveryProvider &&
      automaticReturnDeliveryProvider === DELIVERY_PROVIDERS.ownDriver
    : automaticPickupDeliveryProvider &&
      automaticPickupDeliveryProvider === DELIVERY_PROVIDERS.ownDriver;

  return {
    timeZone: state.timeZone,
    turnAroundInHours: state.turnAroundInHours,
    isDeliveryWindowSelectedManually: state.isDeliveryWindowSelectedManually,
    isThirdPartyDelivery: shouldAutoSelectOwnDriverDelivery
      ? !state.ownDriverDeliverySettings?.active
      : !isStandardReturn,
    dayWiseWindows: state.isPickup
      ? state?.pickupDayWiseWindows
      : state?.returnDayWiseWindows,
    isAutoScheduleDelivery: isPickupAvailable(
      state?.orderDelivery?.pickup,
      state.orderType
    ),
    isProcessingCompleted: state.isProcessingCompleted,
  };
};

const getOrderDeliveryObject = (pickupOrDelivery, timeZone) => {
  const isUber = pickupOrDelivery.deliveryProvider === DELIVERY_PROVIDERS.uber;

  return {
    storeId: null,
    id: pickupOrDelivery.id,
    subsidyInCents: pickupOrDelivery.subsidyInCents || 0,
    type: pickupOrDelivery.type,
    timingsId: pickupOrDelivery.timingsId,
    deliveryWindow: pickupOrDelivery.deliveryWindow || [],
    selectedDate: pickupOrDelivery.deliveryWindow?.length
      ? DateTime.fromMillis(Number(pickupOrDelivery?.deliveryWindow[0] || 0))
          .setZone(timeZone)
          .startOf("day")
      : null,
    uberEstimate: {
      totalDeliveryCost: isUber ? pickupOrDelivery.totalDeliveryCost * 100 : null,
      estimateId: isUber ? pickupOrDelivery.thirdPartyDeliveryId : null,
      pickupAt: isUber ? pickupOrDelivery.pickupAt : null,
    },
    totalDeliveryCost: pickupOrDelivery.totalDeliveryCost,
    doorDashEstimate: pickupOrDelivery.doorDashEstimate,
    deliveryProvider: pickupOrDelivery.deliveryProvider,
    thirdPartyDeliveryId: pickupOrDelivery.thirdPartyDeliveryId,
    thirdPartyDeliveryCostInCents: pickupOrDelivery.thirdPartyDeliveryCostInCents || 0,
    status: pickupOrDelivery.status,
    routeDelivery: pickupOrDelivery.routeDelivery,
    courierTip: pickupOrDelivery.courierTip || 0,
  };
};

const shouldInitPickup = (
  pickup,
  isNotServiceOrder,
  dayWiseWindows,
  ownDriverDeliverySettings,
  onDemandDeliverySettings,
  timeZone
) => {
  return (
    isNotServiceOrder &&
    dayWiseWindows?.length &&
    dayWiseWindows?.some(({timings}) => timings?.length) &&
    (!pickup.deliveryWindow?.length ||
      !OrderDeliveryValidator.canRetainDeliveryWindow(
        pickup,
        ownDriverDeliverySettings,
        onDemandDeliverySettings,
        dayWiseWindows,
        timeZone
      ))
  );
};

export const setInitState = (state, payload) => {
  const {
    orderDelivery: {pickup = {}, delivery},
    orderType,
    timeZone,
    returnMethod,
    ownDriverDeliverySettings,
    onDemandDeliverySettings,
    intakeCompletedAtInMillis,
    turnAroundInHours,
    isProcessingCompleted,
    currentOrderDelivery,
    skipInitialValidation,
  } = payload;

  let updatedPickup = {...pickup};
  let updatedDelivery = {...delivery};

  const dataToBeSet = {
    timingsId: null,
    deliveryWindow: [],
    uberEstimate,
    doorDashEstimate: null,
    selectedDate: null,
  };
  const orderDeliveryValidator = new OrderDeliveryValidator({
    pickup: updatedPickup,
    delivery: updatedDelivery,
    timeZone,
    isProcessingCompleted,
    intakeCompletedAtInMillis,
    turnAroundInHours,
    orderType,
    returnMethod,
    bufferTimeInHours: ownDriverDeliverySettings?.deliveryWindowBufferInHours,
  });

  const hidePickup = orderDeliveryValidator.isPickupNotUpdatable();
  const returnProvider = updatedDelivery.deliveryProvider;
  const pickupProvider = updatedPickup.deliveryProvider;
  const hasStandardSettings =
    ownDriverDeliverySettings?.storeId && ownDriverDeliverySettings?.active;
  const hasDoordashSettings =
    onDemandDeliverySettings?.storeId &&
    onDemandDeliverySettings?.active &&
    onDemandDeliverySettings?.dayWiseWindows?.length &&
    onDemandDeliverySettings?.doorDashEnabled;

  const firstActiveDeliveryProvider = hasStandardSettings
    ? DELIVERY_PROVIDERS.ownDriver
    : DELIVERY_PROVIDERS.doorDash;

  const isValidReturnProvider = isValidDeliveryProvider(
    returnProvider,
    hasStandardSettings,
    hasDoordashSettings
  );

  const isValidPickupProvider =
    hidePickup ||
    isValidDeliveryProvider(pickupProvider, hasStandardSettings, hasDoordashSettings);

  const isDeliveryValid =
    returnMethod === RETURN_METHODS?.inStorePickup ||
    (isValidReturnProvider && orderDeliveryValidator.isReturnValid());
  const isPickupValid = isValidPickupProvider && orderDeliveryValidator.isPickupValid();

  if (!isDeliveryValid) {
    updatedDelivery = {
      ...updatedDelivery,
      ...dataToBeSet,
      deliveryProvider: isValidReturnProvider
        ? returnProvider
        : firstActiveDeliveryProvider,
    };
  }

  if (!isPickupValid) {
    updatedPickup = {
      ...updatedPickup,
      ...dataToBeSet,
      deliveryProvider: isValidPickupProvider
        ? pickupProvider
        : firstActiveDeliveryProvider,
    };
  }

  let errorToastMessage;
  if (!skipInitialValidation && (!isPickupValid || !isDeliveryValid)) {
    errorToastMessage = OrderValidator.orderDeliveriesErrorMessage(
      isPickupValid,
      isDeliveryValid
    );
  }

  return {
    ...state,
    timeZone,
    orderType,
    uberAuthToken: null,
    ownDriverDeliverySettings,
    onDemandDeliverySettings,
    isPickup: !hidePickup,
    returnMethod: returnMethod || null,
    intakeCompletedAtInMillis,
    turnAroundInHours,
    orderDelivery: {
      pickup: getOrderDeliveryObject(updatedPickup, timeZone),
      delivery: Object.keys(delivery)?.length
        ? getOrderDeliveryObject(updatedDelivery, timeZone)
        : {deliveryProvider: firstActiveDeliveryProvider},
      // Need to initialize this so that we could see the days available
    },
    currentOrderDelivery: {
      pickup: Object.keys(currentOrderDelivery?.pickup)?.length
        ? getOrderDeliveryObject(currentOrderDelivery?.pickup, timeZone)
        : {},
      delivery: Object.keys(currentOrderDelivery?.delivery)?.length
        ? getOrderDeliveryObject(currentOrderDelivery?.delivery, timeZone)
        : {},
    },
    isProcessingCompleted,
    isDeliveryWindowSelectedManually: false,
    error: null,
    loading: false,
    errorToastMessage,
  };
};

export const setCurrentDeliveryProvider = (state, payload) => {
  const dataToBeSet = {
    deliveryProvider: payload.id,
    timingsId: null,
    deliveryWindow: [],
    uberEstimate,
    doorDashEstimate: null,
    selectedDate: null,
  };

  const updatedOrderDelivery = {...state.orderDelivery};
  let returnMethod = state.returnMethod;

  if (state.isPickup) {
    updatedOrderDelivery.pickup = {
      ...state.orderDelivery.pickup,
      ...dataToBeSet,
    };
  } else {
    updatedOrderDelivery.delivery = {
      ...state.orderDelivery.delivery,
      ...dataToBeSet,
    };
  }

  return {
    ...state,
    returnMethod,
    orderDelivery: updatedOrderDelivery,
    isDeliveryWindowSelectedManually:
      !state.isPickup || state.isDeliveryWindowSelectedManually,
    loading: true,
    error: null,
    ...(state.isPickup
      ? {
          pickupDayWiseWindows: [],
        }
      : {
          returnDayWiseWindows: [],
        }),
  };
};

export const setSelectedDate = (state, payload) => {
  const clearedTimings = {
    uberEstimate,
    timingsId: null,
    deliveryWindow: [],
    doorDashEstimate: null,
  };
  let updatedPickup = {...state.orderDelivery.pickup};
  let updatedDelivery = {...state.orderDelivery.delivery};
  if (!state.isDeliveryWindowSelectedManually) {
    updatedDelivery = {...updatedDelivery, ...clearedTimings};
  }
  if (state.isPickup) {
    const isPickupOwnDriver =
      updatedPickup.deliveryProvider === DELIVERY_PROVIDERS.ownDriver;
    const pickupAutoScheduler = new PickupAutoScheduler({
      timeZone: state.timeZone,
      isOwnDriver: isPickupOwnDriver,
      dayWiseWindows: state.pickupDayWiseWindows,
      bufferTimeInHours:
        state.ownDriverDeliverySettings?.deliveryWindowBufferInHours ||
        state.ownDriverDeliverySettings?.ownDeliverySettings?.deliveryWindowBufferInHours,
    });
    // Get the autoscheduled delivery timingId and window
    let {timingsId, deliveryWindow} = pickupAutoScheduler.generateForDate(
      payload.selectedDate
    );
    updatedPickup = {
      ...updatedPickup,
      ...clearedTimings,
      timingsId,
      deliveryWindow,
      selectedDate: payload.selectedDate,
    };
  } else {
    const isDeliveryOwnDriver =
      updatedDelivery.deliveryProvider === DELIVERY_PROVIDERS.ownDriver;
    const returnAutoScheduler = new ReturnAutoScheduler({
      timeZone: state.timeZone,
      isProcessingCompleted: state.isProcessingCompleted,
      intakeCompletedAtInMillis: state.intakeCompletedAtInMillis,
      turnAroundInHours: state.turnAroundInHours,
      selectedDate: payload.selectedDate,
      isOwnDriver: isDeliveryOwnDriver,
      pickupStartTimeInMillis: state?.orderDelivery?.pickup?.deliveryWindow?.[0],
      dayWiseWindows: state.returnDayWiseWindows,
      bufferTimeInHours: state.ownDriverDeliverySettings?.deliveryWindowBufferInHours,
    });
    // Get the autoscheduled delivery timingId and window
    let {timingsId, deliveryWindow} = returnAutoScheduler.generateForDate(
      payload.selectedDate
    );
    updatedDelivery = {
      ...updatedDelivery,
      timingsId,
      deliveryWindow,
      selectedDate: payload.selectedDate,
    };
  }
  return {
    ...state,
    orderDelivery: {
      ...state.orderDelivery,
      pickup: updatedPickup,
      delivery: updatedDelivery,
    },
    isDeliveryWindowSelectedManually: !state.isPickup,
    loading: false,
    error: null,
  };
};

export const setSelectedTimeWindow = (state, payload) => {
  const updatedDeliveryObj = {...state.orderDelivery};

  if (state.isPickup && !payload.autoScheduleReturn) {
    updatedDeliveryObj.pickup = {
      ...updatedDeliveryObj.pickup,
      ...payload.windowTimings,
      uberEstimate,
      doorDashEstimate: null,
    };
  } else {
    updatedDeliveryObj.delivery = {
      ...updatedDeliveryObj.delivery,
      ...payload.windowTimings,
      uberEstimate,
      doorDashEstimate: null,
    };
  }
  return {
    ...state,
    ...(payload.autoScheduleReturn && {returnMethod: RETURN_METHODS.delivery}),
    orderDelivery: updatedDeliveryObj,
    isDeliveryWindowSelectedManually: !state.isPickup,
    loading: false,
    error: null,
  };
};

export const updateReturnMethod = (state) => {
  const dataToBeSet = {
    timingsId: null,
    deliveryWindow: [],
    uberEstimate,
    doorDashEstimate: null,
    selectedDate: null,
  };

  return {
    ...state,
    orderDelivery: {
      ...state.orderDelivery,
      delivery:
        state.returnMethod === RETURN_METHODS.delivery
          ? {...state.orderDelivery.delivery}
          : {
              ...state.orderDelivery.delivery,
              // Reset data so that it gets calculated again.
              ...dataToBeSet,
              // Taking own driver as priority.
              deliveryProvider:
                !!state.ownDriverDeliverySettings?.storeId &&
                state.ownDriverDeliverySettings?.active
                  ? DELIVERY_PROVIDERS.ownDriver
                  : DELIVERY_PROVIDERS.doorDash,
              uberEstimate,
            },
    },
    // Reset day wise windows to calculate again since the deliveryProvider is updated
    returnDayWiseWindows: [],
    returnMethod:
      state.returnMethod === RETURN_METHODS.delivery
        ? RETURN_METHODS.inStorePickup
        : RETURN_METHODS.delivery,
    // Currently. it is in store pickup. When we are converting it to delivery, we need loader
    loading: state.returnMethod !== RETURN_METHODS.delivery,
  };
};

export const updateReturnDeliveryMethod = (state, payload) => {
  return {
    ...state,
    orderDelivery: {
      ...state.orderDelivery,
      delivery:
        payload.returnMethod === RETURN_METHODS.inStorePickup
          ? {}
          : {
              ...state.orderDelivery.delivery,
            },
    },
    showTurnAroundTimePopup: payload.toggleTurnAroundTimePopup
      ? !state.showTurnAroundTimePopup
      : state.showTurnAroundTimePopup,
    isPickup: payload.returnMethod === RETURN_METHODS.delivery ? false : state.isPickup,
    returnMethod: payload.returnMethod,
  };
};

export const forceSetIsPickup = (state, payload) => {
  const dataToBeSet = {
    timingsId: null,
    deliveryWindow: [],
    uberEstimate,
    doorDashEstimate: null,
    selectedDate: null,
  };
  return {
    ...state,
    orderDelivery: {
      ...state.orderDelivery,
      delivery:
        !payload.isPickup && !state?.orderDelivery?.delivery?.timingsId
          ? {
              ...state.orderDelivery.delivery,
              ...dataToBeSet,
              deliveryProvider:
                !!state.ownDriverDeliverySettings?.storeId &&
                state.ownDriverDeliverySettings?.active
                  ? DELIVERY_PROVIDERS.ownDriver
                  : DELIVERY_PROVIDERS.doorDash,
              uberEstimate,
            }
          : state?.orderDelivery?.delivery,
    },
    isPickup: payload.isPickup,
    returnDayWiseWindows:
      !payload.isPickup && !state?.orderDelivery?.delivery?.timingsId
        ? []
        : state.returnDayWiseWindows,
    returnMethod: payload.isPickup ? state.returnMethod : RETURN_METHODS.delivery,
    loading: !payload.isPickup && !state?.orderDelivery?.delivery?.timingsId,
  };
};

export const setPickupOrDeliveryWindows = (state, payload) => {
  const {type, dayWiseWindows, orderType} = payload;
  const {
    returnMethod,
    orderDelivery,
    timeZone,
    turnAroundInHours,
    isProcessingCompleted,
    intakeCompletedAtInMillis,
    ownDriverDeliverySettings,
  } = state;
  let updatedOrderDelivery = {...orderDelivery};

  const orderDeliveryValidator = new OrderDeliveryValidator({
    pickup: updatedOrderDelivery.pickup,
    delivery: updatedOrderDelivery.delivery,
    timeZone,
    isProcessingCompleted,
    intakeCompletedAtInMillis,
    turnAroundInHours,
    orderType,
    returnMethod,
    bufferTimeInHours:
      ownDriverDeliverySettings?.deliveryWindowBufferInHours ||
      ownDriverDeliverySettings?.ownDeliverySettings?.deliveryWindowBufferInHours,
  });

  const key =
    type === ORDER_DELIVERY_TYPES.pickup
      ? "pickupDayWiseWindows"
      : "returnDayWiseWindows";
  let updatedDelivery = {};
  const isNotServiceOrder = orderType !== ORDER_TYPES.service;
  const bufferTimeInHours = ownDriverDeliverySettings?.deliveryWindowBufferInHours;
  if (
    type === ORDER_DELIVERY_TYPES.return &&
    returnMethod === RETURN_METHODS.delivery &&
    (!state.orderDelivery?.delivery?.deliveryWindow?.length ||
      !orderDeliveryValidator.isOrderDeliveryWindowValid({
        deliveryWindow: state.orderDelivery?.delivery?.deliveryWindow,
        deliveryProvider: state.orderDelivery?.delivery?.deliveryProvider,
        timeZone: state?.timeZone,
        includeBuffer: state?.isProcessingCompleted,
        minimumStartTime: getEarliestDeliveryStartTime(state),
      }) ||
      !OrderDeliveryValidator.canRetainDeliveryWindow(
        state.orderDelivery?.delivery,
        ownDriverDeliverySettings,
        state.onDemandDeliverySettings,
        dayWiseWindows,
        state.timeZone
      ))
  ) {
    const isOwnDriver =
      getReturnDeliveryProvider(
        orderDelivery?.pickup,
        orderDelivery?.delivery,
        ownDriverDeliverySettings,
        state?.onDemandDeliverySettings
      ) === DELIVERY_PROVIDERS.ownDriver;
    const returnAutoScheduler = new ReturnAutoScheduler({
      timeZone: state.timeZone,
      isProcessingCompleted,
      intakeCompletedAtInMillis,
      turnAroundInHours,
      isOwnDriver,
      pickupStartTimeInMillis: state?.orderDelivery?.pickup?.deliveryWindow?.[0],
      dayWiseWindows,
      bufferTimeInHours,
    });
    // pickup is changed
    // delivery is not there - Autoschedule the crap out of this. - Manual selection as false.
    // delivery is there - we are not able to retain windows since we are here - manual selection is false.
    // delivery is changed

    updatedDelivery = {
      ...orderDelivery?.delivery,
      ...returnAutoScheduler.autoScheduleAfterLatestDeliveryTime({
        currentDelivery: {
          timingsId: orderDelivery?.delivery.timingsId,
          deliveryWindow: orderDelivery?.delivery.deliveryWindow,
        },
        isDeliveryWindowSelectedManually: false,
      }),
    };
    updatedOrderDelivery = {
      ...updatedOrderDelivery,
      delivery: !isEmpty(updatedDelivery)
        ? {...state.orderDelivery?.delivery, ...updatedDelivery}
        : {...state.orderDelivery.delivery},
    };
  } else if (
    type === ORDER_DELIVERY_TYPES.pickup &&
    shouldInitPickup(
      orderDelivery?.pickup,
      isNotServiceOrder,
      dayWiseWindows,
      ownDriverDeliverySettings,
      state.onDemandDeliverySettings,
      timeZone
    )
  ) {
    const updatedPickup = {...orderDelivery?.pickup};
    const isOwnDriver = updatedPickup?.deliveryProvider === DELIVERY_PROVIDERS.ownDriver;
    const bufferTimeInHours =
      ownDriverDeliverySettings?.deliveryWindowBufferInHours ||
      ownDriverDeliverySettings?.ownDeliverySettings?.deliveryWindowBufferInHours;
    // Auto schedule pickup on init.
    initAutoSchedulePickup(
      updatedPickup,
      timeZone,
      isOwnDriver,
      dayWiseWindows,
      bufferTimeInHours
    );

    updatedOrderDelivery = {
      ...updatedOrderDelivery,
      pickup: getOrderDeliveryObject(updatedPickup, timeZone),
    };
  }
  return {
    ...state,
    [key]: dayWiseWindows,
    loading: false,
    orderDelivery: {
      ...updatedOrderDelivery,
    },
  };
};

export const rescheduleDelivery = (state, payload) => {
  const {
    returnMethod,
    orderDelivery,
    timeZone,
    turnAroundInHours,
    isProcessingCompleted,
    intakeCompletedAtInMillis,
    ownDriverDeliverySettings,
  } = state;

  let updatedOrderDelivery = {...orderDelivery};
  const {type} = payload;

  const orderDeliveryValidator = new OrderDeliveryValidator({
    pickup: updatedOrderDelivery.pickup,
    delivery: updatedOrderDelivery.delivery,
    timeZone,
    isProcessingCompleted,
    intakeCompletedAtInMillis,
    turnAroundInHours,
    orderType: type,
    returnMethod,
    bufferTimeInHours:
      ownDriverDeliverySettings?.deliveryWindowBufferInHours ||
      ownDriverDeliverySettings?.ownDeliverySettings?.deliveryWindowBufferInHours,
  });

  return {
    ...state,
    orderDelivery: {
      ...state.orderDelivery,
      delivery:
        payload.type === ORDER_DELIVERY_TYPES.return &&
        state?.returnMethod === RETURN_METHODS?.delivery &&
        !orderDeliveryValidator.isOrderDeliveryWindowValid({
          deliveryWindow: state.orderDelivery?.delivery?.deliveryWindow,
          deliveryProvider: state.orderDelivery?.delivery?.deliveryProvider,
          timeZone: state?.timeZone,
          includeBuffer: state?.isProcessingCompleted,
          minimumStartTime: getEarliestDeliveryStartTime(state),
        })
          ? {
              ...state.orderDelivery.delivery,
              ...getAutoScheduledDelivery(
                state.orderDelivery.pickup?.deliveryWindow?.[0] ||
                  state.intakeCompletedAtInMillis,
                {
                  timingsId: state.orderDelivery.delivery.timingsId,
                  deliveryWindow: state.orderDelivery.delivery.deliveryWindow,
                },
                ownDriverDeliverySettings?.deliveryWindowBufferInHours ||
                  ownDriverDeliverySettings?.ownDeliverySettings
                    ?.deliveryWindowBufferInHours,
                buildDeliveryOptions(
                  {...state, isDeliveryWindowSelectedManually: false},
                  true
                )
              ),
              uberEstimate,
            }
          : state?.orderDelivery?.delivery,
    },
  };
};
