import React from "react";
import {Text, Image, Flex, Box} from "rebass/styled-components";
import {BlueVan} from "../../../../../assets/images";

const ScheduleReturnDeliveryCard = ({onDeliverToMeClick}) => {
  return (
    <Box {...styles.deliverItemWrapper}>
      <Flex {...styles.bodyWrapper}>
        <Flex {...styles.textContent}>
          <Text {...styles.boldText}>Get your laundry</Text>
          <Text {...styles.boldText}>delivered back to you.</Text>
        </Flex>
        <Image src={BlueVan} />
      </Flex>
      <Text {...styles.blueText} onClick={onDeliverToMeClick}>
        Deliver to me, instead
      </Text>
    </Box>
  );
};

const styles = {
  mainWrapper: {
    alignItem: "end",
  },
  deliverItemWrapper: {
    padding: "22px 0px 22px 22px",
    margin: "2px 2px 15px 2px",
    sx: {
      borderRadius: "14px",
      boxShadow: "0 2px 6px 0 rgba(0,0,0,0.2)",
    },
  },
  bodyWrapper: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  textContent: {
    flexDirection: "column",
    sx: {
      flex: 2,
    },
  },
  boldText: {
    fontSize: "18px",
    color: "BLACK",
    fontWeight: 700,
  },
  blueText: {
    fontSize: "18px",
    color: "CENTS_BLUE",
    fontWeight: 700,
    mt: "5px",
    sx: {textDecoration: "underline"},
  },
};
export default ScheduleReturnDeliveryCard;
