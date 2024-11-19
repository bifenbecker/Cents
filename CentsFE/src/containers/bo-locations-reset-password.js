import {connect} from "react-redux";
import {createNamespacer} from "../utils/reducers";
import * as locationsApi from "../api/business-owner/locations";
import actionTypes from "../actionTypes";

import ResetPassword from "../components/business-owner/global-settings/locations/reset-password/reset-password";

const locationsAT = actionTypes.businessOwner.globalSettings.locations;
const BoLocationsNamespacer = createNamespacer("BUSINESS_OWNER_GS_LOCATIONS");

const mapStateToProps = (state) => {
  const {
    businessOwner: {
      globalSettings: {
        locations: {
          selectedLocation,
          showResetPasswordScreen,
          showPasswordForm,
          resetPasswordApiError,
          resetPasswordLoading,
          isLocationDetailsLoading,
        },
      },
    },
  } = state;

  return {
    location: selectedLocation,
    showResetPasswordScreen,
    showPasswordForm,
    resetPasswordApiError,
    resetPasswordLoading,
    isLocationDetailsLoading,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    refreshActiveLocation: () => {
      dispatch({
        type: BoLocationsNamespacer(locationsAT.REFRESH_ACTIVE_LOCATION_DETAILS),
        payload: true,
      });
    },
    onUnmountResetPassword: () => {
      dispatch({
        type: BoLocationsNamespacer(locationsAT.SET_SHOW_RESET_PASSWORD_SCREEN),
        payload: false,
      });
    },
    onSetShowResetPasswordScreen: async (value) => {
      dispatch({
        type: BoLocationsNamespacer(locationsAT.SET_SHOW_RESET_PASSWORD_SCREEN),
        payload: value,
      });

      if (!value) {
        dispatch({
          type: BoLocationsNamespacer(locationsAT.REFRESH_ACTIVE_LOCATION_DETAILS),
          payload: true,
        });
      }
    },
    onSetShowPasswordForm: (value) => {
      dispatch({
        type: BoLocationsNamespacer(locationsAT.SET_SHOW_PASSWORD_FORM),
        payload: value,
      });
    },
    onResetPassword: async (location, passwordFields) => {
      try {
        dispatch({
          type: BoLocationsNamespacer(locationsAT.RESET_PASSWORD_API_STARTED),
        });

        await locationsApi.updateLocationPassword(location.id, passwordFields);

        dispatch({
          type: BoLocationsNamespacer(locationsAT.RESET_PASSWORD_API_SUCCESS),
        });
      } catch (error) {
        dispatch({
          type: BoLocationsNamespacer(locationsAT.RESET_PASSWORD_API_FAILURE),
          payload: error?.response?.data?.error || error.message,
        });
      }
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(ResetPassword);
