import {faChevronLeft} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {Progress} from "reactstrap";
import React, {useMemo} from "react";
import PropTypes from "prop-types";
import cx from "classnames";

import FooterWithSave from "../footer-with-save";
import BlockingLoader from "../../../../../commons/blocking-loader/blocking-loader";

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
  } = props;

  const progress = useMemo(() => (Number(currentStep) * 100) / Number(totalSteps) - 1, [
    currentStep,
    totalSteps,
  ]);

  return (
    <>
      <div className="locations-card-header wizard-header">
        {currentStep !== 1 && (
          <div
            className="back-button-container"
            onClick={() => {
              moveToStep(Number(currentStep) - 1);
            }}
          >
            <FontAwesomeIcon icon={faChevronLeft} className="back-chevron-icon" />
            <button className="btn btn-text-only cancel-button back-button">Back</button>
          </div>
        )}
        <p>{header}</p>
      </div>
      {isLoading ? <BlockingLoader className={"loader"} /> : null}
      <Progress value={progress} className="_progressbar" />
      <div className={cx("locations-card-content", contentClassName)}>{children}</div>
      <FooterWithSave
        errorMessage={errorMessage}
        closeScreen={onCancel}
        isSaveDisabled={isSaveDisabled || isLoading}
        onSave={onSubmit}
        saveBtnLabel={totalSteps === currentStep ? "SAVE" : "NEXT"}
      />
    </>
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
};

WizardStep.defaultProps = {
  isSaveDisabled: false,
  errorMessage: "",
  isLoading: false,
  contentClassName: "",
};

export default WizardStep;
