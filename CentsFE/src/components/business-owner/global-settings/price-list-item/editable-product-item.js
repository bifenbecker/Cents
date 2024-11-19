import React from "react";

import placeHolderImage from "../../../../assets/images/Icon_Image_Placeholder.svg";

import Checkbox from "../../../commons/checkbox/checkbox";
import TextField from "../../../commons/textField/textField";

const EditableProductItem = (props) => {
  const {
    showImage,
    item,
    unselectedMessage,
    onChange,
    isInline,
    showApplyToAll,
    isApplyAllDisabled,
    handleApplyAll,
    showTaxable,
    showQuantity,
  } = props;

  return (
    <>
      {showImage ? (
        <div className="image-container">
          <img src={item.imageUrl || placeHolderImage} alt="" />
        </div>
      ) : null}
      <div className="title-container">
        <p className={`store-name ${!item.isSelected && "unselected-store-name"}`}>
          {item.title}
        </p>
        {item.isSelected ? (
          false
        ) : (
          <p className="unselected-message">{unselectedMessage}</p>
        )}
      </div>

      <div className="price-inputs-section">
        {showQuantity && (
          <TextField
            isInline={isInline}
            className={`product-item product-qty ${
              !item.isSelected && item.quantity > 0 ? "unselected" : ""
            }`}
            value={item.quantity === 0 ? "0" : item.quantity || ""}
            onChange={(e) => {
              onChange && onChange("quantity", e.target.value);
            }}
            onBlur={(e) => {
              onChange && onChange("quantity", Number(e.target.value).toString(), true);
            }}
            maxLength="4"
          />
        )}
        <TextField
          isInline={isInline}
          className="product-item product-price"
          prefix="$"
          value={
            item.price === 0
              ? "0.00"
              : typeof item.price === "number"
              ? item.price.toFixed(2)
              : item.price || ""
          }
          onChange={(e) => {
            onChange && onChange("price", e.target.value);
          }}
          onBlur={(e) => {
            onChange && onChange("price", Number(e.target.value).toFixed(2), true);
          }}
          maxLength="5"
        />
      </div>
      {showTaxable && (
        <div className="taxable-section">
          <div className="product-item editable-checkbox">
            <Checkbox
              checked={item.isTaxable}
              onChange={() => {
                onChange && onChange("isTaxable", !item.isTaxable, true);
              }}
            />
          </div>
        </div>
      )}
      {showApplyToAll ? (
        <p
          className={`apply-to-all ${isApplyAllDisabled && "disabled"}`}
          onClick={handleApplyAll}
        >
          Apply to All
        </p>
      ) : (
        <div style={{width: "35px"}} />
      )}
    </>
  );
};

export default EditableProductItem;
