import React from "react";
import PropTypes from "prop-types";
import cx from "classnames";

const PillButton = (props) => {
  const {children, onSelection, isSelected, className} = props;
  return (
    <button
      className={cx(
        "pill-button",
        isSelected ? "selected-pill" : "deselected-pill",
        className
      )}
      onClick={() => onSelection(!isSelected)}
    >
      {children}
    </button>
  );
};

PillButton.propTypes = {
  children: PropTypes.node.isRequired,
  onSelection: PropTypes.func.isRequired,
  isSelected: PropTypes.bool.isRequired,
  className: PropTypes.string,
};

PillButton.defaultProps = {
  isSelected: false,
};

export default PillButton;
