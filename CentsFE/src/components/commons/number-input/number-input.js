import React from "react";

import TextField from "../textField/textField";
import PropTypes from "prop-types";

const NumberInput = ({value, max, onNumberChange, onChange, ...rest}) => {
  const handleChange = (e) => {
    const value = e.target.value?.replace(/[^0-9.]/g, "");
    onChange && onChange(e);
    if (value === "") {
      onNumberChange && onNumberChange(null);
    } else if ((!max || Number(value) <= Number(max)) && Number(value) !== 0) {
      onNumberChange && onNumberChange(Number(value));
    }
  };
  return <TextField {...rest} value={value || ""} onChange={handleChange} />;
};

NumberInput.proptype = {
  max: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onNumberChange: PropTypes.func,
  onChange: PropTypes.func,
};
export default NumberInput;
