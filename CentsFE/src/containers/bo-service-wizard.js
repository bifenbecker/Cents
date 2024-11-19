import {connect} from "react-redux";
import store from "../store";
import ServiceWizard from "../components/business-owner/global-settings/services/service-wizard/service-wizard.js";
import {createNamespacer} from "../utils/reducers";
import actionTypes from "../actionTypes";
import _ from "lodash";
import {
  createOrUpdateService,
  createOrUpdateNewServiceSubcategory,
  fetchServiceCategoriesForService,
  fetchServiceCategories,
} from "../api/business-owner/services";
// import {fetchServiceCategories} from "../api/business-owner/drycleaning";
import {fetchLocations} from "../api/business-owner/locations";

const servicesAT = actionTypes.businessOwner.globalSettings.services;
const servicesNamespacer = createNamespacer("BO-SERVICES");

const mapStateToProps = (state) => {
  const {
    businessOwner: {
      globalSettings: {
        services: {
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
          handleShowNewCategoryScreen,
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
    handleShowNewCategoryScreen,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    addNewService: async (serviceDetails, params) => {
      let errorFrom;
      const service = {
        serviceCategoryId: serviceDetails.serviceCategoryId,
        name: serviceDetails.name,
        description: serviceDetails.description,
        hasMinPrice: serviceDetails.hasMinPrice,
        prices: serviceDetails.prices,
        servicePricingStructureId: serviceDetails.servicePricingStructureId,
      };
      try {
        dispatch({
          type: servicesNamespacer(servicesAT.SET_NEW_SERVICE_CALL_PROGRESS),
          payload: true,
        });

        errorFrom = "create-service";
        const responseFromCreateService = await createOrUpdateService(service);
        dispatch({
          type: servicesNamespacer(servicesAT.SET_SERVICES_CALL_PROGRESS),
          payload: true,
        });
        errorFrom = "get-services";
        const responseFromFetchAllServices = await fetchServiceCategories({
          archived: params.archived,
        });

        dispatch({
          type: servicesNamespacer(servicesAT.SET_SERVICES_CALL_PROGRESS),
          payload: false,
        });

        dispatch({
          type: servicesNamespacer(servicesAT.SET_NEW_SERVICE_CALL_PROGRESS),
          payload: false,
        });

        dispatch({
          type: servicesNamespacer(servicesAT.SET_ALL_SERVICES),
          payload: responseFromFetchAllServices?.data?.categories[1],
        });

        dispatch({
          type: servicesNamespacer(servicesAT.SET_NEW_SERVICE_ERROR),
          payload: "",
        });

        dispatch({
          type: servicesNamespacer(servicesAT.SET_NEW_SERVICE_ACTIVE_ID),
          payload: responseFromCreateService.data.serviceMaster,
        });

        dispatch({
          type: servicesNamespacer(servicesAT.SET_SHOW_NEW_SERVICE_PRICING_SCREEN),
          payload: false,
        });
      } catch (error) {
        if (errorFrom === "create-service") {
          dispatch({
            type: servicesNamespacer(servicesAT.SET_NEW_SERVICE_ERROR),
            payload: _.get(error, "response.data.error", "Something went wrong."),
          });
        } else if (errorFrom === "get-services") {
          dispatch({
            type: servicesNamespacer(servicesAT.SET_SERVICES_ERROR),
            payload: _.get(error, "response.data.error", "Something went wrong."),
          });
        }

        dispatch({
          type: servicesNamespacer(servicesAT.SET_NEW_SERVICE_CALL_PROGRESS),
          payload: false,
        });
      }
    },

    addNewCategory: async (serviceDetails) => {
      let errorFrom;
      try {
        dispatch({
          type: servicesNamespacer(servicesAT.SET_NEW_SERVICE_CALL_PROGRESS),
          payload: true,
        });
        errorFrom = "create-category";
        const responseFromCreateNewSubcategory = await createOrUpdateNewServiceSubcategory(
          serviceDetails
        );
        dispatch({
          type: servicesNamespacer(servicesAT.SET_SERVICES_CALL_PROGRESS),
          payload: true,
        });
        const response = await fetchServiceCategories();
        dispatch({
          type: servicesNamespacer(servicesAT.SET_ALL_SERVICES),
          payload: response?.data?.categories[1],
        });
        dispatch({
          type: servicesNamespacer(servicesAT.SET_NEW_CATEGORY_ID),
          payload: responseFromCreateNewSubcategory?.data?.category?.id,
        });
        errorFrom = "get-category";
        const responseFromFetchAllServices = await fetchServiceCategoriesForService(2);
        dispatch({
          type: servicesNamespacer(servicesAT.SET_SERVICES_CALL_PROGRESS),
          payload: false,
        });

        dispatch({
          type: servicesNamespacer(servicesAT.SET_NEW_SERVICE_CALL_PROGRESS),
          payload: false,
        });
        dispatch({
          type: servicesNamespacer(servicesAT.UPDATE_SERVICE_CATEGORY),
          payload: responseFromFetchAllServices?.data?.categories,
        });
        dispatch({
          type: servicesNamespacer(servicesAT.SET_NEW_SERVICE_ERROR),
          payload: "",
        });

        dispatch({
          type: servicesNamespacer(servicesAT.SET_SHOW_NEW_SERVICE_PRICING_SCREEN),
          payload: false,
        });
      } catch (error) {
        if (errorFrom === "create-category") {
          dispatch({
            type: servicesNamespacer(servicesAT.SET_NEW_SERVICE_ERROR),
            payload: _.get(
              error,
              "response.data.error",
              "Something went wrong in the get."
            ),
          });
        } else if (errorFrom === "get-category") {
          dispatch({
            type: servicesNamespacer(servicesAT.SET_SERVICES_ERROR),
            payload: _.get(
              error,
              "response.data.error",
              "Something went wrong in the set section."
            ),
          });
        }

        dispatch({
          type: servicesNamespacer(servicesAT.SET_NEW_SERVICE_CALL_PROGRESS),
          payload: false,
        });
      }
    },

    showHideNewServiceWizard: (value) => {
      dispatch({
        type: servicesNamespacer(servicesAT.SET_SHOW_NEW_SERVICE_WIZARD),
        payload: value,
      });
    },

    handleShowNewServicesPricingScreen: async (value) => {
      dispatch({
        type: servicesNamespacer(servicesAT.SET_SHOW_NEW_SERVICE_PRICING_SCREEN),
        payload: value,
      });

      if (value) {
        const currentPriceItems = store.getState().businessOwner.globalSettings.services
          .newServicePriceItems;

        if (!currentPriceItems) {
          try {
            dispatch({
              type: servicesNamespacer(servicesAT.SET_NEW_SERVICE_PRICING_CALL_PROGRESS),
              payload: true,
            });

            const locationResp = await fetchLocations();

            dispatch({
              type: servicesNamespacer(servicesAT.SET_NEW_SERVICE_PRICING_LOCATIONS_LIST),
              payload: locationResp.data.allLocations,
            });
          } catch (error) {
            dispatch({
              type: servicesNamespacer(
                servicesAT.SET_NEW_SERVICE_PRICING_LOCATIONS_ERROR
              ),
              payload: _.get(error, "response.data.error", "Something went wrong."),
            });
          } finally {
            dispatch({
              type: servicesNamespacer(servicesAT.SET_NEW_SERVICE_PRICING_CALL_PROGRESS),
              payload: false,
            });
          }
        }
      }
    },

    handleMinimumToggle: (value) => {
      dispatch({
        type: servicesNamespacer(servicesAT.SET_MINIMUM_TOGGLE_VALUE),
        payload: value,
      });
    },

    handleChange: (value, storeId, field) => {
      dispatch({
        type: servicesNamespacer(servicesAT.SET_NEW_SERVICE_PRICE_AT_LOCATION),
        payload: {
          value,
          storeId,
          field,
        },
      });
    },

    handleSelectAll: (value) => {
      dispatch({
        type: servicesNamespacer(servicesAT.SET_SELECT_ALL_SERVICE_LOCATIONS),
        payload: value,
      });
    },

    handleApplyAll: (index) => {
      dispatch({
        type: servicesNamespacer(servicesAT.SET_APPLY_ALL_SERVICE_PRICES),
        payload: index,
      });
    },
    handleShowNewCategoryScreen: (value) => {
      dispatch({
        type: servicesNamespacer(servicesAT.SET_SHOW_NEW_CATEGORY_SCREEN),
        payload: value,
      });
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(ServiceWizard);
