import React, {useEffect, useState} from "react";
import {Box, Flex, Text} from "rebass/styled-components";

import useToggle from "../../../../../../hooks/useToggle";
import {onlineOrderState} from "../../../../../../state/online-order";
import {getServicePriceBreakdown} from "../../../../utils";

import {sectionStyles} from "../styles";

import EditServiceSelection from "./EditServiceSelection";
import PickupAndDeliverySummary from "./PickupAndDeliverySummary";

import {businessSettingsSelectors} from "../../../../../../features/business/redux";
import {useAppSelector} from "app/hooks";

const Summary = (props) => {
  const {services} = props;
  const businessSettings = useAppSelector(
    businessSettingsSelectors.getBusinessSettingsFromRedux
  );
  const [priceString, setPriceString] = useState(null);
  const [minPriceString, setMinPriceString] = useState(null);
  const [isShortMinPriceDescription, setIsShortMinPriceDescription] = useState(null);

  const {isOpen: showServiceSelection, toggle: toggleShowServiceSelection} = useToggle();

  const selectedService = services?.find(
    (service) => service.prices[0].id === onlineOrderState?.servicePriceId?.get()
  );

  const selectedModifiers = selectedService?.serviceModifiers.filter((modifier) => {
    return onlineOrderState?.serviceModifierIds.get().includes(modifier?.id);
  });

  const hasDryCleaning = onlineOrderState?.hasDryCleaning?.get();

  useEffect(() => {
    if (selectedService) {
      const priceBreakdownResponse = getServicePriceBreakdown(selectedService);
      setPriceString(priceBreakdownResponse.priceString);
      setMinPriceString(priceBreakdownResponse.minPriceString);
      setIsShortMinPriceDescription(priceBreakdownResponse.isShortMinPriceDescription);
    }
  }, [selectedService]);

  return (
    <Box>
      <Box {...styles.section.header}>Your Order</Box>
      <Flex {...styles.section.link.wrapper} {...styles.columnDisplay}>
        {selectedService && (
          <Flex
            {...styles.section.link.dataWrapper}
            {...styles.yourOrderDataWrapper}
            {...styles.bottomPadding}
          >
            <Box {...styles.section.link.data} {...styles.serviceDetails}>
              {selectedService?.name || "No service selected"}
              <Flex
                {...styles.minPrice}
                flexDirection={isShortMinPriceDescription ? "row" : "column"}
              >
                <Text mt="4px">{priceString}</Text>
                {minPriceString ? (
                  <Text {...(isShortMinPriceDescription ? {pl: "4px"} : {mt: "4px"})}>
                    <i>{minPriceString}</i>
                  </Text>
                ) : null}
              </Flex>
              {selectedModifiers
                ? selectedModifiers.map((item, index) => (
                    <Text {...styles.section.link.dataSubText} key={index}>
                      {item?.modifier?.name}
                      {`: +$${Number(item?.modifier?.price).toFixed(2)} / lb`}
                    </Text>
                  ))
                : null}

              <Text {...styles.editLink} onClick={toggleShowServiceSelection}>
                Edit
              </Text>
            </Box>
            <Box {...styles.alignItemsRight} {...styles.servicePriceTBD}>
              <Text>TBD</Text>
            </Box>
          </Flex>
        )}
        {hasDryCleaning && businessSettings?.dryCleaningEnabled && (
          <Flex {...styles.section.link.dataWrapper} {...styles.yourOrderDataWrapper}>
            <Box {...styles.section.link.data} {...styles.serviceDetails}>
              Dry Cleaning
            </Box>
            <Box {...styles.alignItemsRight} {...styles.servicePriceTBD}>
              <Text>TBD</Text>
            </Box>
          </Flex>
        )}
      </Flex>

      <PickupAndDeliverySummary />
      <EditServiceSelection
        services={services}
        isOpen={showServiceSelection}
        toggle={toggleShowServiceSelection}
      />
    </Box>
  );
};

const styles = {
  section: sectionStyles,
  columnDisplay: {
    flexDirection: "column",
  },
  editLink: {
    variant: "link",
    fontSize: "13px",
    mt: "4px",
    display: "block",
    width: "50px",
  },
  yourOrderDataWrapper: {
    alignItems: "flex-start",
  },
  minPrice: {
    fontFamily: "secondary",
    fontSize: ["12px", "12px", "14px", "16px"],
    alignItems: "baseline",
  },
  alignItemsRight: {
    textAlign: "right",
  },
  serviceDetails: {
    mr: 0,
    minWidth: "70%",
  },
  servicePriceTBD: {
    flexShrink: 1,
    fontSize: ["12px", "14px", "16px", "18px"],
    minWidth: "30%",
  },
  bottomPadding: {
    pb: "12px",
  },
};

export default Summary;
