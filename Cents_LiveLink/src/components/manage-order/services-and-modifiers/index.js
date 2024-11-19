import React from "react";
import {Box, Flex, Image, Text} from "rebass/styled-components";
import {WashAndFold, RightChevronIcon} from "../../../assets/images";
import orderSectionStyles from "../../../styles/order-section-styles";
import {actionTypes} from "../reducer";
import {ServiceSelectionDockModalForm} from "../../common/order-sections";
import useToggle from "../../../hooks/useToggle";

const ServicesAndModifiers = props => {
  let {
    services,
    servicePriceId,
    modifierIds,
    dispatch,
    shouldShowCurrentOrRecurringChoice,
    storeId,
    postalCode,
  } = props;

  const {isOpen: serviceModal, toggle: toggleServiceModal} = useToggle();

  const onServiceAndModifiersChange = (servicePriceId, modifierIds, choice) => {
    dispatch({
      type: actionTypes.UPDATE_SERVICES_AND_MODIFIERS,
      payload: {servicePriceId, modifierIds, choice},
    });
  };
  const selectedService = services?.find(
    service => service.prices[0].id === servicePriceId
  );

  return (
    <Box>
      <Box {...styles.section.header}> Service(s)</Box>
      <Flex
        {...styles.section.link.wrapper}
        {...styles.section.link.lastWrapper}
        onClick={toggleServiceModal}
      >
        <Box {...styles.washAndFlodIcon}>
          <Image src={WashAndFold} />
        </Box>
        <Flex {...styles.section.link.dataWrapper}>
          <Box {...styles.section.link.data}>
            Service(s)
            <Text {...styles.section.link.dataSubText}>{selectedService?.name}</Text>
          </Box>

          <Image src={RightChevronIcon} {...styles.section.link.rightChevron} />
        </Flex>
      </Flex>

      {serviceModal ? (
        <ServiceSelectionDockModalForm
          isOpen={serviceModal}
          toggle={toggleServiceModal}
          services={services}
          shouldShowCurrentOrRecurringChoice={shouldShowCurrentOrRecurringChoice}
          servicePriceId={servicePriceId}
          modifierIds={modifierIds}
          onServiceAndModifiersChange={onServiceAndModifiersChange}
          storeId={storeId}
          postalCode={postalCode}
        />
      ) : null}
    </Box>
  );
};

const styles = {
  section: orderSectionStyles,
  washAndFlodIcon: {
    width: "35px",
    marginRight: "10px",
  },
};
export default ServicesAndModifiers;
