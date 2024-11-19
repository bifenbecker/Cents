import {createNamespacer, createReducer} from "../utils/reducers";
import actionTypes from "../actionTypes";

const initialState = {
  isLoggedIn: false,
};

const sessionNamespacer = createNamespacer("SESSION");

const handlers = {
  [sessionNamespacer(actionTypes.session.SET_SESSION)]: (state, action) => {
    return {
      ...state,
      ...action.payload,
    };
  },

  [sessionNamespacer(actionTypes.session.REMOVE_SESSION)]: (state, action) => {
    const isLoggedIn = action.payload.value;

    return {
      isLoggedIn,
    };
  },
};

export default createReducer(initialState, handlers, ["SESSION"]);
