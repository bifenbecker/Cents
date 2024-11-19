import React from "react";
import TierItems from "./tiers-items.js";
import BlockingLoader from "components/commons/blocking-loader/blocking-loader";

export const SearchResults = () => {
  return (
    <div className="service-item-list search-results">
      <div key={"No search results"} className={`common-list-item`}>
        <p style={{fontStyle: "italic"}}>{`No Search Results.`}</p>
      </div>
    </div>
  );
};

const TiersList = (props) => {
  const {setShowHideNewTierWizard, state, dispatch} = props;

  return (
    <div className="tiers-pricing-list-content">
      {state?.loading && <BlockingLoader />}
      <TierItems
        setShowHideNewTierWizard={setShowHideNewTierWizard}
        state={state}
        dispatch={dispatch}
      />
    </div>
  );
};

export default TiersList;
