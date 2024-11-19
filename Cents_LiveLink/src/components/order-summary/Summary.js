import React from "react";
import {Box, Flex, Image, Text, Button} from "rebass/styled-components";
import {useHistory} from "react-router-dom";
import isEmpty from "lodash/isEmpty";

import {HorizontalThreeDotIcon} from "../../assets/images";
import {orderItemCategories, ORDER_STATUSES} from "./constants";

import {calculateItemTotal, getMinPriceString, getPerUnitString} from "../../utils";
import {
  toDollars,
  displayPromotionAmount,
  isUnpaidOnlineOrder,
  isInProgressOrder,
} from "./utils";
import useToggle from "../../hooks/useToggle";

import {ToggleButton, Accordion, SimplePopover} from "../common";
import {ORDER_TYPES} from "../../constants/order";
import PickupDeliveryOrderSummary from "../common/pickupDeliveryOrderSummary";
import {formatAsUSAPhoneNumber} from "../../utils/formatAsUSAPhoneNumber/formatAsUSAPhoneNumber";

const SummaryHeader = props => {
  const {
    orderDetails,
    toggleCancelOrderConfirmation,
    toggleDrawerOpen,
    drawerOpen,
    toggleStoreInfo,
  } = props;

  const {isOpen, toggle} = useToggle();

  const isCanceled = orderDetails?.status === ORDER_STATUSES.CANCELLED;
  const history = useHistory();

  const onOrderAgainClick = () => {
    history.push(`/order/business/${orderDetails?.store?.businessId}`);
  };

  const isOrderAgainVisible = () => {
    const subscription = orderDetails?.subscription;
    const deletedAt = orderDetails?.subscription?.recurringSubscription?.deletedAt;
    if (isEmpty(subscription)) {
      return true;
    } else {
      return !!deletedAt;
    }
  };

  return (
    <Flex {...styles.header.wrapper}>
      <Box>
        <Text {...styles.header.title}>Order #{orderDetails?.orderCodeWithPrefix}</Text>
        <CustomerDetails
          orderDetails={orderDetails}
          toggleStoreInfo={toggleStoreInfo}
          drawerOpen={drawerOpen}
        />
      </Box>
      <Box>
        {orderDetails?.orderType === ORDER_TYPES.online &&
        (orderDetails?.status === ORDER_STATUSES.COMPLETED || isCanceled) &&
        isOrderAgainVisible() ? (
          <Button variant="primary" {...styles.orderAgainBtn} onClick={onOrderAgainClick}>
            ORDER AGAIN
          </Button>
        ) : null}

        {(orderDetails?.orderType === ORDER_TYPES.residential ||
          orderDetails?.orderType === ORDER_TYPES.service) &&
        Number(orderDetails?.balanceDue) > 0 &&
        orderDetails?.status !== ORDER_STATUSES.CANCELLED && //Showing Pay button if it is a post pay service order
          !drawerOpen && (
            <Flex {...styles.buttonWrapper}>
              <Button
                variant="primary"
                {...styles.checkoutBtn}
                onClick={toggleDrawerOpen}
              >
                PAY {toDollars(orderDetails.balanceDue)}
              </Button>
            </Flex>
          )}
        {/* //giving styles for popover when drawer is closed to make sure popover UI doesn't get blocked           */}
        {orderDetails.canCancel && !isCanceled ? (
          <SimplePopover
            beforeOpen={() => {
              if (!drawerOpen) {
                toggleDrawerOpen();
              }
            }}
            label={<Image src={HorizontalThreeDotIcon} />}
            isOpen={isOpen}
            toggle={toggle}
            childrenStyles={!drawerOpen ? styles.childrenStyles : {}}
          >
            <Text {...styles.popoverItem} onClick={toggleCancelOrderConfirmation}>
              Cancel Order
            </Text>
          </SimplePopover>
        ) : null}
      </Box>
    </Flex>
  );
};

