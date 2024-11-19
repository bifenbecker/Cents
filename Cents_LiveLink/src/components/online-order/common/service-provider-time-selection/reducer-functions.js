import {DateTime} from "luxon";

import {
  DELIVERY_PROVIDERS,
  ORDER_TYPES,
  RETURN_METHODS,
} from "../../../../constants/order";
import {canUpdateOrderDelivery} from "../../../../utils";
import {getTimeFromMilliSeconds} from "../../utils";
import {
  initAutoSchedulePickup,
  getAutoScheduledDelivery,
  shouldAutoScheduleOwnDriverDelivery,
  autoScheduleOrderDeliveryForSelectedDate,
  isSameAsOriginalWindow,
} from "./utils";

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
      ? ownDriverDeliverySettings?.active
      : onDemandDeliverySettings?.active)
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
      ? ownDriverDeliverySettings?.active
      : onDemandDeliverySettings?.active)
  ) {
    return deliveryProvider;
  }
  return ownDriverDeliverySettings?.active
    ? DELIVERY_PROVIDERS.ownDriver
    : onDemandDeliverySettings?.active
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
      ? !state.ownDriverDeliverySettings?.dayWiseWindows?.length
      : !isStandardReturn,
    dayWiseWindows: shouldAutoSelectOwnDriverDelivery
      ? state.ownDriverDeliverySettings?.dayWiseWindows?.length
        ? state.ownDriverDeliverySettings?.dayWiseWindows
        : state.onDemandDeliverySettings?.dayWiseWindows
      : isStandardReturn
      ? state.ownDriverDeliverySettings?.dayWiseWindows
      : state.onDemandDeliverySettings?.dayWiseWindows,
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
    selectedDate: (pickupOrDelivery.deliveryWindow?.length
      ? DateTime.fromMillis(Number(pickupOrDelivery?.deliveryWindow[0] || 0))
      : DateTime.local()
    )
      .setZone(timeZone)
      .startOf("day"),
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
  ownDriverDeliverySettings,
  onDemandDeliverySettings
) => {
  return (
    isNotServiceOrder &&
    !pickup.deliveryWindow?.length &&
    (ownDriverDeliverySettings?.dayWiseWindows?.length ||
      onDemandDeliverySettings?.dayWiseWindows?.length)
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
  } = payload;

  const isNotServiceOrder = orderType !== ORDER_TYPES.service;

  const updatedPickup = {...pickup};
  let updatedDelivery = {...delivery};
  const canInitializePickup = shouldInitPickup(
    updatedPickup,
    isNotServiceOrder,
    ownDriverDeliverySettings,
    onDemandDeliverySettings,
    timeZone
  );

  if (canInitializePickup) {
    const isOwnDriver =
      getPickupDeliveryProvider(
        updatedPickup,
        ownDriverDeliverySettings,
        onDemandDeliverySettings
      ) === DELIVERY_PROVIDERS.ownDriver;
    // Auto schedule pickup on init.
    initAutoSchedulePickup(
      updatedPickup,
      timeZone,
      isOwnDriver,
      isOwnDriver ? ownDriverDeliverySettings : onDemandDeliverySettings
    );
    // Auto schedule delivery for auto scheduled pickup on init.
  }

  if (returnMethod === RETURN_METHODS.delivery && !updatedDelivery.timingsId) {
    const isOwnDriver =
      (updatedDelivery.deliveryProvider || updatedPickup.deliveryProvider) ===
      DELIVERY_PROVIDERS.ownDriver;
    updatedDelivery = {
      ...updatedDelivery,
      ...getAutoScheduledDelivery(
        updatedPickup.deliveryWindow?.[0] || intakeCompletedAtInMillis,
        {
          timingsId: updatedDelivery.timingsId,
          deliveryWindow: updatedDelivery.deliveryWindow,
        },
        {
          timeZone,
          turnAroundInHours,
          isDeliveryWindowSelectedManually: false,
          isThirdPartyDelivery: !isOwnDriver,
          dayWiseWindows: isOwnDriver
            ? ownDriverDeliverySettings.dayWiseWindows
            : onDemandDeliverySettings.dayWiseWindows,
          isAutoScheduleDelivery: canInitializePickup,
          isProcessingCompleted,
        }
      ),
    };
  }

  return {
    ...state,
    timeZone,
    orderType,
    uberAuthToken: null,
    ownDriverDeliverySettings,
    onDemandDeliverySettings,
    isPickup:
      isNotServiceOrder &&
      (!updatedPickup?.id || canUpdateOrderDelivery(updatedPickup?.status)),
    // If there is delivery, reset the returnMethod to delivery
    currentReturnMethod: returnMethod || null,
    returnMethod: returnMethod || null,
    intakeCompletedAtInMillis,
    turnAroundInHours,
    currentOrderDelivery: {
      pickup,
      delivery: returnMethod === RETURN_METHODS.delivery ? delivery : {},
    },
    orderDelivery: {
      pickup: getOrderDeliveryObject(updatedPickup, timeZone),
      delivery: Object.keys(delivery)?.length
        ? getOrderDeliveryObject(updatedDelivery, timeZone)
        : {
            deliveryProvider:
              updatedPickup?.deliveryProvider ||
              (ownDriverDeliverySettings?.active
                ? DELIVERY_PROVIDERS.ownDriver
                : DELIVERY_PROVIDERS.doorDash),
          },
      // Need to initialize this so that we could see the days available
    },
    isProcessingCompleted,
    isDeliveryWindowSelectedManually: false,
    error: null,
    loading: false,
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
  const isOwnDriver = payload.id === DELIVERY_PROVIDERS.ownDriver;
  let returnMethod = state.returnMethod;

  if (state.isPickup) {
    updatedOrderDelivery.pickup = {
      ...state.orderDelivery.pickup,
      ...dataToBeSet,
    };
    if (
      state?.currentOrderDelivery?.pickup?.timingsId &&
      state?.currentOrderDelivery?.pickup?.deliveryProvider === payload.id
    ) {
      updatedOrderDelivery.pickup = {
        ...updatedOrderDelivery.pickup,
        timingsId: state?.currentOrderDelivery?.pickup?.timingsId,
        deliveryWindow: state?.currentOrderDelivery?.pickup?.deliveryWindow,
        selectedDate: getTimeFromMilliSeconds(
          state?.currentOrderDelivery?.pickup?.deliveryWindow?.[0] || 0,
          state.timeZone
        ).startOf("day"),
        deliveryProvider: payload.id,
      };
    } else {
      initAutoSchedulePickup(
        updatedOrderDelivery.pickup,
        state.timeZone,
        isOwnDriver,
        isOwnDriver ? state.ownDriverDeliverySettings : state.onDemandDeliverySettings
      );
      if (updatedOrderDelivery.pickup.deliveryWindow?.length) {
        updatedOrderDelivery.pickup.selectedDate = getTimeFromMilliSeconds(
          updatedOrderDelivery.pickup?.deliveryWindow?.[0] || 0,
          state.timeZone
        );
      }
    }
  }

  if (
    !state.isPickup &&
    state?.currentOrderDelivery?.delivery?.deliveryProvider &&
    state?.currentOrderDelivery?.delivery?.deliveryProvider === payload.id
  ) {
    updatedOrderDelivery.delivery = {
      ...state.orderDelivery.delivery,
      ...dataToBeSet,
      timingsId: state?.currentOrderDelivery?.delivery?.timingsId,
      deliveryWindow: state?.currentOrderDelivery?.delivery?.deliveryWindow,
      selectedDate: getTimeFromMilliSeconds(
        state?.currentOrderDelivery?.delivery?.deliveryWindow?.[0] || 0,
        state.timeZone
      ).startOf("day"),
      deliveryProvider: state?.currentOrderDelivery?.delivery?.deliveryProvider,
    };
  } else {
    const shouldAutoSelectOwnDriverDelivery = shouldAutoScheduleOwnDriverDelivery(
      state.isDeliveryWindowSelectedManually,
      state.orderDelivery,
      updatedOrderDelivery,
      state.turnAroundInHours,
      state.timeZone,
      state.intakeCompletedAtInMillis
    );

    if (
      !state.isPickup ||
      !state.isDeliveryWindowSelectedManually ||
      shouldAutoSelectOwnDriverDelivery
    ) {
      updatedOrderDelivery.delivery = {
        ...state.orderDelivery.delivery,
        ...dataToBeSet,
        ...getAutoScheduledDelivery(
          updatedOrderDelivery?.pickup?.deliveryWindow?.[0] ||
            state.intakeCompletedAtInMillis,
          updatedOrderDelivery.delivery.timingsId
            ? {
                timingsId: updatedOrderDelivery.delivery.timingsId,
                deliveryWindow: updatedOrderDelivery.delivery.deliveryWindow,
              }
            : {},
          {
            timeZone: state.timeZone,
            turnAroundInHours: state.turnAroundInHours,
            isDeliveryWindowSelectedManually: false,
            isThirdPartyDelivery:
              shouldAutoSelectOwnDriverDelivery && state.isPickup
                ? !state.ownDriverDeliverySettings?.dayWiseWindows?.length
                : !isOwnDriver,
            dayWiseWindows:
              (shouldAutoSelectOwnDriverDelivery &&
                state.isPickup &&
                state.ownDriverDeliverySettings?.dayWiseWindows?.length) ||
              isOwnDriver
                ? state.ownDriverDeliverySettings?.dayWiseWindows
                : state.onDemandDeliverySettings?.dayWiseWindows,
            isAutoScheduleDelivery: isPickupAvailable(
              updatedOrderDelivery?.pickup,
              state.orderType
            ),
            isProcessingCompleted: state.isProcessingCompleted,
          }
        ),
      };
    }
  }

  return {
    ...state,
    returnMethod,
    orderDelivery: updatedOrderDelivery,
    isDeliveryWindowSelectedManually:
      !state.isPickup || state.isDeliveryWindowSelectedManually,
    loading: false,
    error: null,
  };
};

export const setSelectedDate = (state, payload) => {
  const clearedTimings = {
    uberEstimate,
    timingsId: null,
    deliveryWindow: [],
    doorDashEstimate: null,
  };
  let returnMethod = state.returnMethod;
  let updatedPickup = {...state.orderDelivery.pickup};
  let updatedDelivery = state.orderDelivery.delivery;
  let isManualWindowSelection = state.isDeliveryWindowSelectedManually;
  if (!state.isDeliveryWindowSelectedManually) {
    updatedDelivery = {...updatedDelivery, ...clearedTimings};
  }
  if (state.isPickup) {
    const isPickupOwnDriver =
      updatedPickup.deliveryProvider === DELIVERY_PROVIDERS.ownDriver;
    let {timingsId, deliveryWindow} = autoScheduleOrderDeliveryForSelectedDate({
      timeZone: state.timeZone,
      isOwnDriver: isPickupOwnDriver,
      currentDate: payload.selectedDate,
      deliverySettings: isPickupOwnDriver
        ? state.ownDriverDeliverySettings
        : state.onDemandDeliverySettings,
    });
    if (
      payload.isPastDate &&
      state.currentOrderDelivery?.pickup?.deliveryProvider &&
      updatedPickup.deliveryProvider ===
        state.currentOrderDelivery?.pickup?.deliveryProvider &&
      (!timingsId ||
        !deliveryWindow?.length ||
        deliveryWindow[0] > state.currentOrderDelivery?.pickup?.deliveryWindow[0])
    ) {
      timingsId = state.currentOrderDelivery?.pickup?.timingsId;
      deliveryWindow = state.currentOrderDelivery?.pickup?.deliveryWindow;
    }
    updatedPickup = {
      ...updatedPickup,
      ...clearedTimings,
      timingsId,
      deliveryWindow,
      selectedDate: payload.selectedDate,
    };

    const shouldAutoSelectOwnDriverDelivery = shouldAutoScheduleOwnDriverDelivery(
      state.isDeliveryWindowSelectedManually,
      state.orderDelivery,
      {pickup: updatedPickup},
      state.turnAroundInHours,
      state.timeZone,
      state.intakeCompletedAtInMillis
    );
    if (!state.isDeliveryWindowSelectedManually || shouldAutoSelectOwnDriverDelivery) {
      const isDeliveryOwnDriver =
        updatedDelivery.deliveryProvider === DELIVERY_PROVIDERS.ownDriver;
      let autoScheduledDelivery = getAutoScheduledDelivery(
        updatedPickup?.deliveryWindow?.[0],
        {
          timingsId: updatedDelivery.timingsId,
          deliveryWindow: updatedDelivery.deliveryWindow,
        },
        {
          timeZone: state.timeZone,
          turnAroundInHours: state.turnAroundInHours,
          isDeliveryWindowSelectedManually: false,
          isThirdPartyDelivery: shouldAutoSelectOwnDriverDelivery
            ? !state.ownDriverDeliverySettings?.dayWiseWindows?.length
            : !isDeliveryOwnDriver,
          dayWiseWindows:
            (shouldAutoSelectOwnDriverDelivery &&
              state.ownDriverDeliverySettings?.dayWiseWindows?.length) ||
            isDeliveryOwnDriver
              ? state.ownDriverDeliverySettings?.dayWiseWindows
              : state.onDemandDeliverySettings?.dayWiseWindows,
          isAutoScheduleDelivery: isPickupAvailable(updatedPickup, state.orderType),
          isProcessingCompleted: state.isProcessingCompleted,
        }
      );
      if (payload.isPastDate) {
        if (
          state.currentOrderDelivery?.delivery?.timingsId &&
          updatedDelivery?.deliveryProvider &&
          updatedDelivery?.deliveryProvider ===
            state.currentOrderDelivery?.delivery?.deliveryProvider &&
          autoScheduledDelivery.deliveryWindow?.[0] &&
          autoScheduledDelivery.deliveryWindow[0] >
            state.currentOrderDelivery?.delivery?.deliveryWindow
        ) {
          autoScheduledDelivery = {
            timingsId: state.currentOrderDelivery?.delivery?.timingsId,
            deliveryWindow: state.currentOrderDelivery?.delivery?.deliveryWindow,
          };
        }
        if (
          !state.currentOrderDelivery?.delivery?.timingsId ||
          !autoScheduledDelivery.deliveryWindow?.[0]
        ) {
          returnMethod = RETURN_METHODS.inStorePickup;
        }
      }
      updatedDelivery = {
        ...updatedDelivery,
        ...autoScheduledDelivery,
      };
    }
  } else {
    const isDeliveryOwnDriver =
      updatedDelivery.deliveryProvider === DELIVERY_PROVIDERS.ownDriver;
    let {timingsId, deliveryWindow} = payload.latestDeliveryStartTime
      ? autoScheduleOrderDeliveryForSelectedDate({
          timeZone: state.timeZone,
          isOwnDriver: isDeliveryOwnDriver,
          currentDate: payload.selectedDate,
          deliverySettings: isDeliveryOwnDriver
            ? state.ownDriverDeliverySettings
            : state.onDemandDeliverySettings,
          minDate: payload.latestDeliveryStartTime,
          isAutoScheduleDelivery: !state.isProcessingCompleted,
        })
      : {timingsId: null, deliveryWindow: []};
    if (
      payload.isPastDate &&
      state.currentOrderDelivery?.delivery?.timingsId &&
      state.currentOrderDelivery?.delivery?.deliveryProvider &&
      updatedDelivery.deliveryProvider ===
        state.currentOrderDelivery?.delivery?.deliveryProvider &&
      (!timingsId ||
        !deliveryWindow?.length ||
        deliveryWindow?.[0] > state.currentOrderDelivery?.delivery?.deliveryWindow[0])
    ) {
      timingsId = state.currentOrderDelivery?.delivery?.timingsId;
      deliveryWindow = state.currentOrderDelivery?.delivery?.deliveryWindow;
    }
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
      pickup: updatedPickup,
      delivery: updatedDelivery,
    },
    returnMethod,
    isDeliveryWindowSelectedManually: !state.isPickup || isManualWindowSelection,
    loading: false,
    error: null,
  };
};

