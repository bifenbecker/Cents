import React from "react";

import placeHolderImage from "../../../../assets/images/Icon_Image_Placeholder.svg";

const PromotionProductItem = (props) => {
  const {showImage, item, unselectedMessage} = props;

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
        {item.isSelected ? null : (
          <p className="unselected-message">{unselectedMessage}</p>
        )}
      </div>

      <div className="price-inputs-section">
        <p className="product-item product-price promotion-item">{item.price}</p>
      </div>
    </>
  );
};

export default PromotionProductItem;
