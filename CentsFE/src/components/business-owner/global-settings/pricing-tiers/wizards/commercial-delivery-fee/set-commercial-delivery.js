import React from "react";
import CommercialDeliveryFee from "./commercial-delivery";

const SetCommercialTierDelivery = ({setTierData, loading}) => {
  const onDeliveryFeeUpdate = (deliveryFeeInCents) => {
    setTierData((state) => ({
      ...state,
      commercialDeliveryFeeInCents: deliveryFeeInCents,
    }));
  };

  return (
    <>
      <div className="new-delivery-container">
        <CommercialDeliveryFee
          loading={loading}
          onDeliveryFeeUpdate={onDeliveryFeeUpdate}
        />
      </div>
    </>
  );
};

export default SetCommercialTierDelivery;
