import {createNamespacer} from "../utils/reducers.js";
import actionTypes from "../actionTypes.js";
import apiClient from "../api/business-owner/preferences.js";
import apiClientFixed from "../api/business-owner/preferences-fixed.js";
import {connect} from "react-redux";
import Preferences from "../components/business-owner/global-settings/account/preferences/preferences.js";
import {UpdateAccountSettings, fetchAccountSettings} from "./bo-account-settings.js";

export const BoGSAccountNamespacer = createNamespacer("BUSINESS_OWNER_GS_PREFERENCES");

export const preferencesActionTypes =
  actionTypes.businessOwner.globalSettings.preferences;

const addPreferences = async (dispatch, ...preferences) => {
  dispatch({
    type: BoGSAccountNamespacer(preferencesActionTypes.ADD_PREFERENCES_CALL_PROGRESS),
    payload: true,
  });

  try {
    const response = await apiClientFixed.addPreferences(preferences);

    if (response.status === 201) {
      dispatch({
        type: BoGSAccountNamespacer(preferencesActionTypes.ADD_PREFERENCES),
        payload: response.data.preferences,
      });

      dispatch({
        type: BoGSAccountNamespacer(preferencesActionTypes.ADD_PREFERENCES_CALL_ERROR),
        payload: "",
      });
    } else {
      dispatch({
        type: BoGSAccountNamespacer(preferencesActionTypes.ADD_PREFERENCES_CALL_ERROR),
        payload: response.data || "Something went wrong!",
      });
    }
  } catch (error) {
    dispatch({
      type: BoGSAccountNamespacer(preferencesActionTypes.ADD_PREFERENCES_CALL_ERROR),
      payload: error.response?.data?.error || "Something went wrong!",
    });
  } finally {
    dispatch({
      type: BoGSAccountNamespacer(preferencesActionTypes.ADD_PREFERENCES_CALL_PROGRESS),
      payload: false,
    });
  }
};

const fetchPreferences = async (dispatch) => {
  try {
    dispatch({
      type: BoGSAccountNamespacer(preferencesActionTypes.FETCH_PREFERENCES_CALL_PROGRESS),
      payload: true,
    });

    const response = await apiClientFixed.fetchPreferences();
    const preferences = response.data.preferences;

    dispatch({
      type: BoGSAccountNamespacer(preferencesActionTypes.FETCH_PREFERENCES),
      payload: preferences,
    });

    dispatch({
      type: BoGSAccountNamespacer(preferencesActionTypes.FETCH_PREFERENCES_CALL_PROGRESS),
      payload: false,
    });

    dispatch({
      type: BoGSAccountNamespacer(preferencesActionTypes.FETCH_PREFERENCES_CALL_ERROR),
      payload: "",
    });
  } catch (error) {
    // Set error
    dispatch({
      type: BoGSAccountNamespacer(preferencesActionTypes.FETCH_PREFERENCES_CALL_ERROR),
      payload: error?.response?.data?.error || "Something went wrong",
    });
  }
};

const updatePreference = async (dispatch, preference) => {
  dispatch({
    type: BoGSAccountNamespacer(preferencesActionTypes.UPDATE_PREFERENCE_CALL_PROGRESS),
    payload: true,
  });

  try {
    const response = await apiClientFixed.updatePreference(preference);

    if (response.status === 200) {
      dispatch({
        type: BoGSAccountNamespacer(preferencesActionTypes.UPDATE_PREFERENCE),
        payload: response.data.preference,
      });

      dispatch({
        type: BoGSAccountNamespacer(preferencesActionTypes.UPDATE_PREFERENCE_CALL_ERROR),
        payload: "",
      });
    } else {
      if (response.status === 204) {
        dispatch({
          type: BoGSAccountNamespacer(
            preferencesActionTypes.UPDATE_PREFERENCE_CALL_ERROR
          ),
          payload: `nothing updated, missing ${preference}) on server`,
        });
      } else {
        dispatch({
          type: BoGSAccountNamespacer(
            preferencesActionTypes.UPDATE_PREFERENCE_CALL_ERROR
          ),
          payload: response.data || "Something went wrong!",
        });
      }
    }
  } catch (error) {
    dispatch({
      type: BoGSAccountNamespacer(preferencesActionTypes.UPDATE_PREFERENCE_CALL_ERROR),
      payload: error.response?.data?.error || "Something went wrong!",
    });
  } finally {
    dispatch({
      type: BoGSAccountNamespacer(preferencesActionTypes.UPDATE_PREFERENCE_CALL_PROGRESS),
      payload: false,
    });
  }
};

