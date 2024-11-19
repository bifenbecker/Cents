import windowSelectionActions from "./actions";
import {
  setInitState,
  setSelectedTimeWindow,
  setCurrentDeliveryProvider,
  updateReturnMethod,
  setSelectedDate,
  updateReturnDeliveryMethod,
  forceSetIsPickup,
} from "./reducer-functions";

export default (state, action) => {
  switch (action.type) {
    case windowSelectionActions.INIT:
      return setInitState(state, action.payload);

    case windowSelectionActions.SET_CURRENT_TAB:
      return setCurrentDeliveryProvider(state, action.payload);

    case windowSelectionActions.SET_UBER_AUTH_TOKEN:
      return {
        ...state,
        uberAuthToken: action.payload,
        loading: false,
        error: null,
      };

    case windowSelectionActions.SET_SELECTED_DATE:
      return setSelectedDate(state, action.payload);

    // when user switches between pickup and delivery screen
    case windowSelectionActions.TOGGLE_PICKUP_AND_DELIVERY_WINDOWS:
      return {
        ...state,
        isPickup: !state.isPickup,
      };

    case windowSelectionActions.SET_IS_PICKUP:
      return forceSetIsPickup(state, action.payload);

    case windowSelectionActions.TOGGLE_IN_STORE_PICKUP:
      return updateReturnMethod(state, action.payload);

    case windowSelectionActions.SET_SELECTED_TIME_WINDOWS:
      return setSelectedTimeWindow(state, action.payload || {});

    case windowSelectionActions.SET_UBER_ESTIMATE_AND_TIME_WINDOW:
      return {
        ...state,
        orderDelivery: {
          delivery: {...state.orderDelivery.delivery},
          pickup: {...state.orderDelivery.pickup, ...action.payload},
        },
        loading: false,
        error: null,
      };

    case windowSelectionActions.SET_DOORDASH_ESTIMATE:
      return {
        ...state,
        orderDelivery: {
          ...state.orderDelivery,
          [action.payload.type]: {
            ...state.orderDelivery[action.payload.type],
            doorDashEstimate: action.payload.doorDashEstimate,
          },
        },
        [action.payload.type === "pickup"
          ? "fetchingPickupEstimates"
          : "fetchingDeliveryEstimates"]: false,
      };

    case windowSelectionActions.API_STARTED:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case windowSelectionActions.API_FAILED:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    case windowSelectionActions.ESTIMATE_CALL_STARTED:
      return {
        ...state,
        [action.payload.type === "pickup"
          ? "fetchingPickupEstimates"
          : "fetchingDeliveryEstimates"]: true,
      };

    case windowSelectionActions.ESTIMATE_CALL_FAILED:
      return {
        ...state,
        [action.payload.type === "pickup"
          ? "fetchingPickupEstimates"
          : "fetchingDeliveryEstimates"]: false,
      };

    case windowSelectionActions.UPDATE_RETURN_METHOD:
      return updateReturnDeliveryMethod(state, action.payload);

    case windowSelectionActions.TOGGLE_TURNAROUND_TIME_POPUP:
      return {
        ...state,
        showTurnAroundTimePopup: !state.showTurnAroundTimePopup,
      };

    default:
      return state;
  }
};
