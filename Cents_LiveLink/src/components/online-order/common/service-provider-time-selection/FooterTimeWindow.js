import React, {useMemo} from "react";
import {Image, Flex, Box, Text} from "rebass/styled-components";

import {RightChevronIcon} from "../../../../assets/images";
import {
  DELIVERY_PROVIDERS,
  DELIVERY_TRACKING_ORDER_STATUSES,
  TEXT_ME_WHEN_READY,
} from "../../../../constants/order";
import {canUpdateOrderDelivery} from "../../../../utils";

import {formatJSTimeToReadableTime, formatTimeWindow} from "../../../../utils/date";
import windowSelectionActions from "./actions";

const OrderDeliverySummary = props => {
  const {orderDelivery, type, timeZone} = props;

  const statusDisplay = useMemo(() => {
    switch (orderDelivery.status) {
      case DELIVERY_TRACKING_ORDER_STATUSES.enRouteToPickup:
      case DELIVERY_TRACKING_ORDER_STATUSES.enRouteToDropoff:
        return "In Progress";
      case DELIVERY_TRACKING_ORDER_STATUSES.completed:
        return "Completed";

      case DELIVERY_TRACKING_ORDER_STATUSES.scheduled:
      case DELIVERY_TRACKING_ORDER_STATUSES.intentCreated:
      default:
        return orderDelivery?.timingsId ? "Scheduled" : "Unavailable";
    }
  }, [orderDelivery]);

  const description = useMemo(() => {
    switch (orderDelivery.status) {
      case DELIVERY_TRACKING_ORDER_STATUSES.enRouteToPickup:
      case DELIVERY_TRACKING_ORDER_STATUSES.enRouteToDropoff:
        return "Order is in transit";
      case DELIVERY_TRACKING_ORDER_STATUSES.completed:
        return orderDelivery?.routeDelivery?.completedAt
          ? formatJSTimeToReadableTime(
              orderDelivery?.routeDelivery?.completedAt,
              timeZone,
              {monthShort: true}
            )
          : `${type} completed time is not available`;
      case DELIVERY_TRACKING_ORDER_STATUSES.scheduled:
      case DELIVERY_TRACKING_ORDER_STATUSES.intentCreated:
      default:
        // TODO: Add ASAP condition here.
        return orderDelivery?.timingsId
          ? formatTimeWindow(orderDelivery?.deliveryWindow, timeZone, {
              monthShort: true,
            })
          : `${type} is not available`;
    }
  }, [orderDelivery, timeZone, type]);

  return (
    <Box>
      <Flex alignItems="center">
        <Text>
          {type} {statusDisplay} (
          {orderDelivery.deliveryProvider === DELIVERY_PROVIDERS.ownDriver
            ? "Standard"
            : "On Demand"}
          ):
        </Text>
      </Flex>
      <Text variant="footerTimeWindow">{description}</Text>
    </Box>
  );
};

const FooterTimeWindow = props => {
  const {
    isInStorePickup,
    isPickup,
    timeZone,
    delivery,
    pickup,
    dispatch,
    isNotServiceOrder,
    onDeliveryWindowsToggle,
    isReturnDelivery,
  } = props;

  const reversedOrderDelivery = isPickup ? delivery : pickup;

  const disableToggle =
    (isPickup ? false : !isNotServiceOrder) ||
    (reversedOrderDelivery?.status &&
      !canUpdateOrderDelivery(reversedOrderDelivery?.status)) ||
    isReturnDelivery;

  const toggleDeliveryTypeWindows = () => {
    if (!disableToggle) {
      dispatch({
        type: windowSelectionActions.TOGGLE_PICKUP_AND_DELIVERY_WINDOWS,
      });
      onDeliveryWindowsToggle();
    }
  };

  return (
    <Flex
      {...styles.footerTimeWindowContainer}
      justifyContent={isPickup ? "space-between" : "normal"}
      onClick={toggleDeliveryTypeWindows}
    >
      {isPickup || disableToggle ? null : (
        <Box sx={{transform: "rotate(180deg)"}} mr="16px">
          <Image src={RightChevronIcon} />
        </Box>
      )}
      {isPickup ? (
        isInStorePickup ? (
          <Box>
            {TEXT_ME_WHEN_READY} <br />{" "}
            <Text variant="footerTimeWindow">Click to view return options</Text>
          </Box>
        ) : (
          <OrderDeliverySummary
            orderDelivery={delivery || {}}
            type="Return Delivery"
            timeZone={timeZone}
          />
        )
      ) : (
        <OrderDeliverySummary
          orderDelivery={pickup || {}}
          type="Pickup"
          timeZone={timeZone}
        />
      )}
      {isPickup && !disableToggle ? <Image src={RightChevronIcon} /> : null}
    </Flex>
  );
};

const styles = {
  footerTimeWindowContainer: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    px: "18px",
    pt: "18px",
  },
};

export default FooterTimeWindow;
