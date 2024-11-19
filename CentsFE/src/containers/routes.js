import {connect} from "react-redux";
import Routes from "../Routes";
import {createNamespacer} from "../utils/reducers";
import actionTypes from "../actionTypes";
import {
  setStringifiedLocalStorageData,
  getParsedLocalStorageData,
} from "../utils/functions";
import {SESSION_ENV_KEY} from "../utils/config";

const sessionNamespacer = createNamespacer("SESSION");

const mapStateToProps = (state) => ({
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
      } else if (!localStorageData?.uuid) {
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
});

export default connect(mapStateToProps, mapDispatchToProps)(Routes);
