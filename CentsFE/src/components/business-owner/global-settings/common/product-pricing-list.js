import React, {useMemo} from "react";
import {Link} from "react-router-dom";

import BlockingLoader from "../../../commons/blocking-loader/blocking-loader";
import Checkbox from "../../../commons/checkbox/checkbox";
import PriceListItem from "../price-list-item";

const handleChangeItemFactory = (item, handleChange) => {
  return (field, value, isBlur) => handleChange(item, field, value, isBlur);
};

const handleSelectAllFactory = (handleSelectAll) => {
  return (e) => {
    handleSelectAll && handleSelectAll(e);
  };
};

const ProductPricingList = (props) => {
  const {
    // Product List state
    error,
    items,
    loading,
    unselectedMessage,
    nullDescription,
    showTaxable,
    showQuantity,
    // Individual items props.
    handleChange,
    showImage,
    isInline,
    keyExtractor,
    fromPromotions,
    // select all state
    showSelectAll,
    handleSelectAll,
    // Apply all state
    canApplyAll,
    onApplyAll,
    isApplyAllDisabled,
    // Editing state
    editLoading,
    editError,
    // display states
    hideHeaders,
    showProductsScreenLink,
  } = props;

  const allSelected = useMemo(() => items?.every(({isSelected}) => isSelected), [items]);
  return (
    <>
      {error ? (
        <p>{error}</p>
      ) : loading ? (
        <BlockingLoader />
      ) : !items?.length ? (
        <div className="product-qty-price-header null-description">
          <p>{nullDescription}</p>
        </div>
      ) : (
        <>
          {editLoading || editError ? <BlockingLoader error={editError} /> : null}
          {hideHeaders ? null : (
            <div className="product-qty-price-header">
              {showSelectAll ? (
                <div
                  className={`select-all-container ${
                    fromPromotions ? "promotion-container" : "products-select-all"
                  }`}
                >
                  <Checkbox
                    checked={allSelected}
                    onChange={handleSelectAllFactory(handleSelectAll)}
                  />
                  <button className="btn btn-text-only cancel-button">
                    {allSelected ? "Deselect All" : "Select All"}
                  </button>
                </div>
              ) : showProductsScreenLink ? (
                <div className="services-buttons-container product-btn-container">
                  <Link
                    to="/global-settings/products-services/products"
                    className="btn btn-text-only go-to-button"
                  >
                    Go to my products {">"}
                  </Link>
                </div>
              ) : (
                <div style={{width: "188px", flexShrink: 0}} />
              )}
              {fromPromotions ? null : (
                <div className="right-header">
                  {showQuantity && <p className="quantity">QTY</p>}
                  <p className="price">Price</p>
                  {showTaxable && <p className="taxable">Taxable</p>}
                  <p className="apply-to-all-spacer" />
                </div>
              )}
            </div>
          )}
          <div className="product-list-wrapper">
            <div className="product-list-scroll-conatiner">
              {items?.map((item, index) => (
                <PriceListItem
                  showApplyToAll={canApplyAll && index === 0}
                  key={keyExtractor(item, index)}
                  item={item}
                  type="PRODUCT"
                  unselectedMessage={unselectedMessage}
                  onChange={handleChangeItemFactory(item, handleChange)}
                  onApplyAll={onApplyAll}
                  isApplyAllDisabled={isApplyAllDisabled}
                  showImage={showImage}
                  isInline={isInline}
                  fromPromotions={fromPromotions}
                  showTaxable={showTaxable}
                  showQuantity={showQuantity}
                />
              ))}
            </div>
          </div>
        </>
      )}
    </>
  );
};

ProductPricingList.propTypes = {};

ProductPricingList.defaultProps = {
  unselectedMessage: "Not featured in this location",
  isInline: false,
  showImage: false,
  canApplyAll: false,
  hideHeaders: false,
  showTaxable: true,
  showQuantity: true,
};

export default ProductPricingList;
