import React from "react";

const TurnDetails = (props) => {
  const {selectedTurn, dispatch} = props;

  // TODO: TURN VIEW IMPLEMENTATION
  return (
    <div onClick={() => dispatch({type: "CLOSE_SELECTED_TURN_POPUP"})}>
      Selected turn {selectedTurn.id}
    </div>
  );
};

export default TurnDetails;
