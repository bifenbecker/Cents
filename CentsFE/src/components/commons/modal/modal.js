import React from "react";
import PropTypes from "prop-types";

function Modal(props) {
  const {isConfirmationPopup, children} = props;

  const onClickOutSide = () => {
    if (props.onClickOutSide) {
      props.onClickOutSide();
    }
  };

  return (
    <div
      className={`modal-container ${isConfirmationPopup ? "dark-background" : ""}`}
      onClick={onClickOutSide}
    >
      <div
        className={`cents-modal ${isConfirmationPopup ? "confirmation-modal-body" : ""}`}
      >
        {children}
      </div>
    </div>
  );
}

Modal.propTypes = {
  isConfirmationPopup: PropTypes.bool,
  children: PropTypes.node.isRequired,
};

Modal.defaultProps = {
  isConfirmationPopup: false,
};

export default Modal;
