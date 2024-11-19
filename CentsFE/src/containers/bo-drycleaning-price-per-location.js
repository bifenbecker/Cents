import {connect} from "react-redux";
import PricePerLocation from "../components/business-owner/global-settings/productsandservices/dry-cleaning/price-per-location";
import {createNamespacer} from "../utils/reducers";
import actionTypes from "../actionTypes";
import {
  updatePerLocationServicePrices,
  updateSingleServicePriceField,
  updateServiceDetails,
  fetchServiceDetails,
} from "../api/business-owner/drycleaning";
import _, {isBoolean} from "lodash";

const drycleaningAT = actionTypes.businessOwner.globalSettings.drycleaning;
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
          drycleaningAT.SET_DRYCLEANING_SERVICE_DETAILS_CALL_IN_PROGRESS
        ),
        payload: true,
      });
      try {
        let response = await fetchServiceDetails(serviceId);
        dispatch({
          type: drycleaningNamespacer(
            drycleaningAT.SET_ACTIVE_DRYCLEANING_SERVICE_DETAILS
          ),
          payload: response.data,
        });
        dispatch({
          type: drycleaningNamespacer(
            drycleaningAT.SET_DRYCLEANING_SERVICE_DETAILS_CALL_IN_PROGRESS
          ),
          payload: false,
        });
      } catch (e) {
        dispatch({
          type: drycleaningNamespacer(
            drycleaningAT.SET_DRYCLEANING_SERVICE_DETAILS_ERROR
          ),
          payload: _.get(e, "response.data.error", "Something went wrong"),
        });
        dispatch({
          type: drycleaningNamespacer(
            drycleaningAT.SET_DRYCLEANING_SERVICE_DETAILS_CALL_IN_PROGRESS
          ),
          payload: false,
        });
      }
    },

    handleChange: async (
      inventoryId,
      value,
      storeId,
      field,
      shouldSubmit,
      serviceId,
      serviceCategoryId,
      prices
    ) => {
      dispatch({
        type: drycleaningNamespacer(
          drycleaningAT.UPDATE_DRYCLEANING_SERVICES_PRICE_PER_LOCATION
        ),
        payload: {
          value,
          storeId,
          field,
        },
      });

      if (shouldSubmit) {
        try {
          dispatch({
            type: drycleaningNamespacer(drycleaningAT.INCREMENT_PRICE_UPDATE_COUNTER),
          });
          await updateSingleServicePriceField({
            storeId,
            field,
            value: isBoolean(value) ? value : parseFloat(value),
            serviceId: inventoryId,
          });

          if (field === "storePrice") {
            dispatch({
              type: drycleaningNamespacer(drycleaningAT.DECREMENT_PRICE_UPDATE_COUNTER),
            });

            dispatch({
              type: drycleaningNamespacer(
                drycleaningAT.UPDATE_DEFAULT_PRICE_ARRAY_OF_DRYCLEANING_SERVICE
              ),
              payload: {
                value,
                storeId,
                field,
                serviceId,
                serviceCategoryId,
                prices,
              },
            });
          }
        } catch (e) {
          // TODO Figure out how to handle update errors
          dispatch({
            type: drycleaningNamespacer(drycleaningAT.DECREMENT_PRICE_UPDATE_COUNTER),
          });
        }
      }
    },

    handleCancel: async () => {
      dispatch({
        type: drycleaningNamespacer(
          drycleaningAT.SET_SHOW_DRYCLEANING_SERVICE_PRICES_SCREEN
        ),
        payload: false,
      });
    },

    handleSave: async (data) => {
      dispatch({
        type: drycleaningNamespacer(
          drycleaningAT.SET_PER_LOCATION_DRYCLEANING_SERVICE_PRICES_CALL_PROGRESS
        ),
        payload: true,
      });

      try {
        await updatePerLocationServicePrices(data);

        dispatch({
          type: drycleaningNamespacer(
            drycleaningAT.SET_PER_LOCATION_DRYCLEANING_SERVICE_PRICES_CALL_PROGRESS
          ),
          payload: false,
        });

        dispatch({
          type: drycleaningNamespacer(
            drycleaningAT.SET_PER_LOCATION_DRYCLEANING_SERVICE_PRICES_ERROR
          ),
          payload: "",
        });

        dispatch({
          type: drycleaningNamespacer(
            drycleaningAT.SET_SHOW_DRYCLEANING_SERVICE_PRICES_SCREEN
          ),
          payload: false,
        });
      } catch (error) {
        dispatch({
          type: drycleaningNamespacer(
            drycleaningAT.SET_PER_LOCATION_DRYCLEANING_SERVICE_PRICES_ERROR
          ),
          payload: _.get(error, "response.data.error", "Something went wrong."),
        });
      }
    },

    toggleMinimum: async (hasMinPrice, activeServiceDetails) => {
      try {
        dispatch({
          type: drycleaningNamespacer(drycleaningAT.SET_HAS_MIN_PRICE_UPDATE_IN_PROGRESS),
          payload: true,
        });

        let data = {
          id: activeServiceDetails.id,
          hasMinPrice,
          name: activeServiceDetails.name,
          serviceCategoryId: activeServiceDetails.serviceCategoryId,
          description: activeServiceDetails.description,
        };
        let resp = await updateServiceDetails(data);

        dispatch({
          type: drycleaningNamespacer(drycleaningAT.SET_HAS_MIN_PRICE_UPDATE_IN_PROGRESS),
          payload: false,
        });

        dispatch({
          type: drycleaningNamespacer(
            drycleaningAT.SET_DRYCLEANING_SERVICE_DETAILS_UPDATED_ID
          ),
          payload: _.get(resp, "data.service", {}),
        });

        dispatch({
          type: drycleaningNamespacer(drycleaningAT.TOGGLE_MINIMUM_IN_PRICE_PER_LOCATION),
          payload: hasMinPrice,
        });

        dispatch({
          type: drycleaningNamespacer(
            drycleaningAT.SET_PER_LOCATION_DRYCLEANING_SERVICE_PRICES_ERROR
          ),
          payload: "",
        });
      } catch (e) {
        dispatch({
          type: drycleaningNamespacer(drycleaningAT.SET_HAS_MIN_PRICE_UPDATE_IN_PROGRESS),
          payload: false,
        });
        dispatch({
          type: drycleaningNamespacer(
            drycleaningAT.SET_PER_LOCATION_DRYCLEANING_SERVICE_PRICES_ERROR
          ),
          payload: _.get(e, "response.data.error", "Something went wrong."),
        });
      }
    },

    handleApplyAll: (price) => {
      dispatch({
        type: drycleaningNamespacer(drycleaningAT.APPLY_TO_ALL),
        payload: price,
      });
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(PricePerLocation);