const removePreference = async (dispatch, preference) => {
  dispatch({
    type: BoGSAccountNamespacer(preferencesActionTypes.REMOVE_PREFERENCE_CALL_PROGRESS),
    payload: true,
  });

  try {
    const response = await apiClientFixed.removePreference(preference);

    if (response.status === 200) {
      dispatch({
        type: BoGSAccountNamespacer(preferencesActionTypes.REMOVE_PREFERENCE),
        payload: preference,
      });

      dispatch({
        type: BoGSAccountNamespacer(preferencesActionTypes.REMOVE_PREFERENCE_CALL_ERROR),
        payload: "",
      });
    } else {
      dispatch({
        type: BoGSAccountNamespacer(preferencesActionTypes.REMOVE_PREFERENCE_CALL_ERROR),
        payload: response.data || "Something went wrong!",
      });
    }
  } catch (error) {
    dispatch({
      type: BoGSAccountNamespacer(preferencesActionTypes.REMOVE_PREFERENCE_CALL_ERROR),
      payload: error.response?.data?.error || "Something went wrong!",
    });
  } finally {
    dispatch({
      type: BoGSAccountNamespacer(preferencesActionTypes.REMOVE_PREFERENCE_CALL_PROGRESS),
      payload: false,
    });
  }
};

const updatePreferenceOption = async (dispatch, option) => {
  dispatch({
    type: BoGSAccountNamespacer(
      preferencesActionTypes.UPDATE_PREFERENCE_OPTION_CALL_PROGRESS
    ),
    payload: true,
  });

  try {
    const response = await apiClientFixed.updateOption(option);

    if (response.status === 201) {
      dispatch({
        type: BoGSAccountNamespacer(preferencesActionTypes.UPDATE_PREFERENCE_OPTION),
        payload: option,
      });

      dispatch({
        type: BoGSAccountNamespacer(
          preferencesActionTypes.UPDATE_PREFERENCE_OPTION_CALL_ERROR
        ),
        payload: "",
      });
    } else {
      dispatch({
        type: BoGSAccountNamespacer(
          preferencesActionTypes.UPDATE_PREFERENCE_OPTION_CALL_ERROR
        ),
        payload: response.data || "Something went wrong!",
      });
    }
  } catch (error) {
    dispatch({
      type: BoGSAccountNamespacer(
        preferencesActionTypes.UPDATE_PREFERENCE_OPTION_CALL_ERROR
      ),
      payload: error.response?.data || "Something went wrong!",
    });
  } finally {
    dispatch({
      type: BoGSAccountNamespacer(
        preferencesActionTypes.UPDATE_PREFERENCE_OPTION_CALL_PROGRESS
      ),
      payload: false,
    });
  }
};

const removePreferenceOption = (option) => {
  return async (dispatch, getState) => {
    dispatch({
      type: BoGSAccountNamespacer(
        preferencesActionTypes.REMOVE_PREFERENCE_OPTION_CALL_PROGRESS
      ),
      payload: true,
    });

    try {
      const response = await apiClientFixed.removeOption(option);

      if (response.status === 200) {
        const preferencesList = getState().businessOwner.globalSettings.preferences
          .preferencesList;
        const matchingList = preferencesList.find(
          (preference) => preference.id === option.businessCustomerPreferenceId
        );

        if (matchingList?.options?.length === 2) {
          const lastOption = matchingList.options.find(
            (remainingOption) => option.id !== remainingOption.id
          );
          if (lastOption) {
            await changeDefaultOption(dispatch, lastOption);
          }
        }

        if (matchingList?.options?.length > 2 && option.isDefault) {
          await changeDefaultOption(dispatch, matchingList.options[0]);
        }

        dispatch({
          type: BoGSAccountNamespacer(preferencesActionTypes.REMOVE_PREFERENCE_OPTION),
          payload: option,
        });

        dispatch({
          type: BoGSAccountNamespacer(
            preferencesActionTypes.REMOVE_PREFERENCE_OPTION_CALL_ERROR
          ),
          payload: "",
        });
      } else {
        dispatch({
          type: BoGSAccountNamespacer(
            preferencesActionTypes.REMOVE_PREFERENCE_OPTION_CALL_ERROR
          ),
          payload: response.data || "Something went wrong!",
        });
      }
    } catch (error) {
      dispatch({
        type: BoGSAccountNamespacer(
          preferencesActionTypes.REMOVE_PREFERENCE_OPTION_CALL_ERROR
        ),
        payload: error.response?.data || "Something went wrong!",
      });
    } finally {
      dispatch({
        type: BoGSAccountNamespacer(
          preferencesActionTypes.REMOVE_PREFERENCE_OPTION_CALL_PROGRESS
        ),
        payload: false,
      });
    }
  };
};