const CustomerDetails = props => {
  const {orderDetails, toggleStoreInfo, drawerOpen} = props;

  const {
    customer: {fullName, phoneNumber},
  } = orderDetails;

  return (
    <Box {...styles.address.wrapper}>
      <Box {...styles.address.info}>
        <Text {...styles.address.infoText}>{fullName}</Text>
        <Text {...styles.address.infoText}> {formatAsUSAPhoneNumber(phoneNumber)}</Text>
        {drawerOpen && (
          <Text
            {...styles.address.storeInfo}
            variant="blackLink"
            onClick={toggleStoreInfo}
          >
            Show Store Info
          </Text>
        )}
      </Box>
    </Box>
  );
};

const OrderItems = props => {
  const {orderDetails} = props;
  /*
   * Sorts order items as service first and pickup and delivery later.
   */
  const sortedOrderItems = order => {
    let sortedItems;
    sortedItems = order?.orderItems?.filter(
      item => item.category !== orderItemCategories.deliveryOrPickup
    );
    return sortedItems?.concat(
      order?.orderItems?.filter(
        item => item.category === orderItemCategories.deliveryOrPickup
      )
    );
  };

  return (
    <Box {...styles.orderItems.wrapper}>
      {sortedOrderItems(orderDetails)?.map(item => (
        <Box {...styles.orderItems.itemWrapper} key={item.orderItemId}>
          <Flex {...styles.orderItems.itemTitle}>
            <Text>{item.laundryType}</Text>
            <Text>
              {orderDetails?.isIntakeComplete ? calculateItemTotal(item) : "TBD"}
            </Text>
          </Flex>
          <Flex {...styles.orderItems.itemPriceInfo}>
            <Text>
              {getPerUnitString(item)}
              {item.hasMinPrice && item.minimumPrice !== 0
                ? ` (minimum ${getMinPriceString(item)})`
                : null}
            </Text>
          </Flex>
          {item?.modifierLineItems?.length ? (
            <Accordion key={item.id} label="Modifiers" labelStyles={{color: "TEXT_GREY"}}>
              <Flex {...styles.orderItems.itemPriceInfo} color="TEXT_GREY">
                {item?.modifierLineItems?.map(modifier => {
                  return (
                    <Text key={modifier.id}>
                      {[
                        `${modifier.modifierName} (+$${Number(modifier.unitCost).toFixed(
                          2
                        )} / lb)`,
                        `${modifier?.quantity} lbs`,
                      ]
                        .filter(v => v)
                        .join(" x ")}
                    </Text>
                  );
                })}
              </Flex>
            </Accordion>
          ) : null}
        </Box>
      ))}
    </Box>
  );
};

