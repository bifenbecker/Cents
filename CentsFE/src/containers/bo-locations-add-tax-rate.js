import { connect } from "react-redux";
import get from "lodash/get";

import { createNamespacer } from "../utils/reducers";
import actionTypes from "../actionTypes";
import * as taxesApi from "../api/business-owner/taxes";

import AddTaxScreen from "../components/business-owner/global-settings/locations/add-tax-screen/add-tax-screen";

const BoLocationsNamespacer = createNamespacer("BUSINESS_OWNER_GS_LOCATIONS");
const locationsAT = actionTypes.businessOwner.globalSettings.locations;

const mapStateToProps = (state) => {
  const {
    businessOwner: {
      globalSettings: {
        locations: {
          taxErrorMessage,
          selectedLocation,
          newTaxRateCallInprogress,
        },
      },
    },
  } = state;

  return {
    taxErrorMessage,
    selectedLocation,
    newTaxRateCallInprogress,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    submitNewTaxRate: async (newTaxRate, selectedLocationId = null) => {
      try {
        dispatch({
          type: BoLocationsNamespacer(locationsAT.ADD_TAX_RATE_API_STARTED),
        });

        const { name, rate, taxAgency } = newTaxRate;

        const formattedTaxRate = {
          name: name.trim(),
          taxAgency: taxAgency.trim(),
          rate: Number(rate),
        };

        let resp = await taxesApi.addNewTaxRate(formattedTaxRate);

        // If we are adding tax from selected location,
        // then add that tax rate directly to that location.
        if (selectedLocationId) {
          await taxesApi.updateLocationTaxRate(
            { id: selectedLocationId },
            { taxRateId: resp.data.tax.id }
          );
        } else {
          dispatch({
            type: BoLocationsNamespacer(locationsAT.SET_NEW_TAX_RATE_WHILE_LOCATION_CREATION),
            payload: resp.data.tax
          });
        }

        if (resp.data.success) {
          dispatch({
            type: BoLocationsNamespacer(locationsAT.APPEND_TO_TAX_LIST),
            payload: resp.data.tax,
          });

          dispatch({
            type: BoLocationsNamespacer(locationsAT.ADD_TAX_RATE_API_SUCCESS),
          });
        } else {
          dispatch({
            type: BoLocationsNamespacer(locationsAT.ADD_TAX_RATE_API_FAILURE),
            payload: "Something went wrong.",
          });
        }
      } catch (error) {
        dispatch({
          type: BoLocationsNamespacer(locationsAT.ADD_TAX_RATE_API_FAILURE),
          payload: get(error, "response.data.error", "Something went wrong."),
        });
      }
    },
    showHideAddTaxRateScreen: (value) => {
      dispatch({
        type: BoLocationsNamespacer(locationsAT.SHOW_HIDE_ADD_TAXRATE_SCREEN),
        payload: value,
      });
    },
    exitAddTaxRateScreen: () => {
      // Close tax rate screen, Remove any errors and reset loaders.
      dispatch({
        type: BoLocationsNamespacer(locationsAT.EXIT_ADD_TAX_RATE_SCREEN),
      });
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(AddTaxScreen);
