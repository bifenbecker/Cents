import React from "react";

const SkeletonItem = ({style, showInListLoader}) => {
  return (
    <div
      className="machine-list-item"
      style={{...style, ...(showInListLoader && {borderBottom: "0px"})}}
    >
      <div className="text-container skeleton">
        <div className="skeleton"></div>
        <div className="skeleton"></div>
      </div>
      <div className="text-container skeleton">
        <div className="skeleton"></div>
        <div className="skeleton"></div>
      </div>
      <div className="text-container skeleton">
        <div className="skeleton"></div>
        <div className="skeleton"></div>
      </div>
    </div>
  );
};

export default SkeletonItem;
