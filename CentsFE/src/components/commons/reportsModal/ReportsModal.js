import React, {useState} from "react";

// Icons
import calendarSidePanelImg from "../../../assets/images/calendarSidePanel.svg";
import closeImg from "../../../assets/images/close.svg";
import personIcon from "../../../assets/images/person.svg";

// Components & Libraries
import {Modal as TeamsReportModal, ModalBody as TeamsReportModalBody} from "reactstrap";
import moment from "moment-timezone";
import ExcelJS from "exceljs/dist/es5/exceljs.browser.js";
import * as FileSaver from "file-saver";
import get from "lodash/get";

// API
import {fetchTeamMembersReport} from "../../../api/business-owner/teams";
import {fetchTasksReport} from "../../../api/business-owner/taskManager";

import DateRangePicker from "../date-range/date-range";
import MultiSelectWithInput from "../multi-select-with-input/multi-select-with-input";
import {REPORTS} from "./../../../constants/index";

const ReportsModal = ({showModal, toggleModal, report, teamMemberOptions, ...props}) => {
  const [selectedTeamMembers, setSelectedTeamMembers] = useState(
    teamMemberOptions?.map(({value}) => value) || []
  );
  const [dates, setDates] = useState({
    dateRange: {
      startDate: moment(moment().subtract(30, "days")),
      endDate: moment(),
    },
  });

  const [focusedInput, setFocusedInput] = useState(null);

  const [isDownloadInProgress, setIsDownloadInProgress] = useState(false);

  const [error, setError] = useState("");

  const handleDateChange = (key, val) => {
    setDates({[key]: val});
  };

  const onDateFocusChange = (fi) => {
    setFocusedInput(fi);
  };

  const handleReportDownload = async () => {
    const timezone = moment.tz.guess();
    let {startDate, endDate} = dates.dateRange;
    if (startDate) {
      startDate = moment(startDate).startOf("day").utc(timezone).toISOString();
    }
    if (endDate) {
      endDate = moment(endDate).endOf("day").utc(timezone).toISOString();
    }

    const params =
      report === REPORTS.TEAMS
        ? {
            startDate,
            endDate,
            userTz: timezone,
            team: selectedTeamMembers,
          }
        : {
            startDate,
            endDate,
            userTz: timezone,
          };

    try {
      setIsDownloadInProgress(true);
      const {data: reportRows} =
        report === REPORTS.TEAMS
          ? await fetchTeamMembersReport(params)
          : await fetchTasksReport(params);
      const wb = new ExcelJS.Workbook();
      const ws = wb.addWorksheet(`${report} Report`);
      ws.properties.defaultColWidth = 17;
      reportRows.forEach((reportRow, index) => {
        const row = ws.addRow(reportRow);
        if (index === 0) {
          row.font = {bold: true};
        }
      });
      const buf = await wb.xlsx.writeBuffer();
      FileSaver.saveAs(new Blob([buf]), `Cents_${report}.xlsx`);
      toggleModal(false);
      void props.onIntercomEventTrack?.();
    } catch (error) {
      const teamsReportError = get(error, "response.data.error", "Error fetching report");
      setError(teamsReportError);
    } finally {
      setIsDownloadInProgress(false);
    }
  };

  return (
    <TeamsReportModal
      isOpen={showModal}
      toggle={() => {
        toggleModal(!showModal);
      }}
      centered={true}
      backdrop="static"
      className="orders-report"
    >
      <TeamsReportModalBody>
        <div className="export-order-popup-content">
          <div className="close-icon">
            <img
              alt="icon"
              src={closeImg}
              onClick={() => {
                toggleModal(false);
              }}
            />
          </div>
          <div className="input-row modal-title">
            <span className="title">
              {report === REPORTS.TEAMS ? "Export Team Report" : "Export Tasks"}
            </span>
          </div>
          <div className="input-row">
            <img alt="icon" src={calendarSidePanelImg} />
            <DateRangePicker
              startDate={dates.dateRange.startDate}
              endDate={dates.dateRange.endDate}
              classNamePrefix="locations-dropdown"
              label="Date Range"
              endDateId="endDateId"
              startDateId="startDateId"
              isOutsideRange={(day) => moment().diff(day.startOf("day")) < 0}
              onDatesChange={({startDate, endDate}) =>
                handleDateChange("dateRange", {startDate, endDate})
              }
              onFocusChange={onDateFocusChange}
              focusedInput={focusedInput}
              readOnly={true}
            />
          </div>
          {report === REPORTS.TEAMS && (
            <div className="input-row">
              <img alt="icon" src={personIcon} />
              <MultiSelectWithInput
                itemName={
                  selectedTeamMembers.length === 1 ? "Team Member" : "Team Members"
                }
                allItemsLabel="All Team Members"
                label="Team Member"
                options={teamMemberOptions}
                value={selectedTeamMembers}
                onChange={setSelectedTeamMembers}
              />
            </div>
          )}
          <button
            className="btn-theme form-save-button"
            disabled={
              !dates.dateRange.endDate ||
              (report === REPORTS.TEAMS && !selectedTeamMembers.length) ||
              isDownloadInProgress
            }
            onClick={handleReportDownload}
          >
            {isDownloadInProgress ? "Downloading..." : "DOWNLOAD REPORT"}
          </button>
          {error ? (
            <p className="team-report-error">{error}</p>
          ) : (
            <div className="error-message-spacer" />
          )}
        </div>
      </TeamsReportModalBody>
    </TeamsReportModal>
  );
};

export default ReportsModal;
