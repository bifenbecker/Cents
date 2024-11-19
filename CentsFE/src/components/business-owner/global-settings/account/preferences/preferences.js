import IconPreferences from "../../../../../assets/images/Icon_Preferences.svg";
import ToggleSwitch from "../../../../commons/toggle-switch/toggleSwitch.js";
import PreferencesConfigurator from "./components/preference-configurator.js";
import React, {useEffect, useState} from "react";
import presets from "./custom-preferences-preset.js";
import FeatureToggle from "./components/feature-toggle.js";
import HangDrySettings from "../settings/components/hang-dry-settings.js";
import useTrackEvent from "../../../../../hooks/useTrackEvent";
import {
  INTERCOM_EVENTS,
  INTERCOM_EVENTS_TEMPLATES,
} from "../../../../../constants/intercom-events.js";

const Preferences = ({
  preferencesList,
  fetchPreferences,
  updateAccountSettings,
  fetchAccountSettings,
  settings,
  createPreferenceCallInProgress,
  createPreferenceCallError,
  addPreferences,
  updatePreference,
  updatePreferenceCallError,
  removePreference,
  updatePreferenceOptions,
  removePreferenceOption,
  addPreferenceOption,
  changeDefaultOption,
}) => {
  const {trackEvent} = useTrackEvent();

  const [preferencesListFetched, setPreferencesListFetched] = useState(false);

  useEffect(() => {
    fetchAccountSettings();
  }, [fetchAccountSettings]);

  useEffect(() => {
    const fetchList = async () => {
      await fetchPreferences();
      setPreferencesListFetched(true);
    };
    fetchList();
  }, [fetchPreferences]);

  useEffect(() => {
    if (
      settings.isCustomPreferencesEnabled &&
      preferencesList.length === 0 &&
      preferencesListFetched &&
      !createPreferenceCallInProgress
    ) {
      addPreferences(...presets);
    }
  }, [
    addPreferences,
    settings.isCustomPreferencesEnabled,
    preferencesList,
    createPreferenceCallInProgress,
    preferencesListFetched,
  ]);

  const handlePreferenceEnabledChange = (value) => {
    trackEvent(INTERCOM_EVENTS.settings, INTERCOM_EVENTS_TEMPLATES.settings, {
      Description: "Customer Preferences enabled/disabled",
      Enabled: value,
    });

    updateAccountSettings({isCustomPreferencesEnabled: value});
  };

  return (
    <div className="account-settings-container">
      <div className="form-section settings-section no-bottom-margin">
        <img alt="icon" src={IconPreferences} />
        <div className="form-fields-container">
          <b>Customer Preferences</b>
          <FeatureToggle>
            <div className="toggle-container">
              <small>
                Enable customers to set custom care preferences based on options you
                provide{" "}
              </small>
              <ToggleSwitch
                checked={settings.isCustomPreferencesEnabled}
                onChange={handlePreferenceEnabledChange}
              />
            </div>
          </FeatureToggle>
          {settings.isCustomPreferencesEnabled && (
            <PreferencesConfigurator
              onUpdatePreference={updatePreference}
              onAddPreference={addPreferences}
              onUpdatePreferenceOptions={updatePreferenceOptions}
              onRemovePreferenceOption={removePreferenceOption}
              onAddPreferenceOption={addPreferenceOption}
              onRemovePreference={removePreference}
              preferencesList={preferencesList}
              createError={createPreferenceCallError}
              createInProgress={createPreferenceCallInProgress}
              updateError={updatePreferenceCallError}
              onChangeDefaultOption={changeDefaultOption}
            />
          )}
        </div>
      </div>
      <HangDrySettings
        isHangDryEnabled={settings.isHangDryEnabled}
        hangDryInstructions={settings.hangDryInstructions}
        onSwitchToggle={(isHangDryEnabled) => updateAccountSettings({isHangDryEnabled})}
        onUpdateInstructions={(hangDryInstructions) =>
          updateAccountSettings({hangDryInstructions})
        }
      />
    </div>
  );
};

export default Preferences;
