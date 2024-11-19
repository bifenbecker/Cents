import React, {useMemo, useState} from "react";

import useToggle from "../../../../hooks/useToggle";

import CurrentOrAllRecurringOrdersChoice from "../../CurrentOrAllRecurringOrdersChoice";
import ServiceDockModal from "./ServiceDockModal";
import ModifierDockModal from "./ModfierDockModal";
import SeePricing from "./SeePricing";

const fetchModifiersForService = (services, servicePriceId) => {
  const selectedService = services?.find(
    service => service.prices[0].id === servicePriceId
  );
  if (selectedService?.serviceCategory?.category === "FIXED_PRICE") {
    return [];
  } else {
    return selectedService?.serviceModifiers?.map(modifier => {
      return {
        id: modifier.id,
        name: modifier.modifier.name,
        price: modifier.modifier.price,
      };
    });
  }
};

const ServiceSelection = props => {
  const {
    isOpen,
    toggle,
    services,
    shouldShowCurrentOrRecurringChoice,
    servicePriceId,
    modifierIds,
    onServiceAndModifiersChange,
    storeId,
    postalCode,
  } = props;

  const [orderServicePriceIdState, setOrderServicePriceIdState] = useState(
    servicePriceId
  );
  const [orderServiceModifierIdsState, setOrderServiceModifierIdsState] = useState(
    modifierIds
  );
  const {isOpen: addOnModal, toggle: toggleAddOnModal} = useToggle();
  const {isOpen: subscriptionModal, toggle: toggleSubscriptionModal} = useToggle();
  const {isOpen: showPricing, toggle: toggleShowPricing} = useToggle();

  const modifiers = useMemo(
    () => fetchModifiersForService(services, orderServicePriceIdState),
    [orderServicePriceIdState, services]
  );

  const setServicePriceId = service => {
    const {
      prices: [{id: priceId}],
    } = service;
    // If there is no change in the selected service modifierIds are not reset
    if (priceId !== orderServicePriceIdState) {
      setOrderServiceModifierIdsState([]);
    }
    setOrderServicePriceIdState(priceId);
    if (fetchModifiersForService(services, priceId)?.length) {
      toggleAddOnModal();
    }
  };

  const onSubscriptionUpdate = choice => {
    onSubmit(choice);
    toggleSubscriptionModal();
  };

  const handleSave = () => {
    if (shouldShowCurrentOrRecurringChoice) {
      toggleSubscriptionModal();
    } else {
      onSubmit();
    }
  };

  const onSubmit = (choice = null) => {
    toggle();
    onServiceAndModifiersChange(
      orderServicePriceIdState,
      orderServiceModifierIdsState,
      choice
    );
  };

  return (
    <>
      {services?.length ? (
        <ServiceDockModal
          isOpen={isOpen}
          toggle={toggle}
          services={services}
          selectedServicePriceId={orderServicePriceIdState}
          selectedModifiersId={orderServiceModifierIdsState}
          setServicePriceId={setServicePriceId}
          handleSave={handleSave}
          toggleShowPricing={toggleShowPricing}
        />
      ) : null}

      <ModifierDockModal
        isOpen={addOnModal}
        toggle={toggleAddOnModal}
        modifiers={modifiers}
        selectedModifierIds={orderServiceModifierIdsState}
        onModifierIdsChange={setOrderServiceModifierIdsState}
      />

      <CurrentOrAllRecurringOrdersChoice
        isOpen={shouldShowCurrentOrRecurringChoice && subscriptionModal}
        toggle={toggleSubscriptionModal}
        header="Edit Services"
        onSubmit={onSubscriptionUpdate}
      />
      <SeePricing
        showPricing={showPricing}
        toggleShowPricing={toggleShowPricing}
        storeId={storeId}
        postalCode={postalCode}
      />
    </>
  );
};

export default ServiceSelection;
