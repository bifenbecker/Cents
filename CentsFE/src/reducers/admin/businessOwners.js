import { createNamespacer, createReducer } from "../../utils/reducers";
import actionTypes from "../../actionTypes";

const businessOwnersNamespacer = createNamespacer("ADMIN_BUSINESS_OWNERS");

const initialState = {
  value: null,
  currentBusinessOwner: {
    businessId: null,
    data: null
  },
  currentPage: 1,
  totalPage: 0,
  error: "",
  showError: false,
  showCreateModal: false,
  refreshCustomerList: false,
  createCustomerError: ""
};

const handlers = {
  [businessOwnersNamespacer(
    actionTypes.admin.businessOwners.FETCH_BUSINESS_OWNERS
  )]: (state, action) => {
    const value = action.payload.value;

    return {
      ...state,
      value: value.data,
      totalPage: value.totalPage
    };
  },

  [businessOwnersNamespacer(
    actionTypes.admin.businessOwners.SET_BUSINESS_OWNERS_ERROR
  )]: (state, action) => {
    const value = action.payload.value;
    return {
      ...state,
      error: value.error,
      showError: value.showError
    };
  },

  [businessOwnersNamespacer(
    actionTypes.admin.businessOwners.RESET_BUSINESS_OWNERS_ERROR
  )]: state => {
    return {
      ...state,
      error: initialState.businessOwners.error,
      showError: initialState.businessOwners.showError
    };
  },

  [businessOwnersNamespacer(
    actionTypes.admin.businessOwners.SET_CURRENT_BUSINESS_OWNER_ID
  )]: (state, action) => {
    return {
      ...state,
      currentBusinessOwner: {
        ...state.currentBusinessOwner,
        businessId: action.payload.value
      }
    };
  },

  [businessOwnersNamespacer(
    actionTypes.admin.businessOwners.SET_CURRENT_BUSINESS_OWNER_DATA
  )]: (state, action) => {
    return {
      ...state,
      currentBusinessOwner: {
        ...state.currentBusinessOwner,
        data: action.payload.value
      }
    };
  },

  [businessOwnersNamespacer(
    actionTypes.admin.businessOwners.CLEAR_CURRENT_BUSINESS_OWNER_DATA
  )]: state => {
    return {
      ...state,
      currentBusinessOwner: {
        ...state.currentBusinessOwner,
        businessId: initialState.currentBusinessOwner.businessId,
        data: initialState.currentBusinessOwner.data
      }
    };
  },

  [businessOwnersNamespacer(
    actionTypes.admin.businessOwners.UPDATE_CURRENT_PAGE
  )]: (state, action) => {
    return {
      ...state,
      currentPage: action.payload.value
    };
  },

  [businessOwnersNamespacer(
    actionTypes.admin.businessOwners.SHOW_HIDE_CREATE_CUSTOMER_MODAL
  )]: (state, action) => {
    return {
      ...state,
      showCreateModal: action.payload
    };
  },

  [businessOwnersNamespacer(
    actionTypes.admin.businessOwners.REFRESH_CUSTOMER_LIST
  )]: (state, action) => {
    return {
      ...state,
      refreshCustomerList: action.payload
    };
  },

  [businessOwnersNamespacer(
    actionTypes.admin.businessOwners.SET_CREATE_CUSTOMER_ERROR
  )]: (state, action) => {
    return {
      ...state,
      createCustomerError: action.payload.errorMessage
    };
  },

};

export default createReducer(initialState, handlers, ["ADMIN_BUSINESS_OWNERS"]);
