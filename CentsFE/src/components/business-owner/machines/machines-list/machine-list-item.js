import React from "react";
import cx from "classnames";

import {centsToDollarsDisplay} from "../../global-settings/locations/utils/location";
import {DEVICE_STATUSES_DISPLAY} from "../constants";

import SkeletonItem from "./skeleton-item";

const MachineListItem = (props) => {
  const {data, style, index} = props;
  const {machines, handleMachineClick, showInListLoader, selectedMachineId} = data;

  if (index === machines?.length) {
    return <SkeletonItem style={style} showInListLoader={showInListLoader} />;
  }
  const machine = machines[index];
  if (!machine) {
    return null;
  }

  return (
    <div
      className={cx(
        "machine-list-item",
        selectedMachineId === machine?.id && "active",
        !machine?.device?.id && "greyed-text"
      )}
      style={style}
      onClick={() => {
        handleMachineClick(machine);
      }}
    >
      <div className="text-container machine-details">
        <p className="main-text bold-text">
          {machine?.prefix}-{machine?.name}
        </p>
        <p className="sub-text">{machine?.model?.capacity}</p>
      </div>
      <div className="text-container machine-stats">
        <p className="main-text">{(machine?.avgTurnsPerDay || 0).toFixed(1)} avg TPD</p>
        <p className="sub-text">
          {centsToDollarsDisplay(machine?.avgSelfServeRevenuePerDay || 0)} avg RPD
        </p>
      </div>
      <div className="text-container machine-store-and-status">
        <p className="main-text">{machine?.store?.name}</p>
        <div className="sub-text">
          <div
            className={cx(
              "status-dot",
              machine?.device?.id && machine?.device?.status
                ? `${machine?.device?.status?.toLowerCase()}-dot`
                : ""
            )}
          />
          {machine?.device?.id
            ? DEVICE_STATUSES_DISPLAY[machine?.device?.status] || "N/A"
            : "No device paired"}
        </div>
      </div>
    </div>
  );
};

export default React.memo(MachineListItem);
