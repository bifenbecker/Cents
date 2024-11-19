import React, {Fragment, useEffect, useState} from "react";
import map from "lodash/map";

import ToggleSwitch from "../../../../commons/toggle-switch/toggleSwitch";
import PriceListItem from "../../price-list-item";
import BlockingLoader from "../../../../commons/blocking-loader/blocking-loader";

import {applyPriceToAllLocations} from "../../../../../api/business-owner/services";
const PricePerLocation = (props) => {
  let {activeServiceId, fetchServiceDetails, isServiceDetailsLoading} = props;
  const [applyToAllInProgress, setApplyToAllInProgress] = useState(false);
  const [editError, setEditError] = useState();

  useEffect(() => {
    if (!activeServiceId) {
      return;
    }
    fetchServiceDetails(activeServiceId);
  }, [activeServiceId, fetchServiceDetails]);

  if (!props.activeServiceDetails) {
    return null;
  }

  let {prices, hasMinPrice, serviceCategoryId} = props.activeServiceDetails;

  const applyPriceToAll = async (price) => {
    try {
      setApplyToAllInProgress(true);
      const featuredLocations = props.activeServiceDetails?.prices?.filter(
        (ele) => ele.isFeatured
      );
      const applyToAllPrice = {
        storePrice: price.storePrice,
        isTaxable: price.isTaxable,
      };
      if (hasMinPrice) {
        applyToAllPrice.minPrice = price.minPrice;
        applyToAllPrice.minQty = price.minQty;
      }
      await applyPriceToAllLocations(
        props.activeServiceDetails.id,
        applyToAllPrice,
        map(featuredLocations, "id")
      );
      props.handleApplyAll(price);
    } catch (error) {
      setEditError(
        error?.response?.data?.error || "Cannot apply price to all locations!"
      );
      setTimeout(() => {
        setEditError();
      }, 2000);
    } finally {
      setApplyToAllInProgress(false);
    }
  };

  const renderPrices = () => {
    return prices.map((price, index) => {
      let serviceItem = {
        minQty: price.minQty,
        price: price.storePrice,
        title: price.store?.name,
        minPrice: price.minPrice,
        hasMinPrice: hasMinPrice,
        isSelected: price.isFeatured,
        isTaxable: !!price.isTaxable,
        isDeliverable: price.isDeliverable,
        priceUnit:
          serviceCategoryId === props.drycleaningServicesCategoryList.perPoundId
            ? "lb"
            : "unit",
      };
      return (
        <PriceListItem
          key={`service-location-${price.id}`}
          item={serviceItem}
          showApplyToAll={index === prices?.findIndex((price) => price.isFeatured)}
          unselectedMessage="Not featured in this location"
          onChange={(field, value, shouldSubmit) => {
            const formField = field === "isSelected" ? "isFeatured" : field;
            const formValue =
              typeof value === "boolean"
                ? value
                : value.replace(/[^0-9.]/g, "").replace(/(\..*)\./g, "$1");
            const storeId = price.storeId;
            props.handleChange(
              price.serviceId,
              formValue,
              storeId,
              formField,
              shouldSubmit,
              props.activeServiceDetails.id,
              props.activeServiceDetails.serviceCategoryId,
              props.activeServiceDetails.prices
            );
          }}
          onApplyAll={() => {
            applyPriceToAll(price);
          }}
        />
      );
    });
  };

  return (
    <Fragment>
      {isServiceDetailsLoading || applyToAllInProgress || editError ? (
        <BlockingLoader error={editError} />
      ) : null}
      <div className="service-prices-content">
        <div className="edit-service-header-container">
          {serviceCategoryId === props?.drycleaningServicesCategoryList?.perPoundId && (
            <div className="minimum-toggle-container">
              <p>There is a minimum</p>
              <ToggleSwitch
                onChange={(hasMinPriceToggle) => {
                  props.toggleMinimum(hasMinPriceToggle, props.activeServiceDetails);
                }}
                checked={hasMinPrice}
              />
              <p className="error-message">{props.servicesPricesError}</p>
            </div>
          )}
          {props.activeRoundedTab === "per-pound" &&
            (props.activeServiceDetails.hasMinPrice ||
            !props.activeServiceDetails?.prices.find(
              (price) => price.isFeatured
            ) ? null : (
              <div className="edit-service-headers">
                <span className="bold-text service-header-margin">Price / Lb</span>
                <span className="bold-text service-header-margin">Taxable</span>
              </div>
            ))}
          {props.activeRoundedTab === "fixed-price" &&
            (props.activeServiceDetails.hasMinPrice ||
            !props.activeServiceDetails?.prices.find(
              (price) => price.isFeatured
            ) ? null : (
              <div className="edit-service-headers">
                <span className="bold-text service-header-margin">Price</span>
                <span className="bold-text service-header-margin">Taxable</span>
              </div>
            ))}
        </div>
        <div className="service-prices-list-container">{renderPrices()}</div>
      </div>
      {(props.pricePerLocationCallInProgress || props.hasMinPriceUpdating) && (
        <BlockingLoader />
      )}
    </Fragment>
  );
};

export default PricePerLocation;
