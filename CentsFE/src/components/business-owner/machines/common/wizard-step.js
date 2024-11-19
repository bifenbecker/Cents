import {faChevronLeft} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {Progress} from "reactstrap";
import React, {useMemo} from "react";
import PropTypes from "prop-types";
import cx from "classnames";

import BlockingLoader from "../../../commons/blocking-loader/blocking-loader";

const WizardStep = (props) => {
  const {
    currentStep,
    totalSteps,
    header,
    children,
    onCancel,
    onSubmit,
    moveToStep,
    isSaveDisabled,
    errorMessage,
    isLoading,
    contentClassName,
    buttonCta,
    buttonStyle,
  } = props;

  const progress = useMemo(
    () =>
      (Number(currentStep) === 0 ? 1 : Number(currentStep) * 100) / Number(totalSteps) -
      1,
    [currentStep, totalSteps]
  );

  return (
    <div className="machines-wizard-step-container">
      <div className="machine-wizard-header">
        <div
          className="back-button-container"
          onClick={() => {
            !currentStep || currentStep === 1
              ? onCancel()
              : moveToStep(Number(currentStep) - 1);
          }}
        >
          <FontAwesomeIcon icon={faChevronLeft} className="back-chevron-icon" />
          <button className="btn btn-text-only cancel-button">Back</button>
        </div>

        <p>{header}</p>
      </div>
      {isLoading ? <BlockingLoader className={"loader"} /> : null}
      <Progress value={progress} className="_progressbar" />
      <div className={cx("machine-wizard-content", contentClassName)}>{children}</div>
      <div className="machine-wizard-footer">
        <p className="error-message">{errorMessage}</p>
        <div className="btn-container">
          <button className="btn btn-text cancel-button" onClick={onCancel}>
            Cancel
          </button>
          <button
            className="btn-theme btn-rounded save-button"
            style={buttonStyle}
            disabled={isSaveDisabled || isLoading}
            onClick={onSubmit}
          >
            {buttonCta ? buttonCta : totalSteps === currentStep ? "SAVE" : "NEXT"}
          </button>
        </div>
      </div>
    </div>
  );
};

WizardStep.propTypes = {
  currentStep: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  totalSteps: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  header: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
  onCancel: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  moveToStep: PropTypes.func.isRequired,
  isSaveDisabled: PropTypes.bool,
  errorMessage: PropTypes.string,
  isLoading: PropTypes.bool,
  contentClassName: PropTypes.string,
  buttonCta: PropTypes.string,
  buttonStyle: PropTypes.object,
};

WizardStep.defaultProps = {
  isSaveDisabled: false,
  errorMessage: "",
  isLoading: false,
  contentClassName: "",
};

export default WizardStep;
