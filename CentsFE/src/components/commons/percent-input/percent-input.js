import React from "react";
import TextField from "../../commons/textField/textField";
import "./_percent-input.scss";

const PercentInput = (props) => {
  const {value, label, onChange, onPercentChange, error} = props;

  const handleChange = (e) => {
    let value = e.target.value;
    value = value.replace(/[^0-9.]/g, "");
    if (!value) {
      onPercentChange("");
    } else {
      let newValue = value.split(".");
      if (value.split(".")[0]?.length > 2) {
        value = value.substring(0, 2);
      }
      if (newValue[1]?.length > 1) {
        value = newValue[0] + "." + newValue[1].substring(0, 2);
      }
      if (value.indexOf(".", value.indexOf(".") + 1) !== -1) {
        value = value.substring(0, value.length - 1);
      }
      if (Number(value) <= 100) {
        onPercentChange && onPercentChange(value);
        onChange && onChange(e);
      }
    }
  };

  return (
    <>
      <TextField
        className={`percent-input ${error ? "error-field" : ""}`}
        label={label}
        suffix={value ? "%" : ""}
        value={value || ""}
        onChange={handleChange}
      />
    </>
  );
};
export default PercentInput;
