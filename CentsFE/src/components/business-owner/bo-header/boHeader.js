import {useFlags} from "launchdarkly-react-client-sdk";
import React, {useCallback, useState} from "react";
import PropTypes from "prop-types";
import {useIntercom} from "react-use-intercom";

import avatar from "../../../assets/images/Icon_Avatar_Top_Navigation.svg";
import UploadCSVModal from "./modals/UploadCSVModal";
import ReferModal from "./modals/ReferModal";
import CartIcon from "../../../assets/images/Icon_Cart.svg";
import OuterLinkIcon from "../../../assets/images/Icon_Outer_Link.svg";
import {getFeedbackLink} from "../../../api/business-owner/account.js";
import useTrackEvent from "../../../hooks/useTrackEvent";
import {
  INTERCOM_EVENTS,
  INTERCOM_EVENTS_TEMPLATES,
} from "../../../constants/intercom-events.js";

const BoHeader = ({
  leftItems,
  middleItems,
  removeSession,
  session,
  admin,
  rightItems,
}) => {
  const {enableReferAnOperator} = useFlags();
  const {shutdown: shutdownIntercomChat} = useIntercom();
  const {trackEvent} = useTrackEvent();

  const [isUserMenuOpen, setUserMenuOpen] = useState(false);
  const [isUploadCSVModalOpen, setUploadCSVModalOpen] = useState(false);
  const [isReferModalOpen, setReferModalOpen] = useState(false);

  const toggleUserMenu = useCallback(() => {
    setUserMenuOpen(!isUserMenuOpen);
  }, [isUserMenuOpen]);

  const toggleUploadModal = useCallback(() => {
    trackEvent(INTERCOM_EVENTS.avatar, INTERCOM_EVENTS_TEMPLATES.avatar, {
      Description: "Upload Pairing CSV",
    });

    setUploadCSVModalOpen(!isUploadCSVModalOpen);
  }, [isUploadCSVModalOpen, trackEvent]);

  const toggleReferModal = useCallback(() => {
    setReferModalOpen(!isReferModalOpen);
  }, [isReferModalOpen]);

  const submitFeedback = useCallback(async () => {
    const {userId} = session;

    const res = await getFeedbackLink(userId);

    window.open(res?.data?.url, "_blank", "noopener,noreferrer");
  }, [session]);

  const getUserMenuItems = useCallback(() => {
    return (
      <>
        {!admin && <div onClick={toggleUploadModal}>Upload Pairing CSV</div>}
        <div onClick={submitFeedback}>Give your two Cents</div>
        {enableReferAnOperator && (
          <>
            <div onClick={toggleReferModal}>Refer an Operator</div>
            <hr />
          </>
        )}
        <div
          onClick={() => {
            shutdownIntercomChat();
            removeSession();
          }}
        >
          Logout
        </div>
      </>
    );
  }, [
    admin,
    enableReferAnOperator,
    removeSession,
    shutdownIntercomChat,
    submitFeedback,
    toggleReferModal,
    toggleUploadModal,
  ]);

  return (
    <div className="bo-header">
      {!admin && isUploadCSVModalOpen && (
        <UploadCSVModal isOpen={isUploadCSVModalOpen} toggleModal={toggleUploadModal} />
      )}
      {enableReferAnOperator && isReferModalOpen && (
        <ReferModal isOpen={isReferModalOpen} toggleModal={toggleReferModal} />
      )}
      {leftItems && <div className="left-container">{leftItems}</div>}
      {middleItems && <div className="middle-container">{middleItems}</div>}
      <div className="right-icons-container">
        {rightItems}
        <div className="marketplace">
          <img src={CartIcon} alt="CartIcon" />
          <a href="https://shop.trycents.com/" rel="nofollow" target="_blank">
            Cents Marketplace
          </a>
          <img src={OuterLinkIcon} alt="OuterLinkIcon" />
        </div>
        <div className="user" onClick={toggleUserMenu}>
          <img src={avatar} alt={"avatar"} />
          <div className={`user-menu-container ${isUserMenuOpen ? "" : "hidden"}`}>
            <div className="user-menu">{getUserMenuItems()}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

BoHeader.propTypes = {
  leftItems: PropTypes.array,
  middleItems: PropTypes.array,
  removeSession: PropTypes.func.isRequired,
  session: PropTypes.object.isRequired,
};

export default BoHeader;
