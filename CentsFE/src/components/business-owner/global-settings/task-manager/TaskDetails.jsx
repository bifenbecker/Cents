import React, {useState} from "react";
import TextField from "../../../commons/textField/textField";
// import ToggleSwitch from '../../../commons/toggle-switch/toggleSwitch';
import taskIcon from "../../../../assets/images/task-icon.svg";
import taskDescription from "../../../../assets/images/task-description.svg";
// import cameraIcon from '../../../../assets/images/camera-icon.svg';
import calendarIcon from "../../../../assets/images/calendar.svg";
import clockIcon from "../../../../assets/images/clock.svg";
import LocationAssignDropdown from "../../../commons/location-assign-dropdown/location-assign-dropdown";
import Modal from "../../../commons/modal/modal";
import {truncateTaskName, toggleAssignBox} from "./task-manager-assets";
import TaskDayAssignmentCard from "./TaskDayAssignmentCard";
import TaskShiftAssignmentCard from "./TaskShiftAssignmentCard";
import PropTypes from "prop-types";
import MaterialWrapper from "../../../commons/material-input-wrapper/materialInputWrapper";
import useTrackEvent from "../../../../hooks/useTrackEvent";
import {
  INTERCOM_EVENTS,
  INTERCOM_EVENTS_TEMPLATES,
} from "../../../../constants/intercom-events";
import cx from "classnames";

