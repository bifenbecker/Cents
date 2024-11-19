import React from "react";
import {Box, Flex, Image, Text} from "rebass/styled-components";

import {BlueCar, BlueCarReturn, DoorDashLogo} from "../../../../assets/images";

import {toDollars} from "../../utils";

const OnDemandFeeDetails = (props) => {
  const {isPickup, currentUberEstimate, settings, currentDoorDashEstimate} = props;
  const {subsidyInCents} = settings;
  const totalCost = currentDoorDashEstimate?.totalDeliveryCost
    ? currentDoorDashEstimate?.totalDeliveryCost
    : currentUberEstimate?.totalDeliveryCost;

  return (
    <>
      <Flex {...styles.wrapper}>
        <Flex flexDirection="column" alignSelf="stretch" pb={"12px"}>
          <Text {...styles.title}>
            On demand {isPickup ? "pickup & delivery," : "delivery,"} powered by{" "}
            <Image {...styles.doorDashLogo} src={DoorDashLogo} />
          </Text>
          <Flex flexDirection="row" py="12px" justifyContent="space-between">
            <Flex flexDirection="column">
              <Text {...styles.titleSubText}>
                When would you like your laundry {isPickup ? "picked up?" : "delivered?"}
              </Text>
              <Text {...styles.deliveryFee}>
                {totalCost
                  ? toDollars(Math.max(0, totalCost - subsidyInCents) / 100)
                  : null}
                {totalCost && <Text {...styles.oneWayText}>one way</Text>}
              </Text>
            </Flex>
            <Box
              styles={isPickup ? {...styles.imageContainer} : {...styles.blueCarReturn}}
              sx={isPickup ? {...styles.imageContainer.sx} : {...styles.blueCarReturn.sx}}
            />
          </Flex>
        </Flex>
      </Flex>
    </>
  );
};

const styles = {
  wrapper: {
    justifyContent: "flex-start",
    alignItems: ["center", "center", "center", "center"],
    flexDirection: "column",
    fontSize: ["14px", "16px"],
    height: "160px",
  },
  title: {
    pb: "4px",
    display: "inline",
    lineHeight: ["28px", "28px", "24px", "18px"],
    fontSize: "22px",
  },
  titleSubText: {
    py: "12px",
    fontSize: "16px",
  },
  deliveryFee: {
    fontSize: "18px",
    py: "8px",
    fontFamily: "secondary",
  },
  subtext: {
    fontFamily: "secondary",
    fontStyle: "italic",
    fontSize: ["14px", "16px"],
  },
  image: {
    flexShrink: 0,
    pb: "8px",
  },
  oneWayText: {
    fontSize: "12px",
    color: "TEXT_GREY",
    fontFamily: "secondary",
    pl: "4px",
    display: "inline",
    fontStyle: "italic",
  },
  doorDashLogo: {
    verticalAlign: "middle",
  },
  imageContainer: {
    sx: {
      width: ["70%", "70%", "70%", "40%"],
      position: "relative",
      overflow: "hidden",
      backgroundImage: `url(${BlueCar})`,
      backgroundSize: ["cover", "cover", "cover", "contain"],
      backgroundRepeat: "no-repeat",
    },
    height: "auto",
    py: ["0px", "0px", "0px", "54px"],
    pr: ["0px", "0px", "0px", "24px"],
  },
  blueCarReturn: {
    sx: {
      width: ["70%", "70%", "70%", "40%"],
      position: "relative",
      overflow: "hidden",
      backgroundImage: `url(${BlueCarReturn})`,
      backgroundSize: ["cover", "cover", "cover", "contain"],
      backgroundRepeat: "no-repeat",
    },
    height: "auto",
    py: ["0px", "0px", "0px", "54px"],
    pr: ["0px", "0px", "0px", "24px"],
  },
};

export default OnDemandFeeDetails;
