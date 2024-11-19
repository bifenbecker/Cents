import React, {useState, useEffect} from "react";
import PropTypes from "prop-types";

import TextField from "../textField/textField";

const CentsInput = (props) => {
  const {value, onChange, onCentsChange, onBlur, maxLimit, className, ...rest} = props;

  const [{dollarValue}, setState] = useState({
    dollarValue: value ? (Number(value) / 100).toFixed(2) : "",
    localValue: value,
  });
  // This is to set the dollar value, if the data comes after some loading happens
  // and this component already mounts without the initial value of the data from API call.
  useEffect(() => {
    setState((state) => {
      return state.localValue !== value
        ? {
            localValue: value,
            dollarValue: value ? Number(value) / 100 : "",
          }
        : state;
    });
  }, [value]);

  return (
    <TextField
      prefix="$"
      className={`${className} non-italic-prefix`}
      value={dollarValue}
      onBlur={(event) => {
        setState((state) => ({
          ...state,
          dollarValue: state.dollarValue ? Number(state.dollarValue).toFixed(2) : "",
        }));
        if (onBlur) onBlur(event);
      }}
      onChange={(event) => {
        let newInput = event.target.value
          .replace(/[^0-9.]/g, "")
          .replace(/(\..*)\./g, "$1");
        if (!newInput) {
          onCentsChange("");
          setState({
            localValue: "",
            dollarValue: "",
          });
          if (onChange) onChange("");
        } else {
          // Allow only 2 numbers after .
          const dotIndex = newInput.indexOf(".");
          if (dotIndex >= 0 && newInput.length > dotIndex + 2) {
            newInput = newInput.substring(0, dotIndex + 1 + 2);
          }
          const numberDollarInput = isNaN(Number(newInput))
            ? 0
            : Math.floor(Number(newInput));
          if (!maxLimit || numberDollarInput < maxLimit) {
            const newLocalValue = isNaN(Number(newInput))
              ? 0
              : (Number(newInput) * 100).toFixed(0);
            setState({
              dollarValue: newInput === "." ? "0." : newInput,
              localValue: newLocalValue,
            });
            onCentsChange(newLocalValue);
            if (onChange) onChange(newInput);
          }
        }
      }}
      {...rest}
    />
  );
};

CentsInput.propTypes = {
  onCentsChange: PropTypes.func,
  value: PropTypes.any,
  onChange: PropTypes.func,
  maxLimit: PropTypes.number,
};

CentsInput.defaultProps = {
  value: "",
  suffix: "",
  onChange: undefined,
  maxLimit: undefined,
  onCentsChange: () => {},
};

export default CentsInput;
