import pick from "lodash/pick";
import {ORDER_DELIVERY_TYPES} from "../../../../../constants/order";

const windowSelectionActionTypes = {
  INIT: "INIT",
  API_FAILED: "API_FAILED",
  API_STARTED: "API_STARTED",
  SET_CURRENT_TAB: "SET_CURRENT_TAB",
  SET_SELECTED_DATE: "SET_SELECTED_DATE",
  SET_UBER_AUTH_TOKEN: "SET_UBER_AUTH_TOKEN",
  ESTIMATE_CALL_FAILED: "ESTIMATE_CALL_FAILED",
  SET_DOORDASH_ESTIMATE: "SET_DOORDASH_ESTIMATE",
  SET_OWN_DRIVER_DELIVERY_FEE: "SET_OWN_DRIVER_DELIVERY_FEE",
  ESTIMATE_CALL_STARTED: "ESTIMATE_CALL_STARTED",
  TOGGLE_IN_STORE_PICKUP: "TOGGLE_IN_STORE_PICKUP",
  SET_SELECTED_TIME_WINDOWS: "SET_SELECTED_TIME_WINDOWS",
  SET_UBER_ESTIMATE_AND_TIME_WINDOW: "SET_UBER_ESTIMATE_AND_TIME_WINDOW",
  TOGGLE_PICKUP_AND_DELIVERY_WINDOWS: "TOGGLE_PICKUP_AND_DELIVERY_WINDOWS",
  UPDATE_RETURN_METHOD: "UPDATE_RETURN_METHOD",
  TOGGLE_TURNAROUND_TIME_POPUP: "TOGGLE_TURNAROUND_TIME_POPUP",
  SET_IS_PICKUP: "SET_IS_PICKUP",
  SET_PICKUP_OR_RETURN_WINDOWS: "SET_PICKUP_OR_RETURN_WINDOWS",
  SET_OWNDRIVER_WINDOWS_API_LOADING: "SET_OWNDRIVER_WINDOWS_API_LOADING",
  RESCHEDULE_DELIVERY: "RESCHEDULE_DELIVERY",
  SET_ERROR_TOAST_MESSAGE: "SET_ERROR_TOAST_MESSAGE",
  SET_ALL_PICKUP_WISE_WINDOWS: "SET_ALL_PICKUP_WISE_WINDOWS",
  SET_ALL_RETURN_WISE_WINDOWS: "SET_ALL_RETURN_WISE_WINDOWS",
  RESET_ALL_WISE_WINDOWS: "RESET_ALL_WISE_WINDOWS",
};

export const initAction = (payload) => ({
  type: windowSelectionActionTypes.INIT,
  payload: {
    orderDelivery: payload.orderDelivery,
    timeZone: payload.timeZone,
    returnMethod: payload.returnMethod,
    ownDriverDeliverySettings: payload.ownDriverDeliverySettings,
    onDemandDeliverySettings: payload.onDemandDeliverySettings,
    turnAroundInHours: payload.turnAroundInHours,
    orderType: payload.orderType,
    isProcessingCompleted: payload.isProcessingCompleted,
    intakeCompletedAtInMillis: payload.intakeCompletedAtInMillis,
    pickupDayWiseWindows: payload.pickupDayWiseWindows,
    currentOrderDelivery: payload.currentOrderDelivery,
    skipInitialValidation: payload.skipInitialValidation,
  },
});

export const apiFailedAction = (payload) => ({
  type: windowSelectionActionTypes.API_FAILED,
  payload: payload.message,
});

export const apiStartedAction = () => ({
  type: windowSelectionActionTypes.API_STARTED,
});

export const setCurrentTabAction = (newTab) => ({
  type: windowSelectionActionTypes.SET_CURRENT_TAB,
  payload: newTab,
});

export const setSelectedDateAction = (payload) => ({
  type: windowSelectionActionTypes.SET_SELECTED_DATE,
  payload: pick(payload, ["selectedDate"]),
});

export const setUberAuthTokenAction = (uberToken) => ({
  type: windowSelectionActionTypes.SET_UBER_AUTH_TOKEN,
  payload: uberToken,
});

export const estimateCallFailedAction = (payload) => ({
  type: windowSelectionActionTypes.ESTIMATE_CALL_FAILED,
  payload: pick(payload, ["type"]),
});

