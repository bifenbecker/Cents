import {connect} from "react-redux";
import curry from "lodash/curry";
import get from "lodash/get";

import {createNamespacer} from "../utils/reducers";
import {fetchDeliverySettings} from "../api/business-owner/delivery-settings";
import actionTypes from "../actionTypes";
import DeliverySettingsWizard from "../components/business-owner/global-settings/locations/delivery-settings/delivery-settings";
import OwnDriverDeliverySettingsWizard from "../components/business-owner/global-settings/locations/own-driver-delivery-settings/wizard";
import ServicePricingAndAvailabilityWizard from "../components/business-owner/global-settings/locations/general-delivery-settings/forms/service-pricing-availability/index";

const locationsAT = actionTypes.businessOwner.globalSettings.locations;
const BoLocationsNamespacer = createNamespacer("BUSINESS_OWNER_GS_LOCATIONS");

const mapStateToProps = (state) => {
  const {
    businessOwner: {
      globalSettings: {
        locations: {
          selectedLocation,
          deliveryWizard,
          deliverySettings,
          deliverySettingsApiError,
          deliverySettingsLoading,
          isLocationDetailsLoading,
        },
      },
    },
  } = state;
  return {
    location: selectedLocation,
    deliveryWizard,
    deliverySettings,
    deliverySettingsApiError,
    deliverySettingsLoading,
    isLocationDetailsLoading,
  };
};

export const setDeliveryWizard = (dispatch, wizardType) => {
  dispatch({
    type: BoLocationsNamespacer(locationsAT.SET_DELIVERY_WIZARD_TYPE),
    payload: wizardType,
  });
};

const mapDispatchToProps = (dispatch) => {
  return {
    fetchDeliverySettings: async (locationId) => {
      try {
        dispatch({
          type: BoLocationsNamespacer(locationsAT.SET_DELIVERY_SETTINGS_CALL_PROGRESS),
          payload: true,
        });
        const response = await fetchDeliverySettings(locationId);
        dispatch({
          type: BoLocationsNamespacer(locationsAT.SET_DELIVERY_SETTINGS),
          payload: response.data,
        });

        dispatch({
          type: BoLocationsNamespacer(locationsAT.SET_DELIVERY_SETTINGS_CALL_PROGRESS),
          payload: false,
        });

        dispatch({
          type: BoLocationsNamespacer(locationsAT.SET_DELIVERY_SETTINGS_ERROR),
          payload: "",
        });
      } catch (error) {
        dispatch({
          type: BoLocationsNamespacer(locationsAT.SET_DELIVERY_SETTINGS_ERROR),
          payload: get(error, "response.data.error", "Something went wrong."),
        });
      }
    },

    setDeliveryWizard: curry(setDeliveryWizard)(dispatch),
    setEditableDeliveryScreen: (deliveryScreenType) => {
      dispatch({
        type: BoLocationsNamespacer(locationsAT.SET_EDIT_DELIVERY_SETTINGS_SCREEN_TYPE),
        payload: deliveryScreenType,
      });
    },
  };
};

export const DeliverySettings = connect(
  mapStateToProps,
  mapDispatchToProps
)(DeliverySettingsWizard);
export const ServicePricingAndAvailability = connect(
  mapStateToProps,
  mapDispatchToProps
)(ServicePricingAndAvailabilityWizard);
export const OwnDriverDeliverySettings = connect(
  mapStateToProps,
  mapDispatchToProps
)(OwnDriverDeliverySettingsWizard);
