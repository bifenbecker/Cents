import React, {useEffect} from "react";

import TextField from "../../../commons/textField/textField.js";
import Checkbox from "../../../commons/checkbox/checkbox.js";

const ServicePriceListItem = (props) => {
  const {
    item,
    isInline,
    onChange,
    fromLocations,
    fromPromotions,
    showApplyToAll,
    handleApplyAll,
    unselectedMessage,
    isApplyAllDisabled,
    showTaxable,
    enableSelectionForAllServices,
    isPricingTierScreen,
  } = props;

  const formatVal = (val) => {
    if (typeof val === "number") {
      return Number(val).toFixed(2);
    } else {
      return val || "";
    }
  };

  return (
    <div
      className={`service-price-item-wrapper ${
        item.hasMinPrice && item.isSelected ? "with-min-price" : "without-min-price"
      }`}
    >
      <div className="apply-link-and-title-container">
        <div className="title-container">
          <p className={`store-name ${!item.isSelected && "unselected-store-name"}`}>
            {item.title}
          </p>
          {item.isDeliverable && !enableSelectionForAllServices ? (
            <p className="unselected-message note-color">
              *Cannot unselect the service since it is deliverable.
            </p>
          ) : null}
        </div>
        {item.hasMinPrice ? (
          fromPromotions ? null : (
            <p
              className={`apply-to-all apply-to-all-width ${
                isApplyAllDisabled && "disabled"
              }`}
              onClick={handleApplyAll}
            >
              {showApplyToAll ? "Apply To All" : ""}
            </p>
          )
        ) : (
          ""
        )}
      </div>
      <div className={"price-inputs-section service-pricing-item"}>
        {item.isSelected ? (
          item.hasMinPrice ? (
            <>
              {fromPromotions ? (
                <p className="service-item-promotion-price">{item.price}</p>
              ) : (
                <TextField
                  isInline={isInline}
                  className={`service-item default-price ${
                    item.priceUnit === "unit" && "per-unit"
                  }`}
                  prefix="$"
                  suffix={`/${item.priceUnit}`}
                  value={formatVal(item.price)}
                  onChange={(e) => {
                    onChange && onChange("storePrice", e.target.value);
                  }}
                  onBlur={(e) => {
                    onChange &&
                      onChange("storePrice", Number(e.target.value).toFixed(2), true);
                  }}
                  maxLength="5"
                />
              )}
              <span className="bold-text service-pricing-row-text">Minimum:</span>
              <div className="pricing-sub-groups">
                <span className="service-pricing-row-text service-row-margin">first</span>
                <TextField
                  isInline={isInline}
                  className="service-item min-qty"
                  suffix={item.priceUnit}
                  value={item.minQty === 0 ? "0" : item.minQty || ""}
                  onChange={(e) => {
                    onChange && onChange("minQty", e.target.value);
                  }}
                  onBlur={(e) => {
                    onChange &&
                      onChange("minQty", Number(e.target.value).toString(), true);
                  }}
                  maxLength="4"
                />
              </div>
              <div className="pricing-sub-groups">
                <span className="service-pricing-row-text service-row-margin">@</span>
                <TextField
                  isInline={isInline}
                  className="service-item min-price"
                  prefix="$"
                  value={formatVal(item.minPrice)}
                  onChange={(e) => {
                    onChange && onChange("minPrice", e.target.value);
                  }}
                  onBlur={(e) => {
                    onChange &&
                      onChange("minPrice", Number(e.target.value).toFixed(2), true);
                  }}
                  maxLength="5"
                />
              </div>
              {showTaxable && (
                <div className="pricing-sub-groups">
                  <div className="service-row-margin">
                    <Checkbox
                      checked={item?.isTaxable}
                      onChange={() => {
                        onChange && onChange("isTaxable", !item.isTaxable, true);
                      }}
                    />
                  </div>
                  <span className="service-price-tax-text">Tax</span>
                </div>
              )}
            </>
          ) : (
            <>
              <div
                className={`column-margin ${isPricingTierScreen ? "picing-tier" : ""}`}
              >
                {fromPromotions ? (
                  <p className="service-item-promotion-price">{item.price}</p>
                ) : (
                  <TextField
                    isInline={isInline}
                    className={`service-item default-price ${
                      item.priceUnit === "unit" && "per-unit"
                    }`}
                    prefix="$"
                    suffix={`/${item.priceUnit}`}
                    value={formatVal(item.price)}
                    onChange={(e) => {
                      onChange && onChange("storePrice", e.target.value);
                    }}
                    onBlur={(e) => {
                      onChange &&
                        onChange("storePrice", Number(e.target.value).toFixed(2), true);
                    }}
                    maxLength="5"
                  />
                )}
              </div>
              {fromPromotions ? null : showTaxable ? (
                <div className="column-margin taxable-checkbox-margin">
                  <Checkbox
                    checked={item?.isTaxable}
                    onChange={() => {
                      onChange && onChange("isTaxable", !item.isTaxable, true);
                    }}
                  />
                  <span className="service-price-tax-text">Tax</span>
                </div>
              ) : null}
            </>
          )
        ) : (
          <p
            className={`error-message ${fromLocations ? "from-locations" : ""} ${
              fromPromotions ? "" : "column-margin"
            }`}
          >
            {unselectedMessage}
          </p>
        )}
        {!item.hasMinPrice && !(fromPromotions || isPricingTierScreen) ? (
          <p
            className={`apply-to-all ${isApplyAllDisabled && "disabled"}`}
            onClick={handleApplyAll}
          >
            {showApplyToAll ? "Apply To All" : ""}
          </p>
        ) : (
          ""
        )}
      </div>
    </div>
  );
};

export default ServicePriceListItem;
