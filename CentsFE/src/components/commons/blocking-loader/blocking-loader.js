import React from "react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faSpinner} from "@fortawesome/free-solid-svg-icons";

function BlockingLoader(props) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        position: "absolute",
        alignItems: "center",
        justifyContent: "center",
        background: props.error ? "rgba(255,255,255,0.8)" : "rgba(255,255,255,0.5)",
        zIndex: "50",
      }}
      {...props}
    >
      {props.error ? (
        <p className="error-message mr-3 ml-3 text-center">{props.error}</p>
      ) : (
        <FontAwesomeIcon icon={faSpinner} spin />
      )}
    </div>
  );
}

export default BlockingLoader;
