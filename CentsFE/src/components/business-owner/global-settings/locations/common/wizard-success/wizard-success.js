import React from "react";
import PropTypes from "prop-types";
import cx from "classnames";

import exitIcon from "../../../../../../assets/images/Icon_Exit_Side_Panel.svg";
import completeLgIcon from "../../../../../../assets/images/Icon_Complete_Large.svg";

const WizardSuccess = (props) => {
  const {className, onClose, successMessage, headerText, children} = props;

  return (
    <div className={cx("locations-card-content wizard-success", className)}>
      <div className="close-icon">
        <img src={exitIcon} alt="exit" onClick={onClose} />
      </div>
      <img src={completeLgIcon} alt="complete" />
      <span className="success-message">{successMessage}</span>
      {headerText && <span className="header-text">{headerText}</span>}
      {children}
    </div>
  );
};

WizardSuccess.propTypes = {
  successMessage: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
  headerText: PropTypes.string,
  children: PropTypes.node,
};

WizardSuccess.defaultProps = {
  children: <></>,
  headerText: "",
};

export default WizardSuccess;
