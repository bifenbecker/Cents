import React from "react";

import BlockingLoader from "../../../commons/blocking-loader/blocking-loader";

const MachineStats = (props) => {
  const {stats} = props;

  return (
    <div className="machine-stats-container">
      {stats?.loading ? <BlockingLoader /> : null}
      {stats?.error ? (
        <div className="error-message stats-error">{stats?.error}</div>
      ) : (
        <>
          <div className="label">Machines</div>
          <div className="stats-container">
            <div className="stats-item">
              <p className="stats-value">{stats?.data?.activeMachines || 0}</p>
              <p className="description">Active Machines</p>
            </div>
            <div className="stats-item">
              <p className="stats-value">{stats?.data?.inUseMachines || 0}</p>
              <p className="description">In Use Machines</p>
            </div>
            <div className="stats-item">
              <p className="stats-value">{stats?.data?.outOfServiceMachines || 0}</p>
              <p className="description">Out of service Machines</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default MachineStats;
