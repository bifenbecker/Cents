import React, {useState, useEffect, useCallback} from "react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faTimes} from "@fortawesome/free-solid-svg-icons";

const LabelDropdown = (props) => {
  let [isPaneOpen, setIsPaneOpen] = useState(false);

  let {onClose} = props;

  const closePane = useCallback(() => {
    onClose && onClose();
    setIsPaneOpen(false);
  }, [onClose]);

  const handleOutSideClick = useCallback(() => {
    closePane();
  }, [closePane]);

  // Hook equiv of componentDidMount
  useEffect(() => {
    window.document.addEventListener("click", handleOutSideClick, false);

    return () => {
      // Component will unmount
      window.document.removeEventListener("click", handleOutSideClick, false);
    };
  }, [handleOutSideClick]);
  const _render_card = () => {
    let headerText = props.cardContent[0];
    let contentElements = props.cardContent.slice(1, props.cardContent.length);
    return (
      <div>
        {!props.withDetails ? (
          <div
            className="tasks-assign-card"
            style={{top: "-300%", width: "200px"}}
            onClick={(e) => {
              e.stopPropagation();
              e.nativeEvent.stopImmediatePropagation();
            }}
          >
            <FontAwesomeIcon
              icon={faTimes}
              className="close-icon"
              onClick={() => closePane()}
            />
            <div className="left-task-card">
              <div> {headerText} </div>
              <div className="left-locations-pane">
                {" "}
                {contentElements.map((item) => item)}{" "}
              </div>
            </div>
          </div>
        ) : (
          <div
            className="tasks-assign-card with-right-pane"
            onClick={(e) => {
              e.stopPropagation();
              e.nativeEvent.stopImmediatePropagation();
            }}
          >
            <div className="location-picker-without-footer">
              <FontAwesomeIcon
                icon={faTimes}
                className="close-icon"
                style={{top: "12px"}}
                onClick={() => closePane()}
              />
              <div
                className="left-task-card"
                style={{width: "250px", paddingLeft: "10px"}}
              >
                <div> {headerText} </div>
                <div className="left-locations-pane">
                  {" "}
                  {contentElements.map((item) => item)}{" "}
                </div>
              </div>
              <div className="right-task-card">
                <div className="right-card-header">All Selected Locations</div>
                <div className="right-card-content">{props.rightPaneContent}</div>
              </div>
            </div>
            <div className="task-assign-card-footer ">
              <div
                className="apply-buttton"
                onClick={() => {
                  setIsPaneOpen(false);
                  props.onApply && props.onApply();
                }}
              >
                {" "}
                APPLY{" "}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      className={`label-task-field-container
       clickable ${isPaneOpen ? "active" : ""} ${
        props.className ? props.className : ""
      } ${props.isDisabled ? "disabled" : ""}`}
      onClick={(e) => {
        if (props.onClick) {
          props.onClick();
        }
        e.nativeEvent.stopImmediatePropagation();
        isPaneOpen ? closePane() : setIsPaneOpen(!isPaneOpen);
      }}
    >
      <img alt="icon" src={props.icon} />
      {props.label}
      {isPaneOpen ? _render_card() : null}
    </div>
  );
};

export default LabelDropdown;
