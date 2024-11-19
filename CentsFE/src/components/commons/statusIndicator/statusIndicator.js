import React from "react";

function StatusIndicator(props) {
  let statusColors = props.statusColors || {
    paired: "#3790F4",
    online: "#3790F4",
    unpaired: "#FF9900",
    inactive: "#AAAAAA",
    offline: "#B00020",
    in_use: "#3EA900",
    device_unpaired: "#AAAAAA",
  };

  return (
    <div
      style={{
        background: statusColors[props.status?.toLowerCase()] || "purple",
        width: props.size || "8px",
        height: props.size || "8px",
        borderRadius: "50%",
      }}
      className={props.className}
      title={props.status}
    ></div>
  );
}

export default StatusIndicator;