const PaymentSummary = props => {
  const {
    orderDetails,
    toggleApplyPromo,
    toggleApplyCredit,
    toggleCADriverFeePopup,
    removePromo,
    removeCredits,
  } = props;

  const isOrderInProgress = isInProgressOrder(orderDetails);
  const unpaidOnlineOrder = isUnpaidOnlineOrder(orderDetails);

  const totalPaid = orderDetails.totalPaid;

  return (
    <Box {...styles.footer.wrapper}>
      {orderDetails?.isIntakeComplete &&
      isOrderInProgress &&
      (Number(orderDetails.balanceDue) > 0 ||
        (Number(orderDetails?.orderTotal) > 0 && unpaidOnlineOrder)) ? (
        <Flex pb={[3, 3, 4]}>
          <ToggleButton
            checked={!!orderDetails.promotionId}
            {...styles.footer.toggleButton}
            onClick={orderDetails.promotionId ? removePromo : toggleApplyPromo}
          >
            {orderDetails.promotionId ? "Remove Promo" : "Apply Promo"}
          </ToggleButton>
          <ToggleButton
            checked={!!orderDetails.creditAmount}
            {...styles.footer.toggleButton}
            disabled={
              !orderDetails?.creditAmount && !orderDetails?.customer?.availableCredit
            }
            onClick={orderDetails.creditAmount ? removeCredits : toggleApplyCredit}
          >
            {orderDetails.creditAmount ? "Remove Credit" : "Apply Credit"}
          </ToggleButton>
        </Flex>
      ) : null}

      {orderDetails?.isIntakeComplete ? (
        <>
          <Flex {...styles.footer.otherPaidInfo}>
            <Text>Subtotal</Text>
            <Text>{toDollars(orderDetails.orderTotal)}</Text>
          </Flex>
          {orderDetails.promotionId && orderDetails.promotion ? (
            <Flex {...styles.footer.otherPaidInfo}>
              <Text>
                {displayPromotionAmount(orderDetails.promotion.promoDetails)} promo
                applied
              </Text>
              <Text>-{toDollars(orderDetails.promotionAmount)}</Text>
            </Flex>
          ) : null}
          {orderDetails?.subscription?.recurringSubscription &&
          Number(orderDetails?.subscription?.recurringDiscountInPercent) > 0 &&
          Number(orderDetails.recurringDiscountInCents) > 0 ? (
            <Flex {...styles.footer.otherPaidInfo}>
              <Text>
                Recurring Order Discount (
                {-orderDetails.subscription.recurringDiscountInPercent}%)
              </Text>
              <Text>-{toDollars(orderDetails.recurringDiscountInCents / 100)}</Text>
            </Flex>
          ) : null}
          {orderDetails.isTaxable ? (
            <Flex {...styles.footer.otherPaidInfo}>
              <Text>Tax</Text>
              <Text>{toDollars(orderDetails.taxAmount)}</Text>
            </Flex>
          ) : null}
          {orderDetails.convenienceFee && orderDetails.convenienceFee > 0 ? (
            <Flex {...styles.footer.otherPaidInfo}>
              <Text>Service fee</Text>
              <Text>{toDollars(orderDetails.convenienceFee)}</Text>
            </Flex>
          ) : null}
          {orderDetails.creditAmount ? (
            <Flex {...styles.footer.otherPaidInfo}>
              <Text>Credit applied</Text>
              <Text>-{toDollars(orderDetails.creditAmount)}</Text>
            </Flex>
          ) : null}
          {orderDetails.tipAmount ? (
            <Flex {...styles.footer.otherPaidInfo}>
              <Text>
                Tip
                {orderDetails.tipOption && orderDetails?.tipOption[0] !== "$"
                  ? ` (${orderDetails.tipOption})`
                  : null}
              </Text>
              <Text>{toDollars(orderDetails.tipAmount)}</Text>
            </Flex>
          ) : null}
        </>
      ) : null}
      {orderDetails?.subscription?.recurringSubscription &&
        Number(orderDetails?.subscription?.recurringDiscountInPercent) > 0 &&
        !orderDetails?.isIntakeComplete && (
          <Flex {...styles.footer.otherPaidInfo}>
            <Text>Recurring Order Discount </Text>
            <Text>-{orderDetails.subscription.recurringDiscountInPercent}% off</Text>
          </Flex>
        )}

      {orderDetails?.delivery?.deliveryProvider ||
      orderDetails?.pickup?.deliveryProvider ? (
        <PickupDeliveryOrderSummary
          pickup={orderDetails.pickup}
          delivery={orderDetails.delivery}
          pickupDeliveryFee={orderDetails.pickupDeliveryFee}
          returnDeliveryFee={orderDetails.returnDeliveryFee}
          pickupDeliveryTip={orderDetails.pickupDeliveryTip}
          returnDeliveryTip={orderDetails.returnDeliveryTip}
          storeLocation={orderDetails?.store?.state}
          toggleCADriverFeePopup={toggleCADriverFeePopup}
        />
      ) : null}

      {orderDetails?.isIntakeComplete && Number(orderDetails.balanceDue) > 0 ? (
        <>
          {orderDetails?.status !== ORDER_STATUSES.CANCELLED && (
            <Flex {...styles.footer.paidInfo}>
              <Text>Total Paid</Text>
              <Text>{toDollars(totalPaid)}</Text>
            </Flex>
          )}

          {orderDetails?.status !== ORDER_STATUSES.CANCELLED && (
            <Flex {...styles.footer.dueInfo}>
              <Text>Total Due</Text>
              <Text>{toDollars(orderDetails.balanceDue)}</Text>
            </Flex>
          )}
        </>
      ) : null}

      {orderDetails?.isIntakeComplete &&
      orderDetails.status === ORDER_STATUSES.CANCELLED &&
      !orderDetails.refundableAmount ? (
        <Flex {...styles.footer.otherPaidInfo}>
          <Text {...styles.footer.canceledText}>Canceled</Text>
          <Text>{toDollars(0)}</Text>
        </Flex>
      ) : null}
    </Box>
  );
};

