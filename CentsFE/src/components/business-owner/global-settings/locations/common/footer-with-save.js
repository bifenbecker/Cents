import React from "react";

const FooterWithSave = (props) => {
  const {
    errorMessage,
    closeScreen,
    isSaveDisabled,
    onSave,
    saveBtnLabel = "SAVE",
  } = props;

  return (
    <div className="locations-card-footer">
      <p className="error-message">{errorMessage}</p>
      <div className="btn-container">
        <button className="btn btn-text cancel-button" onClick={closeScreen}>
          Cancel
        </button>
        <button
          className="btn-theme btn-rounded save-button"
          disabled={isSaveDisabled}
          onClick={onSave}
        >
          {saveBtnLabel}
        </button>
      </div>
    </div>
  );
};

export default FooterWithSave;
