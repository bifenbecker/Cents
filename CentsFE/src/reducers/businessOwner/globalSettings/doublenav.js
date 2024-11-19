import {createNamespacer, createReducer} from "../../../utils/reducers";
import actionTypes from "../../../actionTypes";

const doubleNavNamespacer = createNamespacer("BUSINESS_OWNER_DOUBLENAV");
const doublenavActionTypes = actionTypes.doubleNav;

const initialState = {
  tab: "Locations",
  rightNav: false,
  rightTab: "",
};

const handlers = {
  [doubleNavNamespacer(doublenavActionTypes.SHOW_RIGHTNAV)]: (state, action) => {
    return {
      ...state,
      rightNav: action.payload,
    };
  },
  [doubleNavNamespacer(doublenavActionTypes.SET_TAB)]: (state, action) => {
    return {
      ...state,
      tab: action.payload,
    };
  },
  [doubleNavNamespacer(doublenavActionTypes.SET_RIGHT_TAB)]: (state, action) => {
    return {
      ...state,
      rightTab: action.payload,
    };
  },
};

export default createReducer(initialState, handlers, ["BUSINESS_OWNER_DOUBLENAV"]);