const Summary = props => {
  const {
    orderDetails,
    toggleApplyPromo,
    toggleApplyCredit,
    removePromo,
    removeCredits,
    toggleCancelOrderConfirmation,
    toggleCADriverFeePopup,
    toggleDrawerOpen,
    drawerOpen,
    toggleStoreInfo,
  } = props;
  return (
    <>
      <SummaryHeader
        orderDetails={orderDetails}
        toggleCancelOrderConfirmation={toggleCancelOrderConfirmation}
        toggleDrawerOpen={toggleDrawerOpen}
        drawerOpen={drawerOpen}
        toggleStoreInfo={toggleStoreInfo}
      />

      <OrderItems orderDetails={orderDetails} />

      <PaymentSummary
        orderDetails={orderDetails}
        toggleApplyPromo={toggleApplyPromo}
        toggleApplyCredit={toggleApplyCredit}
        toggleCADriverFeePopup={toggleCADriverFeePopup}
        removePromo={removePromo}
        removeCredits={removeCredits}
      />
    </>
  );
};

const styles = {
  buttonWrapper: {
    width: "140px",
    height: "62px",
    alignItems: "center",
  },
  childrenStyles: {
    sx: {
      bottom: "-10px",
      bg: "WHITE",
    },
  },
  checkoutBtn: {
    width: "100%",
    fontSize: "16px",
    py: "1rem",
    height: "50px",
    sx: {
      boxShadow: "0 0 3px rgba(0, 0, 0, .25)",
    },
  },
  orderAgainBtn: {
    p: "12px",
  },
  header: {
    wrapper: {
      justifyContent: "space-between",
      mb: "0.5rem",
      sx: {
        borderBottom: "1px solid",
        borderColor: "BOX_BORDER",
      },
    },
    title: {
      fontSize: [3, 4],
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
      },
      textAlign: "Center",
    },
    canceledStatus: {
      fontFamily: "Roboto Bold",
      fontSize: [0, 1],
      bg: "BACKGROUND_RED",
      px: 2,
      py: 1,
      color: "TEXT_RED",
      sx: {
        borderRadius: 9999,
      },
    },
  },
  address: {
    wrapper: {
      fontFamily: "secondary",
      // sx: {
      //   borderBottom: "1px solid",
      //   borderColor: "BOX_BORDER",
      // },
    },
    storeInfo: {
      fontSize: "12px",
      fontStyle: "normal",
      pt: "8px",
    },
    info: {
      pb: 3,
      as: "address",
    },
    infoText: {
      fontSize: "12px",
      fontStyle: "normal",
      pt: "5px",
    },
  },
  orderItems: {
    wrapper: {
      pt: 3,
    },
    itemWrapper: {
      pb: 3,
    },
    itemTitle: {
      py: 1,
      fontSize: [1, 2],
      justifyContent: "space-between",
    },
    itemPriceInfo: {
      fontFamily: "secondary",
      py: 1,
      fontSize: [1, 2],
      lineHeight: 1.5,
      flexDirection: "column",
    },
  },
  footer: {
    toggleButton: {
      py: "0.4rem",
      px: ["0.75rem", "1rem"],
      fontSize: ["12px", "14px"],
      mr: "0.6rem",
    },
    wrapper: {
      as: "footer",
      py: [3, 3, 4],
      width: 1,
      bg: "WHITE",
      sx: {
        borderTop: "1px solid",
        borderColor: "BOX_BORDER",
      },
    },
    paidInfo: {
      pb: [1, 2],
      fontSize: [1, 2],
      justifyContent: "space-between",
      lineHeight: 2,
    },
    dueInfo: {
      fontSize: [2, 3],
      justifyContent: "space-between",
      lineHeight: 1.6,
    },
    otherPaidInfo: {
      fontFamily: "secondary",
      pb: [1, 1],
      fontSize: [1, 2],
      justifyContent: "space-between",
      lineHeight: 2,
      fontWeight: "normal",
      color: "TEXT_GREY",
    },
    canceledText: {
      color: "TEXT_RED",
    },
  },
  popoverItem: {
    p: "16px",
    width: "100%",
    sx: {border: "none", cursor: "pointer"},
    fontFamily: "secondary",
  },
};

export default Summary;
