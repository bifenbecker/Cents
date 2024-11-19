import {faChevronLeft} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import React, {useMemo} from "react";
import {Progress} from "reactstrap";
import PropTypes from "prop-types";

import useTrackEvent from "../../../../../hooks/useTrackEvent";
import {
  INTERCOM_EVENTS,
  INTERCOM_EVENTS_TEMPLATES,
} from "../../../../../constants/intercom-events";

const WizardHeader = ({addLocationStep, moveToStep, title}) => {
  const {trackEvent} = useTrackEvent();
  const progress = useMemo(() => {
    return [1, 2, 3].includes(addLocationStep)
      ? Math.floor((addLocationStep / 3) * 100 - 0.1)
      : 0;
  }, [addLocationStep]);

  return (
    <>
      <div className="locations-card-header wizard-header">
        {addLocationStep !== 1 && (
          <div
            className="back-button-container"
            onClick={() => {
              trackEvent(
                INTERCOM_EVENTS.addLocation,
                INTERCOM_EVENTS_TEMPLATES.trackLocationForm,
                {
                  "Button Name": "Back",
                  "Wizard Step": addLocationStep,
                }
              );
              moveToStep(Number(addLocationStep) - 1);
            }}
          >
            <FontAwesomeIcon icon={faChevronLeft} className="back-chevron-icon" />
            <button className="btn btn-text-only cancel-button">Back</button>
          </div>
        )}
        <p>{title}</p>
      </div>
      <Progress value={progress} className="_progressbar" />
    </>
  );
};

WizardHeader.propTypes = {
  addLocationStep: PropTypes.number,
  moveToStep: PropTypes.func,
  title: PropTypes.string,
};

export default WizardHeader;
