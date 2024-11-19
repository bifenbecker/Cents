import React from "react";

export const truncateTaskName = (taskName) => {
  return taskName.length > 24 ? <>{taskName.substring(0, 23)}&hellip;</> : taskName;
};

export const toggleAssignBox = (assignBox, currentBox, setActiveAssignBox) => {
  return currentBox === assignBox
    ? setActiveAssignBox("")
    : setActiveAssignBox(assignBox);
};
