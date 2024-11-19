import {createNamespacer, createReducer} from "../../../utils/reducers";
import actionTypes from "../../../actionTypes";
import _ from "lodash";

const BoGSAccountNamespacer = createNamespacer("BUSINESS_OWNER_GS_ACCOUNT_SETTINGS");
const accountSettingsAT = actionTypes.businessOwner.globalSettings.accountSettings;

const initialState = {
  accountDetails: {
    fullName: "",
    companyName: "",
    address: "",
    state: "",
    city: "",
    zipCode: "",
    phone: "",
    email: "",
    needsRegions: false,
    regions: [],
  },
  updateInProgress: false,
  fullPageError: false,
  showRegionModal: false,
  modalRegion: {},
  regionSaveInProgress: false,
  regionSaveError: "",
  errorMessage: "",
  errorFields: {
    fullName: false,
    companyName: false,
    address: false,
    state: false,
    city: false,
    zipCode: false,
    phone: false,
    email: false,
  },
  settings: {
    businessId: null,
    id: null,
    isBagTrackingEnabled: false,
    isWeightAfterProcessing: false,
    isWeightBeforeProcessing: false,
    isWeightDuringIntake: false,
    isWeightReceivingAtStore: false,
    isWeightUpOnCompletion: false,
    isCustomPreferencesEnabled: false,
    requiresEmployeeCode: false,
    requiresRack: false,
    salesWeight: "DURING_INTAKE",
    isCustomUrl: false,
    termsOfServiceUrl: "",
    receiptFooterMessage: "Thank you for your order.",
    isHangDryEnabled: false,
    hangDryInstructions: "",
  },

  settingSaveInProgress: false,
  settingsSaveError: "",
  taxes: [],
  taxSaveInProgress: false,
  taxSaveError: "",
  showTaxModal: false,
  fetchStripeConnectedAccountCallInProgress: false,
  stripeConnectedAccountCallError: "",
  stripeConnectedAccountDetails: null,
  createStripeAccountCallInProgress: false,
  createStripeAccountCallError: "",
  fetchStripeVerificationLinkCallInProgress: false,
  stripeVerificationLinkCallError: "",
  stripeVerificationLink: "",
  addBankAccountCallInProgress: false,
  addBankAccountCallError: "",
  bankAccount: null,
  fetchBankAccountCallInProgress: false,
  fetchBankAccountCallError: "",
  showModal: false,
  updateBankAccountCallInProgress: false,
  updateBankAccountCallError: "",
};

