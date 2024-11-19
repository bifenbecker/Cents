import {connect} from "react-redux";
import _ from "lodash";
import * as yup from "yup";
import Customers from "../components/business-owner/customers/customers";
import * as customersApi from "../api/business-owner/customers";
import {createNamespacer} from "../utils/reducers";
import actionTypes from "../actionTypes";

const customersAT = actionTypes.businessOwner.customers;
const custNamespacer = createNamespacer("BO-CUSTOMERS");

const mapStateToProps = (state) => {
  return {
    filteredLocations: state.businessOwner.dashboard.selectedLocations,
    allLocations: state.businessOwner.dashboard.allLocations,
    ...state.businessOwner.customers,
  };
};

const validateAndPutBoCustomer = _.debounce((custId, field, value, dispatch) => {
  const schema = yup.object().shape({
    boFullName: yup.string(),
    boEmail: yup.string().email("Invalid email address"),
    boPhoneNumber: yup.string().min(5).max(16),
    languageId: yup.number(),
  });

  let apiField = field;
  if (field === "languageId") {
    value = Number(value);
    apiField = "language";
  }

  try {
    schema.validateSyncAt(field, {[field]: value});
  } catch (e) {
    // Validation error
    dispatch({
      type: custNamespacer(customersAT.UPDATE_CUSTOMER_FAILED),
      payload: {
        field,
        errorMessage: e.message,
      },
    });
    return; // Exit the function without making put call
  }

  customersApi
    .updateBoCustomer(custId, apiField, value)
    .then(() => {
      dispatch({
        type: custNamespacer(customersAT.UPDATE_CUSTOMER_SUCCEEDED),
        payload: {field, value, custId},
      });
    })
    .catch((e) => {
      dispatch({
        type: custNamespacer(customersAT.UPDATE_CUSTOMER_FAILED),
        payload: {
          field,
          errorMessage: e.message,
        },
      });
    });
}, 200);

const debouncedSearchTextCall = _.debounce(
  async ({searchText, dispatch, page, stores}) => {
    dispatch({
      type: custNamespacer(customersAT.CUSTOMERS_LIST_CALL_STARTED),
      payload: {page},
    });
    try {
      const resp = await customersApi.fetchCustomers(stores, page, searchText);

      dispatch({
        type: custNamespacer(customersAT.CUSTOMERS_LIST_CALL_SUCCEEDED),
        payload: {
          resp,
          page,
        },
      });
    } catch (e) {
      dispatch({
        type: custNamespacer(customersAT.CUSTOMERS_LIST_CALL_FAILED),
        payload: e,
      });
    }
  },
  500
);

