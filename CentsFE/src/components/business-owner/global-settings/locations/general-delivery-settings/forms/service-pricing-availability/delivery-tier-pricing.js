import React from "react";
import Select from "../../../../../../commons/select/select";
import isEmpty from "lodash/isEmpty";

const DeliveryTierPricing = ({dispatch, state, deliverySettingsLoading}) => {
  const {deliveryTiersList, zones, deliveryTier, deliverySettings} = state;

  const {ownDriverDeliverySettings} = deliverySettings;

  const handleDeliveryTierSelection = (selection, zoneId) => {
    dispatch({
      type: "SET_DELIVERY_TIER_FOR_A_LOCATION_OR_ZONE",
      payload: {
        selection,
        isZone: false,
        zoneId,
      },
    });
  };

  const handleApplyAll = (deliveryTier) => {
    dispatch({
      type: "HANDLE_APPLY_TIER_FOR_ALL_ZONE",
      payload: {
        deliveryTier,
      },
    });
  };

  return (
    <div>
      {!ownDriverDeliverySettings?.hasZones && !deliverySettingsLoading && (
        <>
          <p className="info-text">Which one of your Delivery Pricing Tiers</p>
          <p className="info-text">would you like to use?</p>
          <div className="delivery-tier-zone">
            <Select
              className="delivery-tier-zone-dropdown"
              label="Delivery Pricing Tier"
              options={deliveryTiersList}
              isSearchable={true}
              value={!isEmpty(deliveryTier) && deliveryTier}
              onChange={handleDeliveryTierSelection}
            />
          </div>
        </>
      )}

      {ownDriverDeliverySettings?.hasZones && !deliverySettingsLoading && (
        <>
          <p className="info-text">Which one of your Delivery Pricing Tiers</p>
          <p className="info-text">would you like to use?</p>
          {zones?.map((zone, index) => {
            return (
              <div className="delivery-tier-zone">
                <div className="delivery-tier-zone-assign">
                  <p>{zone?.name}</p>
                  <Select
                    className="delivery-tier-zone-dropdown"
                    label="Delivery Pricing Tier"
                    options={deliveryTiersList}
                    value={!isEmpty(zone?.deliveryTier?.label) && zone?.deliveryTier}
                    isSearchable={true}
                    onChange={(val) => handleDeliveryTierSelection(val, zone?.id)}
                  />
                </div>
                <div className="apply-to-all-button-container">
                  {!index && zones?.length > 1 && zones[0]?.deliveryTier?.value && (
                    <span
                      className="apply-to-all-button"
                      onClick={() => handleApplyAll(zone?.deliveryTier)}
                    >
                      Apply to all
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </>
      )}
    </div>
  );
};

export default DeliveryTierPricing;
