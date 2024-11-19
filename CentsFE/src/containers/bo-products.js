import {connect} from "react-redux";
import Products from "../components/business-owner/global-settings/products/products";
import {createNamespacer} from "../utils/reducers";
import actionTypes from "../actionTypes";
import _ from "lodash";

import {
  archiveProduct,
  fetchProductsList,
  fetchProductCategories,
  saveNewCategory,
} from "../api/business-owner/products";

const productsAT = actionTypes.businessOwner.globalSettings.products;
const productsNamespacer = createNamespacer("BO-PRODUCTS");

const mapStateToProps = (state) => {
  const {
    businessOwner: {
      globalSettings: {
        products: {
          activeTab,
          tabs,
          productsListCallInProgress,
          productsListError,
          productsList,
          productCategories,
          activeProductId,
          showNewProductWizard,
          searchText,
          searchInProgress,
          productInventoryStatus,
          showNewCategoryScreenInDetails,
          showNewProductsPricingScreen,
        },
      },
    },
  } = state;

  return {
    activeTab,
    tabs,
    productsListCallInProgress,
    productsListError,
    productsList,
    productCategories,
    activeProductId,
    showNewProductWizard,
    searchText,
    searchInProgress,
    productInventoryStatus,
    showNewCategoryScreenInDetails,
    showNewProductsPricingScreen,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    setActiveTab: (tabValue) => {
      dispatch({
        type: productsNamespacer(productsAT.SET_ACTIVE_TAB),
        payload: tabValue,
      });
    },

    fetchAllProductsList: async (params) => {
      try {
        dispatch({
          type: productsNamespacer(productsAT.SET_PRODUCTS_LIST_CALL_PROGRESS),
          payload: true,
        });

        const [productsListResponse, productCategoriesResponse] = await Promise.all([
          fetchProductsList(params),
          fetchProductCategories(),
        ]);

        dispatch({
          type: productsNamespacer(productsAT.SET_PRODUCTS_LIST_CALL_PROGRESS),
          payload: false,
        });

        dispatch({
          type: productsNamespacer(productsAT.SET_PRODUCTS_LIST_ERROR),
          payload: "",
        });

        dispatch({
          type: productsNamespacer(productsAT.SET_PRODUCTS_LIST),
          payload: productsListResponse.data.categories,
        });

        dispatch({
          type: productsNamespacer(productsAT.SET_PRODUCT_CATEGORIES_LIST),
          payload: productCategoriesResponse.data.categories,
        });
      } catch (error) {
        dispatch({
          type: productsNamespacer(productsAT.SET_PRODUCTS_LIST_CALL_PROGRESS),
          payload: false,
        });

        dispatch({
          type: productsNamespacer(productsAT.SET_PRODUCTS_LIST_ERROR),
          payload: _.get(error, "response.data.error", "Something went wrong."),
        });
      }
    },

    setActiveProductId: (id) => {
      try {
        dispatch({
          type: productsNamespacer(productsAT.SET_ACTIVE_PRODUCT),
          payload: id,
        });
      } catch (error) {
        console.error(error);
      }
    },

    handleProductSearch: (searchText, includeArchived) => {
      dispatch({
        type: productsNamespacer(productsAT.SET_PRODUCT_SEARCH_TEXT),
        payload: {
          text: searchText,
          includeArchived,
        },
      });
    },

    showHideNewProductWizard: (value) => {
      dispatch({
        type: productsNamespacer(productsAT.SET_SHOW_NEW_PRODUCT_WIZARD),
        payload: value,
      });
    },

    setSearchInProgress: (value) => {
      dispatch({
        type: productsNamespacer(productsAT.SET_SEARCH_IN_PROGRESS),
        payload: value,
      });
    },

    archiveProduct: async (id, archiveBoolean) => {
      await archiveProduct(id, {archiveBoolean});
      dispatch({
        type: productsNamespacer(productsAT.SET_ACTIVE_PRODUCT),
      });
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
          type: productsNamespacer(productsAT.SET_SHOW_NEW_CATEGORY_SCREEN_IN_DETAILS),
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
    handleShowNewCategoryScreenInDetails: (value) => {
      dispatch({
        type: productsNamespacer(productsAT.SET_SHOW_NEW_CATEGORY_SCREEN_IN_DETAILS),
        payload: value,
      });
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Products);
