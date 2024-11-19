import { createNamespacer, createReducer } from "../utils/reducers";
import actionTypes from "../actionTypes";

const initialState = {
  businessOwners: {
    value: null,
    currentPage: 1,
    totalPage: 0,
    error: "",
    showError: false
  },
  currentBusinessOwner: {
    businessId: null,
    data: null,
    currentPage: 1,
    totalPage: 0,
    devices: [],
    error: "",
    showError: false
  }
};

const adminDashboardNamespacer = createNamespacer("ADMIN_DASHBOARD");

const handlers = {
  [adminDashboardNamespacer(
    actionTypes.adminDashboard.FETCH_BUSINESS_OWNERS
  )]: (state, action) => {
    const value = action.payload.value;
    return {
      ...state,
      businessOwners: {
        ...state.businessOwners,
        totalPage: value.totalPage,
        value: value.data
      }
    };
  },

  [adminDashboardNamespacer(
    actionTypes.adminDashboard.SET_BUSINESS_OWNERS_ERROR
  )]: (state, action) => {
    const value = action.payload.value;
    return {
      ...state,
      businessOwners: {
        ...state.businessOwners,
        error: value.error,
        showError: value.showError
      }
    };
  },

  [adminDashboardNamespacer(
    actionTypes.adminDashboard.RESET_BUSINESS_OWNERS_ERROR
  )]: state => {
    return {
      ...state,
      businessOwners: {
        ...state.businessOwners,
        error: initialState.businessOwners.error,
        showError: initialState.businessOwners.showError
      }
    };
  },

  [adminDashboardNamespacer(actionTypes.adminDashboard.UPDATE_CURRENT_PAGE)]: (
    state,
    action
  ) => {
    return {
      ...state,
      businessOwners: {
        ...state.businessOwners,
        currentPage: action.payload.value
      }
    };
  },

  // devices
  [adminDashboardNamespacer(
    actionTypes.adminDashboard.UPDATE_DEVICES_CURRENT_PAGE
  )]: (state, action) => {
    return {
      ...state,
      currentBusinessOwner: {
        ...state.currentBusinessOwner,
        currentPage: action.payload.value
      }
    };
  },

  [adminDashboardNamespacer(
    actionTypes.adminDashboard.SET_CURRENT_BUSINESS_OWNER_ID
  )]: (state, action) => {
    return {
      ...state,
      currentBusinessOwner: {
        ...state.currentBusinessOwner,
        businessId: action.payload.value
      }
    };
  },

  [adminDashboardNamespacer(
    actionTypes.adminDashboard.CLEAR_CURRENT_BUSINESS_OWNER_DATA
  )]: state => {
    return {
      ...state,
      currentBusinessOwner: {
        ...state.currentBusinessOwner,
        businessId: initialState.currentBusinessOwner.id,
        data: initialState.currentBusinessOwner.data
      }
    };
  },

  [adminDashboardNamespacer(
    actionTypes.adminDashboard.SET_CURRENT_BUSINESS_OWNER_DATA
  )]: (state, action) => {
    const value = action.payload.value;

    return {
      ...state,
      currentBusinessOwner: {
        ...state.currentBusinessOwner,
        data: value.data,
        totalPage: value.totalPage
      }
    };
  },

  [adminDashboardNamespacer(
    actionTypes.adminDashboard.UPDATE_CURRENT_BUSINESS_OWNER_DATA
  )]: (state, action) => {
    return {
      ...state,
      currentBusinessOwner: {
        ...state.currentBusinessOwner,
        data: {
          ...state.currentBusinessOwner.data,
          deviceList: [
            ...state.currentBusinessOwner.data.deviceList,
            action.payload.value
          ]
        }
      }
    };
  },

  [adminDashboardNamespacer(
    actionTypes.adminDashboard.CLEAR_CURRENT_BUSINESS_OWNER_DATA
  )]: state => {
    return {
      ...state,
      currentBusinessOwner: {
        ...state.currentBusinessOwner,
        data: initialState.currentBusinessOwner.data
      }
    };
  },

  [adminDashboardNamespacer(
    actionTypes.adminDashboard.SET_CURRENT_BUSINESS_OWNERS_DEVICES_ERROR
  )]: (state, action) => {
    const value = action.payload.value;
    return {
      ...state,
      currentBusinessOwner: {
        ...state.currentBusinessOwner,
        error: value.error,
        showError: value.showError
      }
    };
  },

  [adminDashboardNamespacer(
    actionTypes.adminDashboard.RESET_CURRENT_BUSINESS_OWNERS_DEVICES_ERROR
  )]: state => {
    return {
      ...state,
      currentBusinessOwner: {
        ...state.currentBusinessOwner,
        error: initialState.currentBusinessOwner.error,
        showError: initialState.currentBusinessOwner.showError
      }
    };
  },

  [adminDashboardNamespacer(actionTypes.adminDashboard.UPLOAD_DEVICES_DATA)]: (
    state,
    action
  ) => {
    return {
      ...state,
      currentBusinessOwner: {
        ...state.currentBusinessOwner,
        devices: action.payload.value
      }
    };
  },

  [adminDashboardNamespacer(actionTypes.adminDashboard.CLEAR_DEVICES_DATA)]: (
    state,
    action
  ) => {
    return {
      ...state,
      currentBusinessOwner: {
        ...state.currentBusinessOwner,
        devices: initialState.currentBusinessOwner.devices
      }
    };
  }
};

export default createReducer(initialState, handlers, ["ADMIN_DASHBOARD"]);
