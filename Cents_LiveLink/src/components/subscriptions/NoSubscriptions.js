import React from "react";
import {Box, Flex, Heading, Text, Image} from "rebass/styled-components";

import {IndustryIsChangingWashAndFold} from "../../assets/images";

const NoSubscriptions = () => {
  return (
    <Box {...styles.wrapper}>
      <Heading>You haven’t set up any recurring orders yet.</Heading>
      <Text {...styles.description}>
        If you want to create a recurring order, place a new order and click “Add
        Recurring Order” when presented with the option.
      </Text>
      <Flex {...styles.imageWrapper}>
        <Image src={IndustryIsChangingWashAndFold} />
      </Flex>
    </Box>
  );
};

const styles = {
  wrapper: {
    px: "20px",
  },
  description: {
    my: "16px",
    fontFamily: "secondary",
  },
  imageWrapper: {
    flexDirection: "column",
    alignItems: "center",
  },
};

export default NoSubscriptions;
