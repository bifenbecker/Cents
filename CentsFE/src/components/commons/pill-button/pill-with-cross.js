import React from "react";
import PropTypes from "prop-types";
import cx from "classnames";

import closeImg from "../../../assets/images/close.svg";

const PillWithCross = (props) => {
  const {children, className, onClose} = props;
  return (
    <div className={cx("pill-button", className)}>
      {children}
      <img
        alt="icon"
        src={closeImg}
        style={{width: 10, height: 10}}
        onClick={() => onClose()}
      />
    </div>
  );
};

PillWithCross.propTypes = {
  children: PropTypes.node.isRequired,
  onClose: PropTypes.func.isRequired,
  className: PropTypes.string,
};

export default PillWithCross;
