import React, {useMemo} from "react";
import {Box, Text, Image, Flex, Button} from "rebass/styled-components";

import {DeliveryCarHalf, BlueVanHalf} from "../../../assets/images";
import {DELIVERY_PROVIDERS} from "../../../constants/order";

import useWindowSize from "../../../hooks/useWindowSize";
import {shiftDetails} from "../utils";
import {setLocalStorageItemWithExpiry} from "../utils";
import {getSkipRecurringPickupAcknowledgementKey} from "../../../utils/common";

import {DockModal} from "../../common";

const SkipRecurringPickupPopup = props => {
  const {
    isOpen,
    toggle,
    orderToken,
    orderId,
    orderDelivery,
    onChangeTimingsClick,
    timeZone,
    handleCancelOrder,
    loading,
  } = props;

  const [width, height] = useWindowSize();

  const getSize = useMemo(() => {
    if (height >= 568) {
      return 350;
    } else {
      return 0.75 * height;
    }
  }, [height]);

  const shiftInfo = useMemo(() => {
    return shiftDetails(orderDelivery, timeZone);
  }, [orderDelivery, timeZone]);

  const handleClosePopup = () => {
    // 86400000 = 24hours in milli seconds
    setLocalStorageItemWithExpiry(
      getSkipRecurringPickupAcknowledgementKey(orderId),
      orderToken,
      86400000
    );
    toggle();
  };

  const handleSeePickupOptions = () => {
    onChangeTimingsClick();
    handleClosePopup();
  };

  const handleSkipNextPickup = () => {
    handleCancelOrder(false, toggle);
  };

  const fontSize = width < 300 ? "16px" : width <= 340 ? "20px" : "24px";
  const contentFontSize = width < 300 ? "12px" : width <= 320 ? "16px" : "18px";

  return (
    <DockModal
      isOpen={!!isOpen}
      provideBackOption={false}
      fixedSize
      size={getSize}
      {...{loading}}
    >
      <Flex {...styles.mainWrapper}>
        <Flex {...styles.wrapper}>
          <Text {...styles.blueText}>Laundry Pickup Reminder</Text>
          <Flex {...styles.bodyWrapper}>
            <Flex {...styles.textContent}>
              <Text {...styles.boldText} fontSize={fontSize}>
                Pickup scheduled for
              </Text>
              <Text {...styles.boldText} fontSize={fontSize}>
                {shiftInfo?.startTime} - {shiftInfo?.endTime}
              </Text>
              <Text {...styles.normalText} fontSize={contentFontSize}>
                {shiftInfo?.day}, {shiftInfo?.month} {shiftInfo?.date}
              </Text>
            </Flex>
            <Box {...styles.imageWrapper}>
              <Image
                alt={
                  orderDelivery?.deliveryProvider === DELIVERY_PROVIDERS.ownDriver
                    ? "Van Image"
                    : "Car Image"
                }
                src={
                  orderDelivery?.deliveryProvider === DELIVERY_PROVIDERS.ownDriver
                    ? BlueVanHalf
                    : DeliveryCarHalf
                }
                {...styles.image}
              />
            </Box>
          </Flex>
          <Text
            {...styles.blueText}
            {...styles.underlineText}
            onClick={handleSeePickupOptions}
          >
            Choose a different time
          </Text>
        </Flex>
        <Box {...styles.footerWrapper}>
          <Button
            {...styles.button}
            {...styles.skipButton}
            onClick={handleSkipNextPickup}
          >
            skip this pickup
          </Button>
          <Button {...styles.button} {...styles.gotItButton} onClick={handleClosePopup}>
            got it
          </Button>
        </Box>
      </Flex>
    </DockModal>
  );
};

const styles = {
  mainWrapper: {
    sx: {
      height: "100%",
      width: "100%",
      flexDirection: "column",
    },
  },
  wrapper: {
    margin: "20px 0px 0px 20px",
    sx: {
      flexDirection: "column",
    },
  },
  bodyWrapper: {
    pt: "16px",
    sx: {
      flexDirection: "column",
      justifyContent: "space-between",
    },
  },
  textContent: {
    flexDirection: "column",
    sx: {
      flex: 2,
    },
  },
  blueText: {
    fontSize: "18px",
    color: "CENTS_BLUE",
    fontWeight: 700,
  },
  boldText: {
    color: "BLACK",
    fontWeight: 700,
    lineHeight: "28px",
  },
  normalText: {
    fontSize: "18px",
    color: "BLACK",
    fontFamily: "secondary",
    mt: "18px",
    sx: {
      overflowWrap: "break-word",
    },
  },
  underlineText: {
    fontWeight: 500,
    sx: {textDecoration: "underline"},
    margin: "45px 0px 25px 0px",
  },
  imageWrapper: {
    sx: {
      position: "absolute",
      right: 0,
      top: "70px",
    },
  },
  footerWrapper: {
    display: "flex",
    sx: {
      alignItems: "center",
      justifyContent: "center",
      width: "100%",
      height: "120px",
    },
  },
  button: {
    sx: {
      borderRadius: 31,
    },
    p: "18px",
  },
  skipButton: {
    flex: 2,
    sx: {
      border: "1.65px solid #3D98FF",
      boxShadow: "0px 5px 25px rgba(121, 120, 120, 0.248907)",
      backgroundColor: "white",
      color: "#3D98FF",
      textTransform: "uppercase",
    },
    ml: "21px",
    mr: "10.5px",
  },
  gotItButton: {
    flex: 1,
    sx: {
      backgroundColor: "#3D98FF",
      textTransform: "uppercase",
    },
    mr: "21px",
    ml: "10.5px",
  },
};

export default SkipRecurringPickupPopup;