export const setSelectedTimeWindow = (state, payload) => {
  const updatedDeliveryObj = {...state.orderDelivery};
  let returnMethod = state.returnMethod;
  const {pickup: currentPickup, delivery: currentDelivery} =
    state.currentOrderDelivery || {};
  let isManualWindowSelection = state.isDeliveryWindowSelectedManually;

  if (state.isPickup) {
    updatedDeliveryObj.pickup = {
      ...updatedDeliveryObj.pickup,
      ...payload.windowTimings,
      uberEstimate,
      doorDashEstimate: null,
    };
    if (state.returnMethod === RETURN_METHODS.delivery) {
      if (isSameAsOriginalWindow(currentPickup, updatedDeliveryObj.pickup)) {
        if (currentDelivery?.timingsId) {
          updatedDeliveryObj.delivery = {
            ...updatedDeliveryObj.delivery,
            timingsId: currentDelivery?.timingsId,
            deliveryWindow: currentDelivery?.deliveryWindow,
            deliveryProvider: currentDelivery?.deliveryProvider,
            uberEstimate,
            doorDashEstimate: null,
          };
        } else {
          returnMethod = RETURN_METHODS.inStorePickup;
        }
      } else {
        const shouldAutoSelectOwnDriverDelivery = shouldAutoScheduleOwnDriverDelivery(
          state.isDeliveryWindowSelectedManually,
          state.orderDelivery,
          {pickup: payload.windowTimings},
          state.turnAroundInHours,
          state.timeZone,
          state.intakeCompletedAtInMillis
        );
        if (
          !state.isDeliveryWindowSelectedManually ||
          shouldAutoSelectOwnDriverDelivery
        ) {
          const autoDelivery = getAutoScheduledDelivery(
            payload.windowTimings.deliveryWindow[0],
            {
              timingsId: updatedDeliveryObj.delivery.timingsId,
              deliveryWindow: updatedDeliveryObj.delivery.deliveryWindow,
            },
            buildDeliveryOptions(state, shouldAutoSelectOwnDriverDelivery)
          );
          updatedDeliveryObj.delivery = {
            ...updatedDeliveryObj.delivery,
            ...autoDelivery,
            asapTimingsId: autoDelivery.timingsId,
            uberEstimate,
            doorDashEstimate: null,
          };
        }
      }
    }
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
    orderDelivery: updatedDeliveryObj,
    returnMethod,
    isDeliveryWindowSelectedManually:
      state.isDeliveryWindowSelectedManually ||
      !state.isPickup ||
      isManualWindowSelection,
    loading: false,
    error: null,
  };
};

