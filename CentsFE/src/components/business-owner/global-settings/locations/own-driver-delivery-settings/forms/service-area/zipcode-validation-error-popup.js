import React from "react";
import Modal from "../../../../../../commons/modal/modal";

const ZipcodeValidationErrorPopup = (props) => {
  const {
    zipCodesForDelivery,
    zipCodesForRecurringSubscription,
    setShowZipcodeValidationPopup,
  } = props;

  return (
    <Modal isConfirmationPopup>
      <div className="zipcodes-validation-popup-body">
        <p className="header">Some zip codes could not be removed</p>

        {zipCodesForDelivery?.length ? (
          <p>{`Scheduled pickups and / or deliveries will need to be completed or canceled in order to remove the following zip codes: ${zipCodesForDelivery?.join(
            ", "
          )} `}</p>
        ) : null}

        {zipCodesForRecurringSubscription?.length ? (
          <p>{`Conflicting active subscriptions will need to be canceled in order to remove the following zip codes: ${zipCodesForRecurringSubscription?.join(
            ", "
          )}`}</p>
        ) : null}

        <div className="modal-buttons-container">
          <button
            className="btn-theme btn-rounded small-button"
            onClick={() => {
              setShowZipcodeValidationPopup();
            }}
          >
            GOT IT
          </button>
        </div>
      </div>
    </Modal>
  );
};
export default ZipcodeValidationErrorPopup;