const mapDispatchToProps = (dispatch) => {
  return {
    fetchCustomers: async (stores, page) => {
      dispatch({
        type: custNamespacer(customersAT.CUSTOMERS_LIST_CALL_STARTED),
        payload: {page},
      });
      try {
        const resp = await customersApi.fetchCustomers(stores, page);
        dispatch({
          type: custNamespacer(customersAT.CUSTOMERS_LIST_CALL_SUCCEEDED),
          payload: {
            resp,
            page,
          },
        });
      } catch (e) {
        dispatch({
          type: custNamespacer(customersAT.CUSTOMERS_LIST_CALL_FAILED),
          payload: e,
        });
      }
    },

    fetchInsights: async (stores) => {
      dispatch({
        type: custNamespacer(customersAT.INSIGHTS_CALL_STARTED),
      });
      try {
        const resp = await customersApi.fetchInsights(stores);
        dispatch({
          type: custNamespacer(customersAT.INSIGHTS_CALL_SUCCEEDED),
          payload: resp.data,
        });
      } catch (e) {
        dispatch({
          type: custNamespacer(customersAT.INSIGHTS_CALL_FAILED),
          payload: _.get(
            e,
            "response.data.error",
            _.get(e, "message", "Something went wrong!")
          ),
        });
      }
    },

    fetchCustomerLanguages: async () => {
      dispatch({
        type: custNamespacer(customersAT.CUSTOMERS_LANGUAGES_CALL_STARTED),
      });
      try {
        const resp = await customersApi.fetchCustomerLanguages();
        dispatch({
          type: custNamespacer(customersAT.CUSTOMERS_LANGUAGES_CALL_SUCCEEDED),
          payload: _.get(resp, "data.languages", null),
        });
      } catch (e) {
        dispatch({
          type: custNamespacer(customersAT.CUSTOMERS_LANGUAGES_CALL_FAILED),
          payload: e.response?.data?.error || e.message,
        });
      }
    },

    setActiveCustomer: (id) => {
      dispatch({
        type: custNamespacer(customersAT.CUSTOMER_SELECTED),
        payload: id,
      });
    },

    handleCustomerDetailChange: (custId, field, value) => {
      const formattedValue =
        field === "boPhoneNumber" ? value.replace(/[^0-9]+/g, "") : value;
      dispatch({
        type: custNamespacer(customersAT.CUSTOMER_DETAIL_CHANGED),
        payload: {
          field,
          value: formattedValue,
        },
      });

      validateAndPutBoCustomer(custId, field, formattedValue, dispatch);
    },

    handleTabClick: (tabValue) => {
      dispatch({
        type: custNamespacer(customersAT.SET_ACTIVE_TAB),
        payload: tabValue,
      });
    },

    fetchCustomerDetailsAndInsights: async (customerId) => {
      dispatch({
        type: custNamespacer(customersAT.CUSTOMER_DETAILS_CALL_STARTED),
      });

      try {
        let insightsPromise = customersApi.fetchCustomerInsights(customerId);
        let detailsPromise = customersApi.fetchCustomerDetails(customerId);

        let [insightsResp, detailsResp] = await Promise.all([
          insightsPromise,
          detailsPromise,
        ]);

        let customerDetails = _.get(detailsResp, "data.details", {});
        customerDetails.insights = _.get(insightsResp, "data.insights", {});

        dispatch({
          type: custNamespacer(customersAT.CUSTOMER_DETAILS_CALL_SUCCEEDED),
          payload: customerDetails,
        });
      } catch (e) {
        dispatch({
          type: custNamespacer(customersAT.CUSTOMER_DETAILS_CALL_FAILED),
          payload: _.get(
            e,
            "response.data.error",
            _.get(e, "message", "Something went wrong!")
          ),
        });
      }
    },

    fetchReasonsList: async () => {
      dispatch({
        type: custNamespacer(customersAT.SET_REASONS_CALL_PROGRESS),
        payload: true,
      });
      try {
        const response = await customersApi.fetchCreditReasons();
        dispatch({
          type: custNamespacer(customersAT.SET_REASONS_LIST),
          payload: response.data.reasons,
        });
      } catch (e) {
        dispatch({
          type: custNamespacer(customersAT.SET_REASONS_CALL_ERROR),
          payload: _.get(
            e,
            "response.data.error",
            _.get(e, "message", "Something went wrong!")
          ),
        });
      } finally {
        dispatch({
          type: custNamespacer(customersAT.SET_REASONS_CALL_PROGRESS),
          payload: false,
        });
      }
    },

    issueCustomerCredit: async (creditDetails) => {
      let errors;

      dispatch({
        type: custNamespacer(customersAT.SET_NEW_CREDIT_CALL_PROGRESS),
        payload: true,
      });
      try {
        const response = await customersApi.issueCredit(creditDetails);

        dispatch({
          type: custNamespacer(customersAT.SHOW_HIDE_ISSUE_CREDIT_SCREEN),
          payload: false,
        });
      } catch (e) {
        errors = e.response.data.error;

        dispatch({
          type: custNamespacer(customersAT.SET_NEW_CREDIT_CALL_ERROR),
          payload: _.get(
            e,
            "response.data.error",
            _.get(e, "message", "Something went wrong!")
          ),
        });
      } finally {
        dispatch({
          type: custNamespacer(customersAT.SET_NEW_CREDIT_CALL_PROGRESS),
          payload: false,
        });

        return errors;
      }
    },

    showHideIssueCreditScreen: (value) => {
      dispatch({
        type: custNamespacer(customersAT.SHOW_HIDE_ISSUE_CREDIT_SCREEN),
        payload: value,
      });
    },

    setSearchInProgress: (value) => {
      dispatch({
        type: custNamespacer(customersAT.SET_SEARCH_IN_PROGRESS),
        payload: value,
      });

      if (!value) {
        dispatch({
          type: custNamespacer(customersAT.SET_CUSTOMER_SEARCH_TEXT),
          payload: "",
        });
      }
    },

    handleCustomerSearch: async (searchText, page, stores) => {
      dispatch({
        type: custNamespacer(customersAT.SET_CUSTOMER_SEARCH_TEXT),
        payload: searchText,
      });

      if (searchText) {
        debouncedSearchTextCall({searchText, dispatch, page, stores});
      }
    },

    showHideCardsOnFileScreen: (value) => {
      dispatch({
        type: custNamespacer(customersAT.SHOW_HIDE_CARDS_ON_FILE_SCREEN),
        payload: value,
      });
      dispatch({
        type: custNamespacer(customersAT.SET_SAVED_CARDS_LIST),
        payload: [],
      });
    },

    addCardOnFile: async ({stripe, cardElement, billingDetails, customerId}) => {
      dispatch({
        type: custNamespacer(customersAT.CARD_ON_FILE_SCREEN_LOADER),
        payload: true,
      });

      const {paymentMethod, error} = await stripe.createPaymentMethod({
        type: "card",
        card: cardElement,
        billing_details: {
          ...(billingDetails.zipCode
            ? {
                address: {
                  postal_code: billingDetails.zipCode,
                },
              }
            : {}),
          ...(billingDetails.email ? {email: billingDetails.email} : {}),
        },
      });

      if (error?.message) {
        dispatch({
          type: custNamespacer(customersAT.SET_SAVE_CREDIT_CARD_CALL_ERROR),
          payload: error.message || "Something went wrong!",
        });
      } else {
        try {
          await customersApi.createCardOnFile(customerId, paymentMethod.id);
          dispatch({
            type: custNamespacer(customersAT.SHOW_HIDE_ADD_CARD_SCREEN),
            payload: false,
          });
        } catch (e) {
          dispatch({
            type: custNamespacer(customersAT.SET_SAVE_CREDIT_CARD_CALL_ERROR),
            payload: e?.response?.data?.error || "Something went wrong!",
          });
        }
      }
      dispatch({
        type: custNamespacer(customersAT.CARD_ON_FILE_SCREEN_LOADER),
        payload: false,
      });
    },

    getCardsOnFile: async (customerId) => {
      try {
        dispatch({
          type: custNamespacer(customersAT.CARD_ON_FILE_SCREEN_LOADER),
          payload: true,
        });

        const response = await customersApi.fetchCardsOnFile(customerId);

        dispatch({
          type: custNamespacer(customersAT.SET_SAVED_CARDS_LIST),
          payload: response.data.cards.data,
        });
      } catch (e) {
        dispatch({
          type: custNamespacer(customersAT.SET_SAVED_CARDS_LIST_CALL_ERROR),
          payload: e?.response?.data?.error || "Something went wrong!",
        });
      } finally {
        dispatch({
          type: custNamespacer(customersAT.CARD_ON_FILE_SCREEN_LOADER),
          payload: false,
        });
      }
    },

    deleteCardOnFile: async (customerId, paymentMethod) => {
      let errors;

      try {
        dispatch({
          type: custNamespacer(customersAT.CARD_ON_FILE_SCREEN_LOADER),
          payload: true,
        });

        const deleteCardResponse = await customersApi.removeCardOnFile(
          customerId,
          paymentMethod
        );

        const fetchCardsResponse = await customersApi.fetchCardsOnFile(customerId);

        dispatch({
          type: custNamespacer(customersAT.SET_SAVED_CARDS_LIST),
          payload: fetchCardsResponse.data.cards.data,
        });
      } catch (e) {
        errors = e.response?.data?.error;

        dispatch({
          type: custNamespacer(customersAT.SET_SAVED_CARDS_LIST_CALL_ERROR),
          payload: e?.response?.data?.error || "Something went wrong!",
        });
      } finally {
        dispatch({
          type: custNamespacer(customersAT.CARD_ON_FILE_SCREEN_LOADER),
          payload: false,
        });

        return errors;
      }
    },

    showHideAddCardScreen: (value) => {
      dispatch({
        type: custNamespacer(customersAT.SHOW_HIDE_ADD_CARD_SCREEN),
        payload: value,
      });
      dispatch({
        type: custNamespacer(customersAT.SET_SAVE_CREDIT_CARD_CALL_ERROR),
        payload: "",
      });
    },

    setShowCommercialCustomerScreen: (value) => {
      dispatch({
        type: custNamespacer(customersAT.SHOW_COMMERCIAL_CUSTOMER_SCREEN),
        payload: value,
      });
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Customers);
