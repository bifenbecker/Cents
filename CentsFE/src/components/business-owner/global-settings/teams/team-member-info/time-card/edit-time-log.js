import React, {useMemo, useState, useEffect, useCallback} from "react";
import moment from "moment-timezone";
import get from "lodash/get";

import exitIcon from "../../../../../../assets/images/Icon_Exit_Side_Panel.svg";
import clockIcon from "../../../../../../assets/images/clock.svg";
import {updateTimeLog} from "../../../../../../api/business-owner/teams";

import BlockingLoader from "../../../../../commons/blocking-loader/blocking-loader";
import TimePickerWithInput from "../../../../../commons/time-picker/time-picker-with-input";
import {INTERCOM_EVENTS, INTERCOM_EVENTS_TEMPLATES} from "constants/intercom-events";

const EMPTY_VALUES = ["", null, undefined];

const EditTimeLog = (props) => {
  const {
    activeTeamMemberId,
    selectedTimeLog,
    onClose,
    fetchActiveTeamMemberDetails,
  } = props;

  const [timeLog, setTimeLog] = useState({...selectedTimeLog});
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const isSaveDisabled = useMemo(() => {
    const {checkInTime, checkOutTime} = timeLog;
    return (
      EMPTY_VALUES.some((val) => [checkInTime, checkOutTime].includes(val)) ||
      moment.utc(timeLog.checkOutTime).diff(timeLog.checkInTime, "minutes") < 0
    );
  }, [timeLog]);

  useEffect(() => {
    if (moment.utc(timeLog.checkOutTime).diff(timeLog.checkInTime, "minutes") < 0) {
      setError("Check-in time should be before checkout time");
    } else {
      setError(null);
    }
  }, [timeLog.checkOutTime, timeLog.checkInTime]);

  const updateLog = async () => {
    try {
      setError();
      setLoading(true);
      const {checkInTime, checkOutTime} = timeLog;
      await updateTimeLog(
        {teamMemberId: activeTeamMemberId, id: timeLog.id},
        {checkInTime, checkOutTime}
      );
      setLoading(false);
      fetchActiveTeamMemberDetails(activeTeamMemberId);
      void props.onIntercomEventTrack?.(
        INTERCOM_EVENTS.team,
        INTERCOM_EVENTS_TEMPLATES.team.timeCardEdit,
        {
          "Check-in time": moment(checkInTime).format("YYYY-MM-DD hh:mm"),
          "Checkout time": moment(checkOutTime).format("YYYY-MM-DD hh:mm"),
        }
      );
      onClose();
    } catch (error) {
      setError(get(error, "response.data.error", "Error while updating time log"));
      setLoading(false);
    }
  };

  const handleTimePick = (value, param) => {
    setTimeLog((prevState) => ({
      ...prevState,
      [param]: value,
    }));
  };

  return (
    <>
      {loading && <BlockingLoader />}
      <div className="locations-card-content edit-time-log">
        <div className="close-icon">
          <img src={exitIcon} alt="exit" onClick={onClose} />
        </div>
        <div className="edit-time-log-form-container">
          <div className="edit-time-log-heading">Edit Time Card Log</div>
          <div className="edit-time-log-date">
            Date:{" "}
            {timeLog.checkInTime ? moment(timeLog.checkInTime).format("MM/DD/YY") : "N/A"}
          </div>
          <div className="edit-time-log-form">
            <div className="input-container">
              <img src={clockIcon} alt="percentage" style={{marginRight: "10px"}} />
              <TimePickerWithInput
                showError
                includeMinTime
                showTimezone
                required
                key="check-in-time"
                label="Check-In Time"
                onChange={(value) => handleTimePick(value, "checkInTime")}
                value={timeLog.checkInTime}
                minTime={moment(timeLog.checkInTime).startOf("day").toISOString()}
                nextDayLabel="(+1)"
              />
            </div>
            <div className="input-container">
              <TimePickerWithInput
                showError
                showTimezone
                required
                key="check-out-time"
                label="Checkout Time"
                onChange={(value) => handleTimePick(value, "checkOutTime")}
                value={timeLog.checkOutTime}
                minTime={timeLog.checkInTime}
                nextDayLabel="(+1)"
              />
            </div>
          </div>
        </div>
      </div>
      <div className="locations-card-footer edit-time-log-footer">
        <p className="error-message">{error}</p>
        <div className="flex">
          <div className="cancel-text" onClick={onClose}>
            Cancel
          </div>
          <button
            className="btn-theme btn-rounded save-button"
            disabled={isSaveDisabled}
            onClick={updateLog}
          >
            SAVE
          </button>
        </div>
      </div>
    </>
  );
};

export default EditTimeLog;