const handlers = {
  [BoGSAccountNamespacer(accountSettingsAT.SET_ACCOUNT_DETAILS)]: (state, action) => {
    return {
      ...state,
      accountDetails: action.payload,
    };
  },

  [BoGSAccountNamespacer(accountSettingsAT.UPDATE_ACCOUNT_DETAILS)]: (state, action) => {
    let accountDetails = {...state.accountDetails};
    accountDetails[action.payload.field] = action.payload.value;
    return {
      ...state,
      accountDetails,
    };
  },

  [BoGSAccountNamespacer(accountSettingsAT.RESET_ACCOUNT_DETAILS)]: (state, action) => {
    return {
      ...state,
      accountDetails: initialState.accountDetails,
    };
  },

  [BoGSAccountNamespacer(accountSettingsAT.SET_ACCOUNT_DETAILS_ERROR)]: (
    state,
    action
  ) => {
    let errorMessage = _.get(action, "payload.errorMessage") || "Something went wrong";
    return {
      ...state,
      errorMessage,
      fullPageError: action.payload.fullPageError,
      errorFields: action.payload.errorFields || {},
    };
  },

  [BoGSAccountNamespacer(accountSettingsAT.SET_ACCOUNT_DETAILS_FIELD_ERROR)]: (
    state,
    action
  ) => {
    return {
      ...state,
      errorFields: {
        ...state.errorFields,
        [action.payload.field]: action.payload.error,
      },
    };
  },

  [BoGSAccountNamespacer(accountSettingsAT.RESET_ACCOUNT_DETAILS_ERROR)]: (
    state,
    action
  ) => {
    return {
      ...state,
      errorMessage: initialState.errorMessage,
      fullPageError: initialState.fullPageError,
      errorFields: initialState.errorFields,
    };
  },

  [BoGSAccountNamespacer(accountSettingsAT.UPDATE_CALL_IN_PROGRESS)]: (state, action) => {
    return {
      ...state,
      updateInProgress: action.payload,
    };
  },

  [BoGSAccountNamespacer(accountSettingsAT.SET_SHOW_REGION_MODAL)]: (state, action) => {
    return {
      ...state,
      showRegionModal: action.payload,
    };
  },

  [BoGSAccountNamespacer(accountSettingsAT.SET_MODAL_REGION)]: (state, action) => {
    let modalRegion;
    if (!action.payload) {
      modalRegion = {
        name: "",
        districts: [],
      };
    } else {
      let region = state.accountDetails.regions.find(
        (region) => region.id === action.payload
      );
      if (!region) {
        modalRegion = {};
      } else {
        modalRegion = region;
      }
    }

    return {
      ...state,
      modalRegion,
    };
  },

  [BoGSAccountNamespacer(accountSettingsAT.ADD_NEW_DISTRICT_TO_MODAL_REGION)]: (
    state,
    action
  ) => {
    const modalRegion = {...state.modalRegion};
    if (
      modalRegion.districts &&
      (modalRegion.districts.length === 0 ||
        (modalRegion.districts[modalRegion.districts.length - 1].name &&
          modalRegion.districts[modalRegion.districts.length - 1].name.trim()))
    ) {
      const districts = modalRegion.districts.slice();
      districts.push({
        name: "",
      });
      modalRegion.districts = districts;
    } else {
      return state;
    }
    return {
      ...state,
      modalRegion,
    };
  },

  [BoGSAccountNamespacer(accountSettingsAT.SET_REGION_MODAL_TEXT_FIELD_VALUE)]: (
    state,
    action
  ) => {
    const modalRegion = {...state.modalRegion};

    if (action.payload.field === "region") {
      modalRegion.name = action.payload.value;
    } else if (action.payload.field === "district") {
      let districts = modalRegion.districts.slice();
      let updatedDistrict = {...districts[action.payload.index]};
      updatedDistrict.name = action.payload.value;
      districts[action.payload.index] = updatedDistrict;
      modalRegion.districts = districts;
    }

    return {
      ...state,
      modalRegion,
    };
  },

  [BoGSAccountNamespacer(accountSettingsAT.SET_REGION_SAVE_IN_PROGRESS)]: (
    state,
    action
  ) => {
    return {
      ...state,
      regionSaveInProgress: action.payload,
    };
  },

  [BoGSAccountNamespacer(accountSettingsAT.SET_REGION_SAVE_ERROR)]: (state, action) => {
    return {
      ...state,
      regionSaveError: action.payload,
    };
  },

  [BoGSAccountNamespacer(accountSettingsAT.SET_ACCOUNT_SETTINGS)]: (state, action) => {
    return {
      ...state,
      settings: action.payload,
      settingsCopy: action.payload,
    };
  },

  [BoGSAccountNamespacer(accountSettingsAT.UPDATE_ACCOUNT_SETTINGS)]: (state, action) => {
    return {
      ...state,
      settings: {
        ...state.settings,
        [action.payload.field]: action.payload.value,
      },
    };
  },

  [BoGSAccountNamespacer(accountSettingsAT.SET_ACCOUNT_SETTINGS_ERROR)]: (
    state,
    action
  ) => {
    if (action.payload && state.settingsCopy) {
      return {
        ...state,
        settingsSaveError: action.payload,
        settings: {...state.settingsCopy},
      };
    }
    return {
      ...state,
      settingsSaveError: action.payload,
    };
  },

  [BoGSAccountNamespacer(accountSettingsAT.SET_SETTING_SAVE_IN_PROGRESS)]: (
    state,
    action
  ) => {
    return {
      ...state,
      settingSaveInProgress: action.payload,
    };
  },

  [BoGSAccountNamespacer(accountSettingsAT.SET_ACCOUNT_TAXES)]: (state, action) => {
    const taxes = _.sortBy(action.payload, [(tax) => tax.name.toLowerCase()]);
    return {
      ...state,
      taxes,
    };
  },

  [BoGSAccountNamespacer(accountSettingsAT.SET_ACCOUNT_TAXES_ERROR)]: (state, action) => {
    return {
      ...state,
      taxSaveError: action.payload,
    };
  },

  [BoGSAccountNamespacer(accountSettingsAT.SET_TAX_SAVE_IN_PROGRESS)]: (
    state,
    action
  ) => {
    return {
      ...state,
      taxSaveInProgress: action.payload,
    };
  },

  [BoGSAccountNamespacer(accountSettingsAT.SET_SHOW_TAX_MODAL)]: (state, action) => {
    return {
      ...state,
      showTaxModal: action.payload,
    };
  },
  [BoGSAccountNamespacer(accountSettingsAT.SET_TERMS_OF_SERVICE_URL)]: (
    state,
    action
  ) => {
    return {
      ...state,
      settings: {
        ...state.settings,
        termsOfServiceUrl: action.payload,
      },
    };
  },

  [BoGSAccountNamespacer(accountSettingsAT.SET_RECEIPT_CUSTOM_MESSAGE)]: (
    state,
    action
  ) => {
    return {
      ...state,
      settings: {
        ...state.settings,
        receiptFooterMessage: action.payload,
      },
    };
  },

  [BoGSAccountNamespacer(accountSettingsAT.SET_STRIPE_CONNECTED_ACCOUNT_CALL_PROGRESS)]: (
    state,
    action
  ) => {
    return {
      ...state,
      fetchStripeConnectedAccountCallInProgress: action.payload,
    };
  },

  [BoGSAccountNamespacer(accountSettingsAT.SET_STRIPE_CONNECTED_ACCOUNT_DETAILS)]: (
    state,
    action
  ) => {
    return {
      ...state,
      stripeConnectedAccountDetails: action.payload,
    };
  },

  [BoGSAccountNamespacer(accountSettingsAT.SET_STRIPE_CONNECTED_ACCOUNT_CALL_ERROR)]: (
    state,
    action
  ) => {
    return {
      ...state,
      stripeConnectedAccountCallError: action.payload,
    };
  },

  [BoGSAccountNamespacer(accountSettingsAT.CREATE_STRIPE_ACCOUNT_CALL_PROGRESS)]: (
    state,
    action
  ) => {
    return {
      ...state,
      createStripeAccountCallInProgress: action.payload,
    };
  },

  [BoGSAccountNamespacer(accountSettingsAT.CREATE_STRIPE_ACCOUNT_CALL_ERROR)]: (
    state,
    action
  ) => {
    return {
      ...state,
      createStripeAccountCallError: action.payload,
    };
  },

  [BoGSAccountNamespacer(accountSettingsAT.SET_VERIFICATION_LINK_CALL_PROGRESS)]: (
    state,
    action
  ) => {
    return {
      ...state,
      fetchStripeVerificationLinkCallInProgress: action.payload,
    };
  },

  [BoGSAccountNamespacer(accountSettingsAT.SET_VERIFICATION_LINK_CALL_ERROR)]: (
    state,
    action
  ) => {
    return {
      ...state,
      stripeVerificationLinkCallError: action.payload,
    };
  },

  [BoGSAccountNamespacer(accountSettingsAT.SET_STRIPE_VERIFICATION_LINK)]: (
    state,
    action
  ) => {
    return {
      ...state,
      stripeVerificationLink: action.payload,
    };
  },

  [BoGSAccountNamespacer(accountSettingsAT.SET_CREATE_BANK_ACCOUNT_CALL_PROGRESS)]: (
    state,
    action
  ) => {
    return {
      ...state,
      addBankAccountCallInProgress: action.payload,
    };
  },

  [BoGSAccountNamespacer(accountSettingsAT.SET_CREATE_BANK_ACCOUNT)]: (state, action) => {
    return {
      ...state,
      bankAccount: action.payload,
    };
  },

  [BoGSAccountNamespacer(accountSettingsAT.SET_CREATE_BANK_ACCOUNT_CALL_ERROR)]: (
    state,
    action
  ) => {
    return {
      ...state,
      addBankAccountCallError: action.payload,
    };
  },

  [BoGSAccountNamespacer(accountSettingsAT.SET_FETCH_BANK_ACCOUNTS_CALL_PROGRESS)]: (
    state,
    action
  ) => {
    return {
      ...state,
      fetchBankAccountCallInProgress: action.payload,
    };
  },

  [BoGSAccountNamespacer(accountSettingsAT.SET_FETCH_BANK_ACCOUNTS_CALL_ERROR)]: (
    state,
    action
  ) => {
    return {
      ...state,
      fetchBankAccountCallError: action.payload,
    };
  },

  [BoGSAccountNamespacer(accountSettingsAT.SET_SHOW_UPDATE_BANK_MODAL)]: (
    state,
    action
  ) => {
    return {
      ...state,
      showModal: action.payload,
    };
  },

  [BoGSAccountNamespacer(accountSettingsAT.SET_UPDATE_BANK_ACCOUNT_CALL_PROGRESS)]: (
    state,
    action
  ) => {
    return {
      ...state,
      updateBankAccountCallInProgress: action.payload,
    };
  },

  [BoGSAccountNamespacer(accountSettingsAT.SET_UPDATE_BANK_ACCOUNT_CALL_ERROR)]: (
    state,
    action
  ) => {
    return {
      ...state,
      updateBankAccountCallError: action.payload,
    };
  },
};

export default createReducer(initialState, handlers, [
  "BUSINESS_OWNER_GS_ACCOUNT_SETTINGS",
]);
