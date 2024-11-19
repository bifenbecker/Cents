import React, {Fragment, useEffect} from "react";
import TextField from "../../../../commons/textField/textField";
import role_side_panel from "../../../../../assets/images/Icon_Role_Side_Panel.svg";
import {TIER_TYPE} from "../constants";
import BlockingLoader from "../../../../commons/blocking-loader/blocking-loader";

const TierType = ({
  state,
  tierData,
  setTierData,
  setError,
  setShouldValidateTierName,
  loading,
  validateTierNameApi,
}) => {
  const {activeRoundedTab} = state;

  useEffect(() => {
    setTierData((state) => ({
      ...state,
      type: state?.type || activeRoundedTab?.toUpperCase(),
    }));
  }, [activeRoundedTab, setTierData]);

  const handleTierTypeChange = (value) => () => {
    setError(null);
    setTierData((state) => ({
      ...state,
      type: value,
      name: "",
    }));
  };

  const handleTierNameChange = (evt) => {
    setError(null);
    const {value} = evt.target;
    setTierData((state) => ({
      ...state,
      name: value,
    }));
    setShouldValidateTierName(true);
  };

  const validateTier = async (evt) => {
    const {value} = evt.target;

    if (
      !value.length ||
      evt.relatedTarget?.id === "radio" ||
      evt.relatedTarget?.id === "cancel-button"
    ) {
      return;
    }
    validateTierNameApi();
  };

  return (
    <Fragment>
      <div className="new-tier-container">
        {loading ? <BlockingLoader /> : null}
        <p className="new-tier-header">Pricing Tier Type</p>
        <div className="type-of-tier-selection">
          <div className="tier-radio-button">
            <input
              name="tier-type"
              checked={tierData?.type === TIER_TYPE.commercial}
              onChange={handleTierTypeChange(TIER_TYPE.commercial)}
              type="radio"
              id="radio"
              value={TIER_TYPE.commercial}
            />
            {TIER_TYPE.commercial.toLowerCase()}
          </div>
          <div className="tier-radio-button">
            <input
              name="tier-type"
              checked={tierData?.type === TIER_TYPE.delivery}
              onChange={handleTierTypeChange(TIER_TYPE.delivery)}
              type="radio"
              id="radio"
              value={TIER_TYPE.delivery}
            />
            {TIER_TYPE.delivery.toLowerCase()}
          </div>
        </div>

        <div className="tier-input-containers">
          <div className="input-container">
            <img src={role_side_panel} className="icon" alt="" />
            <TextField
              label="Name of pricing tier"
              className="tier-name-input"
              name="tierName"
              onChange={handleTierNameChange}
              value={tierData?.name}
              maxLength={30}
              onBlur={validateTier}
            />
          </div>
        </div>
      </div>
    </Fragment>
  );
};

export default TierType;
