import React from "react";
import PropTypes from "prop-types";

const PlusMinusButtons = (props) => {
  const {displayTime, disableMinus, setValue} = props;
  return (
    <div className="plus-minus-buttons-container">
      <div
        className={`circle-container ${disableMinus ? "disable" : null}`}
        onClick={() => {
          setValue(-1);
        }}
      >
        -
      </div>
      <span>{displayTime}</span>
      <div
        className="circle-container"
        onClick={() => {
          setValue(1);
        }}
      >
        +
      </div>
    </div>
  );
};

PlusMinusButtons.propTypes = {
  setValue: PropTypes.func,
  displayTime: PropTypes.string,
  disableMinus: PropTypes.bool,
};

export default PlusMinusButtons;
