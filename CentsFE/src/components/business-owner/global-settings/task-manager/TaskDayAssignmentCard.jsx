import React from "react";
import {WEEK_DAYS as days} from "../../../../constants";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import Checkbox from "../../../commons/checkbox/checkbox";
import {faTimes} from "@fortawesome/free-solid-svg-icons";
import PropTypes from "prop-types";

const TaskDayAssignmentCard = ({
  task,
  handleDayAssignCheckboxClick,
  onSetActiveAssignBox,
}) => {
  const daysData = [];
  const {assignedDays} = task;

  for (let i = 0; i < 7; i++) {
    daysData.push(
      <div key={days[i]} title={days[i]} className="common-list-item">
        <Checkbox
          checked={assignedDays.includes(i)}
          onChange={(e) => {
            e.stopPropagation();
            handleDayAssignCheckboxClick(task.id, i);
          }}
        />
        <p>{days[i]}</p>
      </div>
    );
  }

  daysData.unshift(
    <div className="header" key={"Days-HEADER"}>
      <p>Days</p>
      <FontAwesomeIcon
        icon={faTimes}
        className="close"
        onClick={(e) => onSetActiveAssignBox("")}
      />
    </div>
  );

  return (
    <div className="tasks-assign-card" onClick={(e) => e.stopPropagation()}>
      {daysData}
    </div>
  );
};

TaskDayAssignmentCard.propTypes = {
  task: PropTypes.object.isRequired,
  handleDayAssignCheckboxClick: PropTypes.func.isRequired,
  onSetActiveAssignBox: PropTypes.func.isRequired,
};

export default TaskDayAssignmentCard;