export const setDoordashEstimateAction = (payload) => {
  const {type, doorDashEstimate} = payload;
  return {
    type: windowSelectionActionTypes.SET_DOORDASH_ESTIMATE,
    payload: {
      type,
      doorDashEstimate: {
        estimateId: doorDashEstimate.data.id,
        totalDeliveryCost: Number(doorDashEstimate.data.estimateFee),
        pickupAt: doorDashEstimate.data.pickupTime,
      },
    },
  };
};

export const setOwnDriverDeliveryFeeAction = (payload) => {
  const {ownDriverDeliveryFee} = payload;
  return {
    type: windowSelectionActionTypes.SET_OWN_DRIVER_DELIVERY_FEE,
    payload: {
      deliveryFeeInCents: ownDriverDeliveryFee,
    },
  };
};

export const estimateCallStartedAction = (payload) => ({
  ...estimateCallFailedAction(payload),
  type: windowSelectionActionTypes.ESTIMATE_CALL_STARTED,
});

export const toggleInstorePickupAction = () => ({
  type: windowSelectionActionTypes.TOGGLE_IN_STORE_PICKUP,
});

export const setSelectedTimeWindowAction = (payload) => ({
  type: windowSelectionActionTypes.SET_SELECTED_TIME_WINDOWS,
  payload,
});

export const setUberEstimateAndTimeWindowAction = (payload) => ({
  type: windowSelectionActionTypes.SET_UBER_ESTIMATE_AND_TIME_WINDOW,
  payload: {
    uberEstimate: {
      estimateId: payload.uberEstimate.data.estimateId,
      totalDeliveryCost: Number(
        payload.uberEstimate.data.estimates[0].delivery_fee.total
      ),
      pickupAt: payload.uberEstimate.data.estimates[0].pickup_at,
    },
    deliveryWindow: payload.deliveryTimeArray,
    timingsId: payload.timingsId,
  },
});

export const togglePickupAndDeliveryWindowsAction = () => ({
  type: windowSelectionActionTypes.TOGGLE_PICKUP_AND_DELIVERY_WINDOWS,
});

export const updateReturnMethodAction = (payload) => ({
  type: windowSelectionActionTypes.UPDATE_RETURN_METHOD,
  payload: {
    returnMethod: payload.returnMethod,
    toggleTurnAroundTimePopup: payload.toggleTurnAroundTimePopup,
  },
});

export const toggleTurnaroundTimePopupAction = () => ({
  type: windowSelectionActionTypes.TOGGLE_TURNAROUND_TIME_POPUP,
});

export const setIsPickupAction = (forceOrderDeliveryType) => ({
  type: windowSelectionActionTypes.SET_IS_PICKUP,
  payload: {
    isPickup: forceOrderDeliveryType === ORDER_DELIVERY_TYPES.pickup,
  },
});

export const setPickupOrReturnWindowsAction = (payload) => ({
  type: windowSelectionActionTypes.SET_PICKUP_OR_RETURN_WINDOWS,
  payload: pick(payload, ["type", "dayWiseWindows", "orderType"]),
});

export const setAllPickupDayWiseWindows = (payload) => ({
  type: windowSelectionActionTypes.SET_ALL_PICKUP_WISE_WINDOWS,
  payload,
});

export const setAllReturnDayWiseWindows = (payload) => ({
  type: windowSelectionActionTypes.SET_ALL_RETURN_WISE_WINDOWS,
  payload,
});

export const setAll = (payload) => ({
  type: windowSelectionActionTypes.SET_PICKUP_OR_RETURN_WINDOWS,
  payload: pick(payload, ["type", "dayWiseWindows", "orderType"]),
});

export const setOwnDriverWindowsApiLoadingAction = (payload) => ({
  type: windowSelectionActionTypes.SET_OWNDRIVER_WINDOWS_API_LOADING,
  payload,
});

export const rescheduleDeliveryAction = (payload) => ({
  type: windowSelectionActionTypes.RESCHEDULE_DELIVERY,
  payload,
});

export const setErrorToastMessageAction = (payload) => ({
  type: windowSelectionActionTypes.SET_ERROR_TOAST_MESSAGE,
  payload,
});

export default windowSelectionActionTypes;
