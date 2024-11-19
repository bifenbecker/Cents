import React from "react";
import PropTypes from "prop-types";

function ServicePricingModal({onClick, onCancel}) {
  return (
    <div className="service-pop-container">
      <div className="service-cents">
        <div>
          <p>
            Service pricing and availability must be set in order to offer pickup and
            delivery service. If you exit now you will be able to set it later.
          </p>
          <div className="modal-buttons-container">
            <button className="btn-theme btn-rounded" onClick={onClick}>
              OK
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
