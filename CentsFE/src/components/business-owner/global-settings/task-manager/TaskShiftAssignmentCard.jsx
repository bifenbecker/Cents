import React from "react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import Checkbox from "../../../commons/checkbox/checkbox";
import {faTimes} from "@fortawesome/free-solid-svg-icons";
import PropTypes from "prop-types";

const TaskShiftAssignmentCard = ({
  task,
  handleShiftAssignCheckboxClick,
  onSetActiveAssignBox,
}) => {
  let assignedShifts = task.assignedShifts;
  let shiftsData = [];

  for (let shift of assignedShifts) {
    shiftsData.push(
      <div key={shift.name} title={shift.name} className="common-list-item">
        <Checkbox
          checked={shift.isAssigned}
          onChange={(e) => {
            e.stopPropagation();
            handleShiftAssignCheckboxClick(task.id, shift.name);
          }}
        />
        <p>{shift.name}</p>
      </div>
    );
  }

  shiftsData.unshift(
    <div className="header" key={"Days-HEADER"}>
      <p>Shifts</p>
      <FontAwesomeIcon
        icon={faTimes}
        className="close"
        onClick={(e) => onSetActiveAssignBox("")}
      />
    </div>
  );

  return (
    <div className="tasks-assign-card" onClick={(e) => e.stopPropagation()}>
      {shiftsData}
    </div>
  );
};

TaskShiftAssignmentCard.propTypes = {
  task: PropTypes.object.isRequired,
  handleShiftAssignCheckboxClick: PropTypes.func.isRequired,
  onSetActiveAssignBox: PropTypes.func.isRequired,
};

export default TaskShiftAssignmentCard;
