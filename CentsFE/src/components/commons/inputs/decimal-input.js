// @ts-nocheck
import React, {useState, useEffect} from "react";
import PropTypes from "prop-types";

import TextField from "../textField/textField";

const DecimalInput = (props) => {
  const {value, onChange, onBlur, numbersAfterDecimal, max, min, ...rest} = props;

  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    setLocalValue((state) => {
      return state !== value ? value : state;
    });
  }, [value]);

  return (
    <TextField
      value={localValue}
      onBlur={(event) => {
        setLocalValue((state) => {
          if (!state) {
            return "";
          }
          const val = isNaN(Number(state)) ? 0 : Number(state);
          return numbersAfterDecimal ? val?.toFixed(numbersAfterDecimal) : val;
        });
        if (onBlur) onBlur(event);
      }}
      onChange={(event) => {
        let newInput = event.target.value
          .replace(/[^0-9.]/g, "")
          .replace(/(\..*)\./g, "$1");
        if (!newInput) {
          setLocalValue("");
          if (onChange) onChange("");
        } else {
          // Allow only ${numbersAfterDecimal} numbers after .
          const dotIndex = newInput.indexOf(".");
          if (
            numbersAfterDecimal &&
            dotIndex >= 0 &&
            newInput.length > dotIndex + numbersAfterDecimal
          ) {
            newInput = newInput.substring(0, dotIndex + 1 + numbersAfterDecimal);
          }
          const numberInput = isNaN(Number(newInput)) ? 0 : Number(newInput);
          if ((!max || numberInput < max) && (!min || numberInput > min)) {
            let newChangedValue = isNaN(Number(newInput))
              ? 0
              : numbersAfterDecimal
              ? Number(newInput).toFixed(numbersAfterDecimal)
              : Number(newInput);
            setLocalValue(newInput === "." ? "0." : newInput);
            onChange(newChangedValue);
          }
        }
      }}
      {...rest}
    />
  );
};

DecimalInput.propTypes = {
  value: PropTypes.any,
  onChange: PropTypes.func,
  max: PropTypes.number,
  min: PropTypes.number,
  onBlur: PropTypes.func,
};

DecimalInput.defaultProps = {
  value: "",
  suffix: "",
  onChange: undefined,
  onBlur: undefined,
  max: undefined,
  min: undefined,
};

export default DecimalInput;