const TextArea = MaterialWrapper("textarea");
const TaskDetails = ({
  BlockingLoader,
  UncontrolledPopover,
  taskManager,
  setActiveAssignBox,
  taskFieldChangeHandler,
  handleSelectedLocationChange,
  handleDayAssignCheckboxClick,
  archiveTask,
  saveTask,
  handleShiftAssignCheckboxClick,
}) => {
  const [toggleThreeDotMenu, setToggleThreeDotMenu] = useState(false);
  const [showArchiveModal, setShowArchiveModal] = useState(false);
  const {trackEvent} = useTrackEvent();

  const TASK_DETAILS_COLORS = Object.freeze({
    gray: "#B1B1B1",
    black: "black",
  });

  const task =
    taskManager.activeTaskId === -1
      ? taskManager.newTask
      : taskManager.tasks.find((task) => task.id === taskManager.activeTaskId);

  return !task ? null : (
    <>
      {(taskManager.taskSaveInProgress || taskManager.tasksCallInProgress) && (
        <BlockingLoader />
      )}
      <div className="locations-card-header">
        <div className="location-header-container">
          <div className="task-header-row">
            <p
              style={{
                color:
                  taskManager.activeTaskId !== -1 && task.deletedAt
                    ? TASK_DETAILS_COLORS.gray
                    : TASK_DETAILS_COLORS.black,
              }}
            >
              {taskManager.activeTaskId === -1
                ? "Set Up Task"
                : truncateTaskName(task.name)}
            </p>
            {task.deletedAt && <div className="archive-label">Archived</div>}
          </div>
          <div
            className={cx("location-three-dot-menu", toggleThreeDotMenu && "open")}
            id="three-dot-menu-locations"
          />
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
                setShowArchiveModal(true);
              }}
            >
              {task.deletedAt ? "Unarchive task" : "Archive task"}
            </p>
          </UncontrolledPopover>
        </div>
      </div>
      <div className="locations-card-content">
        <div className="section">
          <div className="field-container">
            <img alt="icon" src={taskIcon} />
            <TextField
              key={`${task.id}-name`}
              className="inline task-field"
              style={{
                color: task.deletedAt
                  ? TASK_DETAILS_COLORS.gray
                  : TASK_DETAILS_COLORS.black,
              }}
              label="Task Title"
              value={task.name}
              onChange={(e) => taskFieldChangeHandler("name", e.target.value)}
            />
          </div>

          <div className="field-container">
            <img alt="icon" src={taskDescription} />
            <TextArea
              key={`${task.id}-desc`}
              className="inline task-field"
              style={{
                color: task.deletedAt
                  ? TASK_DETAILS_COLORS.gray
                  : TASK_DETAILS_COLORS.black,
              }}
              label="Task Description"
              value={task.description}
              onChange={(e) => taskFieldChangeHandler("description", e.target.value)}
            />
          </div>

          {/* Legacy
           <div className="task-field-container">
              <img alt="icon" src={cameraIcon}/>
              <p>Requires Photo</p>
              <ToggleSwitch 
                  key= {`${task.id}-toggle`}
                  checked= {task.isPhotoNeeded}
                  onChange= { (v) => taskFieldChangeHandler("isPhotoNeeded", v)}
              />
          </div> */}
        </div>

        <div className="section no-border">
          <LocationAssignDropdown
            allLocations={taskManager.locations}
            selectedLocations={task.assignedLocations}
            needsRegions={taskManager.needsRegions}
            onChange={(newLocations) => {
              handleSelectedLocationChange(task.id, newLocations);
            }}
            onClick={() =>
              toggleAssignBox("", taskManager.activeAssignBox, setActiveAssignBox)
            }
            label={"Assign to Location(s)"}
            className={cx(task.deletedAt && "archived-text")}
          />

          <div
            className={cx(
              "field-container",
              "clickable",
              taskManager.activeAssignBox === "day" && "active"
            )}
            onClick={(e) => {
              toggleAssignBox("day", taskManager.activeAssignBox, setActiveAssignBox);
            }}
          >
            <img alt="icon" src={calendarIcon} />
            <p
              style={{
                color: task.deletedAt
                  ? TASK_DETAILS_COLORS.gray
                  : TASK_DETAILS_COLORS.black,
              }}
            >
              {(() => {
                let count = task.assignedDays.length;
                if (count === 7) {
                  return "All Days";
                } else {
                  return `${count} ${count === 1 ? "Day" : "Days"}`;
                }
              })()}
            </p>
            {taskManager.activeAssignBox === "day" && (
              <TaskDayAssignmentCard
                task={task}
                handleDayAssignCheckboxClick={handleDayAssignCheckboxClick}
                onSetActiveAssignBox={setActiveAssignBox}
              />
            )}
          </div>

          <div
            style={{
              color: task.deletedAt
                ? TASK_DETAILS_COLORS.gray
                : TASK_DETAILS_COLORS.black,
            }}
            className={cx(
              "field-container",
              "clickable",
              taskManager.activeAssignBox === "shift" && "active"
            )}
            onClick={(e) => {
              toggleAssignBox("shift", taskManager.activeAssignBox, setActiveAssignBox);
            }}
          >
            <img alt="icon" src={clockIcon} />
            <p
              style={{
                color: task.deletedAt
                  ? TASK_DETAILS_COLORS.gray
                  : TASK_DETAILS_COLORS.black,
              }}
            >
              {(() => {
                let count = task.assignedShifts.reduce((count, shift) => {
                  if (shift.isAssigned) {
                    return count + 1;
                  } else {
                    return count + 0;
                  }
                }, 0);
                if (count === task.assignedShifts.length) {
                  return "All Shifts";
                } else {
                  return `${count} ${count === 1 ? "Shift" : "Shifts"}`;
                }
              })()}
            </p>
            {taskManager.activeAssignBox === "shift" && (
              <TaskShiftAssignmentCard
                task={task}
                handleShiftAssignCheckboxClick={handleShiftAssignCheckboxClick}
                onSetActiveAssignBox={setActiveAssignBox}
              />
            )}
          </div>

          <p className="error-message">{taskManager.taskSaveError}</p>
          <button
            type="submit"
            className="btn-theme btn-rounded save-button"
            onClick={(e) => {
              saveTask(task);
              trackEvent(INTERCOM_EVENTS.tasks, INTERCOM_EVENTS_TEMPLATES.tasksAction, {
                "Task Action": !!task.id ? "Update" : "Save",
                "Task Name": task.name,
              });
            }}
          >
            SAVE
          </button>
        </div>
      </div>
      {showArchiveModal && (
        <Modal>
          <div className="archive-modal">
            <p>
              Are you sure you want to {task.deletedAt ? "unarchive" : "archive"} this
              task?
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
                    archiveTask(task, !task.deletedAt);
                    trackEvent(
                      INTERCOM_EVENTS.tasks,
                      INTERCOM_EVENTS_TEMPLATES.tasksAction,
                      {
                        "Task Action": task.deletedAt ? "Unarchive" : "Archive",
                        "Task Name": task.name,
                      }
                    );
                    setShowArchiveModal(false);
                  }}
                >
                  {task.deletedAt ? "UNARCHIVE" : "ARCHIVE"}
                </button>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
};

TaskDetails.propTypes = {
  BlockingLoader: PropTypes.func.isRequired,
  UncontrolledPopover: PropTypes.func.isRequired,
  taskManager: PropTypes.object.isRequired,
  setActiveAssignBox: PropTypes.func.isRequired,
  taskFieldChangeHandler: PropTypes.func.isRequired,
  handleSelectedLocationChange: PropTypes.func.isRequired,
  handleDayAssignCheckboxClick: PropTypes.func.isRequired,
  archiveTask: PropTypes.func.isRequired,
  saveTask: PropTypes.func.isRequired,
  handleShiftAssignCheckboxClick: PropTypes.func.isRequired,
};

export default TaskDetails;
