import React from "react";
import {subsidyTypes} from "../../../constants";

import DeliverySubsidyForm from "./delivery-subsidy-form";

const DeliverySubsidy = ({
  subsidyInCents,
  setSubsidyInCents,
  returnOnlySubsidyInCents,
  setReturnOnlySubsidyInCents,
}) => {
  return (
    <div className="delivery-subsidy__container">
      <DeliverySubsidyForm
        subsidyValueInCents={subsidyInCents}
        updateSubsidy={setSubsidyInCents}
        type={subsidyTypes.onlineOrders}
        className="delivery-subsidy__marginBottom"
      />
      <DeliverySubsidyForm
        subsidyValueInCents={returnOnlySubsidyInCents}
        updateSubsidy={setReturnOnlySubsidyInCents}
        type={subsidyTypes.walkinOrders}
      />
    </div>
  );
};

export default DeliverySubsidy;
