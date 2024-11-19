import React from "react";
import cx from "classnames";
import Checkbox from "../../../commons/checkbox/checkbox";
import PropTypes from "prop-types";

const TaskList = ({taskManager, setActiveTask, BlockingLoader}) => {
  const getTaskElements = (taskManager, setActiveTask, BlockingLoader) => {
    const {tasks, taskListError, tasksCallInProgress, activeTaskId} = taskManager;
    if (!tasks) {
      return null;
    }
    if (tasks.length === 0) {
      return <div className="common-list-item">No tasks to show</div>;
    }
    if (tasksCallInProgress) {
      return <BlockingLoader />;
    }
    if (taskListError) {
      return <p className="error-message">{taskListError}</p>;
    }
    return tasks.map((task) => {
      return (
        <div
          key={task.id}
          title={task.name}
          className={cx("common-list-item", activeTaskId === task.id && "active")}
          onClick={() => {
            setActiveTask(task.id);
          }}
          style={{justifyContent: "space-between"}}
        >
          <div className="task-item-row">
            <Checkbox checked={activeTaskId === task.id} />
            <p>{task.name}</p>
          </div>
          {task.deletedAt && <span className="archived-tag">ARCHIVED</span>}
        </div>
      );
    });
  };

  const taskElements = getTaskElements(taskManager, setActiveTask, BlockingLoader);

  if (taskManager.activeTaskId === -1) {
    taskElements.push(
      <div
        key={"new-task"}
        title={"New Task"}
        className="common-list-item new-task active"
      >
        <p>&#43;</p>
      </div>
    );
  }

  return taskElements;
};

TaskList.propTypes = {
  taskManager: PropTypes.object.isRequired,
  setActiveTask: PropTypes.func.isRequired,
  BlockingLoader: PropTypes.func.isRequired,
};

export default TaskList;
