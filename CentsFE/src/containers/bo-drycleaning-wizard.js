import {connect} from "react-redux";
import store from "../store";
import ServiceWizard from "../components/business-owner/global-settings/productsandservices/dry-cleaning/service-wizard";
import {createNamespacer} from "../utils/reducers";
import actionTypes from "../actionTypes";
import _ from "lodash";
import {
  createOrUpdateService,
  createOrUpdateNewServiceSubcategory,
  fetchServiceCategoriesForService,
  fetchServiceCategories,
} from "../api/business-owner/drycleaning";
import {fetchLocations} from "../api/business-owner/locations";

const drycleaningServicesAT = actionTypes.businessOwner.globalSettings.drycleaning;
const drycleaningNamespacer = createNamespacer("BO-DRYCLEANING");

const mapStateToProps = (state) => {
  const {
    businessOwner: {
      globalSettings: {
        drycleaning: {
          showHideNewServiceWizard,
          addNewServiceCallInProgress,
          addNewServiceError,
          drycleaningServicesCategoryList,
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
    drycleaningServicesCategoryList,
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
        piecesCount: serviceDetails.piecesCount,
      };

      try {
        dispatch({
          type: drycleaningNamespacer(
            drycleaningServicesAT.SET_NEW_DRYCLEANING_SERVICE_CALL_PROGRESS
          ),
          payload: true,
        });

        errorFrom = "create-service";

        const responseFromCreateService = await createOrUpdateService(service);

        dispatch({
          type: drycleaningNamespacer(
            drycleaningServicesAT.SET_DRYCLEANING_SERVICES_CALL_PROGRESS
          ),
          payload: true,
        });

        errorFrom = "get-services";

        const responseFromFetchAllServices = await fetchServiceCategories(params);

        dispatch({
          type: drycleaningNamespacer(
            drycleaningServicesAT.SET_DRYCLEANING_SERVICES_CALL_PROGRESS
          ),
          payload: false,
        });

        dispatch({
          type: drycleaningNamespacer(
            drycleaningServicesAT.SET_NEW_DRYCLEANING_SERVICE_CALL_PROGRESS
          ),
          payload: false,
        });

        dispatch({
          type: drycleaningNamespacer(drycleaningServicesAT.SET_ALL_DRYCLEANING_SERVICES),
          payload: responseFromFetchAllServices?.data?.categories[0],
        });

        dispatch({
          type: drycleaningNamespacer(
            drycleaningServicesAT.SET_NEW_DRYCLEANING_SERVICE_ERROR
          ),
          payload: "",
        });

        dispatch({
          type: drycleaningNamespacer(
            drycleaningServicesAT.SET_NEW_DRYCLEANING_SERVICE_ACTIVE_ID
          ),
          payload: responseFromCreateService.data.serviceMaster,
        });

        dispatch({
          type: drycleaningNamespacer(
            drycleaningServicesAT.SET_SHOW_NEW_DRYCLEANING_SERVICE_PRICING_SCREEN
          ),
          payload: false,
        });

        errorFrom = "";
      } catch (error) {
        if (errorFrom === "create-service") {
          dispatch({
            type: drycleaningNamespacer(
              drycleaningServicesAT.SET_NEW_DRYCLEANING_SERVICE_ERROR
            ),
            payload: _.get(error, "response.data.error", "Something went wrong."),
          });
        } else if (errorFrom === "get-services") {
          dispatch({
            type: drycleaningNamespacer(
              drycleaningServicesAT.SET_DRYCLEANING_SERVICES_ERROR
            ),
            payload: _.get(error, "response.data.error", "Something went wrong."),
          });
        }

        dispatch({
          type: drycleaningNamespacer(
            drycleaningServicesAT.SET_NEW_DRYCLEANING_SERVICE_CALL_PROGRESS
          ),
          payload: false,
        });
      }

      return errorFrom;
    },

    addNewCategory: async (serviceDetails) => {
      let errorFrom;
      try {
        dispatch({
          type: drycleaningNamespacer(
            drycleaningServicesAT.SET_NEW_DRYCLEANING_SERVICE_CALL_PROGRESS
          ),
          payload: true,
        });
        errorFrom = "create-category";
        const responseFromCreateNewSubcategory = await createOrUpdateNewServiceSubcategory(
          serviceDetails
        );
        dispatch({
          type: drycleaningNamespacer(
            drycleaningServicesAT.SET_DRYCLEANING_SERVICES_CALL_PROGRESS
          ),
          payload: true,
        });
        dispatch({
          type: drycleaningNamespacer(
            drycleaningServicesAT.SET_NEW_DRYCLEANING_CATEGORY_ID
          ),
          payload: responseFromCreateNewSubcategory?.data?.category?.id,
        });
        errorFrom = "get-category";
        const responseFromFetchAllServices = await fetchServiceCategoriesForService(1);
        dispatch({
          type: drycleaningNamespacer(
            drycleaningServicesAT.SET_DRYCLEANING_SERVICES_CALL_PROGRESS
          ),
          payload: false,
        });

        dispatch({
          type: drycleaningNamespacer(
            drycleaningServicesAT.SET_NEW_DRYCLEANING_SERVICE_CALL_PROGRESS
          ),
          payload: false,
        });
        dispatch({
          type: drycleaningNamespacer(
            drycleaningServicesAT.UPDATE_DRYCLEANING_SERVICE_CATEGORY
          ),
          payload: responseFromFetchAllServices?.data?.categories,
        });

        dispatch({
          type: drycleaningNamespacer(
            drycleaningServicesAT.SET_NEW_DRYCLEANING_SERVICE_ERROR
          ),
          payload: "",
        });

        dispatch({
          type: drycleaningNamespacer(
            drycleaningServicesAT.SET_SHOW_NEW_DRYCLEANING_SERVICE_PRICING_SCREEN
          ),
          payload: false,
        });
      } catch (error) {
        if (errorFrom === "create-category") {
          dispatch({
            type: drycleaningNamespacer(
              drycleaningServicesAT.SET_NEW_DRYCLEANING_SERVICE_ERROR
            ),
            payload: _.get(
              error,
              "response.data.error",
              "Something went wrong in the get."
            ),
          });
        } else if (errorFrom === "get-category") {
          dispatch({
            type: drycleaningNamespacer(
              drycleaningServicesAT.SET_DRYCLEANING_SERVICES_ERROR
            ),
            payload: _.get(
              error,
              "response.data.error",
              "Something went wrong in the set section."
            ),
          });
        }

        dispatch({
          type: drycleaningNamespacer(
            drycleaningServicesAT.SET_NEW_DRYCLEANING_SERVICE_CALL_PROGRESS
          ),
          payload: false,
        });
      }
    },

    showHideNewServiceWizard: (value) => {
      dispatch({
        type: drycleaningNamespacer(
          drycleaningServicesAT.SET_SHOW_DRYCLEANING_NEW_SERVICE_WIZARD
        ),
        payload: value,
      });
    },

    handleShowNewServicesPricingScreen: async (value) => {
      dispatch({
        type: drycleaningNamespacer(
          drycleaningServicesAT.SET_SHOW_NEW_DRYCLEANING_SERVICE_PRICING_SCREEN
        ),
        payload: value,
      });

      if (value) {
        const currentPriceItems = store.getState().businessOwner.globalSettings
          .drycleaning.newServicePriceItems;

        if (!currentPriceItems) {
          try {
            dispatch({
              type: drycleaningNamespacer(
                drycleaningServicesAT.SET_NEW_DRYCLEANING_SERVICE_PRICING_CALL_PROGRESS
              ),
              payload: true,
            });

            const locationResp = await fetchLocations();

            dispatch({
              type: drycleaningNamespacer(
                drycleaningServicesAT.SET_NEW_DRYCLEANING_SERVICE_PRICING_LOCATIONS_LIST
              ),
              payload: locationResp.data.allLocations,
            });
          } catch (error) {
            dispatch({
              type: drycleaningNamespacer(
                drycleaningServicesAT.SET_NEW_DRYCLEANING_SERVICE_PRICING_LOCATIONS_ERROR
              ),
              payload: _.get(error, "response.data.error", "Something went wrong."),
            });
          } finally {
            dispatch({
              type: drycleaningNamespacer(
                drycleaningServicesAT.SET_NEW_DRYCLEANING_SERVICE_PRICING_CALL_PROGRESS
              ),
              payload: false,
            });
          }
        }
      }
    },

    handleMinimumToggle: (value) => {
      dispatch({
        type: drycleaningNamespacer(drycleaningServicesAT.SET_MINIMUM_TOGGLE_VALUE),
        payload: value,
      });
    },

    handleChange: (value, storeId, field) => {
      dispatch({
        type: drycleaningNamespacer(
          drycleaningServicesAT.SET_NEW_DRYCLEANING_SERVICE_PRICE_AT_LOCATION
        ),
        payload: {
          value,
          storeId,
          field,
        },
      });
    },

    handleSelectAll: (value) => {
      dispatch({
        type: drycleaningNamespacer(
          drycleaningServicesAT.SET_SELECT_ALL_DRYCLEANING_SERVICE_LOCATIONS
        ),
        payload: value,
      });
    },

    handleApplyAll: (index) => {
      dispatch({
        type: drycleaningNamespacer(
          drycleaningServicesAT.SET_APPLY_ALL_DRYCLEANING_SERVICE_PRICES
        ),
        payload: index,
      });
    },
    handleShowNewCategoryScreen: (value) => {
      dispatch({
        type: drycleaningNamespacer(drycleaningServicesAT.SET_SHOW_NEW_CATEGORY_SCREEN),
        payload: value,
      });
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(ServiceWizard);
