import React, {useCallback, useEffect} from "react";
import {useFlags} from "launchdarkly-react-client-sdk";

import Radio from "../../../../../../commons/radio/radio";
import mobileIMg from "../../../../../../../assets/images/Delivery Service Mockup.png";
import DeliveryTierPricing from "./delivery-tier-pricing";
import DeliveryService from "./delivery-services";
import {searchAndListPricingTiers} from "../../../../../../../api/business-owner/customers";
import {
  fetchServicesOfLocation,
  updateLocationSettings,
} from "../../../../../../../api/business-owner/locations";
import {groupedServiceOptions, filterDeliverableServices} from "../../../utils/location";
import {isEmpty} from "lodash";
import flatten from "lodash/flatten";
import {ServicePricingOption} from "../../../constants";
import {TIER_TYPE} from "../../../../pricing-tiers/constants";

const ServicePricingAndAvailabilityWizard = ({
  deliverySettings,
  fetchDeliverySettings,
  location,
  state,
  dispatch,
  isEdit,
  deliverySettingsLoading,
}) => {
  const {
    deliveryPriceType,
    selectedServicesForRetailPricing,
    locationServices,
    servicePricingAndAvailabilityPayload,
    hasDryCleaningServices,
  } = state;

  const flags = useFlags();

  const getDeliveryTiers = useCallback(async () => {
    try {
      dispatch({
        type: "SET_LOADER",
        payload: true,
      });
      const res = await searchAndListPricingTiers({type: TIER_TYPE.delivery});

      if (res?.data?.success) {
        dispatch({
          type: "SET_DELIVERY_TIERS_LIST",
          payload: res.data.tiers || [],
        });
      }
    } catch (error) {
      dispatch({
        type: "SET_ERROR",
        payload:
          error?.response?.data?.error || "Could not load the list of Delivery Tiers",
      });
    } finally {
      dispatch({
        type: "SET_LOADER",
        payload: false,
      });
    }
  }, [dispatch]);

  useEffect(() => {
    if (isEmpty(servicePricingAndAvailabilityPayload)) {
      fetchDeliverySettings(location?.id);
      getDeliveryTiers();
    }
  }, [
    fetchDeliverySettings,
    getDeliveryTiers,
    location,
    location.id,
    servicePricingAndAvailabilityPayload,
  ]);

  const handleServicePricingOptionChange = (val) => () => {
    dispatch({
      type: "TOGGLE_TIER_AND_RETAIL",
      payload: val,
    });
  };

  useEffect(() => {
    dispatch({
      type: "SET_DELIVERY_SETTINGS_DATA",
      payload: {deliverySettings},
    });
    dispatch({
      type: "SET_INITIAL_LOCATION_OR_ZONES_DATA",
      payload: {isEdit},
    });
    isEdit &&
      dispatch({
        type: "SAVE_INITIAL_PRICING",
      });
  }, [deliverySettings, dispatch, isEdit, servicePricingAndAvailabilityPayload]);

  const handleOnChangeServices = (option, index) => {
    dispatch({
      type: "HANDLE_CHANGE_SERVICE_FOR_RETAIL_PRICING",
      payload: {
        selectedService: option,
        selectedServiceIndex: index,
      },
    });
  };

  const handleAddAnotherService = () => {
    dispatch({
      type: "HANDLE_ADD_ANOTHER_SERVICE_FOR_RETAIL_PRICING",
    });
  };

  const isMoreSelectionAvailable = (arr) => {
    return !!flatten(arr?.map(({options}) => options)).length;
  };

  const getServicesForLocation = useCallback(async () => {
    try {
      dispatch({
        type: "SET_LOADER",
        payload: true,
      });
      const res = await fetchServicesOfLocation(location?.id);
      const {
        data: {services},
      } = res;
      dispatch({
        type: "SET_SERVICES_FOR_RETAIL_PRICING",
        payload: {
          services,
        },
      });
      if (isEdit) {
        dispatch({
          type: "SET_SELECTED_SERVICES_FOR_RETAIL_PRICING",
          payload: filterDeliverableServices(services),
        });
      }
    } catch (error) {
      dispatch({
        type: "SET_ERROR",
        payload:
          error?.response?.data?.error || "Something went wrong while fetching Services",
      });
    } finally {
      dispatch({
        type: "SET_LOADER",
        payload: false,
      });
    }
  }, [dispatch, isEdit, location]);

  /**
   * Save the option to offer dry cleaning with delivery
   *
   * @param {Boolean} offerDryCleaningBoolean
   */
  const handleSetOfferDryCleaningOption = async (offerDryCleaningBoolean) => {
    try {
      dispatch({
        type: "SET_LOADER",
        payload: true,
      });
      const res = await updateLocationSettings(location?.id, {
        offerDryCleaningForDelivery: offerDryCleaningBoolean,
        dryCleaningDeliveryPriceType: "RETAIL",
      });
      dispatch({
        type: "TOGGLE_OFFERS_DRY_CLEANING_FOR_DELIVERY",
        payload: res?.data?.storeSettings,
      });
    } catch (error) {
      dispatch({
        type: "SET_ERROR",
        payload:
          error?.response?.data?.error ||
          "Something went wrong while saving delivery settings",
      });
    } finally {
      dispatch({
        type: "SET_LOADER",
        payload: false,
      });
    }
  };

  useEffect(() => {
    isEmpty(servicePricingAndAvailabilityPayload) && getServicesForLocation();
  }, [getServicesForLocation, servicePricingAndAvailabilityPayload]);

  return (
    <div className="delivery-service__wrapper">
      <div className="delivery-service__title">
        <h6 className="lable-info-header-text ">
          How do you want to set the pricing and availability
          <br /> of services for pickup & delivery at this store?
        </h6>
        <div className="pricing-delivery-options-container ">
          <div className="type-of-pricing-delivery-options-selection">
            <div className="type-radio-button">
              <Radio
                selected={
                  deliveryPriceType === ServicePricingOption.storeRetailPricingOption
                }
                onChange={handleServicePricingOptionChange(
                  ServicePricingOption.storeRetailPricingOption
                )}
              />
              Use this store’s Retail pricing
            </div>
            <div className="type-radio-button">
              <Radio
                selected={deliveryPriceType === ServicePricingOption.deliveryTierPricing}
                onChange={handleServicePricingOptionChange(
                  ServicePricingOption.deliveryTierPricing
                )}
              />
              Use a Delivery Tier
            </div>
          </div>
        </div>
      </div>
      <div className="delivery-service__container">
        {deliveryPriceType === ServicePricingOption.storeRetailPricingOption ? (
          <div>
            <DeliveryService
              selectedServicesOptions={selectedServicesForRetailPricing}
              isMoreSelectionAvailable={isMoreSelectionAvailable(
                groupedServiceOptions(
                  locationServices,
                  selectedServicesForRetailPricing,
                  false,
                  flags
                )
              )} //checking if there are anymore services to select
              groupedServiceOptions={groupedServiceOptions(
                locationServices,
                selectedServicesForRetailPricing,
                false,
                flags
              )}
              handleOnChangeServices={handleOnChangeServices}
              handleAddService={handleAddAnotherService}
              showHeaderText={true}
              showDropdown={true}
              hasDryCleaningServices={hasDryCleaningServices}
              offerDryCleaningForDelivery={
                deliverySettings?.generalDeliverySettings?.offerDryCleaningForDelivery &&
                deliverySettings?.generalDeliverySettings
                  ?.dryCleaningDeliveryPriceType === "RETAIL"
              }
              saveDryCleaningToggle={handleSetOfferDryCleaningOption}
            />
          </div>
        ) : (
          <div>
            <DeliveryTierPricing
              state={state}
              dispatch={dispatch}
              deliverySettingsLoading={deliverySettingsLoading}
            />
          </div>
        )}
        {deliveryPriceType === ServicePricingOption.storeRetailPricingOption && (
          <div className="delivery-service__mobile-container">
            <img className="mobile-image" width="140" src={mobileIMg} alt={"cents"}></img>
          </div>
        )}
      </div>
    </div>
  );
};

export default ServicePricingAndAvailabilityWizard;
