/* eslint-disable react-hooks/exhaustive-deps */
import React, {useCallback, useState, useEffect, useMemo} from "react";
import {useFlags} from "launchdarkly-react-client-sdk";
import {cloneDeep, flatten} from "lodash";

import mobileIMg from "../../../../../assets/images/Delivery Service Mockup.png";
import closeImg from "../../../../../assets/images/close.svg";
import faPlus from "../../../../../assets/images/Mask.svg";
import Dropdown from "../../../global-settings/locations/general-delivery-settings/forms/service-pricing-availability/Dropdown";
import {toDollars} from "../../locations/utils/location";
import Radio from "components/commons/radio/radio";

const AddEditOnlineOrderServices = ({setTierData, tierData}) => {
  const [selectedServicesOptions, setSelectedServicesOptions] = useState([]);
  const [hasMoreFeaturedPrices, setHasMoreFeaturedPrices] = useState();
  const [offerDryCleaning, setOfferDryCleaning] = useState(false);
  const flags = useFlags();

  const hasDryCleaningServices = useMemo(() => {
    const dryCleaningServices = tierData?.servicesData?.filter((item) => {
      return item?.categoryType === "DRY_CLEANING";
    });
    return dryCleaningServices?.length > 0;
  }, [tierData?.servicesData]);

  /**
   * Change the state value of the offerDryCleaning option
   */
  const handleOfferDryCleaningChange = () => {
    setOfferDryCleaning(!offerDryCleaning);
    setTierData({
      ...tierData,
      offerDryCleaningForDeliveryTier: !offerDryCleaning,
    });
  };

  const handleAddService = () => {
    if (selectedServicesOptions?.length !== hasMoreFeaturedPrices) {
      setSelectedServicesOptions([...selectedServicesOptions, null]);
    }
  };

  const handleOnChangeServices = (option, index) => {
    const updatedSelection = cloneDeep(selectedServicesOptions);
    if (option) {
      updatedSelection[index] = option;
    } else {
      updatedSelection.splice(index, 1);
    }

    setSelectedServicesOptions(updatedSelection);
    setTierData((state) => ({
      ...state,
      onlineOrderServices: updatedSelection,
    }));
  };

  useEffect(() => {
    if (tierData?.servicesData) {
      setHasMoreFeaturedPrices(
        flatten(groupedServiceOptions?.map(({options}) => options))?.length
      );
      filterDeliverableServices(tierData?.servicesData, tierData?.onlineOrderServices);
    }
  }, [tierData.servicesData]);

  const filterDeliverableServices = useCallback((services, onlineOrderServices) => {
    let filterDeliverableServicesOptions = [];
    ["PER_POUND", "FIXED_PRICE"].forEach((serviceCategory) => {
      filterDeliverableServicesOptions = [
        ...filterDeliverableServicesOptions,
        ...(
          services?.find(({category}) => category === serviceCategory) || {services: []}
        ).services?.filter(({prices: [{isFeatured}]}) => isFeatured),
      ];
    });

    if (filterDeliverableServicesOptions?.length) {
      let featuredServices = onlineOrderServices?.filter((service) =>
        filterDeliverableServicesOptions?.find((order) => service?.value === order?.id)
      );

      setSelectedServicesOptions(
        featuredServices?.length ? featuredServices : [...selectedServicesOptions, null]
      );
      setTierData((state) => ({
        ...state,
        onlineOrderServices: featuredServices,
      }));
    }
  }, []);

  const filterByCategory = useCallback(
    (serviceCategory) => {
      if (!tierData?.servicesData?.length) {
        return [];
      }
      const isPerPound = serviceCategory === "PER_POUND";
      return (
        tierData?.servicesData?.find(({category}) => category === serviceCategory) || {
          services: [],
        }
      )?.services
        ?.filter(({prices: [{isFeatured}]}) => isFeatured)
        ?.map(({name, id, hasMinPrice, prices: [{storePrice}]}) => {
          return {
            label: name,
            value: id,
            metaInfo: `(${hasMinPrice ? "min + " : ""}${toDollars(storePrice)} / ${
              isPerPound ? "lb" : "unit"
            })`,
          };
        })
        ?.filter(
          ({value}) => !selectedServicesOptions.find((option) => option?.value === value)
        );
    },
    [selectedServicesOptions, tierData, tierData.servicesData]
  );

  const buildDropDown = () => {
    const memoArr = [
      {
        label: flags.cents20 ? "Wash & Fold" : "/Lb",
        options: filterByCategory("PER_POUND"),
      },
    ];

    if (!flags.cents20) {
      memoArr.push({
        label: "Fixed Price",
        options: filterByCategory("FIXED_PRICE"),
      });
    }

    return memoArr;
  };

  const groupedServiceOptions = useMemo(() => buildDropDown(), [filterByCategory]);

  const isMoreSelectionAvailable = useMemo(
    () => !!flatten(groupedServiceOptions?.map(({options}) => options))?.length,
    [groupedServiceOptions]
  );

  return (
    <div className="delivery-service-tier__wrapper">
      <div className="delivery-service-tier__title">
        <h6 className="delivery-service-tier__header">
          Please select the wash & fold services you want to offer for pickup and
          delivery.
        </h6>
      </div>
      <div className="delivery-service-tier__container">
        <div className="delivery-service-tier__dropdown-container">
          <div className="delivery-service-tier__dropdown-container__small-heading-pricing-tier">
            <small>
              We recommend a maximum of 2-3
              <br />
              services. Customer can only choose 1.
            </small>
          </div>

          {flags?.cents20 && hasDryCleaningServices && (
            <div className="type-radio-button offer-dry-cleaning-container">
              <Radio
                selected={offerDryCleaning}
                onChange={handleOfferDryCleaningChange}
              />
              Offer Dry Cleaning service
            </div>
          )}

          {selectedServicesOptions?.map((selectedOption, index) => {
            return (
              <div key={selectedOption?.value || index} className="dropdown-item-wrapper">
                <Dropdown
                  options={groupedServiceOptions}
                  defaultValue={selectedOption}
                  onChange={(selected) => handleOnChangeServices(selected, index)}
                  placeholder="Service"
                />
                {selectedServicesOptions.length <= 1 ? null : (
                  <div className="close-icon">
                    <img
                      alt="icon"
                      src={closeImg}
                      onClick={() => handleOnChangeServices(undefined, index)}
                    />
                  </div>
                )}
              </div>
            );
          })}
          {isMoreSelectionAvailable ? (
            hasMoreFeaturedPrices === selectedServicesOptions?.length ? (
              <div className="add-service">
                <p>No services to add</p>
              </div>
            ) : (
              <div className="add-service ">
                <p onClick={handleAddService}>
                  <span className="plus-button">
                    <img src={faPlus} alt="" />
                  </span>
                  <span className="plus-button-text">Add another Service</span>
                </p>
              </div>
            )
          ) : (
            <div className="add-service">
              <p>No services to select</p>
            </div>
          )}
        </div>
        <div className="delivery-service-tier__mobile-container">
          <img width="140" src={mobileIMg} alt={"cents"}></img>
        </div>
      </div>
    </div>
  );
};

export default AddEditOnlineOrderServices;
