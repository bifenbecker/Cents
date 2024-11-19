import { createNamespacer, createReducer } from "../utils/reducers";
import actionTypes from "../actionTypes";

const initialState = {
  error: "",
  email: "",
  submissionSuccessful: false
};

const forgotPasswordNameSpacer = createNamespacer("FORGOT_PASSWORD");

const handlers = {

    [forgotPasswordNameSpacer(actionTypes.forgotPassword.SET_EMAIL)]: (state, action) => {
        return {
          ...state,
          email: action.payload
        };
    },

    [forgotPasswordNameSpacer(actionTypes.forgotPassword.SET_ERROR)]: (state, action) => {
        return {
            ...state,
            error: action.payload
        };
    },

    [forgotPasswordNameSpacer(actionTypes.forgotPassword.SET_SUBMISSION_SUCCESS)]: (state, action) => {
        return {
            ...state,
            submissionSuccessful: true
        };
    },

};

export default createReducer(initialState, handlers, ["FORGOT_PASSWORD"]);
