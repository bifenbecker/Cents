import {connect} from "react-redux";
import store from "../store";
import PricePerProduct from "../components/business-owner/global-settings/locations/price-per-product";
import {createNamespacer} from "../utils/reducers";
import actionTypes from "../actionTypes";
import {fetchProductsList as fetchAllProducts} from "../api/business-owner/products";

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
    fetchProductsList: async (isDetails) => {
      const currentProductsList = store.getState().businessOwner.globalSettings.promotions
        .productsList;
      if (currentProductsList.length === 0 || isDetails) {
        try {
          dispatch({
            type: promotionsNamespacer(promotionsAT.SET_PRODUCTS_CALL_PROGRESS),
            payload: true,
          });
          const productsResponse = await fetchAllProducts({withoutCategory: true});
          dispatch({
            type: promotionsNamespacer(promotionsAT.SET_PRODUCTS_LIST),
            payload: productsResponse.data.products,
            isDetails: isDetails,
          });
        } catch (error) {
          dispatch({
            type: promotionsNamespacer(promotionsAT.SET_PRODUCTS_LIST_CALL_ERROR),
            payload: get(error, "response.data.error", "Something went wrong"),
          });
        } finally {
          dispatch({
            type: promotionsNamespacer(promotionsAT.SET_PRODUCTS_CALL_PROGRESS),
            payload: false,
          });
        }
      }
    },

    handlePromotionClickInProducts: (isSelected, inventoryId) => {
      dispatch({
        type: promotionsNamespacer(promotionsAT.UPDATE_PRODUCTS_LIST),
        payload: {isSelectedForPromotion: isSelected, inventoryId},
      });
      dispatch({
        type: promotionsNamespacer(promotionsAT.SET_ITEMS_COUNT),
      });
    },

    handleSelectAll: () => {
      dispatch({
        type: promotionsNamespacer(promotionsAT.SET_SELECT_ALL_PRODUCTS),
      });
      dispatch({
        type: promotionsNamespacer(promotionsAT.SET_ITEMS_COUNT),
      });
    },

    handleProductsTabSwitch: () => {
      dispatch({
        type: promotionsNamespacer(promotionsAT.HANDLE_PRODUCTS_TAB_SWITCH),
      });
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(PricePerProduct);
