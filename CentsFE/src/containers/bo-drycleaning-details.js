import {connect} from "react-redux";
import ServiceDetails from "../components/business-owner/global-settings/productsandservices/dry-cleaning/service-details";
import {createNamespacer} from "../utils/reducers";
import actionTypes from "../actionTypes";
import {
  fetchServiceDetails,
  updateServiceDetails,
  createOrUpdateNewServiceSubcategory,
  fetchServiceCategoriesForService,
} from "../api/business-owner/drycleaning";
import _ from "lodash";

const drycleaningServicesAT = actionTypes.businessOwner.globalSettings.drycleaning;
const drycleaningNamespacer = createNamespacer("BO-DRYCLEANING");

const mapStateToProps = (state) => {
  return {
    ...state.businessOwner.globalSettings.drycleaning,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    fetchServiceDetails: async (serviceId) => {
      dispatch({
        type: drycleaningNamespacer(
          drycleaningServicesAT.SET_DRYCLEANING_SERVICE_DETAILS_CALL_IN_PROGRESS
        ),
        payload: true,
      });
      try {
        let response = await fetchServiceDetails(serviceId);
        dispatch({
          type: drycleaningNamespacer(
            drycleaningServicesAT.SET_ACTIVE_DRYCLEANING_SERVICE_DETAILS
          ),
          payload: response.data,
        });
        dispatch({
          type: drycleaningNamespacer(
            drycleaningServicesAT.SET_DRYCLEANING_SERVICE_DETAILS_CALL_IN_PROGRESS
          ),
          payload: false,
        });
      } catch (e) {
        dispatch({
          type: drycleaningNamespacer(
            drycleaningServicesAT.SET_DRYCLEANING_SERVICE_DETAILS_ERROR
          ),
          payload: _.get(e, "response.data.error", "Something went wrong"),
        });
        dispatch({
          type: drycleaningNamespacer(
            drycleaningServicesAT.SET_DRYCLEANING_SERVICE_DETAILS_CALL_IN_PROGRESS
          ),
          payload: false,
        });
      }
    },

    navigateToUpdateServiceDetails: async () => {
      dispatch({
        type: drycleaningNamespacer(
          drycleaningServicesAT.SET_SHOW_UPDATE_DRYCLEANING_SERVICE
        ),
      });
    },

    handlePriceDetailsClick: () => {
      dispatch({
        type: drycleaningNamespacer(drycleaningServicesAT.SET_ACTIVE_TAB),
        payload: "location_pricing",
      });
    },

    handleFieldChange: (id, field, value) => {
      dispatch({
        type: drycleaningNamespacer(
          drycleaningServicesAT.UPDATE_ACTIVE_DRYCLEANING_SERVICE_DETAIL
        ),
        payload: {
          field,
          value,
        },
      });
    },

    handleSave: async (data, currentSearchText, searchInProgress, refreshBoolean) => {
      try {
        dispatch({
          type: drycleaningNamespacer(
            drycleaningServicesAT.SET_DRYCLEANING_SERVICE_DETAILS_UPDATE_IN_PROGRESS
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
          subcategory: data.subcategory,
          piecesCount: data.piecesCount,
        };
        let resp = await updateServiceDetails(processedData);
        dispatch({
          type: drycleaningNamespacer(
            drycleaningServicesAT.SET_DRYCLEANING_SERVICE_DETAILS_UPDATED_ID
          ),
          payload: _.get(resp, "data.service", {}),
        });

        dispatch({
          type: drycleaningNamespacer(drycleaningServicesAT.SET_SERVICES_REFRESH),
          payload: refreshBoolean,
        });

        if (searchInProgress) {
          dispatch({
            type: drycleaningNamespacer(
              drycleaningServicesAT.SET_DRYCLEANING_SERVICE_SEARCH_TEXT
            ),
            payload: currentSearchText,
          });
        }

        dispatch({
          type: drycleaningNamespacer(
            drycleaningServicesAT.SET_DRYCLEANING_SERVICE_DETAILS_UPDATE_IN_PROGRESS
          ),
          payload: false,
        });
        dispatch({
          type: drycleaningNamespacer(
            drycleaningServicesAT.SET_DRYCLEANING_SERVICE_DETAILS_UPDATE_ERROR
          ),
          payload: "",
        });
      } catch (e) {
        // Handle error
        dispatch({
          type: drycleaningNamespacer(
            drycleaningServicesAT.SET_DRYCLEANING_SERVICE_DETAILS_UPDATE_ERROR
          ),
          payload: _.get(e, "response.data.error", "Something went wrong"),
        });
        dispatch({
          type: drycleaningNamespacer(
            drycleaningServicesAT.SET_DRYCLEANING_SERVICE_DETAILS_UPDATE_IN_PROGRESS
          ),
          payload: false,
        });
      }
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
    handleShowNewCategoryScreenInDetails: (value) => {
      dispatch({
        type: drycleaningNamespacer(
          drycleaningServicesAT.SET_SHOW_NEW_CATEGORY_SCREEN_IN_DETAILS
        ),
        payload: value,
      });
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(ServiceDetails);
