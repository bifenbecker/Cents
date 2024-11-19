import {createNamespacer, createReducer} from "../../../utils/reducers.js";
import actionTypes from "../../../actionTypes.js";
import _ from "lodash";

const BoGSAccountNamespacer = createNamespacer("BUSINESS_OWNER_GS_PREFERENCES");

const preferencesActionTypes = actionTypes.businessOwner.globalSettings.preferences;

const initialState = {
  preferencesList: [],
  fetchPreferencesCallInProgress: false,
  fetchPreferencesCallError: "",
  createPreferenceCallInProgress: false,
  createPreferenceCallError: "",
  removePreferenceCallInProgress: false,
  removePreferenceCallError: "",
};

const handlers = {
  [BoGSAccountNamespacer(preferencesActionTypes.ADD_PREFERENCES_CALL_PROGRESS)]: (
    state,
    action
  ) => {
    return {...state, createPreferenceCallInProgress: action.payload};
  },

  [BoGSAccountNamespacer(preferencesActionTypes.ADD_PREFERENCES_CALL_ERROR)]: (
    state,
    action
  ) => {
    return {...state, createPreferenceCallError: action.payload};
  },

  [BoGSAccountNamespacer(preferencesActionTypes.ADD_PREFERENCES)]: (state, action) => {
    return {...state, preferencesList: [...state.preferencesList, ...action.payload]};
  },

  [BoGSAccountNamespacer(preferencesActionTypes.REMOVE_PREFERENCE_CALL_PROGRESS)]: (
    state,
    action
  ) => {
    return {...state, removePreferenceCallInProgress: action.payload};
  },

  [BoGSAccountNamespacer(preferencesActionTypes.REMOVE_PREFERENCE_CALL_ERROR)]: (
    state,
    action
  ) => {
    return {...state, removePreferenceCallError: action.payload};
  },

  [BoGSAccountNamespacer(preferencesActionTypes.REMOVE_PREFERENCE)]: (state, action) => {
    const preferencesList = [...state.preferencesList];
    const index = preferencesList.findIndex((pref) => pref.id === action.payload.id);
    if (index !== -1 && preferencesList.length > 1) {
      preferencesList.splice(index, 1);
    }
    return {...state, preferencesList};
  },

  [BoGSAccountNamespacer(preferencesActionTypes.UPDATE_PREFERENCE_CALL_PROGRESS)]: (
    state,
    action
  ) => {
    return {...state, updatePreferenceCallInProgress: action.payload};
  },

  [BoGSAccountNamespacer(preferencesActionTypes.UPDATE_PREFERENCE_CALL_ERROR)]: (
    state,
    action
  ) => {
    return {...state, updatePreferenceCallError: action.payload};
  },

  [BoGSAccountNamespacer(preferencesActionTypes.UPDATE_PREFERENCE)]: (state, action) => {
    let preferencesList = state.preferencesList.map((preference) => {
      if (preference.id === action.payload.id) {
        return {...preference, ...action.payload};
      }
      return preference;
    });

    return {...state, preferencesList};
  },

  [BoGSAccountNamespacer(preferencesActionTypes.FETCH_PREFERENCES_CALL_PROGRESS)]: (
    state,
    action
  ) => {
    return {...state, fetchPreferencesCallInProgress: action.payload};
  },

  [BoGSAccountNamespacer(preferencesActionTypes.FETCH_PREFERENCES_CALL_ERROR)]: (
    state,
    action
  ) => {
    return {...state, fetchPreferencesCallError: action.payload};
  },

  [BoGSAccountNamespacer(preferencesActionTypes.FETCH_PREFERENCES)]: (state, action) => {
    return {...state, preferencesList: [...action.payload]};
  },

  [BoGSAccountNamespacer(preferencesActionTypes.REMOVE_PREFERENCE_OPTION)]: (
    state,
    action
  ) => {
    const preferencesList = _.cloneDeep(state.preferencesList);
    const optionToRemove = action.payload;
    const matchingPref = preferencesList.find(
      (pref) => pref.id === optionToRemove.businessCustomerPreferenceId
    );
    const index = matchingPref.options?.findIndex(
      (option) => option.id === optionToRemove.id
    );

    if (index !== -1 && !_.isUndefined(index)) {
      matchingPref.options.splice(index, 1);
      return {...state, preferencesList};
    }
  },

  [BoGSAccountNamespacer(preferencesActionTypes.REMOVE_PREFERENCE_OPTION_CALL_PROGRESS)]:
    (state, action) => {
      return {...state, removePreferenceOptionCallInProgress: action.payload};
    },

  [BoGSAccountNamespacer(preferencesActionTypes.REMOVE_PREFERENCE_OPTION_CALL_ERROR)]: (
    state,
    action
  ) => {
    return {...state, removePreferenceOptionCallError: action.payload};
  },

  [BoGSAccountNamespacer(preferencesActionTypes.UPDATE_PREFERENCE_OPTION)]: (
    state,
    action
  ) => {
    const preferencesList = _.cloneDeep(state.preferencesList);
    const updatedOption = action.payload;
    const matchingPref = preferencesList.find(
      (pref) => pref.id === updatedOption.businessCustomerPreferenceId
    );
    const index = matchingPref.options?.findIndex(
      (option) => option.id === updatedOption.id
    );

    if (index !== -1 && !_.isUndefined(index)) {
      matchingPref.options[index] = updatedOption;
      return {...state, preferencesList};
    }
  },

  [BoGSAccountNamespacer(preferencesActionTypes.UPDATE_PREFERENCE_OPTION_CALL_PROGRESS)]:
    (state, action) => {
      return {...state, updatePreferenceOptionCallInProgress: action.payload};
    },

  [BoGSAccountNamespacer(preferencesActionTypes.UPDATE_PREFERENCE_OPTION_CALL_ERROR)]: (
    state,
    action
  ) => {
    return {...state, updatePreferenceOptionCallError: action.payload};
  },

  [BoGSAccountNamespacer(preferencesActionTypes.ADD_PREFERENCE_OPTION)]: (
    state,
    action
  ) => {
    const option = action.payload;
    const preferencesList = _.cloneDeep(state.preferencesList);
    const matchingPreference = preferencesList.find(
      (pref) => pref.id === option.businessCustomerPreferenceId
    );

    if (!_.isUndefined(matchingPreference)) {
      matchingPreference.options.push(option);
      return {...state, preferencesList};
    }
  },

  [BoGSAccountNamespacer(preferencesActionTypes.ADD_PREFERENCE_OPTION_CALL_PROGRESS)]: (
    state,
    action
  ) => {
    return {...state, addPreferenceOptionCallInProgress: action.payload};
  },

  [BoGSAccountNamespacer(preferencesActionTypes.ADD_PREFERENCE_OPTION_CALL_ERROR)]: (
    state,
    action
  ) => {
    return {...state, addPreferenceOptionCallError: action.payload};
  },

  [BoGSAccountNamespacer(preferencesActionTypes.CHANGE_DEFAULT_OPTION_CALL_PROGRESS)]: (
    state,
    action
  ) => {
    return {...state, changeDefaultOptionCallInProgress: action.payload};
  },

  [BoGSAccountNamespacer(preferencesActionTypes.CHANGE_DEFAULT_OPTION_CALL_ERROR)]: (
    state,
    action
  ) => {
    return {...state, changeDefaultOptionCallError: action.payload};
  },
};

export default createReducer(initialState, handlers, ["BUSINESS_OWNER_GS_PREFERENCES"]);
