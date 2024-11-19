import {faChevronRight} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import React from "react";

import SkeletonTurnItem from "./skeleton-turn-item";
import {SERVICE_TYPE_DISPLAY} from "../constants";

const TurnListItem = (props) => {
  const {data, style, index} = props;
  const {turns, handleTurnClick, showInListLoader} = data;

  if (index === turns?.length) {
    return <SkeletonTurnItem style={style} showInListLoader={showInListLoader} />;
  }
  const turn = turns[index];
  if (!turn) {
    return null;
  }

  return (
    <div
      className="turn-item-wrapper"
      style={style}
      onClick={() => handleTurnClick(turn)}
    >
      <div className="turn-col turn-col-code">
        {turn?.prefix}-{turn?.code}
      </div>
      <div className="turn-col turn-col-created">{turn?.createdAt}</div>
      <div className="turn-col turn-col-type">
        {SERVICE_TYPE_DISPLAY[turn?.serviceType]}
      </div>
      {/* Arrow not needed as or now
      <div className="turn-col turn-col-arrow">
        <div className="arrow-wrapper">
          <FontAwesomeIcon icon={faChevronRight} className="right-chevron-icon" />
        </div>
      </div> */}
    </div>
  );
};

export default TurnListItem;
