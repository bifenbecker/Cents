import { createNamespacer, createReducer } from "../utils/reducers";
import actionTypes from "../actionTypes";

const initialState = {
  newPassword: '',
  reEnterPassword: '',
  resetToken: null,
  isResetTokenValid: null,
  errorMessage: '',
  resetSuccessful: false
};

const resetPasswordNameSpacer = createNamespacer("RESET_PASSWORD");

const handlers = {
    [resetPasswordNameSpacer(actionTypes.resetPassword.SET_NEW_PASSWORD)]: (state, action) => {
        return {
          ...state,
          newPassword: action.payload
        };
      },
      [resetPasswordNameSpacer(actionTypes.resetPassword.SET_RE_ENTER_PASSWORD)]: (state, action) => {
        return {
          ...state,
          reEnterPassword: action.payload
        };
      },
      [resetPasswordNameSpacer(actionTypes.resetPassword.SET_ERROR_MESSAGE)]: (state, action) => {
        return {
          ...state,
          errorMessage: action.payload
        };
      },

      [resetPasswordNameSpacer(actionTypes.resetPassword.SET_RESET_TOKEN_STATUS)]: (state, action) => {
        return {
          ...state,
          isResetTokenValid: action.payload
        };
      },
      [resetPasswordNameSpacer(actionTypes.resetPassword.SET_RESET_TOKEN)]: (state, action) => {
        return {
          ...state,
          resetToken: action.payload
        };
      },

      [resetPasswordNameSpacer(actionTypes.resetPassword.SET_RESET_SUCCESS)]: (state, action) => {
        return {
          ...state,
          resetSuccessful: action.payload
        };
      },

};

export default createReducer(initialState, handlers, ["RESET_PASSWORD"]);
