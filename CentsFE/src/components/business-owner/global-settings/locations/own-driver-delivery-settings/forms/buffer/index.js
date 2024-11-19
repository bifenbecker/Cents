import React, {useState} from "react";

import {BufferDurationList} from "../../../constants";

import PillButton from "../../../../../../commons/pill-button";
import {DecimalInput} from "../../../../../../commons/inputs";

const Buffer = (props) => {
  const {selectedTime, setDeliveryBufferTime, resetError} = props;
  // Displays input box to enter custom delivery buffer time input.
  const standardBufferValues = BufferDurationList.map((bufferObj) => bufferObj.value);
  const [showCustomInput, setShowCustomInput] = useState(
    !!(selectedTime && !standardBufferValues.includes(Number(selectedTime)))
  );

  // Sets the selected delivery buffer time.
  const setTime = (selected, value) => {
    resetError();
    const isCustom = value === "custom";
    setShowCustomInput(selected && isCustom);
    setDeliveryBufferTime(selected && !isCustom ? Number(value) : "");
  };

  // Sets custom delivery buffer time
  const setCustomTime = (input) => {
    resetError();
    setDeliveryBufferTime(Number(input) || "");
  };

  return (
    <div className="setting-container">
      <span className="setting-content-header">
        How far in advance would you like to cut off new orders for Pickup/Delivery?
      </span>
      <span className="setting-content-description">
        Customers will not be able to schedule pickups if the current time is within the
        buffer.
      </span>
      <div className="pill-container">
        {BufferDurationList.map((item, index) => (
          <PillButton
            onSelection={(selected) => setTime(selected, item.value)}
            isSelected={
              item.label === "Custom" ? showCustomInput : selectedTime === item.value
            }
            key={index}
          >
            {item.label}
          </PillButton>
        ))}
      </div>
      {showCustomInput ? (
        <div className="custom-turnaround-input-container">
          <DecimalInput
            label="Enter buffer (in hours)"
            className="custom-turnaround-input"
            onChange={setCustomTime}
            value={selectedTime}
            min={0}
          />
        </div>
      ) : null}
    </div>
  );
};

export default Buffer;
