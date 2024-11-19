import {connect} from "react-redux";
import Categories from "../components/business-owner/global-settings/productsandservices/categories/categories";
import {createNamespacer} from "../utils/reducers";
import actionTypes from "../actionTypes";
import {
  createOrUpdateSubcategory,
  createOrUpdateNewServiceSubcategory,
  createOrUpdateTurnaroundTime,
  fetchServiceCategories,
} from "../api/business-owner/categories";
import {saveNewCategory, fetchProductCategories} from "../api/business-owner/products";
import _ from "lodash";

const categoriesAT = actionTypes.businessOwner.globalSettings.categories;
const categoriesNamespacer = createNamespacer("BO-CATEGORIES");

const mapStateToProps = (state) => {
  let mapped = {
    ...state.businessOwner.globalSettings.categories,
  };
  // delete mapped.activeServiceDetails
  //delete mapped.newServicePriceItems;
  return mapped;
};
const addNewCategory = async (category, serviceDetails, dispatch) => {
  let errorFrom;
  try {
    dispatch({
      type: categoriesNamespacer(categoriesAT.SET_NEW_CATEGORY_CALL_PROGRESS),
      payload: true,
    });
    errorFrom = "create-category";
    if (category === "Products") {
      await saveNewCategory(serviceDetails);
    } else {
      await createOrUpdateNewServiceSubcategory(serviceDetails);
    }
    dispatch({
      type: categoriesNamespacer(categoriesAT.SET_CATEGORY_CALL_PROGRESS),
      payload: true,
    });
    errorFrom = "get-category";
    dispatch({
      type: categoriesNamespacer(categoriesAT.SET_CATEGORY_CALL_PROGRESS),
      payload: false,
    });

    dispatch({
      type: categoriesNamespacer(categoriesAT.SET_NEW_CATEGORY_CALL_PROGRESS),
      payload: false,
    });
    if (category === "Products") {
      const responseFromFetchCategories = await fetchProductCategories();
      dispatch({
        type: categoriesNamespacer(categoriesAT.SET_SUBCATEGORIES),
        payload: responseFromFetchCategories?.data?.categories,
      });
    } else {
      const responseFromFetchAllServices = await fetchServiceCategories();
      dispatch({
        type: categoriesNamespacer(categoriesAT.SET_SUBCATEGORIES),
        payload: responseFromFetchAllServices?.data?.categories,
      });
    }
    dispatch({
      type: categoriesNamespacer(categoriesAT.SET_NEW_CATEGORY_ERROR),
      payload: "",
    });
  } catch (error) {
    if (errorFrom === "create-category") {
      dispatch({
        type: categoriesNamespacer(categoriesAT.SET_NEW_CATEGORY_ERROR),
        payload: _.get(error, "response.data.error", "Something went wrong in the get."),
      });
    } else if (errorFrom === "get-category") {
      dispatch({
        type: categoriesNamespacer(categoriesAT.SET_NEW_CATEGORY_ERROR),
        payload: _.get(
          error,
          "response.data.error",
          "Something went wrong in the set section."
        ),
      });
    }

    dispatch({
      type: categoriesNamespacer(categoriesAT.SET_NEW_CATEGORY_CALL_PROGRESS),
      payload: false,
    });
  }
};

const fetchSubcategories = async (category, dispatch) => {
  try {
    let res = await fetchServiceCategories();
    if (category === "Products") {
      const responseFromFetchCategories = await fetchProductCategories();
      dispatch({
        type: categoriesNamespacer(categoriesAT.SET_SUBCATEGORIES),
        payload: responseFromFetchCategories?.data?.categories,
      });
    }
    if (category === "Laundry") {
      dispatch({
        type: categoriesNamespacer(categoriesAT.SET_SUBCATEGORIES),
        payload: res.data.categories[1].serviceCategories,
      });
      dispatch({
        type: categoriesNamespacer(categoriesAT.SET_TURNAROUND_TIME),
        payload: res.data.categories[1].serviceCategories[0].turnAroundInHours,
      });
    }

    if (category === "Dry_Cleaning") {
      dispatch({
        type: categoriesNamespacer(categoriesAT.SET_SUBCATEGORIES),
        payload: res.data.categories[0].serviceCategories,
      });
      dispatch({
        type: categoriesNamespacer(categoriesAT.SET_TURNAROUND_TIME),
        payload: res.data.categories[0].serviceCategories[0].turnAroundInHours,
      });
    }
  } catch (err) {
    console.log("the err: ", err);
  }
};

