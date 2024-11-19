import React from "react";
import {Flex, Text} from "rebass/styled-components";

import {toDollars} from "../../../utils";

const AmountInfo = props => {
  const {label, amount} = props;
  return (
    <Flex {...styles.dueInfo}>
      <Text>{label}</Text>
      <Text>{toDollars(amount)}</Text>
    </Flex>
  );
};

const styles = {
  dueInfo: {
    fontSize: 4,
    justifyContent: "space-between",
    lineHeight: 1.6,
    width: "100%",
    color: "BLACK",
    height: "100%",
    alignItems: "center",
    sx: {
      cursor: "pointer",
    },
  },
};

export default AmountInfo;
