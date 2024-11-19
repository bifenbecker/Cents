import React, {useState} from "react";
import Modal from "../../../commons/modal/modal";
import BlockingLoader from "../../../commons/blocking-loader/blocking-loader";
import {unpairDevice} from "../../../../api/business-owner/machines";

const UnpairConfirmationPopup = (props) => {
  const {machineId, dispatch, setUnpairConfirmationPopup, machineName} = props;

  const [unpairDeviceError, setUnpairDeviceError] = useState();
  const [isUnpairingDevice, setIsUnpairingDevice] = useState(false);

  const unpairDevicePoPUp = async () => {
    setIsUnpairingDevice(true);
    try {
      const unpairResponse = await unpairDevice(machineId);
      if (unpairResponse.data.success) {
        dispatch({
          type: "UPDATE_SELECTED_MACHINE_DATA",
          payload: unpairResponse?.data?.machine,
        });
        setUnpairConfirmationPopup(false);
      }
    } catch (e) {
      setUnpairDeviceError(e?.response?.data?.error || e?.message);
    } finally {
      setIsUnpairingDevice(false);
    }
  };

  const closeUnpairModal = () => {
    setUnpairConfirmationPopup(false);
  };

  return (
    <Modal isConfirmationPopup>
      {isUnpairingDevice ? <BlockingLoader /> : null}
      <div className="popup-body">
        <p>{`Are you sure you want to unpair the device from the machine ${machineName}?`}</p>
        <div className="modal-buttons-container">
          <button
            className="btn-theme btn-transparent btn-rounded small-button"
            onClick={() => {
              closeUnpairModal();
            }}
          >
            CANCEL
          </button>
          <button
            className="btn-theme btn-rounded small-button"
            onClick={() => {
              unpairDevicePoPUp();
            }}
          >
            UNPAIR
          </button>
        </div>

        {unpairDeviceError ? (
          <div className="error-message">{unpairDeviceError}</div>
        ) : null}
      </div>
    </Modal>
  );
};
export default UnpairConfirmationPopup;
