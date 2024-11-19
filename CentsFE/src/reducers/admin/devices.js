import { createNamespacer, createReducer } from "../../utils/reducers";
import actionTypes from "../../actionTypes";

const devicesNamespacer = createNamespacer("ADMIN_DEVICES");

const initialState = {
  data: [],
  batchList: [],
  batchData: {},
  deviceCount: 0,
  error: "",
  showError: false,
  currentBatchId: "",
  isUploadInProgress: false
};

const handlers = {
  [devicesNamespacer(actionTypes.admin.devices.SET_BATCH_DATA)]: (
    state,
    action
  ) => {
    const value = action.payload.value;



    let batchData = {...state.batchData};
    batchData[value.batchId] = value;
    
    return {
      ...state,
      batchData
    };
  },

  [devicesNamespacer(actionTypes.admin.devices.SET_BATCH_LIST)]: (
    state,
    action
  ) => {
      return {
        ...state,
        batchList: action.payload.value
      }
  },

  [devicesNamespacer(actionTypes.admin.devices.FETCH_DEVICES)]: (
    state,
    action
  ) => {
    const value = action.payload.value;

    return {
      ...state,
      data: value.data,
      totalPage: value.totalPage
    };
  },

  [devicesNamespacer(actionTypes.admin.devices.RESET_DEVICES)]: state => {
    return {
      ...state,
      data: initialState.data,
      batchList: initialState.batchList,
      batchData: initialState.batchData,
      currentPage: initialState.currentPage,
      totalPage: initialState.totalPage
    };
  },

  [devicesNamespacer(actionTypes.admin.devices.UPDATE_CURRENT_PAGE)]: (
    state,
    action
  ) => {
    return {
      ...state,
      currentPage: action.payload.value
    };
  },

  [devicesNamespacer(actionTypes.admin.devices.SET_DEVICES_ERROR)]: (
    state,
    action
  ) => {
    const value = action.payload.value;
    return {
      ...state,
      error: value.error,
      showError: value.showError
    };
  },

  [devicesNamespacer(actionTypes.admin.devices.RESET_DEVICES_ERROR)]: state => {
    return {
      ...state,
      error: initialState.error,
      showError: initialState.showError
    };
  },

  [devicesNamespacer(actionTypes.admin.devices.SET_UPLOAD_PROGRESS)]: (state, action) => {
    return {
      ...state,
      isUploadInProgress: action.payload
    };
  },

};

export default createReducer(initialState, handlers, ["ADMIN_DEVICES"]);
