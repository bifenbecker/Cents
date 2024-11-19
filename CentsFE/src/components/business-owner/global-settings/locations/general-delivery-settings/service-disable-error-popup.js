import React from "react";
import Modal from "../../../../commons/modal/modal";

const ServiceDisableErrorPopup = ({setShowConfirmationPopup}) => {
  const onClose = () => {
    setShowConfirmationPopup(false);
  };

  return (
    <Modal isConfirmationPopup>
      <div className="zipcodes-validation-popup-body">
        <p className="header">Selected service option cannot be disabled</p>

        <p>
          You currently have some active subscriptions which must be completed or
          cancelled before you can disable the selected service.
        </p>

        <div className="modal-buttons-container">
          <button className="btn-theme btn-rounded small-button" onClick={onClose}>
            GOT IT
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ServiceDisableErrorPopup;
