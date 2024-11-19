import React, {useState, useEffect, useMemo} from "react";

// Icons
import exitIcon from "../../../assets/images/Icon_Exit_Side_Panel.svg";
import tiertype from "../../../assets/images/Icon_Tier_Type.svg";

import ToggleSwitch from "../../commons/toggle-switch/toggleSwitch";
import {
  toggleCommercialCustomer,
  searchAndListPricingTiers,
} from "../../../api/business-owner/customers";
import IconSelect from "../../commons/icon-select/IconSelect";
import {TIER_TYPE} from "../../business-owner/global-settings/pricing-tiers/constants";
import BlockingLoader from "../../commons/blocking-loader/blocking-loader";
import {
  INTERCOM_EVENTS_TEMPLATES,
  DEFAULT_INTERCOM_VALUES,
} from "constants/intercom-events";

const CommercialCustomerScreen = (props) => {
  const {
    activeCustomerDetails,
    refreshCustomerDetails,
    setShowCommercialCustomerScreen,
    onIntercomEventTrack,
  } = props;
  const [isCommercial, setIsCommercial] = useState(activeCustomerDetails?.isCommercial);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [tiers, setTiers] = useState([]);
  const [commercialTierId, setCommercialTierId] = useState(
    activeCustomerDetails?.tier?.id
  );

  useEffect(() => {
    const handleTierList = async () => {
      try {
        setLoading(true);
        const res = await searchAndListPricingTiers({type: TIER_TYPE.commercial});
        if (res?.data?.success) {
          setTiers(res.data.tiers || []);
        }
        setLoading(false);
      } catch (error) {
        setError(
          error?.response?.data?.error || "Could not load the list of Pricing Tiers"
        );
        setLoading(false);
      }
    };
    handleTierList();
  }, []);

  const toggleCustomerSaveHandler = async () => {
    try {
      setLoading(true);
      const res = await toggleCommercialCustomer(
        activeCustomerDetails?.id,
        isCommercial,
        commercialTierId
      );
      if (res?.data?.success) {
        setShowCommercialCustomerScreen(false);
        refreshCustomerDetails();
        void onIntercomEventTrack?.(
          INTERCOM_EVENTS_TEMPLATES.customers.toggleCommercialCustomer,
          {
            "Full name": activeCustomerDetails.boFullName,
            "E-mail": activeCustomerDetails.boEmail || DEFAULT_INTERCOM_VALUES.NO_RECORD,
            "Phone number": activeCustomerDetails.boPhoneNumber,
            "Pricing tier":
              tiers.find((el) => el.id === commercialTierId)?.name ||
              DEFAULT_INTERCOM_VALUES.NO_RECORD,
            "Commercial status": isCommercial ? "enabled" : "disabled",
          }
        );
      }
    } catch (error) {
      setError(error?.response?.data?.error || "Could not turn customer as Commercial");
      setLoading(false);
    }
  };

  const showTiers = useMemo(() => {
    return (
      tiers?.map((tier) => {
        return {value: tier?.id, label: tier?.name};
      }) || []
    );
  }, [tiers]);

  const activeCustomerPricingTier = useMemo(() => {
    if (!activeCustomerDetails?.tier?.id || !tiers) {
      return;
    }

    const activeTier = tiers.find((tier) => tier.id === commercialTierId);

    return {
      label: activeTier?.name,
      value: activeTier?.id,
    };
  }, [activeCustomerDetails, tiers, commercialTierId]);

  const handleCustomerPricingTierChange = (value) => {
    setCommercialTierId(value.value);
  };

  const handleToggleChange = (value) => {
    setIsCommercial(value);
    !isCommercial
      ? setCommercialTierId(activeCustomerDetails?.tier?.id)
      : setCommercialTierId();
  };

  const isSaveDisabled = () => {
    return !(
      !!activeCustomerDetails?.isCommercial !== !!isCommercial ||
      activeCustomerDetails?.tier?.id !== commercialTierId
    );
  };
  return (
    <div className="commercial-customer-setting-container">
      {loading && <BlockingLoader />}
      <div className="exit-icon-container">
        <img
          src={exitIcon}
          alt=""
          onClick={() => {
            setShowCommercialCustomerScreen(false);
          }}
        />
      </div>
      <header className="name-and-title">
        <p className="name-wrap">{activeCustomerDetails.boFullName}</p>
        <p>Commercial Customer Settings</p>
      </header>
      <div className="content-container">
        <p className="content-commercial-description ">
          Commercial customers may need to be treated differently than your retail
          customers. You can set up special pricing tiers for commercial customers, bill
          them via invoices, and more.
        </p>
      </div>
      <div className="toggle-container">
        <small>This is a commercial customer</small>
        <ToggleSwitch checked={isCommercial} onChange={handleToggleChange} />
      </div>

      {isCommercial && (
        <IconSelect
          placeholder="Assign to a pricing tier"
          className={"tiertype-container"}
          options={showTiers}
          value={activeCustomerPricingTier}
          onChange={handleCustomerPricingTierChange}
          icon={tiertype}
          isDisabled={!tiers}
        />
      )}
      {isCommercial && error && <p className="error-message">{error}</p>}
      <div className="btn-container">
        <button
          className="btn btn-text-only cancel-button"
          onClick={() => {
            setShowCommercialCustomerScreen(false);
          }}
        >
          Cancel
        </button>
        <button
          disabled={isSaveDisabled()}
          className="btn-theme btn-rounded save-button"
          onClick={toggleCustomerSaveHandler}
        >
          SAVE
        </button>
      </div>
    </div>
  );
};

export default CommercialCustomerScreen;
