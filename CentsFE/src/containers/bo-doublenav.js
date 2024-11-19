import {connect} from "react-redux";
import {createNamespacer} from "../utils/reducers";
import actionTypes from "../actionTypes";
import DoubleNav from "../components/commons/double-nav/double-nav";

const doubleNavActions = actionTypes.doubleNav;
const BoDoubleNavNameSpacer = createNamespacer("BUSINESS_OWNER_DOUBLENAV");

const mapStateToProps = (state) => {
  const {
    businessOwner: {
      globalSettings: {
        doublenav: {
          tab,
          rightNav,
          rightTab,
          setActiveTab,
          openRightNav,
          closeRightNav,
          setRightTab,
        },
      },
    },
  } = state;
  return {
    rightNav,
    tab,
    rightTab,
    setActiveTab,
    openRightNav,
    closeRightNav,
    setRightTab,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    openRightNav: () => {
      dispatch({
        type: BoDoubleNavNameSpacer(doubleNavActions.SHOW_RIGHTNAV),
        payload: true,
      });
    },
    closeRightNav: () => {
      dispatch({
        type: BoDoubleNavNameSpacer(doubleNavActions.SHOW_RIGHTNAV),
        payload: false,
      });
    },
    setActiveTab: (tabTitle) => {
      dispatch({
        type: BoDoubleNavNameSpacer(doubleNavActions.SET_TAB),
        payload: tabTitle,
      });
    },
    setRightTab: (righttab) => {
      dispatch({
        type: BoDoubleNavNameSpacer(doubleNavActions.SET_RIGHT_TAB),
        payload: righttab,
      });
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(DoubleNav);
