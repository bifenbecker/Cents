import React, {useMemo} from "react";
import PropTypes from "prop-types";
import {Box, Text, Image, Flex, Button} from "rebass/styled-components";
import {setLocalStorageItemWithExpiry} from "../utils";
import {getDeliveryAfterProcessingAcknowledgementKey} from "../../../utils/common";
import {DockModal} from "../../common";
import useWindowSize from "../../../hooks/useWindowSize";
import {BlueVanHalf, DeliveryCarHalf} from "../../../assets/images";
import {DELIVERY_PROVIDERS} from "../../../constants/order";

const ScheduleDeliveryAfterProcessingPopup = props => {
  const {
    isOpen,
    toggle,
    orderToken,
    orderId,
    orderDelivery,
    onScheduleDeliveryClick,
  } = props;
  const [width, height] = useWindowSize();
  const getSize = useMemo(() => {
    if (height >= 568) {
      return 320;
    } else {
      return 0.75 * height;
    }
  }, [height]);

  const handleClosePopup = () => {
    // 86400000 = 24hours in milli seconds
    setLocalStorageItemWithExpiry(
      getDeliveryAfterProcessingAcknowledgementKey(orderId),
      orderToken,
      86400000
    );
    toggle();
  };

  const handleScheduleDeliveryClick = () => {
    handleClosePopup();
    onScheduleDeliveryClick();
  };

  const fontSize = width < 300 ? "16px" : width <= 340 ? "20px" : "24px";

  return (
    <DockModal isOpen={isOpen} provideBackOption={false} fixedSize size={getSize}>
      <Flex {...styles.mainWrapper}>
        <Flex {...styles.wrapper}>
          <Text {...styles.blueText}>Your laundry is ready!</Text>
          <Flex {...styles.bodyWrapper}>
            <Flex {...styles.textContent}>
              <Text {...styles.boldText} fontSize={fontSize}>
                It’s time to schedule
              </Text>
              <Text {...styles.boldText} fontSize={fontSize}>
                your delivery.
              </Text>
            </Flex>
            <Box {...styles.imageWrapper}>
              <Image
                src={
                  orderDelivery?.deliveryProvider === DELIVERY_PROVIDERS.ownDriver
                    ? BlueVanHalf
                    : DeliveryCarHalf
                }
                {...styles.image}
              />
            </Box>
          </Flex>
          <Text {...styles.blueText} {...styles.underlineText} onClick={handleClosePopup}>
            I’ll pick up in store
          </Text>
        </Flex>
        <Flex {...styles.footerWrapper}>
          <Button {...styles.saveButton} onClick={handleScheduleDeliveryClick}>
            Schedule my Delivery
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
    fontWeight: 500,
    lineHeight: "28px",
  },
  underlineText: {
    fontWeight: 500,
    sx: {textDecoration: "underline"},
    margin: "50px 0px 25px 0px",
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
      width: "100%",
      height: "120px",
    },
  },
  saveButton: {
    sx: {
      margin: "0px 20px",
      backgroundColor: "#3D98FF",
      width: "100%",
      borderRadius: 31,
      textTransform: "uppercase",
    },
    p: "22px",
  },
};

ScheduleDeliveryAfterProcessingPopup.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  toggle: PropTypes.func.isRequired,
  onScheduleDeliveryClick: PropTypes.func.isRequired,
};
ScheduleDeliveryAfterProcessingPopup.defaultProps = {
  isOpen: false,
  toggle: false,
  onScheduleDeliveryClick: () => {},
};

export default ScheduleDeliveryAfterProcessingPopup;
