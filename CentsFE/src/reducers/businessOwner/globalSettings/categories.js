import {createNamespacer, createReducer} from "../../../utils/reducers";
import actionTypes from "../../../actionTypes";

const initialState = {
  activeTab: "Laundry",
  categoriesDetailsUpdateError: "",
  subcategories: [],
  activeSubcategory: [],
  turnaroundTime: 48,
  turnaroundTimeUpdateInProgress: false,
  error: "",
};

const nameSpace = "BO-CATEGORIES";
const categoriesNamespacer = createNamespacer(nameSpace);
const categoriesAT = actionTypes.businessOwner.globalSettings.categories;

const handlers = {
  [categoriesNamespacer(categoriesAT.SET_ACTIVE_TAB)]: (state, action) => {
    return {
      ...state,
      activeTab: action.payload,
      categoriesDetailsUpdateError: initialState.categoriesDetailsUpdateError,
    };
  },
  [categoriesNamespacer(categoriesAT.SET_SUBCATEGORIES)]: (state, action) => {
    return {
      ...state,
      subcategories: action.payload,
    };
  },
  [categoriesNamespacer(categoriesAT.SET_TURNAROUND_TIME)]: (state, action) => {
    return {
      ...state,
      turnaroundTime: action.payload,
    };
  },
  [categoriesNamespacer(categoriesAT.UPDATE_SUBCATEGORY)]: (state, action) => {
    return {
      ...state,
      activeSubcategory: action.payload,
    };
  },
  [categoriesNamespacer(categoriesAT.SET_TURNAROUND_TIME_ERROR)]: (state, action) => {
    return {
      ...state,
      error: action.payload,
    };
  },
  [categoriesNamespacer(categoriesAT.SET_TURNAROUND_TIME_UPDATE_IN_PROGRESS)]: (
    state,
    action
  ) => {
    return {
      ...state,
      turnaroundTimeUpdateInProgress: action.payload,
    };
  },
};

export default createReducer(initialState, handlers, [nameSpace]);
