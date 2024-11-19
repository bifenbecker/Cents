import {connect} from "react-redux";
import ServiceDetails from "../components/business-owner/global-settings/services/service-details";
import {createNamespacer} from "../utils/reducers";
import actionTypes from "../actionTypes";
import {fetchServiceDetails, updateServiceDetails} from "../api/business-owner/services";
import _ from "lodash";

const servicesAT = actionTypes.businessOwner.globalSettings.services;
const servicesNamespacer = createNamespacer("BO-SERVICES");

const mapStateToProps = (state) => {
  return {
    ...state.businessOwner.globalSettings.services,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    fetchServiceDetails: async (serviceId) => {
      dispatch({
        type: servicesNamespacer(servicesAT.SET_SERVICE_DETAILS_CALL_IN_PROGRESS),
        payload: true,
      });
      try {
        let response = await fetchServiceDetails(serviceId);
        dispatch({
          type: servicesNamespacer(servicesAT.SET_ACTIVE_SERVICE_DETAILS),
          payload: response.data,
        });
        dispatch({
          type: servicesNamespacer(servicesAT.SET_SERVICE_DETAILS_CALL_IN_PROGRESS),
          payload: false,
        });
      } catch (e) {
        dispatch({
          type: servicesNamespacer(servicesAT.SET_SERVICE_DETAILS_ERROR),
          payload: _.get(e, "response.data.error", "Something went wrong"),
        });
        dispatch({
          type: servicesNamespacer(servicesAT.SET_SERVICE_DETAILS_CALL_IN_PROGRESS),
          payload: false,
        });
      }
    },

    navigateToUpdateServiceDetails: async () => {
      dispatch({
        type: servicesNamespacer(servicesAT.SET_SHOW_UPDATE_SERVICE),
      });
    },

    handlePriceDetailsClick: () => {
      dispatch({
        type: servicesNamespacer(servicesAT.SET_ACTIVE_TAB),
        payload: "location_pricing",
      });
    },

    handleFieldChange: (id, field, value) => {
      dispatch({
        type: servicesNamespacer(servicesAT.UPDATE_ACTIVE_SERVICE_DETAIL),
        payload: {
          field,
          value,
        },
      });
    },

    handleSave: async (data, currentSearchText, searchInProgress, refreshBoolean) => {
      try {
        dispatch({
          type: servicesNamespacer(servicesAT.SET_SERVICE_DETAILS_UPDATE_IN_PROGRESS),
          payload: true,
        });

        let processedData = {
          id: data.id,
          name: data.name,
          description: data.description,
          serviceCategoryId: data.serviceCategoryId,
          hasMinPrice: data.hasMinPrice,
          servicePricingStructureId: data.servicePricingStructureId,
          subcategory: data.subcategory,
        };
        let resp = await updateServiceDetails(processedData);
        dispatch({
          type: servicesNamespacer(servicesAT.SET_SERVICE_DETAILS_UPDATED_ID),
          payload: _.get(resp, "data.service", {}),
        });

        dispatch({
          type: servicesNamespacer(servicesAT.SET_SERVICES_REFRESH),
          payload: refreshBoolean,
        });

        if (searchInProgress) {
          dispatch({
            type: servicesNamespacer(servicesAT.SET_SERVICE_SEARCH_TEXT),
            payload: currentSearchText,
          });
        }

        dispatch({
          type: servicesNamespacer(servicesAT.SET_SERVICE_DETAILS_UPDATE_IN_PROGRESS),
          payload: false,
        });
        dispatch({
          type: servicesNamespacer(servicesAT.SET_SERVICE_DETAILS_UPDATE_ERROR),
          payload: "",
        });
        dispatch({
          type: servicesNamespacer(servicesAT.SET_NEW_CATEGORY_ID),
          payload: data.serviceCategoryId,
        });
      } catch (e) {
        // Handle error
        dispatch({
          type: servicesNamespacer(servicesAT.SET_SERVICE_DETAILS_UPDATE_ERROR),
          payload: _.get(e, "response.data.error", "Something went wrong"),
        });
        dispatch({
          type: servicesNamespacer(servicesAT.SET_SERVICE_DETAILS_UPDATE_IN_PROGRESS),
          payload: false,
        });
      }
    },
    handleShowNewCategoryScreen: (value) => {
      dispatch({
        type: servicesNamespacer(servicesAT.SET_SHOW_NEW_CATEGORY_SCREEN),
        payload: value,
      });
    },
    handleShowNewCategoryScreenInDetails: (value) => {
      dispatch({
        type: servicesNamespacer(servicesAT.SET_SHOW_NEW_CATEGORY_SCREEN_IN_DETAILS),
        payload: value,
      });
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(ServiceDetails);
