import {connect} from "react-redux";
import PricePerLocation from "../components/business-owner/global-settings/services/price-per-location";
import {createNamespacer} from "../utils/reducers";
import actionTypes from "../actionTypes";
import {
  updatePerLocationServicePrices,
  updateSingleServicePriceField,
  updateServiceDetails,
  fetchServiceDetails,
} from "../api/business-owner/services";
import _, {isBoolean} from "lodash";

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
        type: servicesNamespacer(servicesAT.UPDATE_SERVICES_PRICE_PER_LOCATION),
        payload: {
          value,
          storeId,
          field,
        },
      });

      if (shouldSubmit) {
        try {
          dispatch({
            type: servicesNamespacer(servicesAT.INCREMENT_PRICE_UPDATE_COUNTER),
          });
          await updateSingleServicePriceField({
            storeId,
            field,
            value: isBoolean(value) ? value : parseFloat(value),
            serviceId: inventoryId,
          });

          if (field === "storePrice") {
            dispatch({
              type: servicesNamespacer(servicesAT.DECREMENT_PRICE_UPDATE_COUNTER),
            });

            dispatch({
              type: servicesNamespacer(servicesAT.UPDATE_DEFAULT_PRICE_ARRAY_OF_SERVICE),
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
          console.log("error updating price", e);
          dispatch({
            type: servicesNamespacer(servicesAT.DECREMENT_PRICE_UPDATE_COUNTER),
          });
        }
      }
    },

    handleCancel: async () => {
      dispatch({
        type: servicesNamespacer(servicesAT.SET_SHOW_SERVICE_PRICES_SCREEN),
        payload: false,
      });
    },

    handleSave: async (data) => {
      dispatch({
        type: servicesNamespacer(
          servicesAT.SET_PER_LOCATION_SERVICE_PRICES_CALL_PROGRESS
        ),
        payload: true,
      });

      try {
        await updatePerLocationServicePrices(data);

        dispatch({
          type: servicesNamespacer(
            servicesAT.SET_PER_LOCATION_SERVICE_PRICES_CALL_PROGRESS
          ),
          payload: false,
        });

        dispatch({
          type: servicesNamespacer(servicesAT.SET_PER_LOCATION_SERVICE_PRICES_ERROR),
          payload: "",
        });

        dispatch({
          type: servicesNamespacer(servicesAT.SET_SHOW_SERVICE_PRICES_SCREEN),
          payload: false,
        });
      } catch (error) {
        dispatch({
          type: servicesNamespacer(servicesAT.SET_PER_LOCATION_SERVICE_PRICES_ERROR),
          payload: _.get(error, "response.data.error", "Something went wrong."),
        });
      }
    },

    toggleMinimum: async (hasMinPrice, activeServiceDetails) => {
      try {
        dispatch({
          type: servicesNamespacer(servicesAT.SET_HAS_MIN_PRICE_UPDATE_IN_PROGRESS),
          payload: true,
        });
        let data = {
          id: activeServiceDetails.id,
          hasMinPrice,
          name: activeServiceDetails.name,
          serviceCategoryId: activeServiceDetails.serviceCategoryId,
          description: activeServiceDetails.description,
          servicePricingStructureId: activeServiceDetails.servicePricingStructureId,
        };
        let resp = await updateServiceDetails(data);
        dispatch({
          type: servicesNamespacer(servicesAT.SET_HAS_MIN_PRICE_UPDATE_IN_PROGRESS),
          payload: false,
        });

        dispatch({
          type: servicesNamespacer(servicesAT.SET_SERVICE_DETAILS_UPDATED_ID),
          payload: _.get(resp, "data.service", {}),
        });

        dispatch({
          type: servicesNamespacer(servicesAT.TOGGLE_MINIMUM_IN_PRICE_PER_LOCATION),
          payload: hasMinPrice,
        });

        dispatch({
          type: servicesNamespacer(servicesAT.SET_PER_LOCATION_SERVICE_PRICES_ERROR),
          payload: "",
        });
      } catch (e) {
        dispatch({
          type: servicesNamespacer(servicesAT.SET_HAS_MIN_PRICE_UPDATE_IN_PROGRESS),
          payload: false,
        });
        dispatch({
          type: servicesNamespacer(servicesAT.SET_PER_LOCATION_SERVICE_PRICES_ERROR),
          payload: _.get(e, "response.data.error", "Something went wrong."),
        });
      }
    },

    handleApplyAll: (price) => {
      dispatch({
        type: servicesNamespacer(servicesAT.APPLY_TO_ALL),
        payload: price,
      });
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(PricePerLocation);
