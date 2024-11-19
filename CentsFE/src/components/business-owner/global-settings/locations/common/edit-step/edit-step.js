import React from "react";
import PropTypes from "prop-types";
import cx from "classnames";

import exitIcon from "../../../../../../assets/images/Icon_Exit_Side_Panel.svg";

import FooterWithSave from "../footer-with-save";
import BlockingLoader from "../../../../../commons/blocking-loader/blocking-loader";

const EditStep = (props) => {
  const {
    header,
    children,
    onCancel,
    onSubmit,
    isSaveDisabled,
    errorMessage,
    isLoading,
    contentClassName,
  } = props;

  return (
    <>
      <div className="locations-card-header wizard-header without-border-bottom">
        <p>{header}</p>
        <div className="close-icon">
          <img src={exitIcon} alt="exit" onClick={onCancel} />
        </div>
      </div>
      {isLoading ? <BlockingLoader className={"loader"} /> : null}
      <div className={cx("locations-card-content", contentClassName)}>{children}</div>
      <FooterWithSave
        errorMessage={errorMessage}
        closeScreen={onCancel}
        isSaveDisabled={isSaveDisabled || isLoading}
        onSave={onSubmit}
        saveBtnLabel="SAVE"
      />
    </>
  );
};

EditStep.propTypes = {
  header: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
  onCancel: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  isSaveDisabled: PropTypes.bool,
  errorMessage: PropTypes.string,
  contentClassName: PropTypes.string,
  isLoading: PropTypes.bool,
};

EditStep.defaultProps = {
  isSaveDisabled: false,
  errorMessage: "",
  contentClassName: "",
  isLoading: false,
};

export default EditStep;