export const updateReturnMethod = (state) => {
  return {
    ...state,
    orderDelivery: {
      ...state.orderDelivery,
      delivery:
        state.returnMethod === RETURN_METHODS.delivery
          ? {...state.orderDelivery.delivery}
          : {
              ...state.orderDelivery.delivery,
              ...getAutoScheduledDelivery(
                state.orderDelivery.pickup?.deliveryWindow?.[0] ||
                  state.intakeCompletedAtInMillis,
                {
                  timingsId: state.orderDelivery.delivery.timingsId,
                  deliveryWindow: state.orderDelivery.delivery.deliveryWindow,
                },
                buildDeliveryOptions(
                  {...state, isDeliveryWindowSelectedManually: false},
                  true
                )
              ),
              uberEstimate,
            },
    },
    returnMethod:
      state.returnMethod === RETURN_METHODS.delivery
        ? RETURN_METHODS.inStorePickup
        : RETURN_METHODS.delivery,
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
              ...getAutoScheduledDelivery(
                state.orderDelivery.pickup?.deliveryWindow?.[0] ||
                  state.intakeCompletedAtInMillis,
                {
                  timingsId: state.orderDelivery.delivery.timingsId,
                  deliveryWindow: state.orderDelivery.delivery.deliveryWindow,
                },
                buildDeliveryOptions(
                  {...state, isDeliveryWindowSelectedManually: false},
                  true
                )
              ),
              uberEstimate,
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
  return {
    ...state,
    orderDelivery: {
      ...state.orderDelivery,
      delivery:
        !payload.isPickup && !state?.orderDelivery?.delivery?.timingsId
          ? {
              ...state.orderDelivery.delivery,
              ...getAutoScheduledDelivery(
                state.orderDelivery.pickup?.deliveryWindow?.[0] ||
                  state.intakeCompletedAtInMillis,
                {
                  timingsId: state.orderDelivery.delivery.timingsId,
                  deliveryWindow: state.orderDelivery.delivery.deliveryWindow,
                },
                buildDeliveryOptions(
                  {...state, isDeliveryWindowSelectedManually: false},
                  true
                )
              ),
              uberEstimate,
            }
          : state?.orderDelivery?.delivery,
    },
    isPickup: payload.isPickup,
    returnMethod: payload.isPickup ? state.returnMethod : RETURN_METHODS.delivery,
  };
};
