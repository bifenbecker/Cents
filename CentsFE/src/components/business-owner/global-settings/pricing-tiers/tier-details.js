import React, {useState, useEffect} from "react";
import TierCreation from "./tier-creation";
import {DELIVERY_TABS, COMMERCIAL_TABS} from "./constants";
import TabSwitcher from "components/commons/tab-switcher/tab-switcher";
import ViewTierDetails from "./view-tier-details";
import {TierPricing, TierPricing20} from "./wizards/tier-pricing/index";
import EditTierWizard from "./wizards/edit-tier-wizard";
import EditCommercialTierDelivery from "./wizards/commercial-delivery-fee/edit-commercial-delivery";
import {useFlags} from "launchdarkly-react-client-sdk";

const TierDetails = ({
  setShowHideNewTierWizard,
  fetchPricingTiers,
  state,
  dispatch,
  fetchNewServices,
}) => {
  const flags = useFlags();
  const [activeTab, setActiveTab] = useState("details");
  const [error, setError] = useState(null);

  useEffect(() => {
    setActiveTab("details");
  }, [state.selectedTierId]);

  if (state?.showHideNewTiersWizard) {
    return (
      <TierCreation
        setShowHideNewTierWizard={setShowHideNewTierWizard}
        state={state}
        dispatch={dispatch}
        fetchPricingTiers={fetchPricingTiers}
      />
    );
  }
  if (state?.showEditTierWizard) {
    return <EditTierWizard state={state} dispatch={dispatch} />;
  }
  return (
    <>
      {!state?.selectedTierId ? (
        <p className="no-details-message">Please select a tier to view details</p>
      ) : (
        <>
          <div className="locations-card-header service-header">
            <p>{state?.selectedTierName}</p>
          </div>
          <div className="locations-card-content">
            <div className="location-info-container services-tablayout-container">
              <TabSwitcher
                tabs={
                  state?.activeRoundedTab === "delivery" ? DELIVERY_TABS : COMMERCIAL_TABS
                }
                activeTab={activeTab}
                onTabClick={setActiveTab}
                className="location-tabs"
              />
              {activeTab === "details" ? (
                <ViewTierDetails state={state} dispatch={dispatch} />
              ) : null}
              {activeTab === "pricing" ? (
                <div className="tier-right-side-container">
                  {flags.cents20 ? (
                    <TierPricing20
                      setError={setError}
                      state={state}
                      dispatch={dispatch}
                      fetchNewServices={fetchNewServices}
                    />
                  ) : (
                    <TierPricing
                      setError={setError}
                      state={state}
                      dispatch={dispatch}
                      fetchNewServices={fetchNewServices}
                    />
                  )}
                </div>
              ) : null}
              {activeTab === "delivery" ? (
                <EditCommercialTierDelivery
                  setError={setError}
                  state={state}
                  dispatch={dispatch}
                />
              ) : null}
              {error ? (
                <p className="pricing-error-container view-tier-details-error-msg">
                  {error}
                </p>
              ) : null}
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default TierDetails;