const updateSubcategory = async (item, name, category, dispatch) => {
  try {
    let payload = {};
    if (category === "Products") {
      payload = {
        name,
        id: item.id,
      };
      await saveNewCategory(payload);
      const responseFromFetchCategories = await fetchProductCategories();
      dispatch({
        type: categoriesNamespacer(categoriesAT.SET_SUBCATEGORIES),
        payload: responseFromFetchCategories?.data?.categories,
      });
    }
    if (category === "Dry_Cleaning") {
      payload = {
        category: name,
        id: item.id,
      };
      await createOrUpdateSubcategory(payload);
      let res = await fetchServiceCategories();
      dispatch({
        type: categoriesNamespacer(categoriesAT.SET_SUBCATEGORIES),
        payload: res.data.categories[0].serviceCategories,
      });
    }
    if (category === "Laundry") {
      payload = {
        category: name,
        id: item.id,
      };
      await createOrUpdateSubcategory(payload);
      let res = await fetchServiceCategories();
      dispatch({
        type: categoriesNamespacer(categoriesAT.SET_SUBCATEGORIES),
        payload: res.data.categories[1].serviceCategories,
      });
    }
  } catch (err) {
    console.log("the err: ", err);
  }
};

const updateTurnaroundTime = async (
  serviceCategoryTypeId,
  turnAroundInHours,
  dispatch
) => {
  try {
    dispatch({
      type: categoriesNamespacer(categoriesAT.SET_TURNAROUND_TIME_UPDATE_IN_PROGRESS),
      payload: true,
    });
    let res = await createOrUpdateTurnaroundTime({
      serviceCategoryTypeId,
      turnAroundInHours,
    });
    dispatch({
      type: categoriesNamespacer(categoriesAT.SET_TURNAROUND_TIME),
      payload: res.data.turnAroundInHours,
    });
    dispatch({
      type: categoriesNamespacer(categoriesAT.SET_TURNAROUND_TIME_UPDATE_IN_PROGRESS),
      payload: false,
    });
    dispatch({
      type: categoriesNamespacer(categoriesAT.SET_TURNAROUND_TIME_ERROR),
      payload: "",
    });
  } catch (err) {
    dispatch({
      type: categoriesNamespacer(categoriesAT.SET_TURNAROUND_TIME_UPDATE_IN_PROGRESS),
      payload: false,
    });
    dispatch({
      type: categoriesNamespacer(categoriesAT.SET_TURNAROUND_TIME_ERROR),
      payload: "Invalid turnaround time. Please Try again",
    });
  }
};

const mapDispatchToProps = (dispatch) => {
  return {
    handleTabChange: (tab) => {
      dispatch({
        type: categoriesNamespacer(categoriesAT.SET_ACTIVE_TAB),
        payload: tab,
      });
    },
    getAllSubcategories: (category) => {
      fetchSubcategories(category, dispatch);
    },
    updateTurnaroundTime: (serviceCategoryTypeId, turnAroundInHours) => {
      updateTurnaroundTime(serviceCategoryTypeId, turnAroundInHours, dispatch);
    },
    handleSave: (item, name, category) => {
      updateSubcategory(item, name, category, dispatch);
    },
    handleFieldChange: (id, field, value) => {
      dispatch({
        type: categoriesNamespacer(categoriesAT.UPDATE_ACTIVE_SERVICE_DETAIL),
        payload: {
          field,
          value,
        },
      });
    },
    saveNewCategory: (category, serviceDetails) => {
      addNewCategory(category, serviceDetails, dispatch);
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Categories);
