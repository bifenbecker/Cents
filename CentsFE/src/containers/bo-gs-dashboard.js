import {connect} from "react-redux";
import BoDashboard from "../components/business-owner/global-settings/dashboard/index.js";
import {createNamespacer} from "../utils/reducers";
import actionTypes from "../actionTypes";
import {SESSION_ENV_KEY} from "../utils/config";

const sessionNamespacer = createNamespacer("SESSION");

const mapStateToProps = (state) => ({
  session: state.session,
});

const mapDispatchToProps = (dispatch) => ({
  removeSession: () => {
    localStorage.removeItem(SESSION_ENV_KEY);

    dispatch({
      type: sessionNamespacer(actionTypes.session.REMOVE_SESSION),
      payload: {
        value: false,
      },
    });
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(BoDashboard);
