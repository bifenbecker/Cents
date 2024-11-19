import { connect } from "react-redux";
import Payments from "../components/business-owner/global-settings/account/payments/payments";
import actionTypes from "../actionTypes";
import { createNamespacer } from "../utils/reducers";
import {
  fetchStripeConnectedAccount,
  createStripeConnectedAccount,
  fetchStripeVerificationLink,
  createBankAccount,
  fetchBankAccounts,
  deleteBankAccount,
} from "../api/business-owner/account";

const BoGSAccountNamespacer = createNamespacer(
  "BUSINESS_OWNER_GS_ACCOUNT_SETTINGS"
);
const accountSettingsAT =
  actionTypes.businessOwner.globalSettings.accountSettings;

const mapStateToProps = ({
  businessOwner: {
    globalSettings: {
      accountSettings: {
        fetchStripeConnectedAccountCallInProgress,
        stripeConnectedAccountCallError,
        stripeConnectedAccountDetails,
        createStripeAccountCallInProgress,
        createStripeAccountCallError,
        fetchStripeVerificationLinkCallInProgress,
        stripeVerificationLinkCallError,
        stripeVerificationLink,
        addBankAccountCallInProgress,
        bankAccount,
        addBankAccountCallError,
        fetchBankAccountCallInProgress,
        fetchBankAccountCallError,
        showModal,
        updateBankAccountCallInProgress,
        updateBankAccountCallError,
      },
    },
  },
}) => ({
  fetchStripeConnectedAccountCallInProgress,
  stripeConnectedAccountCallError,
  stripeConnectedAccountDetails,
  createStripeAccountCallInProgress,
  createStripeAccountCallError,
  fetchStripeVerificationLinkCallInProgress,
  stripeVerificationLinkCallError,
  stripeVerificationLink,
  addBankAccountCallInProgress,
  bankAccount,
  addBankAccountCallError,
  fetchBankAccountCallInProgress,
  fetchBankAccountCallError,
  showModal,
  updateBankAccountCallInProgress,
  updateBankAccountCallError,
});