const addPreferenceOption = async (dispatch, option) => {
  dispatch({
    type: BoGSAccountNamespacer(
      preferencesActionTypes.ADD_PREFERENCE_OPTION_CALL_PROGRESS
    ),
    payload: true,
  });

  try {
    const response = await apiClientFixed.addOption(option);

    if (response.status === 201) {
      dispatch({
        type: BoGSAccountNamespacer(preferencesActionTypes.ADD_PREFERENCE_OPTION),
        payload: response.data.option,
      });

      dispatch({
        type: BoGSAccountNamespacer(
          preferencesActionTypes.ADD_PREFERENCE_OPTION_CALL_ERROR
        ),
        payload: "",
      });
    } else {
      dispatch({
        type: BoGSAccountNamespacer(
          preferencesActionTypes.ADD_PREFERENCE_OPTION_CALL_ERROR
        ),
        payload: response.data || "Something went wrong!",
      });
    }
  } catch (error) {
    dispatch({
      type: BoGSAccountNamespacer(
        preferencesActionTypes.ADD_PREFERENCE_OPTION_CALL_ERROR
      ),
      payload: error.response?.data?.error || "Something went wrong!",
    });
  } finally {
    dispatch({
      type: BoGSAccountNamespacer(
        preferencesActionTypes.ADD_PREFERENCE_OPTION_CALL_PROGRESS
      ),
      payload: false,
    });
  }
};

const changeDefaultOption = async (dispatch, previousDefaultOption, newDefaultOption) => {
  dispatch({
    type: BoGSAccountNamespacer(
      preferencesActionTypes.CHANGE_DEFAULT_OPTION_CALL_PROGRESS
    ),
    payload: true,
  });

  try {
    const response = await apiClientFixed.updateDefaultOption({
      previousDefaultOptionId: previousDefaultOption.id,
      newDefaultOptionId:
        newDefaultOption !== undefined ? newDefaultOption.id : previousDefaultOption.id,
    });

    if (response.status === 200) {
      await fetchPreferences(dispatch);

      dispatch({
        type: BoGSAccountNamespacer(
          preferencesActionTypes.CHANGE_DEFAULT_OPTION_CALL_ERROR
        ),
        payload: "",
      });
    } else {
      dispatch({
        type: BoGSAccountNamespacer(
          preferencesActionTypes.CHANGE_DEFAULT_OPTION_CALL_ERROR
        ),
        payload: response.data || "Something went wrong!",
      });
    }
  } catch (error) {
    dispatch({
      type: BoGSAccountNamespacer(
        preferencesActionTypes.CHANGE_DEFAULT_OPTION_CALL_ERROR
      ),
      payload: error.response?.data || "Something went wrong!",
    });
  } finally {
    dispatch({
      type: BoGSAccountNamespacer(
        preferencesActionTypes.CHANGE_DEFAULT_OPTION_CALL_PROGRESS
      ),
      payload: false,
    });
  }
};

const mapStateToProps = (state) => ({
  settings: state.businessOwner.globalSettings.accountSettings.settings,
  preferencesList: state.businessOwner.globalSettings.preferences.preferencesList,
  createPreferenceCallInProgress:
    state.businessOwner.globalSettings.preferences.createPreferenceCallInProgress,
  createPreferenceCallError:
    state.businessOwner.globalSettings.preferences.createPreferenceCallError,
});

const mapDispatchToProps = (dispatch, getState) => ({
  addPreferences: (params) => addPreferences(dispatch, params),
  fetchPreferences: () => fetchPreferences(dispatch),
  updatePreference: (params) => updatePreference(dispatch, params),
  removePreference: (params) => removePreference(dispatch, params),
  updateAccountSettings: (params) => UpdateAccountSettings(dispatch, params),
  fetchAccountSettings: () => fetchAccountSettings(dispatch),
  updatePreferenceOptions: (params) => updatePreferenceOption(dispatch, params),
  removePreferenceOption: (params) => dispatch(removePreferenceOption(params)),
  addPreferenceOption: (params) => addPreferenceOption(dispatch, params),
  changeDefaultOption: (previousDefault, newDefault) =>
    changeDefaultOption(dispatch, previousDefault, newDefault),
});

export default connect(mapStateToProps, mapDispatchToProps)(Preferences);
