import {connect} from "react-redux";
import actionTypes from "../actionTypes";
import {createNamespacer} from "../utils/reducers";
import PasswordReset from "../components/password-reset/password-reset";
import * as authApi from "../api/authentication";

const resetPasswordNameSpacer = createNamespacer("RESET_PASSWORD");

const mapStateToProps = (state) => ({
  passwordReset: state.passwordReset,
});

const mapDispatchToProps = (dispatch) => ({
  onChange: ({target: {name, value}}) => {
    if (name === "newPassword") {
      dispatch({
        type: resetPasswordNameSpacer(actionTypes.resetPassword.SET_NEW_PASSWORD),
        payload: value,
      });
    } else if (name === "reEnterPassword") {
      dispatch({
        type: resetPasswordNameSpacer(actionTypes.resetPassword.SET_RE_ENTER_PASSWORD),
        payload: value,
      });
    }
  },

  onSubmit: async (newPassword, reEnterPassword, token) => {
    if (!newPassword || !reEnterPassword) {
      dispatch({
        type: resetPasswordNameSpacer(actionTypes.resetPassword.SET_ERROR_MESSAGE),
        payload: "All fields are mandatory",
      });
    } else if (newPassword !== reEnterPassword) {
      dispatch({
        type: resetPasswordNameSpacer(actionTypes.resetPassword.SET_ERROR_MESSAGE),
        payload: "Passwords don't match",
      });
    } else {
      // Make submit call
      dispatch({
        type: resetPasswordNameSpacer(actionTypes.resetPassword.SET_ERROR_MESSAGE),
        payload: "",
      });

      try {
        const params = {
          token,
        };
        const body = {
          password: newPassword,
        };
        const resp = await authApi.resetPassword(params, body);

        if (resp.data.success) {
          dispatch({
            type: resetPasswordNameSpacer(actionTypes.resetPassword.SET_RESET_SUCCESS),
            payload: true,
          });
        } else {
          dispatch({
            type: resetPasswordNameSpacer(actionTypes.resetPassword.SET_ERROR_MESSAGE),
            payload: "Something went wrong! Please contact support",
          });
        }
      } catch (error) {
        dispatch({
          type: resetPasswordNameSpacer(actionTypes.resetPassword.SET_ERROR_MESSAGE),
          payload: error.message,
        });
      }
    }
  },

  onVerifyResetToken: async (token) => {
    try {
      let res = await authApi.verifyResetToken({token});

      if (res.data.success) {
        //Set token and status to valid
        dispatch({
          type: resetPasswordNameSpacer(actionTypes.resetPassword.SET_RESET_TOKEN_STATUS),
          payload: true,
        });

        dispatch({
          type: resetPasswordNameSpacer(actionTypes.resetPassword.SET_RESET_TOKEN),
          payload: token,
        });
      } else {
        // Set invalid
        dispatch({
          type: resetPasswordNameSpacer(actionTypes.resetPassword.SET_RESET_TOKEN_STATUS),
          payload: false,
        });
      }
    } catch (error) {
      dispatch({
        type: resetPasswordNameSpacer(actionTypes.resetPassword.SET_RESET_TOKEN_STATUS),
        payload: false,
      });
    }
  },

  onSetResetTokenStatus: (status) => {
    dispatch({
      type: resetPasswordNameSpacer(actionTypes.resetPassword.SET_RESET_TOKEN_STATUS),
      payload: status,
    });
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(PasswordReset);
