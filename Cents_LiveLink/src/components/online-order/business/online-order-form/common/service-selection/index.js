import React, {useMemo, useState} from "react";
import {Box, Text} from "rebass/styled-components";
import {useState as useHookState, none} from "@hookstate/core";

import {onlineOrderState} from "../../../../../../state/online-order";
import {sectionStyles} from "../../finishing-up/styles";
import {
  DryCleaningIllustration,
  CheckIcon,
  LaundryServiceIllustration,
} from "../../../../../../assets/images";

import ServiceButton from "./service-button";
import ModifierDrawer from "../modifier-drawer";

import {ServiceSelectionImageCard} from "../../../../../common";

import {businessSettingsSelectors} from "../../../../../../features/business/redux";
import {useAppSelector} from "app/hooks";

const ServiceSelection = (props) => {
  const {
    services,
    hasDryCleaning,
    hasLaundry,
    toggleLaundry,
    toggleDryCleaning,
    offersDryCleaning,
  } = props;

  const businessSettings = useAppSelector(
    businessSettingsSelectors.getBusinessSettingsFromRedux
  );
  const [showModifierDrawer, setShowModifierDrawer] = useState(false);

  // Import global order state and update service and modifier details here only.

  const orderServicePriceIdState = useHookState(onlineOrderState.servicePriceId);
  const orderServiceModifierIdsState = useHookState(onlineOrderState.serviceModifierIds);
  const laundrySelectionState = useHookState(onlineOrderState.hasLaundry);

  const modifiers = useMemo(() => {
    const selectedService = services?.find(
      (service) => service.prices[0].id === orderServicePriceIdState.value
    );
    if (selectedService?.serviceCategory?.category === "FIXED_PRICE") {
      return [];
    } else {
      return selectedService?.serviceModifiers?.map((modifier) => {
        return {
          id: modifier.id,
          name: modifier.modifier.name,
          price: modifier.modifier.price,
        };
      });
    }
  }, [orderServicePriceIdState.value, services]);

  const setServicePriceId = (service) => {
    const {
      prices: [{id: priceId}],
    } = service;
    // If there is no change in the selected service modifierIds are not reset
    if (priceId !== orderServicePriceIdState.get()) {
      orderServiceModifierIdsState.set([]);
    }
    orderServicePriceIdState.set(priceId);
    laundrySelectionState.set(true);
    setShowModifierDrawer(true);
  };

  const setServiceModifierIds = (modifier) => {
    const selectedModifiers = orderServiceModifierIdsState?.get();
    if (selectedModifiers?.includes(modifier.id)) {
      const itemIndex = selectedModifiers.indexOf(modifier.id);
      orderServiceModifierIdsState[itemIndex].set(none);
    } else {
      orderServiceModifierIdsState.merge([modifier.id]);
    }
  };

  /**
   * Determine the count of modifiers added for a given service
   *
   */
  const getServiceModifierCount = () => {
    const selectedModifiers = orderServiceModifierIdsState?.get();
    return selectedModifiers?.length;
  };

  /**
   * Render the dry cleaning section and card selector
   */
  const renderDryCleaningSection = () => {
    return (
      <Box paddingY={"12px"}>
        <Box {...styles.section.header}>Dry Cleaning</Box>
        <Box padding={"12px"}>
          <ServiceSelectionImageCard
            imageSource={DryCleaningIllustration}
            title="Dry Cleaning"
            itemSelected={hasDryCleaning}
            activeStateImage={CheckIcon}
            onClick={toggleDryCleaning}
            illustrationDimensions={{height: "110px", width: "125px"}}
          />
        </Box>
        {hasDryCleaning && (
          <Text {...styles.disclaimerText}>
            Please place garments for dry cleaning in a separate bag from your laundry.
          </Text>
        )}
      </Box>
    );
  };

  /**
   * Render the laundry section
   */
  const renderLaundrySection = () => {
    return (
      <Box paddingY={"12px"}>
        <Box {...styles.section.header}>Laundry</Box>
        <Box padding={"12px"}>
          <ServiceSelectionImageCard
            imageSource={LaundryServiceIllustration}
            title="Laundry"
            itemSelected={hasLaundry}
            activeStateImage={CheckIcon}
            onClick={toggleLaundry}
            illustrationDimensions={{height: "72px", width: "95px"}}
          />
        </Box>
        {hasLaundry && renderLaundryServices()}
      </Box>
    );
  };

  /**
   * Render the laundry service options
   */
  const renderLaundryServices = () => {
    return services?.length ? (
      <>
        <Box {...styles.wrapper}>
          <Text {...styles.header}>Select a service:</Text>
          <Box {...styles.services.wrapper}>
            {services?.map((service) => {
              return (
                <Box {...styles.services.buttonContainer} key={service.id}>
                  <ServiceButton
                    service={service}
                    checked={service.prices[0].id === orderServicePriceIdState.get()}
                    onChange={() => setServicePriceId(service)}
                    modifierCount={getServiceModifierCount()}
                  />
                </Box>
              );
            })}
          </Box>
        </Box>
        <ModifierDrawer
          isOpen={modifiers?.length && showModifierDrawer}
          modifiers={modifiers}
          setServiceModifierIds={setServiceModifierIds}
          modifierIds={orderServiceModifierIdsState}
          onSubmit={() => {
            setShowModifierDrawer(false);
          }}
        />
      </>
    ) : null;
  };

  return (
    <Box>
      {businessSettings?.dryCleaningEnabled &&
        offersDryCleaning &&
        renderDryCleaningSection()}
      {businessSettings?.dryCleaningEnabled && offersDryCleaning
        ? renderLaundrySection()
        : renderLaundryServices()}
    </Box>
  );
};

const styles = {
  section: sectionStyles,
  disclaimerText: {
    fontFamily: "secondary",
    padding: "0px 24px 0px 16px",
  },
  wrapper: {
    mt: "8px",
  },
  header: {
    fontSize: "18px",
    ml: "18px",
    paddingBottom: "12px",
  },
  services: {
    wrapper: {
      display: "block",
      width: "100%",
      p: "12px 12px",
      sx: {
        overflowX: "auto",
        whiteSpace: "nowrap",
      },
    },
    buttonContainer: {
      p: "12px 12px",
    },
    button: {
      width: "236px",
      height: "62px",
      m: "14px 8px 24px 8px",
    },
  },
};

export default ServiceSelection;
