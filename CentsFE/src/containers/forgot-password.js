import {connect} from "react-redux";
import actionTypes from "../actionTypes";
import {createNamespacer} from "../utils/reducers";
import ForgotPassword from "../components/forgot-password/forgot-password";
import {forgotPassword} from "../api/authentication";
import * as yup from "yup";
import _ from "lodash";

const forgotPasswordNameSpacer = createNamespacer("FORGOT_PASSWORD");

const mapStateToProps = (state) => ({
  email: state.forgotPassword.email,
  error: state.forgotPassword.error,
  submissionSuccessful: state.forgotPassword.submissionSuccessful,
});

const mapDispatchToProps = (dispatch) => ({
  onChange: (evt) => {
    dispatch({
      type: forgotPasswordNameSpacer(actionTypes.forgotPassword.SET_EMAIL),
      payload: evt.target.value,
    });
  },

  onSubmitForgotRequest: (email) => {
    let data = {email};
    let schema = yup.object().shape({
      email: yup
        .string()
        .email("Invalid email address. Please correct and retry")
        .required("Email address is required"),
    });
    schema
      .validate(data)
      .then(async () => {
        try {
          await forgotPassword(data);
          // Decide what has to be done
          dispatch({
            type: forgotPasswordNameSpacer(
              actionTypes.forgotPassword.SET_SUBMISSION_SUCCESS
            ),
          });
        } catch (error) {
          // Set error
          let errorMessage = _.get(error, "response.data.error") || error.message;
          dispatch({
            type: forgotPasswordNameSpacer(actionTypes.forgotPassword.SET_ERROR),
            payload: errorMessage,
          });
        }
      })
      .catch((error) => {
        dispatch({
          type: forgotPasswordNameSpacer(actionTypes.forgotPassword.SET_ERROR),
          payload: error.message,
        });
      });
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(ForgotPassword);
