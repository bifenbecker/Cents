import React, {useState, useCallback} from "react";
import {Button, Modal, ModalBody, ModalFooter} from "reactstrap";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import Close from "../../../../assets/images/close.svg";
import PropTypes from "prop-types";
import {faLink} from "@fortawesome/free-solid-svg-icons";
import "./refer-modal.scss";

const BUTTON_TITLE = {
  idle: "Copy Link",
  action: "Copied!",
};
const REFER_LINK = "https://www.trycents.com/refer";

const ReferModal = ({isOpen, toggleModal}) => {
  const [buttonTitle, setButtonTitle] = useState(BUTTON_TITLE.idle);
  const referModalContent = () => (
    <>
      <p className="modal-plane-content-header">Refer an operator and get a month off!</p>
      <p>
        <strong>How it works:</strong>
      </p>
      <p>
        Copy the link below and send it to a friend. When they fill in the form, make sure
        they mention you referred them.
      </p>
      <p>
        For every operator referral you bring to Cents, receive a month off your
        subscription!
      </p>
      <p className="modal-plane-content-addition">
        <sup>*</sup> Terms and conditions apply see the{" "}
        <a href={REFER_LINK} rel="nofollow" target="_blank">
          Cents referral page
        </a>{" "}
        for more details.
      </p>
    </>
  );

  const handleClickCopy = useCallback(() => {
    navigator.clipboard &&
      navigator.clipboard.writeText(REFER_LINK).then(() => {
        setButtonTitle(BUTTON_TITLE.action);
      });
    setTimeout(() => {
      setButtonTitle(BUTTON_TITLE.idle);
    }, 500);
  }, []);

  return (
    <Modal
      isOpen={isOpen}
      toggle={toggleModal}
      className="refer-link-modal"
      backdrop="static"
    >
      <span className="modal-close-button" onClick={toggleModal}>
        <img src={Close} alt="Close" width="18px" height="18px" />
      </span>
      <ModalBody>{referModalContent()}</ModalBody>
      <ModalFooter>
        <input type="text" className="refer-link-input" value={REFER_LINK} disabled />
        <Button className="btn-theme btn-transparent" onClick={handleClickCopy}>
          <FontAwesomeIcon icon={faLink} className="icon-link" /> {buttonTitle}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

ReferModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  toggleModal: PropTypes.func.isRequired,
};

export default ReferModal;
