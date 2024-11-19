import ToggleSwitch from "../../../../../commons/toggle-switch/toggleSwitch.js";
import TextArea from "../../../../../commons/text-area/text-area.js";
import React, {useCallback, useEffect, useState} from "react";
import useTrackEvent from "../../../../../../hooks/useTrackEvent";
import {
  INTERCOM_EVENTS,
  INTERCOM_EVENTS_TEMPLATES,
} from "../../../../../../constants/intercom-events.js";

const HangDrySettings = ({
  isHangDryEnabled,
  hangDryInstructions,
  onSwitchToggle,
  onUpdateInstructions,
}) => {
  const {trackEvent} = useTrackEvent();

  const onChange = useCallback(
    (value) => {
      trackEvent(INTERCOM_EVENTS.settings, INTERCOM_EVENTS_TEMPLATES.settings, {
        Description: "Hang Dry Settings",
        Enabled: value,
      });

      onSwitchToggle(value);
    },
    [onSwitchToggle, trackEvent]
  );

  const [instructions, setInstructions] = useState(hangDryInstructions);

  const handleChangeInstructions = ({target: {value}}) => {
    setInstructions(value);
  };

  useEffect(() => setInstructions(hangDryInstructions), [hangDryInstructions]);

  return (
    <div className="form-section settings-section">
      <div className="form-fields-container">
        <b>Hang Dry Settings</b>
        <div className="toggle-container">
          <small>Offer hang dry service for garments</small>
          <ToggleSwitch checked={isHangDryEnabled} onChange={onChange} />
        </div>
        {isHangDryEnabled && (
          <div className="list-container">
            <div className="list-item-container">
              <small>
                Describe your hang dry service. The customer will be prompted to add a
                description of the items they want to hang dry.
              </small>
              <p className="grey-text">(300 character limit)</p>
              <TextArea
                onBlur={({target: {value}}) => onUpdateInstructions(value)}
                onChange={handleChangeInstructions}
                value={instructions}
                className="description-area"
                maxLength={300}
                placeholder="Place your hang dry garments inside a separate bag within your bag."
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HangDrySettings;
