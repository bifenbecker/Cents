import React, {useMemo} from "react";
import {Box, Flex, Text, Image} from "rebass/styled-components";

import {RightChevronIcon} from "../../../assets/images";
import styles from "./index.styles";

import {DELIVERY_TRACKING_ORDER_STATUSES} from "../../../constants/order";
import {getCreditCardBrandIcon} from "../../../utils/payment";
import {ORDER_STATUSES, ORDER_TYPES} from "../constants";
import {isInProgressOrder, isUnpaidOnlineOrder, toDollars} from "../utils";

import {ToggleButton} from "../../common";
import Footer from "../footer";

const SheetFooter = ({
  drawerOpen,
  storeSettings,
  updateTip,
  orderDetails,
  toggleUpdatePayment,
  toggleDrawerOpen,
  toggleStoreInfo,
  paymentMethod,
  onAddPaymentMethod,
  onPayForOrder,
}) => {
  const {tipOption} = orderDetails;
  const {tipOptions = []} = storeSettings || {};
  const selectedPaymentMethod = useMemo(() => paymentMethod, [paymentMethod]);

  const isOnlineOrder = orderDetails.orderType === ORDER_TYPES.online;
  const isOrderInProgress = isInProgressOrder(orderDetails);
  const hasBalanceDue = !!Number(orderDetails.balanceDue);

  // If there is balance due, show tip options
  // If not, then if its online order, order intake is completed and payment is not done, we can show.
  // Also, tip options should be there.
  // For online orders, check if the payment is done.
  const showTipOptions =
    isOrderInProgress &&
    orderDetails?.isIntakeComplete &&
    (hasBalanceDue || (isOnlineOrder && isUnpaidOnlineOrder(orderDetails))) &&
    tipOptions.length > 0;

  const onTipOptionClick = opt => {
    if (tipOption === opt) {
      updateTip({
        isTipRemoved: true,
      });
    } else {
      updateTip({
        isTipRemoved: false,
        appliedTip: opt,
      });
    }
  };

  // If there is balance due, show tip options
  // If not, then if its online order, order intake is completed and payment is not done, we can show.
  // Also, there should be at least one payment method available.
  const showPaymentMethodsSelection =
    isOrderInProgress &&
    (hasBalanceDue || isUnpaidOnlineOrder(orderDetails)) &&
    selectedPaymentMethod;

  const isCanceled = orderDetails?.status === ORDER_STATUSES.CANCELLED;

  const pickup = useMemo(() => orderDetails?.pickup, [orderDetails]);

  const isFooterRequired =
    (!isCanceled || orderDetails?.refundableAmount > 0) &&
    (orderDetails.status === ORDER_STATUSES.CANCELLED ||
      pickup.status === DELIVERY_TRACKING_ORDER_STATUSES.canceled ||
      orderDetails?.isIntakeComplete ||
      Number(orderDetails.balanceDue) > 0);

  return (
    <Box sx={{borderTop: drawerOpen ? "1px solid #E1E4E5" : "none"}}>
      <Box {...styles.fixedContentWrapper} display={drawerOpen ? "block" : "none"}>
        {showTipOptions && (
          <Flex {...styles.fixedContentBox} {...styles.tipBox} {...styles.flexWrapper}>
            <Flex alignItems="center">
              <Text {...styles.fixedContentTitle}>Tip</Text>
              {tipOptions.map(opt => (
                <ToggleButton
                  key={opt}
                  {...styles.toggleButton}
                  checked={tipOption === opt}
                  onClick={() => onTipOptionClick(opt)}
                >
                  {opt}
                </ToggleButton>
              ))}
            </Flex>
            {orderDetails.tipAmount ? (
              <Text variant="blackText">{toDollars(orderDetails.tipAmount)}</Text>
            ) : null}
          </Flex>
        )}

        {showPaymentMethodsSelection && (
          <Box {...styles.fixedContentBox} height={isOnlineOrder ? "5.50rem" : "3rem"}>
            <Flex
              {...styles.flexWrapper}
              sx={{cursor: "pointer"}}
              onClick={toggleUpdatePayment}
            >
              <Flex alignItems="center">
                <Text {...styles.fixedContentTitle}>Payment</Text>
                <Image
                  src={getCreditCardBrandIcon(selectedPaymentMethod?.brand)}
                  pr={"13px"}
                  width={"48px"}
                />
                <Text fontFamily="secondary">•••• {selectedPaymentMethod?.last4}</Text>
              </Flex>
              <Image src={RightChevronIcon} />
            </Flex>
            {isOnlineOrder && (
              <Text {...styles.paymentNote}>
                Your card will not be charged until your order is picked up in-store or
                delivered back to you
              </Text>
            )}
          </Box>
        )}

        {isFooterRequired && (
          <Box
            {...styles.footerWrapper}
            sx={
              !(showTipOptions || showPaymentMethodsSelection)
                ? {boxShadow: "0 -5px 8px -7px rgba(0,0,0,.2)"}
                : {}
            }
          >
            <Flex
              alignItems={"center"}
              justifyContent={"center"}
              height={Number(orderDetails?.balanceDue) > 0 ? "70px" : "55px"}
            >
              <Footer
                drawerOpen={true}
                toggleDrawerOpen={toggleDrawerOpen}
                toggleStoreInfo={toggleStoreInfo}
                orderDetails={orderDetails}
                paymentMethod={selectedPaymentMethod}
                onAddPaymentMethod={onAddPaymentMethod}
                onPayForOrder={onPayForOrder}
              />
            </Flex>
          </Box>
        )}
      </Box>
      <Flex {...styles.poweredByCentsWrapper}>
        <Text {...styles.poweredByCents}>Powered by Cents</Text>
      </Flex>
    </Box>
  );
};

export default SheetFooter;
