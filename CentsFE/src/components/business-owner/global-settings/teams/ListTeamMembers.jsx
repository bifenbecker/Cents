import Checkbox from "components/commons/checkbox/checkbox";
import React from "react";
import PropTypes from "prop-types";
import cx from "classnames";

const ListTeamMembers = (props) => {
  const {
    teamMembers,
    activeTeamMemberId,
    onSetActiveTeamMember,
    onTabClick,
    onSetSelectedTimeLog,
    getSuggestedEmployeeCode,
  } = props;

  return teamMembers.map((member) => {
    return (
      <div
        key={member.id}
        title={member.fullName}
        className={cx("common-list-item", {
          active: activeTeamMemberId === member.id,
        })}
        onClick={() => {
          if (activeTeamMemberId !== member.id) {
            getSuggestedEmployeeCode();
            onSetActiveTeamMember(member.id);
            onTabClick("details");
            onSetSelectedTimeLog(null);
          }
        }}
      >
        <Checkbox checked={activeTeamMemberId === member.id} />
        <p>{member.fullName}</p>
        {member.isDeleted && <span className="archived-tag">ARCHIVED</span>}
      </div>
    );
  });
};

ListTeamMembers.propTypes = {
  teamMembers: PropTypes.array,
  activeTeamMemberId: PropTypes.number,
  onSetActiveTeamMember: PropTypes.func,
  onTabClick: PropTypes.func,
  onSetSelectedTimeLog: PropTypes.func,
};

ListTeamMembers.defaultProps = {
  teamMembers: [],
  activeTeamMemberId: null,
  onSetActiveTeamMember: () => {},
  onTabClick: () => {},
  onSetSelectedTimeLog: () => {},
};

export default ListTeamMembers;
