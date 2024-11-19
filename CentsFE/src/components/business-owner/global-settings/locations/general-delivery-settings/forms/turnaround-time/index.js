import React, {useState} from "react";

import {TurnAroundTimeList} from "../../../constants";

import PillButton from "../../../../../../commons/pill-button";
import TextField from "../../../../../../commons/textField/textField";

const TurnaroundTime = (props) => {
  const {selectedTime, setTurnAroundTime, resetError} = props;
  // Displays input box to enter custom turnaround time input.
  const [showCustomInput, setShowCustomInput] = useState(
    !!(selectedTime && TurnAroundTimeList.indexOf(selectedTime.toString()) < 0)
  );
  // Sets the selected turnaround time.
  const setTime = (selected, label) => {
    setShowCustomInput(selected && label === "Custom");
    resetError();
    setTurnAroundTime(selected && label !== "Custom" ? Number(label) : "");
  };
  // Sets custom turnaround time
  const setCustomTime = (evt) => {
    resetError();
    const input = evt?.target?.value?.replace(/[^\d]/g, "");
    setTurnAroundTime(Number(input) || "");
  };
  return (
    <div className="setting-container">
      <span className="setting-content-header">
        What is the minimum turnaround time for your laundry service?
      </span>
      <span className="setting-content-description">
        This will allow us to give enough time before the return delivery.
      </span>
      <div className="pill-container">
        {TurnAroundTimeList.map((item, index) => (
          <PillButton
            onSelection={(selected) => setTime(selected, item)}
            isSelected={
              item === "Custom"
                ? showCustomInput
                : (selectedTime || "").toString() === item
            }
            key={index}
          >
            {item} {item === "Custom" ? "" : " hrs"}
          </PillButton>
        ))}
      </div>
      {showCustomInput ? (
        <div className="custom-turnaround-input-container">
          <TextField
            label="Enter turnaround time(in hours)"
            className="custom-turnaround-input"
            onChange={(evt) => setCustomTime(evt)}
            value={selectedTime}
            type="number"
            min="0"
          />
        </div>
      ) : null}
    </div>
  );
};

export default TurnaroundTime;
