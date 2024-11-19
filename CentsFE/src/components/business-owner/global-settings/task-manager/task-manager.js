import React, {useState, useEffect} from "react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faPlus} from "@fortawesome/free-solid-svg-icons";

import {UncontrolledPopover, PopoverBody} from "reactstrap";
import Card from "../../../commons/card/card";
import Checkbox from "../../../commons/checkbox/checkbox";
import BlockingLoader from "../../../commons/blocking-loader/blocking-loader";
import downloadImg from "../../../../assets/images/download.svg";
import TasksReport from "../../../commons/reportsModal/ReportsModal";
import InactiveFiltersButton from "../../../../assets/images/Icon_Filter.svg";
import ActiveFiltersButton from "../../../../assets/images/Icon_Filter_Selected.svg";
import TaskDetails from "./TaskDetails";
import TaskList from "./TaskList";
import PropTypes from "prop-types";
import useTrackEvent from "../../../../hooks/useTrackEvent";
import {
  INTERCOM_EVENTS,
  INTERCOM_EVENTS_TEMPLATES,
} from "../../../../constants/intercom-events";

const TaskManager = ({
  fetchTaskList,
  resetFullState,
  taskManager,
  setShouldRefreshTaskList,
  setActiveAssignBox,
  taskFieldChangeHandler,
  handleSelectedLocationChange,
  handleDayAssignCheckboxClick,
  setActiveTask,
  archiveTask,
  saveTask,
  handleShiftAssignCheckboxClick,
}) => {
  const [showModal, setShowModal] = useState(false);
  const toggleModal = (showModalValue) => {
    setShowModal(showModalValue);
  };
  const [showFiltersPopover, setShowFiltersPopover] = useState(false);
  const [showArchivedTasks, setShowArchivedTasks] = useState(false);
  const {trackEvent} = useTrackEvent();

  useEffect(() => {
    fetchTaskList({withArchived: showArchivedTasks});
    return () => {
      resetFullState();
    };
  }, [fetchTaskList, resetFullState, showArchivedTasks]);

  useEffect(() => {
    if (taskManager.shouldRefreshTaskList) {
      // set shouldRefreshTaskList to false and fetch task list
      setShouldRefreshTaskList(false);
      fetchTaskList({withArchived: showArchivedTasks});
    }
  });

  const taskDetailProps = {
    BlockingLoader,
    UncontrolledPopover,
    taskManager,
    taskFieldChangeHandler,
    handleSelectedLocationChange,
    handleDayAssignCheckboxClick,
    archiveTask,
    saveTask,
    handleShiftAssignCheckboxClick,
    setActiveAssignBox,
  };

  const taskListProps = {
    taskManager,
    setActiveTask,
    BlockingLoader,
  };

  const tasksReportProps = {
    report: "Tasks",
    showModal,
    toggleModal,
    onIntercomEventTrack: () => {
      trackEvent(INTERCOM_EVENTS.tasks, INTERCOM_EVENTS_TEMPLATES.tasksAction, {
        "Task Action": "Download report",
      });
    },
  };

  return (
    <Card>
      <div className="bo-global-settings-content-2-column-layout bo-tasks-layout-container">
        <div className="bo-global-settings-content-left-column">
          <div className="locations-card-container">
            <div className="locations-card-header">
              <p>Tasks</p>
              <img
                src={downloadImg}
                alt="download"
                onClick={() => setShowModal(true)}
                className="tasks-download-button"
              />
              <FontAwesomeIcon
                icon={faPlus}
                onClick={() => setActiveTask(-1)}
                className="tasks-plus-button"
              />
            </div>
            <div className="task-filters-row">
              <div>
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
                      checked={showArchivedTasks}
                      onChange={() => {
                        if (showFiltersPopover) {
                          setShowFiltersPopover(!showFiltersPopover);
                          setShowArchivedTasks(!showArchivedTasks);
                        }
                      }}
                    />
                  </PopoverBody>
                </UncontrolledPopover>
              </div>
            </div>
            <div className="locations-card-content">
              <TaskList {...taskListProps} />
            </div>
          </div>
        </div>

        <div className="bo-global-settings-content-right-column">
          <div className="locations-card-container info-card-container">
            <TaskDetails {...taskDetailProps} />
            {showModal && <TasksReport {...tasksReportProps} />}
          </div>
        </div>
      </div>
    </Card>
  );
};

TaskManager.propTypes = {
  fetchTaskList: PropTypes.func.isRequired,
  resetFullState: PropTypes.func.isRequired,
  taskManager: PropTypes.object.isRequired,
  setShouldRefreshTaskList: PropTypes.func.isRequired,
  setActiveAssignBox: PropTypes.func.isRequired,
  taskFieldChangeHandler: PropTypes.func.isRequired,
  handleSelectedLocationChange: PropTypes.func.isRequired,
  handleDayAssignCheckboxClick: PropTypes.func.isRequired,
  setActiveTask: PropTypes.func.isRequired,
  archiveTask: PropTypes.func.isRequired,
  saveTask: PropTypes.func.isRequired,
  handleShiftAssignCheckboxClick: PropTypes.func.isRequired,
};

export default TaskManager;
