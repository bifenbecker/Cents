import {connect} from "react-redux";
import _ from "lodash";

import ProductDetails from "../components/business-owner/global-settings/products/product-details";
import {createNamespacer} from "../utils/reducers";
import actionTypes from "../actionTypes";
import {
  fetchProductDetails,
  fetchFileStackKey,
  updateAllProductDetails,
  saveNewCategory,
  fetchProductCategories,
} from "../api/business-owner/products";

const productsAT = actionTypes.businessOwner.globalSettings.products;
const productsNamespacer = createNamespacer("BO-PRODUCTS");

const mapStateToProps = (state) => {
  let products = state.businessOwner.globalSettings.products;
  return {
    activeProductDetails: products.activeProductDetails,
    productCategories: products.productCategories,
    productDetailsErrors: products.productDetailsErrors,
    activeProductId: products.activeProductId,
    isProductDetailsLoading: products.isProductDetailsLoading,
    productsListCallInProgress: products.productsListCallInProgress,
    productsListError: products.productsListError,
    productDetailsError: products.productDetailsError,
    productDetailsNullDescription: products.productDetailsNullDescription,
    fileStackKey: products.fileStackKey,
    isProductDetailsUpdateLoading: products.isProductDetailsUpdateLoading,
    productDetailsUpdateError: products.productDetailsUpdateError,
    preventDetailsRefresh: products.preventDetailsRefresh,
    showNewCategoryScreenInDetails: products.showNewCategoryScreenInDetails,
    newCategoryCallInProgress: products.newCategoryCallInProgress,
    newCategoryError: products.newCategoryError,
    searchText: products.searchText,
    searchInProgress: products.searchInProgress,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    handleFieldChange: (id, field, value) => {
      if (value === "new-category") {
        dispatch({
          type: productsNamespacer(productsAT.SET_SHOW_NEW_CATEGORY_SCREEN_IN_DETAILS),
          payload: true,
        });
      } else {
        dispatch({
          type: productsNamespacer(productsAT.UPDATE_ACTIVE_PRODUCT_DETAIL),
          payload: {
            field,
            value,
          },
        });
      }
    },

    fetchProductDetails: async (id) => {
      if (!id) {
        return;
      }
      dispatch({
        type: productsNamespacer(productsAT.SET_PRODUCT_DETAILS_LOADING),
        payload: true,
      });
      try {
        let resp = await fetchProductDetails(id);
        dispatch({
          type: productsNamespacer(productsAT.SET_ACTIVE_PRODUCT_DETAILS),
          payload: _.get(resp, "data", {}),
        });
        dispatch({
          type: productsNamespacer(productsAT.SET_PRODUCT_DETAILS_LOADING),
          payload: false,
        });
      } catch (e) {
        dispatch({
          type: productsNamespacer(productsAT.SET_PRODUCT_DETAILS_ERROR),
          payload: _.get(e, "response.data.error", "Something went wrong"),
        });
        dispatch({
          type: productsNamespacer(productsAT.SET_PRODUCT_DETAILS_LOADING),
          payload: false,
        });
      }
    },

    fetchFileStackKey: async () => {
      try {
        let resp = await fetchFileStackKey();
        let key = resp.data.fileStackApi;
        dispatch({
          type: productsNamespacer(productsAT.SET_FILESTACK_KEY),
          payload: key,
        });
        dispatch({
          type: productsNamespacer(productsAT.SET_FILESTACK_KEY_ERROR),
          payload: "",
        });
      } catch (e) {
        dispatch({
          type: productsNamespacer(productsAT.SET_FILESTACK_KEY_ERROR),
          payload: "Failed to fetch key",
        });
      }
    },

    handleSave: async (activeProductDetails, currentSearchText, searchInProgress) => {
      try {
        dispatch({
          type: productsNamespacer(productsAT.SET_PRODUCT_DETAILS_UPDATE_LOADING),
          payload: true,
        });
        let data = {
          id: activeProductDetails.id,
          description: activeProductDetails.description?.trim(),
          productName: activeProductDetails.productName?.trim(),
          productImage: activeProductDetails.productImage,
          sku: activeProductDetails.sku?.trim(),
          categoryId: activeProductDetails.categoryId,
        };
        let resp;
        if (data?.id) {
          resp = await updateAllProductDetails(data);
        } else {
          throw {
            response: {
              data: {
                error: "Could not upload the image. Please try again later.",
              },
            },
          };
        }

        let updatedProduct = resp.data.product;

        dispatch({
          type: productsNamespacer(productsAT.UPDATE_PRODUCT_ID),
          payload: updatedProduct,
        });

        if (searchInProgress) {
          dispatch({
            type: productsNamespacer(productsAT.SET_PRODUCT_SEARCH_TEXT),
            payload: currentSearchText,
          });
        }

        dispatch({
          type: productsNamespacer(productsAT.SET_PRODUCT_DETAILS_UPDATE_LOADING),
          payload: false,
        });
        dispatch({
          type: productsNamespacer(productsAT.SET_PRODUCT_DETAILS_UPDATE_ERROR),
          payload: "",
        });
      } catch (e) {
        dispatch({
          type: productsNamespacer(productsAT.SET_PRODUCT_DETAILS_UPDATE_ERROR),
          payload: _.get(e, "response.data.error", "Something went wrong"),
        });
        dispatch({
          type: productsNamespacer(productsAT.SET_PRODUCT_DETAILS_UPDATE_LOADING),
          payload: false,
        });
      }
    },

    resetPreventDetailsRefresh: () => {
      dispatch({
        type: productsNamespacer(productsAT.RESET_PREVENT_DETAILS_REFRESH),
      });
    },

    handlePriceClick: () => {
      dispatch({
        type: productsNamespacer(productsAT.SET_ACTIVE_TAB),
        payload: "locationPricing",
      });
    },

    showHideNewCategoryScreenInDetails: (value) => {
      dispatch({
        type: productsNamespacer(productsAT.SET_SHOW_NEW_CATEGORY_SCREEN_IN_DETAILS),
        payload: value,
      });
    },

    createNewCategory: async (category, activeProductDetails) => {
      try {
        dispatch({
          type: productsNamespacer(productsAT.SET_NEW_CATEGORY_CALL_PROGRESS),
          payload: true,
        });

        const newCategoryResponse = await saveNewCategory(category);
        const productCategoriesResponse = await fetchProductCategories();

        activeProductDetails.categoryId = newCategoryResponse.data.productCategory.id;

        let data = {
          id: activeProductDetails.id,
          description: activeProductDetails.description?.trim(),
          productName: activeProductDetails.productName?.trim(),
          productImage: activeProductDetails.productImage,
          sku: activeProductDetails.sku?.trim(),
          categoryId: activeProductDetails.categoryId,
        };
        let resp = await updateAllProductDetails(data);

        dispatch({
          type: productsNamespacer(productsAT.SET_NEW_CATEGORY_ERROR),
          payload: "",
        });

        dispatch({
          type: productsNamespacer(productsAT.SET_PRODUCT_CATEGORIES_LIST),
          payload: productCategoriesResponse.data.categories,
        });

        dispatch({
          type: productsNamespacer(productsAT.SET_SHOW_NEW_CATEGORY_SCREEN_IN_DETAILS),
          payload: false,
        });

        dispatch({
          type: productsNamespacer(productsAT.SET_NEW_CATEGORY_CALL_PROGRESS),
          payload: false,
        });

        dispatch({
          type: productsNamespacer(productsAT.SET_NEW_CATEGORY_ID),
          payload: newCategoryResponse.data.productCategory.id,
        });

        dispatch({
          type: productsNamespacer(productsAT.SET_NEW_CATEGORY_CALL_PROGRESS),
          payload: false,
        });

        let updatedProduct = resp.data.product;

        dispatch({
          type: productsNamespacer(productsAT.UPDATE_PRODUCT_ID),
          payload: updatedProduct,
        });
      } catch (error) {
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
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(ProductDetails);
