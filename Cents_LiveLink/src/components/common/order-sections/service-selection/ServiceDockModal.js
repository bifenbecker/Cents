import React from "react";
import {Box, Flex, Text, Button} from "rebass/styled-components";

import styles from "./DockModalForm.styles";

import {DockModal} from "../..";
import ServiceButton from "../../../online-order/business/online-order-form/common/service-selection/service-button";

const ServiceDockModal = (props) => {
  const {
    isOpen,
    toggle,
    services,
    selectedServicePriceId,
    selectedModifiersId,
    setServicePriceId,
    handleSave,
    toggleShowPricing,
  } = props;

  return (
    <DockModal
      header="Edit Service Selection"
      isOpen={isOpen}
      toggle={toggle}
      size={0.84}
    >
      <Box {...styles.cardContainer}>
        {services?.map((service) => {
          return (
            <Box {...styles.buttonContainer} key={service.id}>
              <ServiceButton
                {...styles.services.button}
                service={service}
                checked={service.prices[0].id === selectedServicePriceId}
                onChange={() => {
                  setServicePriceId(service);
                }}
                modifierCount={selectedModifiersId?.length}
              />
            </Box>
          );
        })}
        <Text {...styles.description}>
          Blankets and larger garments will be priced per item.{" "}
          <Text {...styles.seePricing} onClick={toggleShowPricing}>
            See pricing
          </Text>
        </Text>
      </Box>

      <Flex {...styles.footer.wrapper}>
        <Button {...styles.footer.button} onClick={handleSave}>
          SAVE
        </Button>
      </Flex>
    </DockModal>
  );
};

export default ServiceDockModal;
