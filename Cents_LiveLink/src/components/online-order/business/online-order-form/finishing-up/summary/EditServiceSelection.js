import React from "react";
import {useHookstate} from "@hookstate/core";

import {onlineOrderState} from "../../../../../../state/online-order";

import {ServiceSelectionDockModalForm} from "../../../../../common/order-sections";

const EditServiceSelection = props => {
  const {isOpen, toggle, services} = props;

  const orderServicePriceIdState = useHookstate(onlineOrderState.servicePriceId);
  const orderServiceModifierIdsState = useHookstate(onlineOrderState.serviceModifierIds);
  const storeIdState = useHookstate(onlineOrderState.storeId);

  const handleServicesAndModifiersChange = (servicePriceId, modifierIds) => {
    orderServicePriceIdState.set(servicePriceId);
    orderServiceModifierIdsState.set(modifierIds);
  };

  return (
    <ServiceSelectionDockModalForm
      isOpen={isOpen}
      toggle={toggle}
      services={services}
      servicePriceId={orderServicePriceIdState.value}
      modifierIds={orderServiceModifierIdsState.value}
      onServiceAndModifiersChange={handleServicesAndModifiersChange}
      storeId={storeIdState.value}
    />
  );
};

export default EditServiceSelection;
