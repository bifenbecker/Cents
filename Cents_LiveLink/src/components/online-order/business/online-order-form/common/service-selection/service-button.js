import React from "react";
import {Text, Card, Flex, Box} from "rebass/styled-components";

import {getPriceString, getMinPriceString} from "../../../../utils";

const ServiceButton = props => {
  const {service, checked, onChange, modifierCount} = props;

  const truncateServiceName = serviceName => {
    return serviceName.length > 24 ? serviceName.substr(0, 24 - 1) + "..." : serviceName;
  };

  const renderService = () => {
    return (
      <>
        <Card
          onClick={onChange}
          sx={{
            ...styles.cardContainer,
            border: checked ? "4px solid" : null,
            borderColor: checked ? "CENTS_BLUE" : null,
          }}
        >
          <Flex {...styles.content}>
            <Text>{truncateServiceName(service.name)}</Text>
            <Text {...styles.subtext}>
              {service.hasMinPrice ? (
                <Text {...styles.subtext}>
                  {getPriceString(service)} (minimum {getMinPriceString(service)})
                </Text>
              ) : (
                getPriceString(service)
              )}
            </Text>
          </Flex>
          {modifierCount > 0 && checked && (
            <Box {...styles.modifierCountContainer}>
              <Text {...styles.modifierCountText}>
                +{modifierCount} {modifierCount > 1 ? "add-ons" : "add-on"} selected
              </Text>
            </Box>
          )}
        </Card>
      </>
    );
  };

  return renderService();
};

const styles = {
  cardContainer: {
    width: "339px",
    height: "122px",
    borderRadius: "24px",
    boxShadow:
      "0 4px 5px 0 rgba(0,0,0,0.14), 0 1px 10px 0 rgba(0,0,0,0.12), 0 2px 4px -1px rgba(0,0,0,0.2)",
    margin: "auto",
  },
  content: {
    justifyContent: "center",
    flexDirection: "column",
    alignItems: "center",
    height: "100%",
  },
  subtext: {
    fontSize: "12px",
    color: "TEXT_GREY",
    mt: "6px",
    display: "inline",
  },
  other: {
    sx: {
      position: "relative",
    },
  },
  checkedButton: {
    color: "CENTS_BLUE",
  },
  uncheckedButton: {
    fontFamily: "primary",
    sx: {
      boxShadow:
        "0 4px 5px 0 rgba(0,0,0,0.14), 0 1px 10px 0 rgba(0,0,0,0.12), 0 2px 4px -1px rgba(0,0,0,0.2)",
      border: "none",
    },
  },
  modifiers: {
    sx: {
      color: "WHITE",
      display: "flex",
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      fontSize: "11.61px",
      width: "130px",
      height: "32px",
      position: "absolute",
      bottom: "-16px",
      background: "#FF9900",
      boxShadow:
        "0px 1px 1px rgba(0, 0, 0, 0.14), 0px 2px 1px rgba(0, 0, 0, 0.12), 0px 1px 3px rgba(0, 0, 0, 0.2)",
      borderRadius: "30px",
    },
  },
  modifierCountContainer: {
    sx: {
      backgroundColor: "#FF9900",
      borderRadius: 10,
      height: "25px",
      justifyContent: "center",
      alignItems: "center",
      position: "absolute",
      left: "50%",
      transform: "translateX(-50%)",
      boxShadow: "0px 1px 3px 0px rgba(0, 0, 0, 0.2)",
    },
  },
  modifierCountText: {
    sx: {
      color: "WHITE",
      fontSize: "11.61px",
      justifyContent: "center",
      alignItems: "center",
      flexDirection: "column",
      height: "100%",
      width: "100%",
      p: "6px 6px",
    },
  },
};

export default ServiceButton;
