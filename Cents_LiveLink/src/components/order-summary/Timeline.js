import React, {useEffect, useMemo, useState} from "react";
import {Box, Flex, Image, Text} from "rebass/styled-components";
import {toast} from "react-toastify";
import isEmpty from "lodash/isEmpty";

// APIs
import {getRouteDelivery} from "../../api/order";

import {IMAGE_IDS, ORDER_STATUSES} from "./constants";

import useWindowSize from "../../hooks/useWindowSize";
import {DELIVERY_PROVIDERS, ORDER_TYPES} from "../../constants/order";
import HorizontalTimeline from "../common/HorizontalTimeline";
import OrderLeaveAtDoorImage from "./OrderLeaveAtDoorImage";
import {buildDeliveryDetails} from "../../utils";
import {ToastError} from "../common";

const Timeline = ({orderDetails, orderToken}) => {
  const {
    timeline: {totalNumberOfSteps, step, footer, header, imageKey},
  } = orderDetails;
  const [deliveryDetails, setDeliveryDetails] = useState();
  const [, height] = useWindowSize();

  const getImageSize = useMemo(() => {
    if (height > 667) {
      return "auto";
    }
    // Iphone 6/7/8, Samsung galaxy S5
    else if (height > 569 && height <= 667) {
      return 195;
    }
    // iphone 5 and smaller screens
    else {
      return 120;
    }
  }, [height]);

  const delivery = useMemo(() => {
    return orderDetails?.delivery;
  }, [orderDetails]);

  const isCompleted = orderDetails?.status === ORDER_STATUSES.COMPLETED;

  useEffect(() => {
    (async () => {
      const isUberDelivery = delivery.deliveryProvider === DELIVERY_PROVIDERS.uber;

      const isDoorDashDelivery =
        delivery.deliveryProvider === DELIVERY_PROVIDERS.doorDash;
      if (
        isCompleted &&
        orderDetails.delivery?.id &&
        !isUberDelivery &&
        !isDoorDashDelivery
      ) {
        try {
          const deliveryRes = await getRouteDelivery(orderToken, {
            orderDelivery: delivery.id,
          });
          setDeliveryDetails(buildDeliveryDetails(deliveryRes?.data));
        } catch (error) {
          toast.error(<ToastError message={"Could not fetch return route details"} />);
        }
      }
    })();
  }, [delivery, orderToken, isCompleted, orderDetails.delivery]);

  const isCanceled = orderDetails?.status === ORDER_STATUSES.CANCELLED;
  const [isOpenDriverUploadedImage, setIsOpenDriverUploadedImage] = useState(false);
  const totalStagesArray = useMemo(() => {
    let array = [];

    for (let i = 1; i < totalNumberOfSteps + 1; i++) {
      array.push({
        isStepComplete: i < step,
        isCurrentStep: i === step,
        isFutureStep: i > step && !isCanceled,
        isOrderCanceled: i === step && isCanceled,
        isOrderComplete: i === step && isCompleted,
        solidBorderRequired: i < step,
        dashedBorderRequired: i >= step && !isCanceled,
      });
    }

    return array;
  }, [isCanceled, isCompleted, step, totalNumberOfSteps]);
  return (
    <Flex {...styles.wrapper}>
      <Flex {...styles.link.wrapper} {...styles.mainHeaderWrapper}>
        <Flex {...styles.link.header}>
          <Box {...styles.link.headerName}>{header?.name}</Box>
          <Box {...styles.link.headerDescription}>{header?.description}</Box>
          {isCompleted && <Text {...styles.header.status}>COMPLETE</Text>}
          {isCanceled && <Text {...styles.header.canceledStatus}>Canceled</Text>}
        </Flex>
      </Flex>
      <HorizontalTimeline totalStagesArray={totalStagesArray} isCanceled={isCanceled} />
      <Flex {...styles.link.wrapper}>
        <Flex {...styles.link.footer}>
          {orderDetails?.timeline?.step === 2 || orderDetails?.timeline?.step === 4 ? (
            <Box {...styles.link.enroute}>
              <Flex>
                <Box>
                  <Box {...styles.link.enroute.footerDescription}>
                    {footer?.description}
                  </Box>
                  {isEmpty(orderDetails?.subscription) ||
                  orderDetails?.subscription?.recurringSubscription?.deletedAt ? (
                    <>
                      <Box {...styles.link.enroute.footerName}>{footer?.name}</Box>
                      {footer?.subtext && (
                        <Box {...styles.link.enroute.footerSubtext}>{footer.subtext}</Box>
                      )}
                    </>
                  ) : null}
                </Box>

                {footer?.driverPhoneNumber ? (
                  <Box {...styles.iconWrapper}>
                    <a href={`tel:${footer.driverPhoneNumber}`}>
                      <Image
                        {...styles.iconWrapper.image}
                        src={IMAGE_IDS["CALL_ICON"]}
                        height={getImageSize}
                      />
                    </a>
                    <a href={`sms:${footer.driverPhoneNumber}`}>
                      <Image
                        {...styles.iconWrapper.image}
                        src={IMAGE_IDS["SMS_ICON"]}
                        height={getImageSize}
                      />
                    </a>
                  </Box>
                ) : null}
              </Flex>
            </Box>
          ) : (
            <>
              {isEmpty(orderDetails?.subscription) ||
              orderDetails?.subscription?.recurringSubscription?.deletedAt ? (
                <Box {...styles.link.footerName}>{footer?.name}</Box> // Pickup scheduled text
              ) : null}
              <Box {...styles.link.footerDescription}>{footer?.description}</Box>
            </>
          )}
        </Flex>
      </Flex>
      {(orderDetails?.status === ORDER_STATUSES.COMPLETED ||
        orderDetails?.status === ORDER_STATUSES.CANCELLED) &&
      orderDetails?.orderType === ORDER_TYPES.online &&
      orderDetails?.subscription?.recurringSubscription?.nextAvailablePickup &&
      !orderDetails?.subscription?.recurringSubscription?.deletedAt ? (
        <Flex {...styles.nextPickupWrapper}>
          <Flex>
            <Text>Your Next Pickup: </Text>
          </Flex>
          <Text {...styles.normalText}>
            {orderDetails?.subscription?.recurringSubscription?.nextAvailablePickup}
          </Text>
        </Flex>
      ) : null}
      {imageKey && (
        <Flex {...styles.imageWrapper}>
          <Image
            {...styles.imageWrapper.image}
            src={IMAGE_IDS[imageKey]}
            height={getImageSize}
          />
        </Flex>
      )}
      {step === 2 && !isCanceled && (
        <Flex {...styles.link.wrapper}>
          <Box {...styles.link.footerDescription}>
            Once your order is received at the store, you will receive an update with a
            link to view your order summary.
          </Box>
        </Flex>
      )}
      {orderDetails?.delivery?.instructions?.leaveAtDoor && deliveryDetails?.imageUrl && (
        <Flex
          {...styles.link.wrapper}
          onClick={() => setIsOpenDriverUploadedImage(!isOpenDriverUploadedImage)}
        >
          <Box {...styles.link.deliveryDescription}>
            The driver left your order at your door
          </Box>
        </Flex>
      )}
      <OrderLeaveAtDoorImage
        isOpen={isOpenDriverUploadedImage}
        toggle={setIsOpenDriverUploadedImage}
        imageUrl={deliveryDetails?.imageUrl}
      />
    </Flex>
  );
};

