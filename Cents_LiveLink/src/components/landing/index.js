import React from "react";
import {Flex, Heading, Text} from "rebass/styled-components";

import {Layout} from "../common";

const Landing = () => {
  return (
    <Layout>
      <Flex {...styles.wrapper}>
        <Heading>Welcome to Cents</Heading>
        <Text fontFamily="secondary" color="TEXT_GREY" mt="16px">
          There are no orders.
        </Text>
      </Flex>
    </Layout>
  );
};

const styles = {
  wrapper: {
    width: "100%",
    p: "1.25rem",
    flexDirection: "column",
    height: "calc(var(--app-height) - 67px)",
    textAlign: "center",
  },
};

export default Landing;
