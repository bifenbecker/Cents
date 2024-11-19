import { connect } from "react-redux";
import get from "lodash/get";

import { createNamespacer } from "../utils/reducers";
import * as locationsApi from "../api/business-owner/locations";
import actionTypes from "../actionTypes";

import LocationsWizard from "../components/business-owner/global-settings/locations/locations-wizard/locations-wizard";

const BoLocationsNamespacer = createNamespacer("BUSINESS_OWNER_GS_LOCATIONS");
const locationsAT = actionTypes.businessOwner.globalSettings.locations;

const mapStateToProps = (state) => {
  const {
    businessOwner: {
      globalSettings: {
        locations: {
          addLocationStep,
          needsRegions,
          districts,
          districtsCallInProgress,
          saveLocationCallInProgress,
          taxRatesList,
          showAddTaxScreen,
          newTaxRateWhileLocationCreation,
          errorMessage,
        },
      },
    },
  } = state;

  return {
    addLocationStep,
    needsRegions,
    districts,
    districtsCallInProgress,
    saveLocationCallInProgress,
    taxRatesList,
    showAddTaxScreen,
    newTaxRateWhileLocationCreation,
    errorMessage,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    closeScreen: () => {
      dispatch({
        type: BoLocationsNamespacer(locationsAT.CLOSE_ADD_LOCATION_SCREEN),
      });
    },
    moveToStep: (step) => {
      dispatch({
        type: BoLocationsNamespacer(locationsAT.CHANGE_ADD_LOCATION_STEP),
        payload: step,
      });
    },
    addNewTaxRate: () => {
      dispatch({
        type: BoLocationsNamespacer(locationsAT.SHOW_HIDE_ADD_TAXRATE_SCREEN),
        payload: true,
      });
    },
    createNewLocation: async (location) => {
      const locationBody = {
        name: location.name,
        address: location.address,
        city: location.city,
        state: location.state,
        zipCode: location.zipCode,
        phoneNumber: location.phoneNumber,
        confirmPassword: location.confirmPassword,
        password: location.password,
      };

      if (location.needsRegions) {
        locationBody.districtId = location.districtId;
      }

      if (location.dcaLicense) {
        locationBody.dcaLicense = location.dcaLicense;
      }

      if (location?.taxRate?.id) {
        locationBody.taxRateId = location.taxRate.id;
      }

      try {
        dispatch({
          type: BoLocationsNamespacer(locationsAT.SAVE_LOCATION_API_STARTED),
        });
        let response = await locationsApi.createNewLocation(locationBody);

        if (response.status === 200 && response.data.success) {
          dispatch({
            type: BoLocationsNamespacer(locationsAT.SAVE_LOCATION_API_SUCCESS),
          });
          dispatch({
            type: BoLocationsNamespacer(locationsAT.APPEND_TO_LOCATION_LIST),
            payload: response.data.createLocation,
          });
          dispatch({
            type: BoLocationsNamespacer(locationsAT.SET_SELECTED_LOCATION),
            payload: response.data.createLocation,
          });
        } else {
          dispatch({
            type: BoLocationsNamespacer(locationsAT.SAVE_LOCATION_API_FAILURE),
            payload: "Something went wrong",
          });
        }
      } catch (error) {
        dispatch({
          type: BoLocationsNamespacer(locationsAT.SAVE_LOCATION_API_FAILURE),
          payload: get(error, "response.data.error", "Something went wrong"),
        });
      }
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(LocationsWizard);
