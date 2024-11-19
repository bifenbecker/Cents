import React, {useMemo} from "react";
import {Box, Flex, Image, Text} from "rebass/styled-components";
import {Downgraded, useHookstate} from "@hookstate/core";

import {
  RightChevronIcon,
  RoutesIcon,
  DateAndTimeIcon,
  TruckIcon,
} from "../../../../../../assets/images";

import {sectionStyles} from "../styles";

import {onlineOrderState} from "../../../../../../state/online-order";
import {formatAddress} from "../../../../utils";
import {formatTimeWindow} from "../../../../../../utils/date";
import {TEXT_ME_WHEN_READY} from "../../../../../../constants/order";
import useToggle from "../../../../../../hooks/useToggle";
import {INTERVAL_DISPLAY} from "../../../../../../constants/subscriptions";

import {AddressInstructionsDockModal} from "../../../../../common/order-sections";
import DeliveryWindows from "./DeliveryWindows";
import EditCustomerAddress from "./EditCustomerAddress";

const DeliveryDetails = (props) => {
  const {
    generalDeliverySettings,
    onDemandDeliverySettings,
    ownDriverDeliverySettings,
    subscriptions,
    businessId,
  } = props;
  const {isOpen: showEditAddressInstuctions, toggle: toggleShowEditAddressInstuctions} =
    useToggle();
  const {isOpen: showEditCustomerAddress, toggle: toggleShowEditCustomerAddress} =
    useToggle();
  const {isOpen: showDeliveryWindows, toggle: toggleShowDeliveryWindows} = useToggle();

  const customerAddress = useHookstate(onlineOrderState.customerAddressInfo);
  const orderDeliveryState = useHookstate(onlineOrderState.orderDelivery);
  const subscriptionState = useHookstate(onlineOrderState.subscription);
  const pickupWindow = orderDeliveryState.pickup.deliveryWindow.get();
  const deliveryWindow = orderDeliveryState.delivery.deliveryWindow.get();
  const timeZone = onlineOrderState.addressTimeZone.get();

  const windows = {
    pickup: formatTimeWindow(pickupWindow, timeZone),
    delivery: deliveryWindow?.length
      ? formatTimeWindow(deliveryWindow, timeZone)
      : TEXT_ME_WHEN_READY,
  };

  const formattedAddress = useMemo(() => {
    return formatAddress({...customerAddress.value, postalCode: ""});
  }, [customerAddress.value]);

  const updateSelectedAddress = (address) => {
    onlineOrderState.merge({
      customerAddressInfo: address,
      customerAddressId: address.id,
    });
  };

  return (
    <Box>
      <Box {...styles.section.header}>Pickup & Delivery Details</Box>
      <Flex {...styles.section.link.wrapper} onClick={toggleShowEditCustomerAddress}>
        <Box {...styles.section.link.iconWrapper}>
          <Image src={RoutesIcon} />
        </Box>
        <Flex {...styles.section.link.dataWrapper}>
          <Box {...styles.section.link.data}>
            Pickup / Delivery Address
            <Text {...styles.section.link.dataSubText}>{formattedAddress}</Text>
          </Box>
          <Image src={RightChevronIcon} {...styles.section.link.rightChevron} />
        </Flex>
      </Flex>
      <EditCustomerAddress
        isOpen={showEditCustomerAddress}
        toggle={toggleShowEditCustomerAddress}
        businessId={businessId}
      />
      <Flex {...styles.section.link.wrapper} onClick={toggleShowEditAddressInstuctions}>
        <Box {...styles.section.link.iconWrapper}>
          <Image src={TruckIcon} />
        </Box>
        <Flex {...styles.section.link.dataWrapper}>
          <Box {...styles.section.link.data}>
            Pickup / Delivery Instructions
            <Text {...styles.section.link.dataSubText}>
              {customerAddress.value?.instructions || (
                <i>Add pickup / delivery instructions</i>
              )}
            </Text>
          </Box>
          <Image src={RightChevronIcon} {...styles.section.link.rightChevron} />
        </Flex>
      </Flex>
      <AddressInstructionsDockModal
        isOpen={showEditAddressInstuctions}
        toggle={toggleShowEditAddressInstuctions}
        selectedAddress={customerAddress.attach(Downgraded).value}
        updateSelectedAddress={updateSelectedAddress}
      />

      <Flex
        {...styles.section.link.wrapper}
        {...styles.section.link.lastWrapper}
        onClick={toggleShowDeliveryWindows}
      >
        <Box {...styles.section.link.iconWrapper}>
          <Image src={DateAndTimeIcon} />
        </Box>
        <Flex {...styles.section.link.dataWrapper}>
          <Box {...styles.section.link.data}>
            Pickup / Delivery Time
            {windows.pickup?.length ? (
              <>
                <Text {...styles.section.link.dataSubText}>Pickup: {windows.pickup}</Text>
                {windows.delivery?.length ? (
                  <Text {...styles.section.link.dataSubText}>
                    Delivery: {windows.delivery}
                  </Text>
                ) : null}
              </>
            ) : (
              <Text {...styles.section.link.dataSubText}>
                <i>Add pickup / delivery window</i>
              </Text>
            )}
            {subscriptionState.attach(Downgraded).value?.interval ? (
              <Text {...styles.section.link.recurringText}>
                {INTERVAL_DISPLAY[
                  subscriptionState.attach(Downgraded)?.value?.interval
                ]?.toUpperCase()}
              </Text>
            ) : null}
          </Box>
          <Image src={RightChevronIcon} {...styles.section.link.rightChevron} />
        </Flex>
      </Flex>
      <DeliveryWindows
        isOpen={showDeliveryWindows}
        toggle={toggleShowDeliveryWindows}
        generalDeliverySettings={generalDeliverySettings}
        onDemandDeliverySettings={onDemandDeliverySettings}
        ownDriverDeliverySettings={ownDriverDeliverySettings}
        subscriptions={subscriptions}
      />
    </Box>
  );
};

const styles = {
  section: sectionStyles,
};

export default DeliveryDetails;
