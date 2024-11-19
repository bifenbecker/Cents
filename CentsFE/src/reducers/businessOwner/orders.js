import _ from "lodash";
import {createReducer, createNamespacer} from "../../utils/reducers";
import actionTypes from "../../actionTypes";

const nameSpace = "BO-ORDERS";

const orderNameSpacer = createNamespacer(nameSpace);
const orderAT = actionTypes.businessOwner.orders;

const initialState = {
  orders: [],
  orderListError: "",
  showListLoader: false,
  showInListLoader: false,
  ordersCurrentPage: 1,
  totalOrders: 0,
  activeStatus: "active",
  activeOrder: null,
  insightsLoading: false,
  insights: {},
  insightsError: "",
  detailsLoading: false,
  activeOrderDetails: {},
  activeOrderError: "",
  searchInProgress: false,
  searchText: "",
  businessSettings: [],
};

const handlers = {
  [orderNameSpacer(orderAT.ORDERS_LIST_CALL_STARTED)]: (state, action) => {
    return {
      ...state,
      showListLoader: true,
      showInListLoader: action.payload.page === 1 ? false : true,
      ...(action.payload.page === 1
        ? {
            activeOrder: null,
            activeOrderDetails: {},
            activeOrderError: "",
          }
        : {}),
    };
  },

  [orderNameSpacer(orderAT.ORDERS_LIST_CALL_SUCCEEDED)]: (state, action) => {
    const orderList = _.get(action, "payload.data.orders", []);
    const totalOrders = Number(_.get(action, "payload.data.totalRecords", 0));
    const currentPage = Number(_.get(action, "payload.data.currentPage"));

    let orders = [...state.orders, ...orderList];
    let activeOrder = state.activeOrder;
    if (currentPage === 1) {
      orders = [...orderList];
      activeOrder = orderList[0];
    }

    return {
      ...state,
      showListLoader: false,
      showInListLoader: false,
      orders,
      totalOrders,
      ordersCurrentPage: currentPage,
      activeOrder,
    };
  },

  [orderNameSpacer(orderAT.RESET_ORDERS_LIST)]: (state) => {
    return {
      ...state,
      showListLoader: false,
      showInListLoader: false,
      activeStatus: "active",
      orders: [],
      totalOrders: 0,
      ordersCurrentPage: 1,
      activeOrder: null,
      detailsLoading: false,
      activeOrderDetails: {},
      activeOrderError: "",
    };
  },

  [orderNameSpacer(orderAT.ORDERS_LIST_CALL_FAILED)]: (state, action) => {
    return {
      ...state,
      showListLoader: false,
      showInListLoader: false,
      orders: [],
      orderListError: _.get(
        action,
        "payload.response.data.error",
        _.get(action, "payload.message", "Something went wrong")
      ),
    };
  },

  [orderNameSpacer(orderAT.SET_ACTIVE_STATUS)]: (state, action) => {
    return {
      ...state,
      activeStatus: action.payload,
    };
  },

  [orderNameSpacer(orderAT.SET_ACTIVE_ORDER)]: (state, action) => {
    return {
      ...state,
      activeOrder: action.payload,
    };
  },

  [orderNameSpacer(orderAT.ORDERS_INSIGHTS_CALL_STARTED)]: (state, action) => {
    return {
      ...state,
      insightsLoading: true,
    };
  },

  [orderNameSpacer(orderAT.ORDERS_INSIGHTS_CALL_SUCCEEDED)]: (state, action) => {
    return {
      ...state,
      insightsLoading: false,
      insights: _.get(action, "payload.data.insights", {}),
      insightsError: "",
    };
  },

  [orderNameSpacer(orderAT.ORDERS_INSIGHTS_CALL_FAILED)]: (state, action) => {
    return {
      ...state,
      insightsLoading: false,
      insights: {},
      insightsError: _.get(
        action,
        "payload.response.data.error",
        _.get(action, "payload.message", "Something went wrong")
      ),
    };
  },

  [orderNameSpacer(orderAT.ORDERS_DETAILS_CALL_STARTED)]: (state, action) => {
    return {
      ...state,
      detailsLoading: true,
    };
  },

  [orderNameSpacer(orderAT.ORDERS_DETAILS_CALL_SUCCEEDED)]: (state, action) => {
    return {
      ...state,
      detailsLoading: false,
      activeOrderDetails: _.get(
        action,
        "payload.data.orderDetails",
        _.get(action, "payload.data.details", {})
      ),
      businessSettings: _.get(action, "payload.data.businessSettings"),
      activeOrderError: "",
    };
  },

  [orderNameSpacer(orderAT.ORDERS_DETAILS_CALL_FAILED)]: (state, action) => {
    return {
      ...state,
      detailsLoading: false,
      activeOrderDetails: {},
      activeOrderError: _.get(
        action,
        "payload.response.data.error",
        _.get(action, "payload.message", "Something went wrong")
      ),
    };
  },

  [orderNameSpacer(orderAT.RESET_ORDERS_DETAILS)]: (state, action) => {
    return {
      ...state,
      detailsLoading: false,
      activeOrderDetails: {},
      activeOrderError: "",
    };
  },

  [orderNameSpacer(orderAT.SET_SEARCH_IN_PROGRESS)]: (state, action) => {
    return {
      ...state,
      searchInProgress: action.payload,
    };
  },

  [orderNameSpacer(orderAT.SET_ORDER_SEARCH_TEXT)]: (state, action) => {
    return {
      ...state,
      searchText: action.payload,
    };
  },

  [orderNameSpacer(orderAT.RESET_ORDERS_DATA)]: (state) => {
    return {
      ...state,
      searchInProgress: false,
      activeStatus: "active",
      orders: [],
      totalOrders: 0,
      ordersCurrentPage: 1,
      activeOrder: null,
      detailsLoading: false,
      activeOrderDetails: {},
      activeOrderError: "",
      searchText: "",
    };
  },
};

export default createReducer(initialState, handlers, [nameSpace]);
