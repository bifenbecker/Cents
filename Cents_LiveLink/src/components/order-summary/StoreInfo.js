import React from "react";
import {Flex, Text} from "rebass/styled-components";

import {FullScreenModalForm} from "../common";

const StoreInfo = props => {
  const {
    orderDetails: {
      store: {
        name,
        address,
        city,
        state,
        zipCode,
        phoneNumber,
        dcaLicense,
        commercialDcaLicense,
      },
    },
    onClose,
  } = props;

  return (
    <FullScreenModalForm
      header="Store Info"
      onClose={onClose}
      onSubmit={onClose}
      btnLabel="Close"
    >
      <Flex
        width="100%"
        flexDirection="column"
        justifyContent={["flex-start", "flex-start", "flex-start", "center"]}
        alignItems="center"
        textAlign="center"
        pb={"10px"}
      >
        <Text>{name}</Text>
        <Text>
          {address}, {city}
        </Text>
        <Text>
          {state}, {zipCode}
        </Text>
        <Text>{phoneNumber}</Text>
      </Flex>
      {dcaLicense && (
        <Flex {...styles.dcaContainer}>
          <Text {...styles.dcaHeader}>DCA # - Retail:</Text>
          <Text {...styles.dcaInfo}>{dcaLicense}</Text>
        </Flex>
      )}
      {commercialDcaLicense && (
        <Flex {...styles.dcaContainer}>
          <Text {...styles.dcaHeader}>DCA # - Commercial:</Text>
          <Text {...styles.dcaInfo}>{commercialDcaLicense}</Text>
        </Flex>
      )}
    </FullScreenModalForm>
  );
};

const styles = {
  dcaContainer: {
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    py: "6px",
  },
  dcaHeader: {
    fontFamily: "secondary",
    pt: "6px",
    pb: "4px",
    lineHeight: 1.5,
    flexDirection: "column",
  },
  dcaInfo: {
    fontFamily: "secondary",
    py: "2px",
    lineHeight: 1.5,
    flexDirection: "column",
  },
};

export default StoreInfo;
