// Redux specific
import {connect} from "react-redux";
import store from "../store";
import actionTypes from "../actionTypes";
import {createNamespacer} from "../utils/reducers";

// Component and APIs
import PricePerService from "../components/business-owner/global-settings/locations/price-per-service";
import {
  fetchAllServices,
  fetchAllDryCleaningAndServices,
} from "../api/business-owner/services";

// Libraries
import {get} from "lodash";

const promotionsAT = actionTypes.businessOwner.globalSettings.promotions;
const promotionsNamespacer = createNamespacer("BO-PROMOTIONS");

const mapStateToProps = (state) => {
  return {
    locations: state.businessOwner.globalSettings.locations,
    promotions: state.businessOwner.globalSettings.promotions,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    fetchServicesList: async (isDetails) => {
      const currentServicesList = store.getState().businessOwner.globalSettings.promotions
        .servicesList;
      if (currentServicesList.length === 0 || isDetails) {
        try {
          dispatch({
            type: promotionsNamespacer(promotionsAT.SET_SERVICES_CALL_PROGRESS),
            payload: true,
          });
          const servicesResponse = await fetchAllServices();
          dispatch({
            type: promotionsNamespacer(promotionsAT.SET_SERVICES_LIST),
            payload: servicesResponse.data.categories,
            isDetails: isDetails,
          });
        } catch (error) {
          dispatch({
            type: promotionsNamespacer(promotionsAT.SET_SERVICES_LIST_CALL_ERROR),
            payload: get(error, "response.data.error", "Something went wrong"),
          });
        } finally {
          dispatch({
            type: promotionsNamespacer(promotionsAT.SET_SERVICES_CALL_PROGRESS),
            payload: false,
          });
        }
      }
    },
    fetchDryCleaningAndServicesList: async (isDetails) => {
      const currentServicesList = store.getState().businessOwner.globalSettings.promotions
        .servicesList;
      if (currentServicesList.length === 0 || isDetails) {
        try {
          dispatch({
            type: promotionsNamespacer(promotionsAT.SET_SERVICES_CALL_PROGRESS),
            payload: true,
          });
          const servicesResponse = await fetchAllDryCleaningAndServices();
          dispatch({
            type: promotionsNamespacer(promotionsAT.SET_NEW_SERVICES_LIST),
            payload: servicesResponse.data.categories,
            isDetails: isDetails,
          });
        } catch (error) {
          dispatch({
            type: promotionsNamespacer(promotionsAT.SET_SERVICES_LIST_CALL_ERROR),
            payload: get(error, "response.data.error", "Something went wrong"),
          });
        } finally {
          dispatch({
            type: promotionsNamespacer(promotionsAT.SET_SERVICES_CALL_PROGRESS),
            payload: false,
          });
        }
      }
    },

    handlePromotionClickInServices: (isSelected, categoryId, serviceId) => {
      dispatch({
        type: promotionsNamespacer(promotionsAT.UPDATE_SERVICES_LIST),
        payload: {isSelectedForPromotion: isSelected, categoryId, serviceId},
      });
      dispatch({
        type: promotionsNamespacer(promotionsAT.SET_ITEMS_COUNT),
      });
    },

    handleSelectAll: (serviceCategory, flags) => {
      dispatch({
        type: promotionsNamespacer(promotionsAT.SET_SELECT_ALL_SERVICES),
        payload: {serviceCategory, flags},
      });
      dispatch({
        type: promotionsNamespacer(promotionsAT.SET_ITEMS_COUNT),
      });
    },

    handleServicesTabSwitch: (activeServicesTab) => {
      dispatch({
        type: promotionsNamespacer(promotionsAT.HANDLE_SERVICES_TAB_SWITCH),
        payload: activeServicesTab,
      });
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(PricePerService);
