import React from "react";
import Checkbox from "components/commons/checkbox/checkbox";

const TierItems = (props) => {
  const {setShowHideNewTierWizard, state, dispatch} = props;
  const {tiersList, showHideNewTiersWizard} = state;
  const onListItemClick = (tier) => () => {
    setShowHideNewTierWizard(false);
    dispatch({
      type: "SET_SELECTED_TIER_ID",
      payload: tier?.id,
    });
    dispatch({
      type: "SET_SELECTED_TIER_NAME",
      payload: tier?.name,
    });
  };
  const executeScroll = () => {
    const elements = document.getElementById("latestTier");
    if (elements && !showHideNewTiersWizard) {
      elements.scrollIntoView({behavior: "auto", inline: "nearest", block: "nearest"});
    }
  };
  const onPlusIconClick = () => {
    setShowHideNewTierWizard(true);
    dispatch({
      type: "SET_SELECTED_TIER_ID",
      payload: "",
    });
    dispatch({
      type: "SET_SELECTED_TIER_NAME",
      payload: "",
    });
  };

  if (state?.error) {
    return (
      <div className="service-item-list">
        <div key={"error-item"} className={`common-list-item`}>
          <p className="error-message">{state?.error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="service-item-list">
      {!tiersList?.length ? (
        <div key={"No items to show"} className={`common-list-item`}>
          <p>
            {state.searchText
              ? "No Search Results"
              : `No ${state?.activeRoundedTab} tiers yet. Click the '+' icon to start adding.`}
          </p>
        </div>
      ) : (
        tiersList?.map((tier) => {
          executeScroll();
          return (
            <div
              key={tier?.id}
              className={`common-list-item ${
                state?.selectedTierId === tier?.id ? "active" : ""
              }`}
              onClick={onListItemClick(tier)}
              id={state?.selectedTierId === tier?.id ? "latestTier" : ""}
            >
              <Checkbox checked={state?.selectedTierId === tier?.id} />
              <p className="text-item">{tier?.name}</p>
            </div>
          );
        })
      )}

      <div
        key={"new-tier-list-button"}
        className={`common-list-item ${state?.showHideNewTiersWizard ? "active" : ""}`}
        onClick={onPlusIconClick}
      >
        <p className="add-new-icon-alignment">+</p>
      </div>
    </div>
  );
};

export default TierItems;