const mapDispatchToProps = (dispatch) => ({
  fetchConnectedAccount: async () => {
    dispatch({
      type: BoGSAccountNamespacer(
        accountSettingsAT.SET_STRIPE_CONNECTED_ACCOUNT_CALL_PROGRESS
      ),
      payload: true,
    });

    try {
      const response = await fetchStripeConnectedAccount();

      dispatch({
        type: BoGSAccountNamespacer(
          accountSettingsAT.SET_STRIPE_CONNECTED_ACCOUNT_DETAILS
        ),
        payload: response.data.details,
      });
    } catch (error) {
      dispatch({
        type: BoGSAccountNamespacer(
          accountSettingsAT.SET_STRIPE_CONNECTED_ACCOUNT_CALL_ERROR
        ),
        payload: error.response?.data?.error || "Something went wrong!",
      });
    } finally {
      dispatch({
        type: BoGSAccountNamespacer(
          accountSettingsAT.SET_STRIPE_CONNECTED_ACCOUNT_CALL_PROGRESS
        ),
        payload: false,
      });
    }
  },

  createConnectedAccount: async () => {
    dispatch({
      type: BoGSAccountNamespacer(
        accountSettingsAT.CREATE_STRIPE_ACCOUNT_CALL_PROGRESS
      ),
      payload: true,
    });
    try {
      const response = await createStripeConnectedAccount();
      dispatch({
        type: BoGSAccountNamespacer(
          accountSettingsAT.SET_STRIPE_CONNECTED_ACCOUNT_DETAILS
        ),
        payload: response.data.account,
      });
    } catch (error) {
      dispatch({
        type: BoGSAccountNamespacer(
          accountSettingsAT.CREATE_STRIPE_ACCOUNT_CALL_ERROR
        ),
        payload: error.response?.data?.error || "Something went wrong!",
      });
    } finally {
      dispatch({
        type: BoGSAccountNamespacer(
          accountSettingsAT.CREATE_STRIPE_ACCOUNT_CALL_PROGRESS
        ),
        payload: false,
      });
    }
  },

  fetchVerificationLink: async (linkType) => {
    dispatch({
      type: BoGSAccountNamespacer(
        accountSettingsAT.SET_VERIFICATION_LINK_CALL_PROGRESS
      ),
      payload: true,
    });

    try {
      const response = await fetchStripeVerificationLink(linkType);

      dispatch({
        type: BoGSAccountNamespacer(
          accountSettingsAT.SET_STRIPE_VERIFICATION_LINK
        ),
        payload: response.data.link.url,
      });
    } catch (error) {
      dispatch({
        type: BoGSAccountNamespacer(
          accountSettingsAT.SET_VERIFICATION_LINK_CALL_ERROR
        ),
        payload: error.response?.data?.error || "Something went wrong!",
      });
    } finally {
      dispatch({
        type: BoGSAccountNamespacer(
          accountSettingsAT.SET_VERIFICATION_LINK_CALL_PROGRESS
        ),
        payload: false,
      });
    }
  },

  addBankAccount: async (bankDetails) => {
    dispatch({
      type: BoGSAccountNamespacer(
        accountSettingsAT.SET_CREATE_BANK_ACCOUNT_CALL_PROGRESS
      ),
      payload: true,
    });

    try {
      const response = await createBankAccount(bankDetails);
      dispatch({
        type: BoGSAccountNamespacer(accountSettingsAT.SET_CREATE_BANK_ACCOUNT),
        payload: response.data.bankAccount,
      });
      dispatch({
        type: BoGSAccountNamespacer(
          accountSettingsAT.SET_CREATE_BANK_ACCOUNT_CALL_ERROR
        ),
        payload: "",
      });
    } catch (error) {
      dispatch({
        type: BoGSAccountNamespacer(
          accountSettingsAT.SET_CREATE_BANK_ACCOUNT_CALL_ERROR
        ),
        payload: error.response?.data?.error || "Something went wrong!",
      });
    } finally {
      dispatch({
        type: BoGSAccountNamespacer(
          accountSettingsAT.SET_CREATE_BANK_ACCOUNT_CALL_PROGRESS
        ),
        payload: false,
      });
    }
  },

  getBankAccount: async () => {
    dispatch({
      type: BoGSAccountNamespacer(
        accountSettingsAT.SET_FETCH_BANK_ACCOUNTS_CALL_PROGRESS
      ),
      payload: true,
    });

    try {
      const response = await fetchBankAccounts();

      dispatch({
        type: BoGSAccountNamespacer(accountSettingsAT.SET_CREATE_BANK_ACCOUNT),
        payload: response.data.bankAccounts.data[0],
      });
    } catch (error) {
      dispatch({
        type: BoGSAccountNamespacer(
          accountSettingsAT.SET_FETCH_BANK_ACCOUNTS_CALL_ERROR
        ),
        payload: error.response?.data?.error || "Something went wrong",
      });
    } finally {
      dispatch({
        type: BoGSAccountNamespacer(
          accountSettingsAT.SET_FETCH_BANK_ACCOUNTS_CALL_PROGRESS
        ),
        payload: false,
      });
    }
  },

  setShowModal: (value) => {
    dispatch({
      type: BoGSAccountNamespacer(accountSettingsAT.SET_SHOW_UPDATE_BANK_MODAL),
      payload: value,
    });
    dispatch({
      type: BoGSAccountNamespacer(
        accountSettingsAT.SET_UPDATE_BANK_ACCOUNT_CALL_ERROR
      ),
      payload: "",
    });
  },

  updateBankAccount: async (newBankDetails, prevBankId) => {
    dispatch({
      type: BoGSAccountNamespacer(
        accountSettingsAT.SET_UPDATE_BANK_ACCOUNT_CALL_PROGRESS
      ),
      payload: true,
    });
    try {
      const response = await createBankAccount(newBankDetails);
      dispatch({
        type: BoGSAccountNamespacer(accountSettingsAT.SET_CREATE_BANK_ACCOUNT),
        payload: response.data.bankAccount,
      });
      await deleteBankAccount(prevBankId);

      dispatch({
        type: BoGSAccountNamespacer(
          accountSettingsAT.SET_SHOW_UPDATE_BANK_MODAL
        ),
        payload: false,
      });
    } catch (error) {
      dispatch({
        type: BoGSAccountNamespacer(
          accountSettingsAT.SET_UPDATE_BANK_ACCOUNT_CALL_ERROR
        ),
        payload: error.response?.data?.error || "Something went wrong!",
      });
    } finally {
      dispatch({
        type: BoGSAccountNamespacer(
          accountSettingsAT.SET_UPDATE_BANK_ACCOUNT_CALL_PROGRESS
        ),
        payload: false,
      });
    }
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(Payments);
