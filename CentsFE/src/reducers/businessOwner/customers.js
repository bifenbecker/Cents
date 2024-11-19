import _ from "lodash";
import {createReducer, createNamespacer} from "../../utils/reducers";
import actionTypes from "../../actionTypes";

const nameSpace = "BO-CUSTOMERS";

const custNameSpacer = createNamespacer(nameSpace);
const custAT = actionTypes.businessOwner.customers;

const initialState = {
  customers: [],
  totalCustomers: 0,
  customerListError: "",
  showListLoader: false,
  showInListLoader: false,
  activeCustomerId: null,
  customerFieldErrors: {
    boName: "",
    boEmail: "",
    boPhoneNumber: "",
  },
  customersCurrentPage: 1,
  insightsLoading: false,
  insights: null,
  insightsError: "",
  activeTab: "details",
  activeCustomerDetails: null,
  showDetailsLoader: false,
  detailsError: "",
  showLanguagesLoader: false,
  languages: null,
  languagesError: "",
  reasonsCallInProgress: false,
  reasonsList: [],
  reasonsCallError: "",
  showIssueCreditScreen: false,
  issueCreditCallInProgress: false,
  issueCreditCallError: "",
  searchInProgress: false,
  searchText: "",
  showCardsOnFileScreen: false,
  isLoadingInCardFileScreen: false,
  stripeClientSecret: "",
  stripeClientSecretError: "",
  addCardOnFileError: "",
  cardsOnFileList: [],
  cardsOnFileListError: "",
  showAddCardScreen: false,
  showCommercialSettingsCustomerScreen: false,
};

