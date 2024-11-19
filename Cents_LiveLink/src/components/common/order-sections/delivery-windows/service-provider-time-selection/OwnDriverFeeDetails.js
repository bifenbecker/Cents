import React from "react";
import {Box, Flex, Image, Text} from "rebass/styled-components";

import {BlueVan} from "../../../../../assets/images";

import {toDollars} from "../../../../../utils/order-utils";

const OwnDriverFeeDetails = ({isPickup, deliveryFee}) => {
  const ownDriverDeliveryFee = deliveryFee?.ownDriver?.deliveryFeeInCents;

  return (
    <Flex {...styles.wrapper}>
      <Box>
        <Text {...styles.title}>
          When would you like your laundry to be {isPickup ? "picked up" : "delivered"}?
        </Text>
        <Text {...styles.deliveryFee}>
          {isPickup ? "Pickup fee: " : "Delivery fee: "}{" "}
          {deliveryFee ? toDollars(ownDriverDeliveryFee / 100) : "Free"}
        </Text>
      </Box>
      <Image
        sx={{transform: isPickup ? "none" : "rotateY(180deg)"}}
        src={BlueVan}
        {...styles.image}
      />
    </Flex>
  );
};

const styles = {
  wrapper: {
    justifyContent: "space-between",
    alignItems: "flex-start",
    fontSize: ["14px", "16px"],
  },
  title: {
    pb: "4px",
    width: "190px",
    sx: {
      overflowWrap: "break-word",
    },
  },
  deliveryFee: {
    fontSize: "24px",
    py: "8px",
  },
  subtext: {
    fontFamily: "secondary",
    fontStyle: "italic",
  },
  image: {
    flexShrink: 0,
  },
};

export default OwnDriverFeeDetails;
