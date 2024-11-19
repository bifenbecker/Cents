import React from "react";

const SkeletonTurnItem = (props) => {
  const {style, showInListLoader} = props;

  return (
    <div
      className="turn-item-wrapper"
      style={{...style, ...(showInListLoader && {borderBottom: "0px"})}}
    >
      <div className="turn-col turn-col-code">
        <div className="skeleton"></div>
      </div>
      <div className="turn-col turn-col-created skeleton">
        <div className="skeleton"></div>
      </div>
      <div className="turn-col turn-col-type skeleton">
        <div className="skeleton"></div>
      </div>
      <div className="turn-col turn-col-arrow skeleton">
        <div className="skeleton"></div>
      </div>
    </div>
  );
};

export default SkeletonTurnItem;