const handlers = {
  [custNameSpacer(custAT.CUSTOMERS_LIST_CALL_STARTED)]: (state, action) => {
    let page = action.payload.page;
    return {
      ...state,
      showListLoader: page === 1 ? true : false,
      showInListLoader: page !== 1 ? true : false,
    };
  },

  [custNameSpacer(custAT.CUSTOMERS_LIST_CALL_SUCCEEDED)]: (state, action) => {
    const customerList = _.get(action, "payload.resp.data.detail", []);
    const currentPage = _.get(action, "payload.page", 1);
    const customerCount = _.get(action, "payload.resp.data.totalCount", 0);

    let updatedCustomerList;

    if (currentPage === 1) {
      updatedCustomerList = customerList;
    } else {
      updatedCustomerList = [...state.customers, ...customerList];
    }

    return {
      ...state,
      showListLoader: false,
      showInListLoader: false,
      customers: updatedCustomerList,
      customersCurrentPage: currentPage,
      totalCustomers: customerCount,
      activeCustomerId: _.get(customerList[0], "id", null),
    };
  },

  [custNameSpacer(custAT.CUSTOMERS_LIST_CALL_FAILED)]: (state, action) => {
    return {
      ...state,
      showListLoader: false,
      showInListLoader: false,
      customers: [],
      activeCustomerId: null,
      customerListError: _.get(
        action,
        "payload.response.data.error",
        _.get(action, "payload.message", "Something went wrong")
      ),
    };
  },

  [custNameSpacer(custAT.CUSTOMER_SELECTED)]: (state, action) => {
    const {customerFieldErrors} = initialState;
    return {
      ...state,
      activeCustomerId: action.payload,
      customerFieldErrors,
      activeTab: "details",
    };
  },

  [custNameSpacer(custAT.CUSTOMER_DETAIL_CHANGED)]: (state, action) => {
    const activeCustomerDetails = {...state.activeCustomerDetails};
    activeCustomerDetails[action.payload.field] = action.payload.value;

    return {
      ...state,
      activeCustomerDetails,
    };
  },

  [custNameSpacer(custAT.UPDATE_CUSTOMER_FAILED)]: (state, action) => {
    return {
      ...state,
      customerFieldErrors: {
        ...state.customerFieldErrors,
        [action.payload.field]: action.payload.errorMessage,
      },
    };
  },

  [custNameSpacer(custAT.UPDATE_CUSTOMER_SUCCEEDED)]: (state, action) => {
    const customers = [...state.customers];
    const customer = customers.find((cust) => cust.id === action.payload.custId);
    customer[action.payload.field] = action.payload.value;

    return {
      ...state,
      customers,
      customerFieldErrors: {
        ...state.customerFieldErrors,
        [action.payload.field]: "",
      },
    };
  },

  [custNameSpacer(custAT.INSIGHTS_CALL_STARTED)]: (state, action) => {
    return {
      ...state,
      insightsLoading: true,
      insightsError: "",
    };
  },

  [custNameSpacer(custAT.INSIGHTS_CALL_SUCCEEDED)]: (state, action) => {
    return {
      ...state,
      insightsLoading: false,
      insights: _.get(action, "payload.insights", null),
      insightsError: "",
    };
  },

  [custNameSpacer(custAT.INSIGHTS_CALL_FAILED)]: (state, action) => {
    return {
      ...state,
      insightsLoading: false,
      insights: null,
      insightsError: action.payload,
    };
  },

  [custNameSpacer(custAT.SET_ACTIVE_TAB)]: (state, action) => {
    return {
      ...state,
      activeTab: action.payload,
    };
  },

  [custNameSpacer(custAT.CUSTOMER_DETAILS_CALL_STARTED)]: (state, action) => {
    return {
      ...state,
      showDetailsLoader: true,
      activeCustomerDetails: null,
      detailsError: "",
    };
  },

  [custNameSpacer(custAT.CUSTOMER_DETAILS_CALL_SUCCEEDED)]: (state, action) => {
    return {
      ...state,
      showDetailsLoader: false,
      activeCustomerDetails: action.payload,
      detailsError: "",
    };
  },

  [custNameSpacer(custAT.CUSTOMER_DETAILS_CALL_FAILED)]: (state, action) => {
    return {
      ...state,
      showDetailsLoader: false,
      activeCustomerDetails: null,
      detailsError: action.payload,
    };
  },

  [custNameSpacer(custAT.CUSTOMERS_LANGUAGES_CALL_STARTED)]: (state, action) => {
    return {
      ...state,
      showLanguagesLoader: true,
      languages: null,
      languagesError: "",
    };
  },

  [custNameSpacer(custAT.CUSTOMERS_LANGUAGES_CALL_SUCCEEDED)]: (state, action) => {
    return {
      ...state,
      showLanguagesLoader: false,
      languages: action.payload,
      languagesError: "",
    };
  },

  [custNameSpacer(custAT.CUSTOMERS_LANGUAGES_CALL_FAILED)]: (state, action) => {
    return {
      ...state,
      showLanguagesLoader: false,
      languages: null,
      languagesError: action.payload,
    };
  },

  [custNameSpacer(custAT.SET_REASONS_CALL_PROGRESS)]: (state, action) => {
    return {
      ...state,
      reasonsCallInProgress: action.payload,
    };
  },

  [custNameSpacer(custAT.SET_REASONS_LIST)]: (state, action) => {
    return {
      ...state,
      reasonsList: action.payload,
    };
  },

  [custNameSpacer(custAT.SET_REASONS_CALL_ERROR)]: (state, action) => {
    return {
      ...state,
      reasonsCallError: action.payload,
    };
  },

  [custNameSpacer(custAT.SHOW_HIDE_ISSUE_CREDIT_SCREEN)]: (state, action) => {
    return {
      ...state,
      showIssueCreditScreen: action.payload,
      issueCreditCallError: "",
    };
  },

  [custNameSpacer(custAT.SET_NEW_CREDIT_CALL_PROGRESS)]: (state, action) => {
    return {
      ...state,
      issueCreditCallInProgress: action.payload,
    };
  },

  [custNameSpacer(custAT.SET_NEW_CREDIT_CALL_ERROR)]: (state, action) => {
    return {
      ...state,
      issueCreditCallError: action.payload,
    };
  },

  [custNameSpacer(custAT.ADD_NEW_CREDIT_T0_LIST)]: (state, action) => {
    const activeCustomerDetails = {...state.activeCustomerDetails};
    activeCustomerDetails.credits.push(action.payload);
    return {
      ...state,
      activeCustomerDetails,
    };
  },

  [custNameSpacer(custAT.SET_SEARCH_IN_PROGRESS)]: (state, action) => {
    return {
      ...state,
      searchInProgress: action.payload,
      activeTab: "details",
      showIssueCreditScreen: false,
      customers: [],
    };
  },

  [custNameSpacer(custAT.SET_CUSTOMER_SEARCH_TEXT)]: (state, action) => {
    return {
      ...state,
      searchText: action.payload,
    };
  },
  [custNameSpacer(custAT.SHOW_HIDE_CARDS_ON_FILE_SCREEN)]: (state, action) => {
    return {
      ...state,
      showCardsOnFileScreen: action.payload,
    };
  },

  [custNameSpacer(custAT.CARD_ON_FILE_SCREEN_LOADER)]: (state, action) => {
    return {
      ...state,
      isLoadingInCardFileScreen: action.payload,
    };
  },

  [custNameSpacer(custAT.SET_SAVE_CREDIT_CARD_CALL_ERROR)]: (state, action) => {
    return {
      ...state,
      addCardOnFileError: action.payload,
    };
  },

  [custNameSpacer(custAT.SET_SAVED_CARDS_LIST)]: (state, action) => {
    const cardsOnFileList = [...action.payload];

    return {
      ...state,
      cardsOnFileList,
    };
  },

  [custNameSpacer(custAT.SET_SAVED_CARDS_LIST_CALL_ERROR)]: (state, action) => {
    return {
      ...state,
      cardsOnFileListError: action.payload,
    };
  },

  [custNameSpacer(custAT.SHOW_HIDE_ADD_CARD_SCREEN)]: (state, action) => {
    return {
      ...state,
      showAddCardScreen: action.payload,
    };
  },

  [custNameSpacer(custAT.SHOW_COMMERCIAL_CUSTOMER_SCREEN)]: (state, action) => {
    return {
      ...state,
      showCommercialSettingsCustomerScreen: action.payload,
    };
  },
};

export default createReducer(initialState, handlers, [nameSpace]);
