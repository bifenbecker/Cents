import React from "react";
import PriceListItem from "../../price-list-item";
import PropTypes from "prop-types";

const Prices = ({newServicePriceItems, formInputs, handleChange, handleApplyAll}) => {
  if (!newServicePriceItems) {
    return null;
  }

  return newServicePriceItems.prices.map((price, index) => {
    const serviceItem = {
      minQty: price.minQty,
      price: price.storePrice,
      title: price.store?.name,
      minPrice: price.minPrice,
      isTaxable: price?.isTaxable,
      isSelected: price.isFeatured,
      hasMinPrice:
        formInputs.serviceType === "per-pound" ? newServicePriceItems.hasMinPrice : false,
      priceUnit: formInputs.serviceType === "per-pound" ? "lb" : "unit",
    };

    return (
      <PriceListItem
        type="SERVICE"
        key={`service-location-${price.id}`}
        item={serviceItem}
        showApplyToAll={
          index === newServicePriceItems?.prices?.findIndex((price) => price.isFeatured)
        }
        unselectedMessage="Not featured in this location"
        onChange={(field, value) => {
          const formField = field === "isSelected" ? "isFeatured" : field;
          const formValue =
            typeof value === "boolean"
              ? value
              : value.replace(/[^0-9.]/g, "").replace(/(\..*)\./g, "$1");
          const storeId = price.storeId;
          handleChange(formValue, storeId, formField);
        }}
        onApplyAll={() => handleApplyAll(index)}
      />
    );
  });
};

Prices.propTypes = {
  newServicePriceItems: PropTypes.array,
  formInputs: PropTypes.object,
  handleChange: PropTypes.func,
  handleApplyAll: PropTypes.func,
};

export default Prices;
