import React from "react";
import PropTypes from "prop-types";

function ServicePricingModal({onClick, onCancel, cancelMessage}) {
  return (
    <div className="service-pop-container">
      <div className="service-cents">
        <div>
          <p>{cancelMessage}</p>
          <div className="modal-buttons-container">
            <button className="btn-theme btn-rounded" onClick={onClick}>
              CONFIRM
            </button>
            <button className="btn btn-text-only cancel-button" onClick={onCancel}>
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

ServicePricingModal.propTypes = {
  onClick: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};

ServicePricingModal.defaultProps = {
  onClick: () => {},
  onCancel: () => {},
};

export default ServicePricingModal;
