import {
  saveAddressSelection,
  setInitState,
  updateCustomerAddresses,
  updateManageOrderState,
  updateSingleState,
  updateNotesAndPreferences,
  validateAddressError,
  updateOrderDeliveryWindows,
  updateCustomerInfoState,
  updateCourierTip,
  toggleSingleState,
  updatePaymentMethod,
  updateServicesAndModifiers,
} from "./reducer-fuctions";
import actionTypes from "./action-types";

export {default as initialState} from "./initial-state";
export {default as actionTypes} from "./action-types";

export default (state, action) => {
  switch (action.type) {
    case actionTypes.SET_INIT_STATE:
      return setInitState(state, action.payload);
    case actionTypes.CHANGE_MANAGE_ORDER_STATE:
      return updateManageOrderState(state, action.payload);
    case actionTypes.SET_ADDRESS_TO_VALIDATE:
      return updateSingleState(state, "addressToValidate", action.payload || {});
    case actionTypes.SET_LOADING:
      return updateSingleState(state, "loading", action.payload || false);
    case actionTypes.SET_INIT_LOADING:
      return updateSingleState(state, "initLoading", action.payload || false);
    case actionTypes.SET_OWN_DELIVERY_SETTINGS_LOADING:
      return updateSingleState(
        state,
        "ownDriverDeliverySettingsLoading",
        action.payload || false
      );
    case actionTypes.SAVE_ADDRESS_SELECTION:
      return saveAddressSelection(state, action.payload);
    case actionTypes.UPDATE_SELECTED_ADDRESS:
    case actionTypes.SAVE_ADDRESS:
      return updateCustomerAddresses(state, action.payload || {});
    case actionTypes.UPDATE_CUSTOMER_NOTES_AND_PREFERENCES:
      return updateNotesAndPreferences(state, action.payload);
    case actionTypes.VALIDATE_ADDRESS_ERROR:
      return validateAddressError(state, action.payload);
    case actionTypes.UPDATE_ORDER_DELIVERY_WINDOWS:
      return updateOrderDeliveryWindows(state, action.payload);
    case actionTypes.UPDATE_CUSTOMER_INFO:
      return updateCustomerInfoState(state, action.payload);
    case actionTypes.UPDATE_COURIER_TIP:
      return updateCourierTip(state, action.payload);
    case actionTypes.TOGGLE_ADDRESS_SELECTION:
      return toggleSingleState(state, "showAddressSelection");
    case actionTypes.TOGGLE_DELIVERY_WINDOWS:
      return toggleSingleState(state, "showDeliveryWindows");
    case actionTypes.SET_ERROR_TOAST_MESSAGE:
      return updateSingleState(state, "errorToastMessage", action.payload || null);
    case actionTypes.UPDATE_PAYMENT_METHOD:
      return updatePaymentMethod(state, action.payload || {});
    case actionTypes.API_FAILURE:
      return {
        ...state,
        error: action.payload,
        loading: false,
      };
    case actionTypes.API_SUCCESS:
      return {
        ...state,
        error: null,
        loading: false,
      };
    case actionTypes.UPDATE_SERVICES_AND_MODIFIERS:
      return updateServicesAndModifiers(state, action.payload || null);
    default:
      return {...state};
  }
};
