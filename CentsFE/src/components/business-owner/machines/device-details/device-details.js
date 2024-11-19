import React from "react";

import IconLocation from "../../../../assets/images/location.svg";

import {WIZARD_TYPES} from "../constants";

import StatusIndicator from "../../../commons/statusIndicator/statusIndicator";

const DeviceDetails = (props) => {
  const {deviceInfo, dispatch} = props;

  return (
    <div className="device-info-container">
      <div className="device-info-header">
        <p>{deviceInfo.name}</p>
      </div>
      <div className="device-info-body">
        <div className="info-row">
          <img alt="icon" className="icon" src={IconLocation} />
          <span>{deviceInfo.store?.name}</span>
        </div>
        {/* <button
          className="btn-theme btn-rounded setup-btn"
          onClick={() => {
            dispatch({
              type: "OPEN_WIZARD",
              payload: WIZARD_TYPES.pairDeviceToNewMachine,
            });
          }}
        >
          SET UP NEW MACHINE
        </button>
        <button
          className="btn btn-text pair-machine-btn"
          onClick={() => {
            dispatch({
              type: "OPEN_WIZARD",
              payload: WIZARD_TYPES.pairDeviceToMachine,
            });
          }}
        >
          Pair with existing machine
        </button> */}
      </div>
      <div className="device-info-footer">
        <StatusIndicator status="unpaired" />
        <span className="status">DEVICE NOT SET UP</span>
        <span className="device-info"> Device needs to be connected to a machine</span>
      </div>
    </div>
  );
};

export default DeviceDetails;
