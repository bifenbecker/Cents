import React from "react";
import PropTypes from "prop-types";

import Checkbox from "../../../commons/checkbox/checkbox.js";

import PromotionProductItem from "./promotion-product-item.js";
import EditableProductItem from "./editable-product-item.js";
import ServicePriceListItem from "./service-price-list-item";

const PriceListItem = (props) => {
  let {
    item,
    showApplyToAll,
    onChange,
    unselectedMessage,
    isApplyAllDisabled,
    onApplyAll,
    type,
    showImage,
    isInline,
    fromPromotions,
    fromLocations,
    showTaxable,
    showQuantity,
    enableSelectionForAllServices,
    isPricingTierScreen,
  } = props;

  if (!item) {
    return null;
  }

  const handleApplyAll = () => {
    if (isApplyAllDisabled) {
      return;
    }

    onApplyAll && onApplyAll();
  };

  const renderServicesContent = () => {
    return (
      <ServicePriceListItem
        item={item}
        onChange={onChange}
        isInline={isInline}
        fromLocations={fromLocations}
        fromPromotions={fromPromotions}
        showApplyToAll={showApplyToAll}
        handleApplyAll={handleApplyAll}
        unselectedMessage={unselectedMessage}
        isApplyAllDisabled={isApplyAllDisabled}
        showTaxable={showTaxable}
        enableSelectionForAllServices={enableSelectionForAllServices}
        isPricingTierScreen={isPricingTierScreen}
      />
    );
  };

  return (
    <div
      className={`${
        item.hasMinPrice && item.isSelected ? "left-aligned-row" : "center-aligned-row"
      } service-price-list-item ${fromPromotions ? "promotion-item" : null}`}
    >
      <Checkbox
        checked={item.isSelected}
        disabled={item.isSelected && item.isDeliverable && !enableSelectionForAllServices}
        onChange={() => {
          onChange && onChange("isSelected", !item.isSelected, true);
        }}
      />
      {type === "PRODUCT" ? (
        fromPromotions ? (
          <PromotionProductItem
            showImage={showImage}
            item={item}
            unselectedMessage={unselectedMessage}
          />
        ) : (
          <EditableProductItem
            showImage={showImage}
            item={item}
            unselectedMessage={unselectedMessage}
            onChange={onChange}
            isInline={isInline}
            showApplyToAll={showApplyToAll}
            isApplyAllDisabled={isApplyAllDisabled}
            handleApplyAll={handleApplyAll}
            showTaxable={showTaxable}
            showQuantity={showQuantity}
          />
        )
      ) : (
        renderServicesContent()
      )}
    </div>
  );
};

PriceListItem.propTypes = {
  item: PropTypes.shape({
    title: PropTypes.string.isRequired,
    isSelected: PropTypes.bool,
    hasMinPrice: PropTypes.bool,
    minQty: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    price: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    priceUnit: PropTypes.string,
    quantity: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    imageUrl: PropTypes.string,
  }).isRequired,
  showApplyToAll: PropTypes.bool, // Used to allocate space for apply all button
  isApplyAllDisabled: PropTypes.bool, // Used to hide the apply to all button
  unselectedMessage: PropTypes.string, // Used to show a message under title when not selected
  onChange: PropTypes.func,
  onApplyAll: PropTypes.func,
  showImage: PropTypes.bool,
  type: PropTypes.oneOf(["PRODUCT", "SERVICE"]),
  enableSelectionForAllServices: PropTypes.bool,
  isPricingTierScreen: PropTypes.bool,
};

PriceListItem.defaultProps = {
  showApplyToAll: false,
  showImage: false,
  editable: false,
  showTaxable: true,
  showQuantity: true,
  enableSelectionForAllServices: false,
  isPricingTierScreen: false,
};

export default PriceListItem;
