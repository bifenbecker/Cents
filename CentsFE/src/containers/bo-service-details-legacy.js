import {connect} from "react-redux";
import ServiceDetails from "../components/business-owner/global-settings/legacy_services/service-details";
import {createNamespacer} from "../utils/reducers";
import actionTypes from "../actionTypes";
import {fetchServiceDetails, updateServiceDetails} from "../api/business-owner/services";
import _ from "lodash";

let oldServicesNameSpacer = createNamespacer("BO-LEGACY-SERVICES");
let oldServicesAT = actionTypes.businessOwner.globalSettings.oldServices;

const mapStateToProps = (state) => {
  return {
    ...state.businessOwner.globalSettings.oldServices,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    fetchServiceDetails: async (serviceId) => {
      dispatch({
        type: oldServicesNameSpacer(oldServicesAT.SET_SERVICE_DETAILS_CALL_IN_PROGRESS),
        payload: true,
      });
      try {
        let response = await fetchServiceDetails(serviceId);
        dispatch({
          type: oldServicesNameSpacer(oldServicesAT.SET_ACTIVE_SERVICE_DETAILS),
          payload: response.data,
        });
        dispatch({
          type: oldServicesNameSpacer(oldServicesAT.SET_SERVICE_DETAILS_CALL_IN_PROGRESS),
          payload: false,
        });
      } catch (e) {
        dispatch({
          type: oldServicesNameSpacer(oldServicesAT.SET_SERVICE_DETAILS_ERROR),
          payload: _.get(e, "response.data.error", "Something went wrong"),
        });
        dispatch({
          type: oldServicesNameSpacer(oldServicesAT.SET_SERVICE_DETAILS_CALL_IN_PROGRESS),
          payload: false,
        });
      }
    },

    navigateToUpdateServiceDetails: async () => {
      dispatch({
        type: oldServicesNameSpacer(oldServicesAT.SET_SHOW_UPDATE_SERVICE),
      });
    },

    handlePriceDetailsClick: () => {
      dispatch({
        type: oldServicesNameSpacer(oldServicesAT.SET_ACTIVE_TAB),
        payload: "location_pricing",
      });
    },

    handleFieldChange: (id, field, value) => {
      dispatch({
        type: oldServicesNameSpacer(oldServicesAT.UPDATE_ACTIVE_SERVICE_DETAIL),
        payload: {
          field,
          value,
        },
      });
    },

    handleSave: async (data, currentSearchText, searchInProgress) => {
      try {
        dispatch({
          type: oldServicesNameSpacer(
            oldServicesAT.SET_SERVICE_DETAILS_UPDATE_IN_PROGRESS
          ),
          payload: true,
        });
        let processedData = {
          id: data.id,
          name: data.name,
          description: data.description,
          serviceCategoryId: data.serviceCategoryId,
          hasMinPrice: data.hasMinPrice,
          servicePricingStructureId: data.servicePricingStructureId,
        };
        let resp = await updateServiceDetails(processedData);
        dispatch({
          type: oldServicesNameSpacer(oldServicesAT.SET_SERVICE_DETAILS_UPDATED_ID),
          payload: _.get(resp, "data.service", {}),
        });

        if (searchInProgress) {
          dispatch({
            type: oldServicesNameSpacer(oldServicesAT.SET_SERVICE_SEARCH_TEXT),
            payload: currentSearchText,
          });
        }

        dispatch({
          type: oldServicesNameSpacer(
            oldServicesAT.SET_SERVICE_DETAILS_UPDATE_IN_PROGRESS
          ),
          payload: false,
        });
        dispatch({
          type: oldServicesNameSpacer(oldServicesAT.SET_SERVICE_DETAILS_UPDATE_ERROR),
          payload: "",
        });
      } catch (e) {
        // Handle error
        dispatch({
          type: oldServicesNameSpacer(oldServicesAT.SET_SERVICE_DETAILS_UPDATE_ERROR),
          payload: _.get(e, "response.data.error", "Something went wrong"),
        });
        dispatch({
          type: oldServicesNameSpacer(
            oldServicesAT.SET_SERVICE_DETAILS_UPDATE_IN_PROGRESS
          ),
          payload: false,
        });
      }
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(ServiceDetails);
