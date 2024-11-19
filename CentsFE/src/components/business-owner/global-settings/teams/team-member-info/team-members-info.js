import React, {useState} from "react";
import TabSwitcher from "../../../../commons/tab-switcher/tab-switcher";
import TeamMembersDetails from "./team-members-details";
import IsManagerPopUp from "./is-manager-pop-up";
import TimeCard from "./time-card/time-card";
import EditTimeLog from "./time-card/edit-time-log";
import {RoleNameMapping} from "../../../../../constants";
import {UncontrolledPopover} from "reactstrap";
import Modal from "../../../../commons/modal/modal.js";

const TeamMembersInfo = ({
  activeTab,
  activeTeamMemberId,
  activeTeamMemberDetails,
  fetchActiveTeamMemberDetails,
  handleTeamMemberFieldChange,
  onIntercomEventTrack,
  selectedTimeLog,
  setSelectedTimeLog,
  showHideIsManagerPopUp,
  ...props
}) => {
  const [toggleThreeDotMenu, setToggleThreeDotMenu] = useState(false);
  const [showArchiveModal, setShowArchiveModal] = useState(false);

  if (selectedTimeLog) {
    return (
      <EditTimeLog
        activeTeamMemberId={activeTeamMemberId}
        fetchActiveTeamMemberDetails={fetchActiveTeamMemberDetails}
        selectedTimeLog={selectedTimeLog}
        onClose={() => {
          setSelectedTimeLog(null);
        }}
        onIntercomEventTrack={onIntercomEventTrack}
      />
    );
  }

  return (
    <>
      {props.showIsManagerPopUp && (
        <IsManagerPopUp
          onTeamMemberFieldChange={handleTeamMemberFieldChange}
          activeTeamMember={activeTeamMemberDetails}
          showHideIsManagerPopUp={showHideIsManagerPopUp}
          activeTeamMemberId={activeTeamMemberId}
          onIntercomEventTrack={onIntercomEventTrack}
        />
      )}
      <>
        <div className="locations-card-header">
          <p
            style={{
              color:
                activeTeamMemberDetails.email &&
                activeTeamMemberDetails.email.includes("@archived")
                  ? "#B1B1B1"
                  : "#000000",
            }}
          >
            {activeTeamMemberDetails.fullName}
          </p>
          {activeTeamMemberDetails?.roleName && (
            <div className="role-name-label">
              {RoleNameMapping[activeTeamMemberDetails?.roleName]}
            </div>
          )}
          {activeTeamMemberDetails.email &&
          !activeTeamMemberDetails.email.includes("@archived") ? (
            <div
              className={`location-three-dot-menu ${toggleThreeDotMenu ? "open" : ""}`}
              id="three-dot-menu-locations"
            />
          ) : null}
        </div>
        {activeTeamMemberDetails.email &&
        !activeTeamMemberDetails.email.includes("@archived") ? (
          <UncontrolledPopover
            trigger="legacy"
            placement="bottom-end"
            target="three-dot-menu-locations"
            isOpen={toggleThreeDotMenu}
            toggle={() => setToggleThreeDotMenu(!toggleThreeDotMenu)}
          >
            <p
              onClick={() => {
                setToggleThreeDotMenu(!toggleThreeDotMenu);
                props.setArchiveError("");
                setShowArchiveModal(true);
              }}
            >
              Archive Team Member
            </p>
          </UncontrolledPopover>
        ) : null}
        <div className="locations-card-content teams-content">
          <TabSwitcher
            tabs={props.tabs}
            activeTab={activeTab}
            onTabClick={props.handleTabClick}
            className="team-member-tabs"
          />
          {activeTab === "details" ? (
            <TeamMembersDetails
              allLocations={props.allLocations}
              errors={props.errors}
              activeTeamMember={props.activeTeamMember}
              handleTeamMemberFieldChange={handleTeamMemberFieldChange}
              showHideIsManagerPopUp={showHideIsManagerPopUp}
              fetchActiveTeamMemberDetails={fetchActiveTeamMemberDetails}
              activeTeamMemberId={activeTeamMemberId}
              teamMemberDetailsError={props.teamMemberDetailsError}
              activeTeamMemberDetails={activeTeamMemberDetails}
              teamMemberDetailsCallInProgress={props.teamMemberDetailsCallInProgress}
              onIntercomEventTrack={onIntercomEventTrack}
            />
          ) : (
            <TimeCard
              activeTeamMemberId={activeTeamMemberId}
              onEditClick={setSelectedTimeLog}
            />
          )}
          <div className="team-member-info-footer">
            <div>
              <div
                className={`status-dot ${
                  activeTeamMemberDetails?.checkedInLocation?.length
                    ? "blue-dot"
                    : "grey-dot"
                }`}
              ></div>
              {activeTeamMemberDetails?.checkedInLocation?.length ? (
                <p>
                  CURRENTLY CHECKED IN AT{" "}
                  {activeTeamMemberDetails?.checkedInLocation &&
                    activeTeamMemberDetails.checkedInLocation[0]}
                  .
                </p>
              ) : (
                <p>CURRENTLY NOT CHECKED IN.</p>
              )}
            </div>
          </div>
        </div>
        {showArchiveModal && (
          <Modal>
            <div className="archive-modal">
              <p>
                Are you sure you want to {!props.activeTeamMember.isDeleted && "archive"}{" "}
                {props.activeTeamMember.fullName}?<br />
                {props.activeTeamMember.isDeleted === false &&
                activeTeamMemberDetails.checkedInLocation.length > 0 ? (
                  <span>
                    {props.activeTeamMember.fullName} is currently checked in at{" "}
                    {activeTeamMemberDetails.checkedInLocation[0]}
                  </span>
                ) : null}
              </p>
              <div className="button-group">
                <div className="button-spacing">
                  <button
                    type="submit"
                    className="btn-theme btn-rounded save-button secondary-button"
                    onClick={() => {
                      setShowArchiveModal(false);
                    }}
                  >
                    CANCEL
                  </button>
                </div>
                <div className="button-spacing">
                  <button
                    type="submit"
                    className="btn-theme btn-rounded save-button primary-button"
                    onClick={() => {
                      try {
                        props.archiveTeamMember(props.activeTeamMember, true);
                      } catch (e) {
                        props.setArchiveError(e);
                      }
                    }}
                  >
                    ARCHIVE
                  </button>
                </div>
              </div>
              {props.archiveError && (
                <div className="error-message">{props.archiveError}</div>
              )}
              {props.activeTeamMember.isDeleted && setShowArchiveModal(false)}
            </div>
          </Modal>
        )}
      </>
    </>
  );
};

export default TeamMembersInfo;
