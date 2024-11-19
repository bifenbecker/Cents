import {connect} from "react-redux";
import Settings from "../components/business-owner/global-settings/account/settings/settings";
import actionTypes from "../actionTypes";
import _ from "lodash";
import {createNamespacer} from "../utils/reducers";
import * as accountApi from "../api/business-owner/account";

const BoGSAccountNamespacer = createNamespacer("BUSINESS_OWNER_GS_ACCOUNT_SETTINGS");
const accountSettingsAT = actionTypes.businessOwner.globalSettings.accountSettings;

const mapStateToProps = (state) => ({
  accountSettings: state.businessOwner.globalSettings.accountSettings,
});

export const fetchAccountSettings = async (dispatch) => {
  try {
    let res = await accountApi.fetchAccountSettings();

    const settings = {...res.data.settings};
    if (settings.tipSettings) {
      ["tipDollars", "tipPercentage"].forEach((tipType) => {
        for (const key in settings.tipSettings[tipType]) {
          settings.tipSettings[tipType][key] = settings.tipSettings[tipType][key].toFixed(
            tipType === "tipDollars" ? 2 : 0
          );
        }
      });
    }

    dispatch({
      type: BoGSAccountNamespacer(accountSettingsAT.SET_ACCOUNT_SETTINGS),
      payload: settings,
    });

    dispatch({
      type: BoGSAccountNamespacer(accountSettingsAT.SET_ACCOUNT_SETTINGS_ERROR),
      payload: "",
    });
  } catch (error) {
    // Set error
    dispatch({
      type: BoGSAccountNamespacer(accountSettingsAT.SET_ACCOUNT_SETTINGS_ERROR),
      payload: error?.response?.data?.error || "Something went wrong",
    });
  }
};

export const UpdateAccountSettings = async (dispatch, params) => {
  try {
    dispatch({
      type: BoGSAccountNamespacer(accountSettingsAT.SET_SETTING_SAVE_IN_PROGRESS),
      payload: true,
    });
    await accountApi.updateAccountSettings(params);
    await fetchAccountSettings(dispatch);
    dispatch({
      type: BoGSAccountNamespacer(accountSettingsAT.SET_ACCOUNT_SETTINGS_ERROR),
      payload: "",
    });
  } catch (error) {
    // Set error
    dispatch({
      type: BoGSAccountNamespacer(accountSettingsAT.SET_ACCOUNT_SETTINGS_ERROR),
      payload: error?.response?.data?.error || "Something went wrong",
    });
  }
  dispatch({
    type: BoGSAccountNamespacer(accountSettingsAT.SET_SETTING_SAVE_IN_PROGRESS),
    payload: false,
  });
};

const deleteBagNoteTag = async (dispatch, params) => {
  try {
    dispatch({
      type: BoGSAccountNamespacer(accountSettingsAT.SET_SETTING_SAVE_IN_PROGRESS),
      payload: true,
    });
    await accountApi.deleteBagNoteTag(params);
    await fetchAccountSettings(dispatch);
    dispatch({
      type: BoGSAccountNamespacer(accountSettingsAT.SET_ACCOUNT_SETTINGS_ERROR),
      payload: "",
    });
  } catch (error) {
    dispatch({
      type: BoGSAccountNamespacer(accountSettingsAT.SET_ACCOUNT_SETTINGS_ERROR),
      payload: error?.response?.data?.error || "Something went wrong",
    });
  }
  dispatch({
    type: BoGSAccountNamespacer(accountSettingsAT.SET_SETTING_SAVE_IN_PROGRESS),
    payload: false,
  });
};

const mapDispatchToProps = (dispatch) => ({
  fetchAccountSettings: async () => {
    await fetchAccountSettings(dispatch);
  },
  UpdateAccountSettings: async (params) => {
    await UpdateAccountSettings(dispatch, params);
  },
  handleTermsOfServiceUrl: (value) => {
    dispatch({
      type: BoGSAccountNamespacer(accountSettingsAT.SET_TERMS_OF_SERVICE_URL),
      payload: value.trim(),
    });
    dispatch({
      type: BoGSAccountNamespacer(accountSettingsAT.SET_ACCOUNT_SETTINGS_ERROR),
      payload: "",
    });
  },
  handleReceiptCustomMessage: (value) => {
    dispatch({
      type: BoGSAccountNamespacer(accountSettingsAT.SET_RECEIPT_CUSTOM_MESSAGE),
      payload: value,
    });
    dispatch({
      type: BoGSAccountNamespacer(accountSettingsAT.SET_ACCOUNT_SETTINGS_ERROR),
      payload: "",
    });
  },

  updateTipping: (data, makeAPICall) => {
    if (makeAPICall) {
      UpdateAccountSettings(dispatch, data);
    } else {
      // Just update data in the FE, to be updated with BE on blur
      const field = Object.keys(data)[0];
      dispatch({
        type: BoGSAccountNamespacer(accountSettingsAT.UPDATE_ACCOUNT_SETTINGS),
        payload: {
          field,
          value: data[field],
        },
      });
      dispatch({
        type: BoGSAccountNamespacer(accountSettingsAT.SET_ACCOUNT_SETTINGS_ERROR),
        payload: "",
      });
    }
  },

  updateConvenienceFee: (data, makeAPICall) => {
    if (makeAPICall) {
      UpdateAccountSettings(dispatch, data);
    } else {
      // Just update data in the FE, to be updated with BE on blur
      const field = Object.keys(data)[0];
      dispatch({
        type: BoGSAccountNamespacer(accountSettingsAT.UPDATE_ACCOUNT_SETTINGS),
        payload: {
          field,
          value: data[field],
        },
      });
      dispatch({
        type: BoGSAccountNamespacer(accountSettingsAT.SET_ACCOUNT_SETTINGS_ERROR),
        payload: "",
      });
    }
  },

  deleteBagNoteTag: (data) => {
    deleteBagNoteTag(dispatch, data);
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(Settings);
