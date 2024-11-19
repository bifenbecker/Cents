import { createNamespacer, createReducer } from "../utils/reducers";
import actionTypes from "../actionTypes";

const initialState = {
  email: {
    value: "",
    error: "",
    showError: false
  },
  password: {
    value: "",
    error: "",
    showError: false
  },
  api: {
    error: "",
    showError: false
  },
  loading: false
};

const loginNamespacer = createNamespacer("LOGIN");

const handlers = {
  [loginNamespacer(actionTypes.login.SET_LOADING)]: (state, action) => {
    return {
      ...state,
      loading: action.payload
    };
  },

  [loginNamespacer(actionTypes.login.SET_EMAIL_VALUE)]: (state, action) => {
    return {
      ...state,
      email: {
        ...state.email,
        value: action.payload.value
      }
    };
  },

  [loginNamespacer(actionTypes.login.SET_EMAIL_ERROR)]: (state, action) => {
    return {
      ...state,
      email: {
        ...state.email,
        error: action.payload.value
      }
    };
  },

  [loginNamespacer(actionTypes.login.SET_EMAIL_SHOW_ERROR)]: (
    state,
    action
  ) => {
    return {
      ...state,
      email: {
        ...state.email,
        showError: action.payload.value
      }
    };
  },

  [loginNamespacer(actionTypes.login.SET_PASSWORD_VALUE)]: (state, action) => {
    return {
      ...state,
      password: {
        ...state.password,
        value: action.payload.value
      }
    };
  },

  [loginNamespacer(actionTypes.login.SET_PASSWORD_ERROR)]: (state, action) => {
    return {
      ...state,
      password: {
        ...state.password,
        error: action.payload.value
      }
    };
  },

  [loginNamespacer(actionTypes.login.SET_PASSWORD_SHOW_ERROR)]: (
    state,
    action
  ) => {
    return {
      ...state,
      password: {
        ...state.password,
        showError: action.payload.value
      }
    };
  },

  [loginNamespacer(actionTypes.login.SET_API_ERROR)]: (state, action) => {
    return {
      ...state,
      api: {
        ...state.api,
        error: action.payload.value
      }
    };
  },

  [loginNamespacer(actionTypes.login.SET_API_SHOW_ERROR)]: (state, action) => {
    return {
      ...state,
      api: {
        ...state.api,
        showError: action.payload.value
      }
    };
  },

  [loginNamespacer(actionTypes.login.RESET_FIELDS)]: () => {
    return initialState;
  }
};

export default createReducer(initialState, handlers, ["LOGIN"]);
