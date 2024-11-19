import {
  DEFAULT_INTERCOM_VALUES,
  INTERCOM_EVENTS,
  INTERCOM_EVENTS_TEMPLATES,
} from "../../../../../constants/intercom-events";
import React from "react";
import Modal from "../../../../commons/modal/modal";
import PropTypes from "prop-types";

const IsManagerPopUp = (props) => {
  const {activeTeamMember, showHideIsManagerPopUp} = props;

  const handleConfirm = () => {
    const {isManager, fullName, email, phone, roleName} = activeTeamMember;

    props.onTeamMemberFieldChange(props.activeTeamMemberId, "isManager", !isManager);

    if (!activeTeamMember.isManager) {
      void props.onIntercomEventTrack?.(
        INTERCOM_EVENTS.team,
        INTERCOM_EVENTS_TEMPLATES.team.enableManager,
        {
          "Full name": fullName,
          "E-mail": email,
          Phone: phone || DEFAULT_INTERCOM_VALUES.NO_RECORD,
          Role: roleName || DEFAULT_INTERCOM_VALUES.NO_RECORD,
        }
      );
    }
    showHideIsManagerPopUp(false);
  };

  return (
    <Modal>
      <div className="admin-access-pop-up-container">
        <p>
          {activeTeamMember.isManager
            ? "By revoking Manager Access, this team member can not login on next attempt."
            : "With Manager Access, this team member will be able to access the manager portal."}
        </p>
        <button className="btn-theme btn-rounded small-button" onClick={handleConfirm}>
          OK
        </button>
        <p
          className="text-btn"
          onClick={() => {
            showHideIsManagerPopUp(false);
          }}
        >
          Cancel
        </p>
      </div>
    </Modal>
  );
};

IsManagerPopUp.propTypes = {
  onTeamMemberFieldChange: PropTypes.func,
  activeTeamMember: PropTypes.shape({
    adminAccess: PropTypes.bool,
    assignedLocations: PropTypes.array,
    birthday: PropTypes.string,
    checkedInLocation: PropTypes.array,
    email: PropTypes.string,
    employeeCode: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    fullName: PropTypes.string,
    id: PropTypes.number,
    isManager: PropTypes.bool,
    phone: PropTypes.string,
    role: PropTypes.string,
    roleName: PropTypes.string,
    userId: PropTypes.number,
  }),
  showHideIsManagerPopUp: PropTypes.bool,
  activeTeamMemberId: PropTypes.number,
  onIntercomEventTrack: PropTypes.func,
};

IsManagerPopUp.defaultProps = {};

export default IsManagerPopUp;
