import {connect} from "react-redux";
import store from "../store";
import ProductWizard from "../components/business-owner/global-settings/products/products-wizard";
import {fetchLocations} from "../api/business-owner/locations";
import {createNamespacer} from "../utils/reducers";
import actionTypes from "../actionTypes";
import _ from "lodash";

import {
  saveNewProduct,
  saveNewCategory,
  fetchProductCategories,
  fetchProductsList,
} from "../api/business-owner/products";

const productsAT = actionTypes.businessOwner.globalSettings.products;
const productsNamespacer = createNamespacer("BO-PRODUCTS");

const mapStateToProps = (state) => {
  return {
    ...state.businessOwner.globalSettings.products,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    createNewProduct: async (newProductDetails, params) => {
      let errorFrom;

      try {
        dispatch({
          type: productsNamespacer(productsAT.SET_NEW_PRODUCT_CALL_PROGRESS),
          payload: true,
        });

        errorFrom = "new-product";
        const createNewProductResponse = await saveNewProduct(newProductDetails);

        dispatch({
          type: productsNamespacer(productsAT.SET_NEW_PRODUCT_CALL_PROGRESS),
          payload: false,
        });

        dispatch({
          type: productsNamespacer(productsAT.SET_SHOW_NEW_PRODUCT_WIZARD),
          payload: false,
        });

        dispatch({
          type: productsNamespacer(productsAT.SET_NEW_PRODUCT_ERROR),
          payload: "",
        });

        dispatch({
          type: productsNamespacer(productsAT.SET_SHOW_NEW_PRODUCT_PRICING_SCREEN),
          payload: false,
        });

        // Once the new product is posted, fetch the latest products list and dispatch related actions :

        dispatch({
          type: productsNamespacer(productsAT.SET_PRODUCTS_LIST_CALL_PROGRESS),
          payload: true,
        });

        errorFrom = "fetch-products";

        const productsListResponse = await fetchProductsList(params);

        dispatch({
          type: productsNamespacer(productsAT.SET_PRODUCTS_LIST_CALL_PROGRESS),
          payload: false,
        });

        dispatch({
          type: productsNamespacer(productsAT.SET_PRODUCTS_LIST_ERROR),
          payload: "",
        });

        // When a new product is created, the activeId must be the id of this newly created product.
        // Hence, sending "newProduct" in the action object below to get the activeId in the reducer dynamically.

        dispatch({
          type: productsNamespacer(productsAT.SET_PRODUCTS_LIST),
          payload: productsListResponse.data.categories,
          newProductId: createNewProductResponse.data.product.id,
        });
      } catch (error) {
        dispatch({
          type: productsNamespacer(productsAT.SET_NEW_PRODUCT_CALL_PROGRESS),
          payload: false,
        });

        if (errorFrom === "new-product") {
          dispatch({
            type: productsNamespacer(productsAT.SET_NEW_PRODUCT_ERROR),
            payload: _.get(error, "response.data.error", "Something went wrong."),
          });
        } else if (errorFrom === "fetch-products") {
          dispatch({
            type: productsNamespacer(productsAT.SET_PRODUCTS_LIST_ERROR),
            payload: _.get(error, "response.data.error", "Something went wrong."),
          });
        }
      }
    },

    createNewCategory: async (category) => {
      try {
        dispatch({
          type: productsNamespacer(productsAT.SET_NEW_CATEGORY_CALL_PROGRESS),
          payload: true,
        });

        await saveNewCategory({name: category});
        const productCategoriesResponse = await fetchProductCategories();

        dispatch({
          type: productsNamespacer(productsAT.SET_NEW_CATEGORY_CALL_PROGRESS),
          payload: false,
        });

        dispatch({
          type: productsNamespacer(productsAT.SET_NEW_CATEGORY_ERROR),
          payload: "",
        });

        dispatch({
          type: productsNamespacer(productsAT.SET_PRODUCT_CATEGORIES_LIST),
          payload: productCategoriesResponse.data.categories,
        });

        dispatch({
          type: productsNamespacer(productsAT.SET_SHOW_NEW_CATEGORY_SCREEN),
          payload: false,
        });
      } catch (error) {
        dispatch({
          type: productsNamespacer(productsAT.SET_NEW_CATEGORY_CALL_PROGRESS),
          payload: false,
        });

        dispatch({
          type: productsNamespacer(productsAT.SET_NEW_CATEGORY_ERROR),
          payload: _.get(error, "response.data.error", "Something went wrong."),
        });
      }
    },

    handleShowNewCategoryScreen: (value) => {
      dispatch({
        type: productsNamespacer(productsAT.SET_SHOW_NEW_CATEGORY_SCREEN),
        payload: value,
      });
    },

    handleShowNewProductsPricingScreen: async (value) => {
      dispatch({
        type: productsNamespacer(productsAT.SET_SHOW_NEW_PRODUCT_PRICING_SCREEN),
        payload: value,
      });

      if (value) {
        const currentInventoryItems = store.getState().businessOwner.globalSettings
          .products.newProductInventoryItems;

        if (!currentInventoryItems) {
          try {
            dispatch({
              type: productsNamespacer(productsAT.SET_NEW_PRODUCT_PRICING_CALL_PROGRESS),
              payload: true,
            });

            const locationResp = await fetchLocations();

            dispatch({
              type: productsNamespacer(productsAT.SET_NEW_PRODUCT_PRICING_LOCATIONS_LIST),
              payload: locationResp.data.allLocations,
            });

            dispatch({
              type: productsNamespacer(productsAT.SET_NEW_PRODUCT_PRICING_CALL_PROGRESS),
              payload: false,
            });

            dispatch({
              type: productsNamespacer(
                productsAT.SET_NEW_PRODUCT_PRICING_LOCATIONS_ERROR
              ),
              payload: "",
            });
          } catch (error) {
            dispatch({
              type: productsNamespacer(
                productsAT.SET_NEW_PRODUCT_PRICING_LOCATIONS_ERROR
              ),
              payload: _.get(error, "response.data.error", "Something went wrong."),
            });
          }
        }
      }
    },

    handleChange: (id, storeId, field, value) => {
      if (field === "isSelected") {
        field = "isFeatured";
      } else if (field !== "isTaxable") {
        value = value.replace(/[^0-9.]/g, "").replace(/(\..*)\./g, "$1"); // Allowing only numbers and .
        value = value.substring(0, 5); // Limiting the length to 5 chars
      }

      dispatch({
        type: productsNamespacer(productsAT.SET_NEW_PRODUCT_PRICE_AT_LOCATION),
        payload: {
          id,
          field,
          value,
        },
      });
    },

    handleSelectAll: () => {
      dispatch({
        type: productsNamespacer(productsAT.SET_SELECT_ALL_PRODUCT_LOCATIONS),
      });
    },

    handleApplyAll: () => {
      dispatch({
        type: productsNamespacer(productsAT.SET_APPLY_ALL_PRODUCT_PRICES),
      });
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(ProductWizard);
