import React from "react";

const SkeletonDeviceItem = ({style, showInListLoader}) => {
  return (
    <div
      className="device-item-list"
      style={{...style, ...(showInListLoader && {borderBottom: "0px"})}}
    >
      <div className="skeleton"></div>
      <div className="skeleton"></div>
      <div className="skeleton"></div>
    </div>
  );
};

export default SkeletonDeviceItem;