const styles = {
  wrapper: {
    bg: "WHITE",
    color: "WHITE",
    flexDirection: "column",
    flexFlow: "column",
    flex: "1",
    overflow: "auto",
  },
  buttonWrapper: {
    flex: "1",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  checkoutBtn: {
    width: "80%",
    fontSize: "16px",
    fontWeight: "700",
    py: "1rem",
    height: "56px",
    mb: "25px",
    sx: {
      boxShadow: "0 0 9px rgba(0, 0, 0, .25)",
    },
  },
  imageWrapper: {
    bg: "WHITE",
    alignItems: "flex-start",
    justifyContent: "center",
    padding: "0 25px",
    image: {
      marginTop: "18px",
    },
  },
  iconWrapper: {
    marginLeft: "20px",
    image: {
      margin: "8px 8px",
    },
  },
  completedLine: {
    sx: {
      position: "absolute",
      top: 20,
      left: 20,
      height: "20px",
      color: "CENTS_BLUE",
      width: "50px",
    },
  },
  mainHeaderWrapper: {
    pt: 0,
    alignItems: "center",
    height: "58px",
  },
  link: {
    wrapper: {
      pt: "18px",
      m: "0 18px",
      alignItems: "center",
    },
    header: {
      alignItems: "center",
      width: "100%",
      flex: 1,
      my: "16px",
    },
    headerName: {
      fontWeight: 500,
      fontSize: ["22px", "24px"],
      lineHeight: "28px",
      mr: "4px",
      color: "black",
      fontStyle: "normal",
    },
    headerDescription: {
      fontSize: "12px",
      color: "TEXT_GREY",
      fontFamily: "secondary",
      pt: "6px",
      mr: "8px",
    },
    footer: {
      width: "100%",
      flex: 1,
      flexDirection: "column",
    },
    enroute: {
      display: "grid",
      gridGap: 4,
      gridTemplateColumns: "repeat(auto-fit, minmax(128px, 1fr))",
      footerName: {
        fontWeight: 600,
        fontSize: "14px",
        pt: "6px",
        color: "black",
      },
      footerDescription: {
        fontWeight: 600,
        fontSize: "14px",
        color: "TEXT_GREY",
        fontFamily: "secondary",
      },
      footerSubtext: {
        fontSize: "14px",
        color: "TEXT_GREY",
        fontFamily: "secondary",
      },
    },
    footerName: {
      fontWeight: 500,
      fontSize: ["16px", "18px"],
      lineHeight: "25px",
      mr: "8px",
      color: "black",
    },
    footerDescription: {
      fontSize: "12px",
      color: "TEXT_GREY",
      fontFamily: "secondary",
      py: "6px",
    },
    deliveryDescription: {
      fontSize: "12px",
      color: "primary",
      fontFamily: "secondary",
      pt: "6px",
      sx: {
        textDecoration: "underline",
      },
    },
  },

  nextPickupWrapper: {
    m: "5px 18px 15px",
    fontSize: "16px",
    color: "BLACK",
    fontFamily: "primary",
    flexDirection: "column",
  },
  normalText: {
    fontSize: "14px",
    color: "BLACK",
    fontFamily: "secondary",
    lineHeight: "22px",
  },
  header: {
    canceledStatus: {
      fontFamily: "Roboto Bold",
      fontSize: [0, 1],
      bg: "BACKGROUND_RED",
      px: 2,
      py: 1,
      color: "TEXT_RED",
      sx: {
        borderRadius: 9999,
        position: "absolute",
        marginRight: "3%",
        right: "0%",
      },
    },
    status: {
      fontFamily: "Roboto Bold",
      fontSize: [0, 1],
      bg: "HUB_NOTIFICATION_GREY",
      px: 2,
      py: 1,
      color: "CENTS_BLUE",
      sx: {
        borderRadius: 9999,
        position: "absolute",
        marginRight: "3%",
        right: "0%",
      },
      textAlign: "Center",
    },
  },
};

export default Timeline;
