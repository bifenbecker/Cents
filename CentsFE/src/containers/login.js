import {connect} from "react-redux";
import actionTypes from "../actionTypes";
import {createNamespacer} from "../utils/reducers";
import Login from "../components/login";
import {
  setStringifiedLocalStorageData,
  getParsedLocalStorageData,
} from "../utils/functions";
import {SESSION_ENV_KEY} from "../utils/config";

const sessionNamespacer = createNamespacer("SESSION");
const loginNamespacer = createNamespacer("LOGIN");

const mapStateToProps = (state) => ({
  login: state.login,
  session: state.session,
});

const mapDispatchToProps = (dispatch) => ({
  onSetSession: (value) => {
    const session = {...value};
    const {isLoggedIn} = session;
    const localStorageData = getParsedLocalStorageData(SESSION_ENV_KEY);

    if (isLoggedIn) {
      if (
        !localStorageData?.token &&
        !localStorageData?.userId &&
        !localStorageData?.roleName
      ) {
        delete session.isLoggedIn;
        setStringifiedLocalStorageData(SESSION_ENV_KEY, session);
      }
    }

    dispatch({
      type: sessionNamespacer(actionTypes.session.SET_SESSION),
      payload: {
        isLoggedIn,
        ...session,
      },
    });
  },

  onSetEmailName: (value) => {
    dispatch({
      type: loginNamespacer(actionTypes.login.SET_EMAIL_VALUE),
      payload: {
        value,
      },
    });
  },

  onSetEmailShowError: (value) => {
    dispatch({
      type: loginNamespacer(actionTypes.login.SET_EMAIL_SHOW_ERROR),
      payload: {
        value,
      },
    });
  },

  onSetEmailError: (value) => {
    dispatch({
      type: loginNamespacer(actionTypes.login.SET_EMAIL_ERROR),
      payload: {
        value,
      },
    });
  },

  onSetPassword: (value) => {
    dispatch({
      type: loginNamespacer(actionTypes.login.SET_PASSWORD_VALUE),
      payload: {
        value,
      },
    });
  },

  onSetLoginLoading: (value) => {
    dispatch({
      type: loginNamespacer(actionTypes.login.SET_LOADING),
      payload: value,
    });
  },

  onSetPasswordShowError: (value) => {
    dispatch({
      type: loginNamespacer(actionTypes.login.SET_PASSWORD_SHOW_ERROR),
      payload: {
        value,
      },
    });
  },

  onSetPasswordError: (value) => {
    dispatch({
      type: loginNamespacer(actionTypes.login.SET_PASSWORD_ERROR),
      payload: {
        value,
      },
    });
  },

  onSetApiShowError: (value) => {
    dispatch({
      type: loginNamespacer(actionTypes.login.SET_API_SHOW_ERROR),
      payload: {
        value,
      },
    });
  },

  onSetApiError: (value) => {
    dispatch({
      type: loginNamespacer(actionTypes.login.SET_API_ERROR),
      payload: {
        value,
      },
    });
  },

  onResetFields: () => {
    dispatch({
      type: loginNamespacer(actionTypes.login.RESET_FIELDS),
    });
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(Login);
