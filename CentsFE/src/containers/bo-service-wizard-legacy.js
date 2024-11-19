import {connect} from "react-redux";
import store from "../store";
import ServiceWizard from "../components/business-owner/global-settings/legacy_services/service-wizard";
import {createNamespacer} from "../utils/reducers";
import actionTypes from "../actionTypes";
import _ from "lodash";
import {fetchAllServices, createOrUpdateService} from "../api/business-owner/services";
import {fetchLocations} from "../api/business-owner/locations";

const oldServicesAT = actionTypes.businessOwner.globalSettings.oldServices;
const oldServicesNameSpacer = createNamespacer("BO-LEGACY-SERVICES");

const mapStateToProps = (state) => {
  const {
    businessOwner: {
      globalSettings: {
        oldServices: {
          showHideNewServiceWizard,
          addNewServiceCallInProgress,
          addNewServiceError,
          servicesCategoryList,
          showNewServicesPricingScreen,
          newServicePricingCallProgress,
          newServicePricingError,
          newServicePriceItems,
          allSelected,
          activeRoundedTab,
        },
      },
    },
  } = state;
  return {
    showHideNewServiceWizard,
    addNewServiceCallInProgress,
    addNewServiceError,
    servicesCategoryList,
    showNewServicesPricingScreen,
    newServicePricingCallProgress,
    newServicePricingError,
    newServicePriceItems,
    allSelected,
    activeRoundedTab,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    addNewService: async (serviceDetails, params) => {
      let errorFrom;

      try {
        dispatch({
          type: oldServicesNameSpacer(oldServicesAT.SET_NEW_SERVICE_CALL_PROGRESS),
          payload: true,
        });

        errorFrom = "create-service";
        const responseFromCreateService = await createOrUpdateService(serviceDetails);

        dispatch({
          type: oldServicesNameSpacer(oldServicesAT.SET_SERVICES_CALL_PROGRESS),
          payload: true,
        });

        errorFrom = "get-services";
        const responseFromFetchAllServices = await fetchAllServices(params);

        dispatch({
          type: oldServicesNameSpacer(oldServicesAT.SET_SERVICES_CALL_PROGRESS),
          payload: false,
        });

        dispatch({
          type: oldServicesNameSpacer(oldServicesAT.SET_NEW_SERVICE_CALL_PROGRESS),
          payload: false,
        });

        dispatch({
          type: oldServicesNameSpacer(oldServicesAT.SET_ALL_SERVICES),
          payload: responseFromFetchAllServices.data,
        });

        dispatch({
          type: oldServicesNameSpacer(oldServicesAT.SET_NEW_SERVICE_ERROR),
          payload: "",
        });

        dispatch({
          type: oldServicesNameSpacer(oldServicesAT.SET_NEW_SERVICE_ACTIVE_ID),
          payload: responseFromCreateService.data.serviceMaster,
        });

        dispatch({
          type: oldServicesNameSpacer(oldServicesAT.SET_SHOW_NEW_SERVICE_PRICING_SCREEN),
          payload: false,
        });
      } catch (error) {
        if (errorFrom === "create-service") {
          dispatch({
            type: oldServicesNameSpacer(oldServicesAT.SET_NEW_SERVICE_ERROR),
            payload: _.get(error, "response.data.error", "Something went wrong."),
          });
        } else if (errorFrom === "get-services") {
          dispatch({
            type: oldServicesNameSpacer(oldServicesAT.SET_SERVICES_ERROR),
            payload: _.get(error, "response.data.error", "Something went wrong."),
          });
        }

        dispatch({
          type: oldServicesNameSpacer(oldServicesAT.SET_NEW_SERVICE_CALL_PROGRESS),
          payload: false,
        });
      }
    },

    showHideNewServiceWizard: (value) => {
      dispatch({
        type: oldServicesNameSpacer(oldServicesAT.SET_SHOW_NEW_SERVICE_WIZARD),
        payload: value,
      });
    },

    handleShowNewServicesPricingScreen: async (value) => {
      dispatch({
        type: oldServicesNameSpacer(oldServicesAT.SET_SHOW_NEW_SERVICE_PRICING_SCREEN),
        payload: value,
      });

      if (value) {
        const currentPriceItems = store.getState().businessOwner.globalSettings.services
          .newServicePriceItems;

        if (!currentPriceItems) {
          try {
            dispatch({
              type: oldServicesNameSpacer(
                oldServicesAT.SET_NEW_SERVICE_PRICING_CALL_PROGRESS
              ),
              payload: true,
            });

            const locationResp = await fetchLocations();

            dispatch({
              type: oldServicesNameSpacer(
                oldServicesAT.SET_NEW_SERVICE_PRICING_LOCATIONS_LIST
              ),
              payload: locationResp.data.allLocations,
            });
          } catch (error) {
            dispatch({
              type: oldServicesNameSpacer(
                oldServicesAT.SET_NEW_SERVICE_PRICING_LOCATIONS_ERROR
              ),
              payload: _.get(error, "response.data.error", "Something went wrong."),
            });
          } finally {
            dispatch({
              type: oldServicesNameSpacer(
                oldServicesAT.SET_NEW_SERVICE_PRICING_CALL_PROGRESS
              ),
              payload: false,
            });
          }
        }
      }
    },

    handleMinimumToggle: (value) => {
      dispatch({
        type: oldServicesNameSpacer(oldServicesAT.SET_MINIMUM_TOGGLE_VALUE),
        payload: value,
      });
    },

    handleChange: (value, storeId, field) => {
      dispatch({
        type: oldServicesNameSpacer(oldServicesAT.SET_NEW_SERVICE_PRICE_AT_LOCATION),
        payload: {
          value,
          storeId,
          field,
        },
      });
    },

    handleSelectAll: (value) => {
      dispatch({
        type: oldServicesNameSpacer(oldServicesAT.SET_SELECT_ALL_SERVICE_LOCATIONS),
        payload: value,
      });
    },

    handleApplyAll: (index) => {
      dispatch({
        type: oldServicesNameSpacer(oldServicesAT.SET_APPLY_ALL_SERVICE_PRICES),
        payload: index,
      });
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(ServiceWizard);
