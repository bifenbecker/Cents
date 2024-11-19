import React, {useEffect, useState} from "react";
// importing icons
import hashIcon from "../../../../../assets/images/hash.svg";
import phoneIcon from "../../../../../assets/images/phone.svg";
import starIcon from "../../../../../assets/images/star.svg";
import cakeIcon from "../../../../../assets/images/cake.svg";
import keyIcon from "../../../../../assets/images/key.svg";
import personIcon from "../../../../../assets/images/person.svg";
import emailIcon from "../../../../../assets/images/email.svg";
//  importing common compnents
import ToggleSwitch from "../../../../commons/toggle-switch/toggleSwitch";
import BirthdayPicker from "../../../../commons/birthday-picker/birthday-picker";
import LocationAssignDropdown from "../../../../commons/location-assign-dropdown/location-assign-dropdown";
import TextField from "../../../../commons/textField/textField";
import BlockingLoader from "../../../../commons/blocking-loader/blocking-loader";
import {getParsedLocalStorageData} from "../../../../../utils/functions";
import {SESSION_ENV_KEY} from "../../../../../utils/config";
import {ROLES} from "../../../../../constants";
import Checkbox from "../../../../commons/checkbox/checkbox";
import {
  DEFAULT_INTERCOM_VALUES,
  INTERCOM_EVENTS,
  INTERCOM_EVENTS_TEMPLATES,
} from "constants/intercom-events";

