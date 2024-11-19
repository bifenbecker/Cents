import React from "react";

export default (subcategory) => {
  const uniquePricesArr = [];
  const isFeaturedArr = subcategory.prices.filter((obj) => obj.isFeatured && obj.storeId);

  if (isFeaturedArr.length > 1) {
    isFeaturedArr.forEach(
      (obj) =>
        !uniquePricesArr.includes(obj.storePrice) && uniquePricesArr.push(obj.storePrice)
    );
  }

  const priceScheme = subcategory.servicePricingStructureId === 2 ? "/ unit" : "/ lb";

  return (
    <p className="service-item-dollar-amount text-item">
      {!isFeaturedArr.length
        ? `$0.00 ${priceScheme}`
        : uniquePricesArr.length === 1
        ? `$${uniquePricesArr[0].toFixed(2)} ${priceScheme}`
        : `${uniquePricesArr.length} prices`}
    </p>
  );
};
