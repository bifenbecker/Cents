import {connect} from "react-redux";
import store from "../store";
import PromotionsWizard from "../components/business-owner/global-settings/promotions/promotions-wizard";
import {createNamespacer} from "../utils/reducers";
import actionTypes from "../actionTypes";
import {fetchRegions, fetchLocations} from "../api/business-owner/locations";
import {createNewPromotion, fetchPromotionsList} from "../api/business-owner/promotions";
import get from "lodash/get";

const promotionsAT = actionTypes.businessOwner.globalSettings.promotions;
const promotionsNamespacer = createNamespacer("BO-PROMOTIONS");

const mapStateToProps = (state) => {
  return {...state.businessOwner.globalSettings.promotions};
};

const mapDispatchToProps = (dispatch) => {
  return {
    updateStepCountInWizard: (step) => {
      dispatch({
        type: promotionsNamespacer(promotionsAT.UPDATE_STEP_COUNT_IN_WIZARD),
        payload: step,
      });
    },

    fetchLocationsList: async () => {
      const currentLocationsList = store.getState().businessOwner.globalSettings
        .promotions.selectedLocations;
      if (currentLocationsList.length === 0) {
        try {
          dispatch({
            type: promotionsNamespacer(promotionsAT.SET_LOCATIONS_CALL_PROGRESS),
            payload: true,
          });

          const regionsPromise = fetchRegions();
          const locationsPromise = fetchLocations();

          const [regionsResp, locationsResp] = await Promise.all([
            regionsPromise,
            locationsPromise,
          ]);

          dispatch({
            type: promotionsNamespacer(promotionsAT.SET_ALL_LOCATIONS),
            payload: {
              locations: get(locationsResp, "data.allLocations", []),
              regions: get(regionsResp, "data.regions", []),
              needsRegions: get(locationsResp, "data.needsRegions"),
              storesWithoutRegions: get(regionsResp, "data.stores", []),
            },
          });
        } catch (error) {
          dispatch({
            type: promotionsNamespacer(promotionsAT.SET_LOCATIONS_LIST_ERROR),
            payload: get(error, "response.data.error", "Something went wrong"),
          });
        } finally {
          dispatch({
            type: promotionsNamespacer(promotionsAT.SET_LOCATIONS_CALL_PROGRESS),
            payload: false,
          });
        }
      }
    },

    setSelectedLocation: (location) => {
      dispatch({
        type: promotionsNamespacer(promotionsAT.SET_SELECTED_LOCATION),
        payload: location,
      });
    },

    showOrHideProductsAndServicesScreen: (booleanValue) => {
      dispatch({
        type: promotionsNamespacer(promotionsAT.SHOW_PRODUCTS_AND_SERVICES_SCREEN),
        payload: booleanValue,
      });
    },

    calculateItemsCount: () => {
      dispatch({
        type: promotionsNamespacer(promotionsAT.SET_ITEMS_COUNT),
      });
    },

    resetServicesAndProducts: () => {
      dispatch({
        type: promotionsNamespacer(promotionsAT.RESET_SERVICES_AND_PRODUCTS),
      });
      dispatch({
        type: promotionsNamespacer(promotionsAT.SET_ITEMS_COUNT),
      });
    },

    updateServicesAndProductsCopy: () => {
      dispatch({
        type: promotionsNamespacer(promotionsAT.UPDATE_SERVICES_AND_PRODUCTS_COPY),
      });
    },

    resetPromotionsWizardReduxState: () => {
      dispatch({
        type: promotionsNamespacer(promotionsAT.RESET_WIZARD_REDUX_STATE),
      });
    },

    createNewPromotion: async (newPromotionDetails) => {
      let errorFrom;

      try {
        dispatch({
          type: promotionsNamespacer(promotionsAT.SET_CREATE_PROMOTION_CALL_PROGRESS),
          payload: true,
        });

        errorFrom = "create-promotion";
        const createPromotionResponse = await createNewPromotion(newPromotionDetails);
        const activePromotionId = createPromotionResponse.data.promotionProgram.id;

        dispatch({
          type: promotionsNamespacer(promotionsAT.SET_CREATE_PROMOTION_CALL_PROGRESS),
          payload: false,
        });

        dispatch({
          type: promotionsNamespacer(promotionsAT.SET_PROMOTIONS_CALL_PROGRESS),
          payload: true,
        });

        errorFrom = "fetch-promotions";
        const fetchPromotionsResponse = await fetchPromotionsList();

        dispatch({
          type: promotionsNamespacer(promotionsAT.SET_ALL_PROMOTIONS),
          payload: fetchPromotionsResponse.data,
        });

        dispatch({
          type: promotionsNamespacer(promotionsAT.SET_ACTIVE_PROMOTION),
          payload: activePromotionId,
        });

        dispatch({
          type: promotionsNamespacer(promotionsAT.SET_PROMOTIONS_CALL_PROGRESS),
          payload: false,
        });

        dispatch({
          type: promotionsNamespacer(promotionsAT.SET_PROMOTIONS_ERROR),
          payload: "",
        });

        dispatch({
          type: promotionsNamespacer(promotionsAT.SET_CREATE_PROMOTION_CALL_ERROR),
          payload: "",
        });

        errorFrom = "";
      } catch (error) {
        if (errorFrom === "create-promotion") {
          dispatch({
            type: promotionsNamespacer(promotionsAT.SET_CREATE_PROMOTION_CALL_ERROR),
            payload: get(error, "response.data.error", "Something went wrong"),
          });
        } else if (errorFrom === "fetch-promotions") {
          dispatch({
            type: promotionsNamespacer(promotionsAT.SET_PROMOTIONS_ERROR),
            payload: get(error, "response.data.error", "Something went wrong"),
          });
        }

        dispatch({
          type: promotionsNamespacer(promotionsAT.SET_CREATE_PROMOTION_CALL_PROGRESS),
          payload: false,
        });

        dispatch({
          type: promotionsNamespacer(promotionsAT.SET_PROMOTIONS_CALL_PROGRESS),
          payload: false,
        });
      }

      return errorFrom;
    },

    showHideNewPromotionWizard: (value) => {
      dispatch({
        type: promotionsNamespacer(promotionsAT.SET_SHOW_NEW_PROMOTION_WIZARD),
        payload: value,
      });
    },

    setNewPromoNameAndDiscountValue: (promoNameAndValue) => {
      dispatch({
        type: promotionsNamespacer(promotionsAT.SET_NEW_PROMO_NAME_AND_DISCOUNT_VALUE),
        payload: promoNameAndValue,
      });
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(PromotionsWizard);
