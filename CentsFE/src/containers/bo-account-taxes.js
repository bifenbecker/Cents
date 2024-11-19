import {connect} from "react-redux";
import Taxes from "../components/business-owner/global-settings/account/taxes/taxes";
import actionTypes from "../actionTypes";
import {createNamespacer} from "../utils/reducers";
import * as taxApi from "../api/business-owner/taxes";

const BoGSAccountNamespacer = createNamespacer("BUSINESS_OWNER_GS_ACCOUNT_SETTINGS");
const accountSettingsAT = actionTypes.businessOwner.globalSettings.accountSettings;

const mapStateToProps = (state) => ({
  accountSettings: state.businessOwner.globalSettings.accountSettings,
});

const fetchTaxes = async (dispatch) => {
  try {
    let res = await taxApi.fetchTaxRates();

    dispatch({
      type: BoGSAccountNamespacer(accountSettingsAT.SET_ACCOUNT_TAXES),
      payload: res.data.taxes,
    });

    dispatch({
      type: BoGSAccountNamespacer(accountSettingsAT.SET_ACCOUNT_TAXES_ERROR),
    });
  } catch (error) {
    // Set error
    dispatch({
      type: BoGSAccountNamespacer(accountSettingsAT.SET_ACCOUNT_TAXES_ERROR),
      payload: `Something went wrong!
                ${error.message}`,
    });
  }
};

const createOrUpdateTax = async (dispatch, params) => {
  try {
    dispatch({
      type: BoGSAccountNamespacer(accountSettingsAT.SET_TAX_SAVE_IN_PROGRESS),
      payload: true,
    });

    const data = {
      name: params.name,
      rate: params.rate,
      taxAgency: params.taxAgency,
    };

    if (params.id) {
      await taxApi.updateTax(params.id, data);
    } else {
      await taxApi.addNewTaxRate(data);
    }
    await fetchTaxes(dispatch);
    dispatch({
      type: BoGSAccountNamespacer(accountSettingsAT.SET_SHOW_TAX_MODAL),
      payload: false,
    });
    dispatch({
      type: BoGSAccountNamespacer(accountSettingsAT.SET_ACCOUNT_TAXES_ERROR),
    });
  } catch (error) {
    // Set error
    dispatch({
      type: BoGSAccountNamespacer(accountSettingsAT.SET_ACCOUNT_TAXES_ERROR),
      payload: error.response?.data?.error
        ? error.response?.data?.error
        : `Something went wrong! ${error.message}`,
    });
  }

  dispatch({
    type: BoGSAccountNamespacer(accountSettingsAT.SET_TAX_SAVE_IN_PROGRESS),
    payload: false,
  });
};

const mapDispatchToProps = (dispatch) => ({
  fetchTaxes: async () => {
    await fetchTaxes(dispatch);
  },
  saveTaxChanges: async (params) => {
    await createOrUpdateTax(dispatch, params);
  },
  toggleTaxModal: (payload) => {
    dispatch({
      type: BoGSAccountNamespacer(accountSettingsAT.SET_SHOW_TAX_MODAL),
      payload,
    });
    dispatch({
      type: BoGSAccountNamespacer(accountSettingsAT.SET_ACCOUNT_TAXES_ERROR),
    });
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(Taxes);
