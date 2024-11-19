import React, {useEffect, useState, useMemo, useCallback} from "react";
import Card from "../../../commons/card/card";
import Checkbox from "../../../commons/checkbox/checkbox";
import TextField from "../../../commons/textField/textField";
import BlockingLoader from "../../../commons/blocking-loader/blocking-loader";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faPlus} from "@fortawesome/free-solid-svg-icons";
import personIcon from "../../../../assets/images/person.svg";
import emailIcon from "../../../../assets/images/email.svg";
import downloadImg from "../../../../assets/images/download.svg";
import TeamsReport from "../../../commons/reportsModal/ReportsModal";
import SearchBar from "../../../commons/expandable-search-bar/expandable-search-bar";
import TeamMembersInfo from "./team-member-info/team-members-info";
import hashIcon from "../../../../assets/images/hash.svg";
import {isEmpty} from "lodash";
import {REPORTS} from "../../../../constants/index";
import {
  INTERCOM_EVENTS,
  INTERCOM_EVENTS_TEMPLATES,
} from "../../../../constants/intercom-events";
import ListTeamMembers from "./ListTeamMembers";
import cx from "classnames";
import useTrackEvent from "hooks/useTrackEvent";
import InactiveFiltersButton from "../../../../assets/images/Icon_Filter.svg";
import {PopoverBody, UncontrolledPopover} from "reactstrap";

const AllTeamMembersList = (props) => {
  const {
    teamMembers,
    activeTeamMemberId,
    setActiveTeamMember,
    teamMembersCallInProgress,
    showNewTeamMemberWizard,
    showHideNewTeamMemberWizard,
    handleTabClick,
    setSelectedTimeLog,
    getSuggestedEmployeeCode,
  } = props;

  return (
    <>
      {!teamMembers.length && !teamMembersCallInProgress ? (
        <div title="No Items" className="common-list-item">
          <p>No team members yet. Click the '+' icon to start adding</p>
        </div>
      ) : (
        <ListTeamMembers
          teamMembers={teamMembers}
          activeTeamMemberId={activeTeamMemberId}
          onSetActiveTeamMember={setActiveTeamMember}
          onTabClick={handleTabClick}
          onSetSelectedTimeLog={setSelectedTimeLog}
          getSuggestedEmployeeCode={getSuggestedEmployeeCode}
        />
      )}
      {!teamMembersCallInProgress && (
        <div
          title="Add new team member"
          className={cx("common-list-item plus-item", {
            active: showNewTeamMemberWizard,
          })}
          onClick={() => showHideNewTeamMemberWizard(true)}
        >
          <p>+</p>
        </div>
      )}
    </>
  );
};

const SearchResults = (props) => {
  const {
    searchText,
    teamMembers,
    activeTeamMemberId,
    setActiveTeamMember,
    handleTabClick,
    setSelectedTimeLog,
    getSuggestedEmployeeCode,
  } = props;
  return searchText && teamMembers.length ? (
    <ListTeamMembers
      teamMembers={teamMembers}
      activeTeamMemberId={activeTeamMemberId}
      onSetActiveTeamMember={setActiveTeamMember}
      onTabClick={handleTabClick}
      onSetSelectedTimeLog={setSelectedTimeLog}
      getSuggestedEmployeeCode={getSuggestedEmployeeCode}
    />
  ) : (
    <div className="product-list">
      <div title="No team members search results" className="common-list-item">
        <p style={{fontStyle: "italic"}}>No Search Results.</p>
      </div>
    </div>
  );
};

const TABS = [
  {
    value: "details",
    label: "Details",
  },
  {
    value: "timeCard",
    label: "Time Card",
  },
];

