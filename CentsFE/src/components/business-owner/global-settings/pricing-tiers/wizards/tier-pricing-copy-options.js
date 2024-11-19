import React, {useEffect, useState, useMemo, useCallback} from "react";
import TabSelect from "../../../../commons/select/tab-select";
import {fetchLocations} from "../../../../../api/business-owner/locations";
import {TIER_PRICING_COPY_OPTIONS} from "../constants";
import Radio from "../../../../commons/radio/radio";
import {fetchTiersList} from "../../../../../api/business-owner/tiers";
import BlockingLoader from "../../../../commons/blocking-loader/blocking-loader";

const TierPricingCopyOptions = ({state, dispatch, tierData, setTierData, setError}) => {
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [selectedTier, setSelectedTier] = useState(null);
  const [pricingOption, setPricingOption] = useState(
    tierData?.pricingOption || TIER_PRICING_COPY_OPTIONS.existingPricing
  );
  const [locations, setLocations] = useState([]);
  const [tiersList, setTiersList] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchLocationsDetails = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      let resp = await fetchLocations();
      setLocations(resp?.data?.allLocations || []);
    } catch (error) {
      setError(error?.response?.data?.error || "Cannot fetch locations");
    } finally {
      setLoading(false);
    }
  }, [setError]);

  const fetchTierList = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      let params = {type: tierData.type};
      let resp = await fetchTiersList(params);

      setTiersList(resp?.data?.tiers || []);
    } catch (error) {
      setError(error?.response?.data?.error || "Could not fetch tiers!");
    } finally {
      setLoading(false);
    }
  }, [setError, tierData.type]);

  useEffect(() => {
    fetchLocationsDetails();
    fetchTierList();
  }, [fetchLocationsDetails, fetchTierList]);

  const formatOptionLabel = ({value, label}) => (
    <div className="dropdown-option">
      <div className="dropdown-option__label">{label}</div>
    </div>
  );

  const filterByLocationCategory = useCallback(
    (category) => {
      return locations
        .map(({name, id}) => {
          return {
            label: name,
            value: id,
            type: category,
          };
        })
        .filter(({value}) => !(selectedLocation?.option?.value === value));
    },
    [locations, selectedLocation]
  );

  const filterByTierCategory = useCallback(
    (category) => {
      return tiersList
        .map(({name, id}) => {
          return {
            label: name,
            value: id,
            type: category,
          };
        })
        .filter(({value}) => !(selectedTier?.option?.value === value));
    },
    [tiersList, selectedTier]
  );

  const options = useMemo(
    () => [
      {
        label: "Locations",
        options: filterByLocationCategory("location"),
      },
      {
        label: "Tiers",
        options: filterByTierCategory("tier"),
      },
    ],
    [filterByLocationCategory, filterByTierCategory]
  );

  const handleOnChangeServices = (option) => {
    setSelectedLocation(option);
    setTierData((state) => ({
      ...state,
      locationId: option?.type === "location" ? option?.value : null,
      tierId: option?.type === "tier" ? option?.value : null,
      selectedDropdownValue: option,
    }));
  };

  const handlePriceCopyOptionChange = (val) => () => {
    setPricingOption(val);
    if (val === TIER_PRICING_COPY_OPTIONS.newPricing) {
      setTierData((state) => ({
        ...state,
        locationId: null,
        tierId: null,
        pricingOption: val,
        selectedDropdownValue: null,
      }));
    } else {
      setTierData((state) => ({
        ...state,
        locationId: selectedLocation ? selectedLocation?.value : null,
        tierId: null,
        pricingOption: val,
      }));
    }
  };
  return (
    <div className="pricing-options-container">
      {loading ? <BlockingLoader /> : null}
      <p className="pricing-tier-header">How would you like to price this tier?</p>
      <div className="type-of-pricing-selection">
        <div className="tier-radio-button">
          <Radio
            selected={pricingOption === TIER_PRICING_COPY_OPTIONS.existingPricing}
            onChange={handlePriceCopyOptionChange(
              TIER_PRICING_COPY_OPTIONS.existingPricing
            )}
          />
          Copy from existing pricing
        </div>
        <div className="tier-radio-button">
          <Radio
            selected={pricingOption === TIER_PRICING_COPY_OPTIONS.newPricing}
            onChange={handlePriceCopyOptionChange(TIER_PRICING_COPY_OPTIONS.newPricing)}
          />
          Set all new pricing
        </div>
      </div>

      {pricingOption !== TIER_PRICING_COPY_OPTIONS.newPricing && (
        <div className="dropdown-wrapper">
          <p className="pull-text">Pull pricing from:</p>
          <TabSelect
            smallHeight
            maxMenuHeight={180}
            menuShouldScrollIntoView
            options={options}
            defaultValue={tierData?.selectedDropdownValue}
            formatOptionLabel={formatOptionLabel}
            selectedLabel={"Locations"}
            onChange={handleOnChangeServices}
            hideSelectedOptions
            placeholder={"Select Location or Tier"}
          />
        </div>
      )}
    </div>
  );
};
export default TierPricingCopyOptions;