const TeamMembersDetails = (props) => {
  const {
    errors,
    showHideIsManagerPopUp,
    allLocations,
    handleTeamMemberFieldChange,
    fetchActiveTeamMemberDetails,
    activeTeamMemberId,
    teamMemberDetailsError,
    activeTeamMemberDetails,
  } = props;
  const needsRegions = props.allLocations.needsRegions;

  const currentTeamMemberId = getParsedLocalStorageData(SESSION_ENV_KEY)?.teamMemberId;

  const [teamDetails, setTeamDetails] = useState({
    ...activeTeamMemberDetails,
  });
  const [teamDetailsEditInProgress, setTeamDetailsEditInProgress] = useState(false);

  useEffect(() => {
    setTeamDetails({...activeTeamMemberDetails});
  }, [activeTeamMemberDetails]);

  useEffect(() => {
    if (activeTeamMemberId) {
      fetchActiveTeamMemberDetails(activeTeamMemberId);
    }
  }, [activeTeamMemberId, fetchActiveTeamMemberDetails]);

  const setTeamDetailsField = (field, value) => {
    setTeamDetails((state) => ({
      ...state,
      [field]: value,
    }));
  };

  const currentTeamMemberRole = getParsedLocalStorageData(SESSION_ENV_KEY)?.roleName;
  const isCurrentAdmin =
    currentTeamMemberRole === ROLES.admin && teamDetails.id === currentTeamMemberId;

  const isOwnerRecord = teamDetails?.roleName === ROLES.owner;
  const isOwnerLoggedIn = currentTeamMemberRole === ROLES.owner;
  return (
    <>
      {teamMemberDetailsError ? (
        <div className="error-message"> {teamMemberDetailsError} </div>
      ) : props.teamMemberDetailsCallInProgress ? (
        <div className="loading-wrapper">
          <BlockingLoader />
        </div>
      ) : (
        <div className="team-member-form-container">
          {teamDetailsEditInProgress && <BlockingLoader />}
          <div className="input-container">
            <img src={personIcon} className="icon" alt="icon"></img>
            <TextField
              isInline={true}
              label="Name"
              className="team-member-input"
              value={teamDetails.fullName}
              error={errors.fullName}
              onChange={(e) => {
                let validatedValue = e.target.value.replace(/[^a-zA-Z .]/g, "");
                setTeamDetailsField("fullName", validatedValue.trim());
              }}
              onBlur={() =>
                handleTeamMemberFieldChange(
                  teamDetails.id,
                  "fullName",
                  teamDetails.fullName,
                  setTeamDetailsEditInProgress
                )
              }
              disabled={isOwnerRecord && !isOwnerLoggedIn}
            />
          </div>

          <div className="input-container email-container">
            <img src={emailIcon} className="icon" alt="icon"></img>
            <TextField
              isInline={true}
              label="Email"
              className="team-member-input"
              value={teamDetails.email}
              error={errors.email}
              onChange={(e) => {
                setTeamDetailsField("email", e.target.value);
              }}
              onBlur={() =>
                handleTeamMemberFieldChange(
                  teamDetails.id,
                  "email",
                  teamDetails.email,
                  setTeamDetailsEditInProgress
                )
              }
              disabled={isOwnerRecord}
            />
          </div>

          <div className="input-container">
            <img src={phoneIcon} className="icon" alt="icon"></img>
            <TextField
              isInline={true}
              label="Phone Number"
              className="team-member-input"
              value={teamDetails.phone}
              maxLength={15}
              error={errors.phone}
              onChange={(e) => {
                setTeamDetailsField("phone", e.target.value);
              }}
              onBlur={() =>
                handleTeamMemberFieldChange(
                  teamDetails.id,
                  "phone",
                  teamDetails.phone,
                  setTeamDetailsEditInProgress
                )
              }
              disabled={isOwnerRecord && !isOwnerLoggedIn}
            />
          </div>
          <div className="input-container toggle-container">
            <div className="toggle-row">
              <img src={keyIcon} className="icon" alt="icon"></img>
              <div>
                <span>{isOwnerRecord ? "Owner" : "Manager"} </span>
                {!isOwnerRecord && (
                  <ToggleSwitch
                    checked={activeTeamMemberDetails.isManager}
                    onChange={() => showHideIsManagerPopUp(true)}
                    disabled={isCurrentAdmin}
                  />
                )}
              </div>
            </div>
            <div className="toggle-row">
              {activeTeamMemberDetails.isManager && !isOwnerRecord && (
                <div className="checkbox-container">
                  <Checkbox
                    labelClass={"checkbox-margin"}
                    checked={activeTeamMemberDetails.adminAccess}
                    label="Admin Access"
                    onChange={(e) => {
                      handleTeamMemberFieldChange(
                        activeTeamMemberDetails.id,
                        "adminAccess",
                        !activeTeamMemberDetails.adminAccess,
                        setTeamDetailsEditInProgress
                      );
                      if (e.target.checked) {
                        void props.onIntercomEventTrack?.(
                          INTERCOM_EVENTS.team,
                          INTERCOM_EVENTS_TEMPLATES.team.enableAdminAccess,
                          {
                            "User ID": teamDetails.userId,
                            "Full name": teamDetails.fullName,
                            "E-mail": teamDetails.email,
                            Phone: teamDetails.phone || DEFAULT_INTERCOM_VALUES.NO_RECORD,
                            Role: teamDetails.role || DEFAULT_INTERCOM_VALUES.NO_RECORD,
                            "Role name":
                              teamDetails.roleName || DEFAULT_INTERCOM_VALUES.NO_RECORD,
                          }
                        );
                      }
                    }}
                    disabled={isCurrentAdmin}
                  />
                </div>
              )}
            </div>
          </div>

          <div className="input-container locations-container">
            <LocationAssignDropdown
              allLocations={allLocations}
              selectedLocations={
                isOwnerRecord
                  ? allLocations?.locations?.map((location) => location.id)
                  : activeTeamMemberDetails?.assignedLocations
              }
              needsRegions={needsRegions}
              onChange={(value) => {
                handleTeamMemberFieldChange(
                  activeTeamMemberDetails.id,
                  "assignedLocations",
                  value,
                  setTeamDetailsEditInProgress
                );
              }}
              label={"Assign to Location(s)"}
              disabled={isOwnerRecord}
            />
          </div>

          <div className="input-container">
            <img src={hashIcon} className="icon" alt="icon"></img>
            <TextField
              isInline={true}
              label="Employee Code"
              className="team-member-input"
              value={teamDetails.employeeCode}
              error={errors.employeeCode}
              onChange={(e) => {
                const newValidatedInput = e.target.value.replace(/[^0-9]/g, "");
                setTeamDetailsField("employeeCode", newValidatedInput);
              }}
              onBlur={() =>
                handleTeamMemberFieldChange(
                  teamDetails.id,
                  "employeeCode",
                  teamDetails.employeeCode,
                  setTeamDetailsEditInProgress
                )
              }
              disabled={isOwnerRecord && !isOwnerLoggedIn}
            />
          </div>

          <div className="input-container">
            <img src={starIcon} className="icon" alt="icon"></img>
            <TextField
              isInline={true}
              label="Role"
              className="team-member-input"
              value={teamDetails.role}
              error={errors.role}
              onChange={(e) => {
                setTeamDetailsField("role", e.target.value);
              }}
              onBlur={() =>
                handleTeamMemberFieldChange(
                  teamDetails.id,
                  "role",
                  teamDetails.role,
                  setTeamDetailsEditInProgress
                )
              }
              disabled={isOwnerRecord && !isOwnerLoggedIn}
            />
          </div>

          <div className="input-container">
            <img src={cakeIcon} className="icon" alt="icon"></img>
            <BirthdayPicker
              key={`bpicker-${activeTeamMemberDetails.id}`}
              onChange={(value) => {
                handleTeamMemberFieldChange(
                  activeTeamMemberDetails.id,
                  "birthday",
                  value,
                  setTeamDetailsEditInProgress
                );
              }}
              value={activeTeamMemberDetails.birthday}
              label="Birthday (MM/DD)"
              className="team-member-input"
              disabled={isOwnerRecord && !isOwnerLoggedIn}
            />
          </div>

          {Object.values(errors)
            .filter((error) => error)
            .map((error) => {
              return (
                error && (
                  <p className="error-message" style={{textAlign: "center"}}>
                    {error}
                  </p>
                )
              );
            })}
        </div>
      )}
    </>
  );
};

export default TeamMembersDetails;