const Teams = (props) => {
  const {
    getSuggestedEmployeeCode,
    fetchTeamMembers,
    showHideNewTeamMemberWizard,
    handleSearchUnmount,
    setActiveTeamMember,
    refreshTeamList,
    newTeamMemberWizardStep,
  } = props;

  //feature-flag
  const {trackEvent} = useTrackEvent();

  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState("details");
  const [selectedTimeLog, setSelectedTimeLog] = useState();
  const [showFiltersPopover, setShowFiltersPopover] = useState(false);
  const [showArchivedTeamMembers, setShowArchivedTeamMembers] = useState(false);

  const teamMembers = useMemo(() => {
    return showArchivedTeamMembers
      ? props.teamMembers
      : props.teamMembers.filter((teamMember) => {
          return teamMember.isDeleted === false;
        });
  }, [showArchivedTeamMembers, props.teamMembers]);

  useEffect(() => {
    getSuggestedEmployeeCode();
  }, [getSuggestedEmployeeCode]);

  // Hook equiv of componentDidMount
  useEffect(() => {
    fetchTeamMembers();
    setActiveTab("details");

    return () => {
      // Component will unmount
      handleSearchUnmount();
      setActiveTeamMember(null);
      showHideNewTeamMemberWizard(false);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (refreshTeamList) {
      fetchTeamMembers();
      setActiveTab("details");
      getSuggestedEmployeeCode();
    }
  }, [refreshTeamList, fetchTeamMembers, getSuggestedEmployeeCode]);

  const teamMemberOptions = useMemo(() => {
    return teamMembers.map((teamMember) => {
      return {
        label: teamMember.fullName,
        value: teamMember.id,
      };
    });
  }, [teamMembers]);

  //#region handlers && togglers
  /**
   * @param {{email: string, employeeCode: number|null, firstName:string, lastName:string}} newTeamMember
   * @param {Number} step
   */
  const handleNextStepClick = (newTeamMember, step) => {
    props.onNextClick(newTeamMember, step).then((error) => {
      if (isEmpty(error) && step === 3) {
        const {email, employeeCode, firstName, lastName} = newTeamMember;
        trackEvent(
          INTERCOM_EVENTS.team,
          INTERCOM_EVENTS_TEMPLATES.team.addNewTeamMember,
          {
            "E-mail": email,
            "Employee code": employeeCode,
            "First name": firstName,
            "Last name": lastName,
          }
        );
      }
    });
  };

  const handleTabClick = (tabValue) => {
    switch (tabValue) {
      case "details":
        setActiveTab("details");
        break;
      case "timeCard":
        setActiveTab("timeCard");
        break;
      default:
        break;
    }
  };

  const toggleModal = (showModalValue) => {
    setShowModal(showModalValue);
  };
  //#endregion handlers && togglers

  //#region getters
  const getStepHeader = (step) => {
    if (step === 1) {
      return "What’s the team member’s name?";
    } else if (step === 2) {
      return "What’s the team member’s email address?";
    } else if (step === 3) {
      return "What code would you like to assign to this team member?";
    } else {
      // Most unlikely to happen - if happens - some thing is wrong
      return "";
    }
  };

  const getStepFields = (step) => {
    if (step === 1) {
      return (
        <>
          <div className="input-container">
            <img className="icon" src={personIcon} alt={"icon"}></img>
            <TextField
              key="wizard-firstName"
              label="First Name"
              error={props.wizardErrors.firstName}
              className="teams-wizard-text-field"
              value={props.newTeamMember.firstName}
              onChange={(e) =>
                props.wizardFieldChangeHandler("firstName", e.target.value)
              }
            />
          </div>
          <div className="input-container">
            <div className="icon"></div>
            <TextField
              key="wizard-lastName"
              label="Last Name"
              error={props.wizardErrors.lastName}
              className="teams-wizard-text-field"
              value={props.newTeamMember.lastName}
              onChange={(e) => props.wizardFieldChangeHandler("lastName", e.target.value)}
            />
          </div>
        </>
      );
    } else if (step === 2) {
      return (
        <div className="input-container">
          <img className="icon" src={emailIcon} alt={"icon"}></img>
          <TextField
            key="wizard-email"
            label="Email"
            error={props.wizardErrors.email}
            className="teams-wizard-text-field"
            onChange={(e) => props.wizardFieldChangeHandler("email", e.target.value)}
          />
        </div>
      );
    } else if (step === 3) {
      return (
        <div className="input-container">
          <img className="icon" src={hashIcon} alt={"icon"}></img>
          <TextField
            key="wizard-employee-code"
            label="Employee Code"
            error={props.wizardErrors.employeeCode}
            className="teams-wizard-text-field"
            value={props.newTeamMember.employeeCode}
            onChange={(e) => {
              const newValidatedInput = e.target.value.replace(/[^0-9]/g, "");
              props.wizardFieldChangeHandler("employeeCode", newValidatedInput);
            }}
          />
        </div>
      );
    } else {
      // Most unlikely to happen - if happens - some thing is wrong
      return null;
    }
  };
  //#endregion getters

  //#region render
  const renderTeamMemberDetails = () => {
    // Show loader if we are still fetching all the team members
    if (props.teamMembersCallInProgress) {
      return <BlockingLoader />;
    }
    // If there is search field and there is no search term
    // Show on results text so that, they can search with correct data.
    if (props.searchInProgress && (props.searchText === "" || !teamMembers.length)) {
      return (
        <div className="no-search-results">
          <p>No Search Results</p>
        </div>
      );
    }

    const activeTeamMember = teamMembers?.find(
      (teamMember) => teamMember.id === props.activeTeamMemberId
    );
    if (props.activeTeamMemberDetails) {
      return teamMembers.length ? (
        <TeamMembersInfo
          allLocations={props.allLocations}
          errors={props.activeTeamMemberErrors}
          activeTeamMemberId={props.activeTeamMemberId}
          handleTeamMemberFieldChange={props.handleTeamMemberFieldChange}
          showHideIsManagerPopUp={props.showHideIsManagerPopUp}
          fetchActiveTeamMemberDetails={props.fetchActiveTeamMemberDetails}
          teamMemberDetailsCallInProgress={props.teamMemberDetailsCallInProgress}
          showIsManagerPopUp={props.showIsManagerPopUp}
          teamMemberDetailsError={props.teamMemberDetailsError}
          activeTeamMemberDetails={props.activeTeamMemberDetails}
          activeTeamMemberName={activeTeamMember?.fullName}
          tabs={TABS}
          activeTab={activeTab}
          handleTabClick={handleTabClick}
          setSelectedTimeLog={setSelectedTimeLog}
          selectedTimeLog={selectedTimeLog}
          onIntercomEventTrack={trackEvent}
          setArchiveError={props.setArchiveError}
          archiveTeamMember={props.archiveTeamMember}
          archiveError={props.archiveError}
          activeTeamMember={activeTeamMember}
          setActiveTeamMember={props.setActiveTeamMember}
        />
      ) : (
        <div className="no-search-results"> No data available </div>
      );
    }
  };

  const renderWizard = () => {
    let step = newTeamMemberWizardStep;
    return (
      <div className="teams-wizard-container">
        <div className="teams-wizard-step-container">
          <div className="header">
            <p>{getStepHeader(step)}</p>
          </div>
          {step === 3 && (
            <div className="employee-code-subheader">
              Each employee code should be unique - it is used to access and perform
              certain actions on the Cents Tablet App POS.
            </div>
          )}
          <div className="content-container">{getStepFields(step)}</div>
          <div className="buttons-container" style={{paddingTop: "32px"}}>
            <p className="error-message">
              {props.wizardApiError ||
                (props.wizardErrors.firstName && props.wizardErrors.lastName
                  ? "First name and last name are required"
                  : props.wizardErrors.firstName || props.wizardErrors.lastName) ||
                props.wizardErrors.email ||
                props.wizardErrors.employeeCode}
            </p>
            <button
              className="btn-theme btn-rounded small-button"
              onClick={() => handleNextStepClick(props.newTeamMember, step)}
            >
              NEXT
            </button>
            <p
              className="text-btn"
              onClick={() => {
                props.showHideNewTeamMemberWizard(false);
                getSuggestedEmployeeCode();
                handleTabClick("details");
              }}
            >
              Cancel
            </p>
          </div>
        </div>
      </div>
    );
  };

  const renderTeamMemberList = () => {
    const {teamMembersListError, searchInProgress} = props;

    if (!teamMembers) {
      return null;
    }

    if (teamMembersListError) {
      return (
        <div title="Error" className="common-list-item">
          <p className="error-message">{teamMembersListError}</p>
        </div>
      );
    }

    return searchInProgress ? (
      <SearchResults
        teamMembers={teamMembers}
        handleTabClick={handleTabClick}
        searchText={props.searchText}
        activeTeamMemberId={props.activeTeamMemberId}
        setActiveTeamMember={props.setActiveTeamMember}
        fetchActiveTeamMemberDetails={props.fetchActiveTeamMemberDetails}
        setSelectedTimeLog={setSelectedTimeLog}
        getSuggestedEmployeeCode={getSuggestedEmployeeCode}
      />
    ) : (
      <AllTeamMembersList
        teamMembers={teamMembers}
        activeTeamMemberId={props.activeTeamMemberId}
        setActiveTeamMember={props.setActiveTeamMember}
        teamMembersCallInProgress={props.teamMembersCallInProgress}
        showNewTeamMemberWizard={props.showNewTeamMemberWizard}
        showHideNewTeamMemberWizard={props.showHideNewTeamMemberWizard}
        fetchActiveTeamMemberDetails={props.fetchActiveTeamMemberDetails}
        handleTabClick={handleTabClick}
        setSelectedTimeLog={setSelectedTimeLog}
        getSuggestedEmployeeCode={getSuggestedEmployeeCode}
      />
    );
  };
  //#endregion render

  return (
    <Card>
      <div
        className={"bo-global-settings-content-2-column-layout bo-tasks-layout-container"}
      >
        <div className={"bo-global-settings-content-left-column"}>
          <div className="locations-card-container">
            <div className="locations-card-header">
              <p>Team</p>
              <img
                src={downloadImg}
                alt="download"
                onClick={() => {
                  setShowModal(true);
                }}
                className="teams-download-button"
              />
              <div className="teams-filter-button">
                <img id="archive-filters-icon" src={InactiveFiltersButton} />
                <UncontrolledPopover
                  trigger="legacy"
                  placement="bottom-end"
                  target="archive-filters-icon"
                  isOpen={showFiltersPopover}
                  toggle={() => setShowFiltersPopover(!showFiltersPopover)}
                >
                  <PopoverBody>FILTERS</PopoverBody>
                  <PopoverBody>
                    <span>Show archived</span>
                    <Checkbox
                      checked={showArchivedTeamMembers}
                      onChange={() => {
                        if (showFiltersPopover) {
                          setShowFiltersPopover(!showFiltersPopover);
                          setShowArchivedTeamMembers(!showArchivedTeamMembers);
                        }
                      }}
                    />
                  </PopoverBody>
                </UncontrolledPopover>
              </div>
              <FontAwesomeIcon
                icon={faPlus}
                onClick={() => props.showHideNewTeamMemberWizard(true)}
                className="teams-plus-button"
              />
            </div>
            <div className="services-tab-search-container">
              <SearchBar
                dontSearchOnClose
                className="services-list"
                setSearchInProgress={(value) => {
                  handleTabClick("details");
                  setSelectedTimeLog(null);
                  props.showHideNewTeamMemberWizard(false);
                  props.setSearchInProgress(value);
                  if (!value) {
                    fetchTeamMembers();
                  }
                }}
                searchInProgress={props.searchInProgress}
                handleSearch={props.handleTeamMemberSearch}
                value={props.searchText}
              />
            </div>
            <div className="locations-card-content teams-content">
              {props.teamMembersCallInProgress || props.wizardCallInProgress ? (
                <BlockingLoader />
              ) : (
                renderTeamMemberList()
              )}
            </div>
          </div>
        </div>
        <div className={"bo-global-settings-content-right-column"}>
          <div className="locations-card-container info-card-container">
            {props.wizardCallInProgress && <BlockingLoader />}

            {props.showNewTeamMemberWizard ? renderWizard() : renderTeamMemberDetails()}

            {showModal && (
              <TeamsReport
                showModal={showModal}
                toggleModal={toggleModal}
                report={REPORTS.TEAMS}
                teamMemberOptions={teamMemberOptions}
                onIntercomEventTrack={() =>
                  trackEvent(
                    INTERCOM_EVENTS.team,
                    INTERCOM_EVENTS_TEMPLATES.team.teamReportExport
                  )
                }
              />
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default Teams;
