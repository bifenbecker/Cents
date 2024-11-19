import React from "react";
import PropTypes from "prop-types";

const Checkbox = ({
  checked,
  disabled,
  onChange,
  containerClass,
  iconClass,
  labelClass,
  ...props
}) => {
  const onChangeHandler = (e) => {
    if (!e.target.disabled) {
      onChange(e);
    }
  };

  return (
    <label className={`checkbox-input ${containerClass}`}>
      <input
        className="visually-hidden"
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChangeHandler(e)}
      />
      <span className={`checkbox-circle-icon ${iconClass}`} />
      {props.label && (
        <span className={`checkbox-label ${labelClass}`}>{props.label}</span>
      )}
    </label>
  );
};

Checkbox.propTypes = {
  checked: PropTypes.bool,
  disabled: PropTypes.bool,
  onChange: PropTypes.func,
  containerClass: PropTypes.string,
  iconClass: PropTypes.string,
  labelClass: PropTypes.string,
};

Checkbox.defaultProps = {
  checked: false,
  disabled: false,
  onChange: () => {},
  containerClass: "",
  iconClass: "",
  labelClass: "",
};

export default Checkbox;
