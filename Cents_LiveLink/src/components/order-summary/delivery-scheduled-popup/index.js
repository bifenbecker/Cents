import React, {useMemo} from "react";
import {Box, Text, Image, Flex, Button} from "rebass/styled-components";

import {DeliveryCarHalf, BlueVanHalf} from "../../../assets/images";
import {DELIVERY_PROVIDERS} from "../../../constants/order";

import useWindowSize from "../../../hooks/useWindowSize";
import {shiftDetails} from "../utils";
import {setLocalStorageItemWithExpiry} from "../utils";
import {getDeliveryAcknowledgementKey} from "../../../utils/common";

import {DockModal} from "../../common";

const DeliveryScheduledPopup = props => {
  const {
    orderToken,
    orderId,
    isOpen,
    toggle,
    orderDelivery,
    timeZone,
    onShowDeliveryOptionsClick,
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
      getDeliveryAcknowledgementKey(orderId),
      orderToken,
      86400000
    );
    toggle();
  };

  const handleSeeDeliveryOptions = () => {
    handleClosePopup();
    onShowDeliveryOptionsClick();
  };

  const fontSize = width < 300 ? "16px" : width <= 340 ? "20px" : "24px";
  const contentFontSize = width < 300 ? "12px" : width <= 320 ? "16px" : "18px";

  return (
    <DockModal isOpen={!!isOpen} provideBackOption={false} fixedSize size={getSize}>
      <Flex {...styles.mainWrapper}>
        <Flex {...styles.wrapper}>
          <Text {...styles.blueText}>Your laundry is ready!</Text>
          <Flex {...styles.bodyWrapper}>
            {/* <Flex> */}
            <Flex {...styles.textContent}>
              <Text {...styles.boldText} fontSize={fontSize}>
                Delivery scheduled for
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
                src={
                  orderDelivery?.deliveryProvider === DELIVERY_PROVIDERS.ownDriver
                    ? BlueVanHalf
                    : DeliveryCarHalf
                }
                alt={
                  orderDelivery?.deliveryProvider === DELIVERY_PROVIDERS.ownDriver
                    ? "Van Image"
                    : "Car Image"
                }
                {...styles.image}
              />
            </Box>
            {/* </Flex> */}
          </Flex>
          <Text
            {...styles.blueText}
            {...styles.underlineText}
            onClick={handleSeeDeliveryOptions}
          >
            See my delivery options
          </Text>
        </Flex>
        <Flex {...styles.footerWrapper}>
          <Button {...styles.saveButton} onClick={handleClosePopup}>
            got it
          </Button>
        </Flex>
      </Flex>
    </DockModal>
  );
};

const styles = {
  mainWrapper: {
    sx: {
      height: "100%",
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
      top: "80px",
    },
  },
  image: {
    sx: {},
  },
  footerWrapper: {
    sx: {
      alignItems: "center",
      justifyContent: "center",
      width: "calc(100% - 40px)",
      height: "120px",
    },
  },
  saveButton: {
    sx: {
      marginLeft: "auto",
      backgroundColor: "#3D98FF",
      width: "90%",
      borderRadius: 31,
      textTransform: "uppercase",
    },
    p: "18px",
  },
};

export default DeliveryScheduledPopup;
