import React, {useMemo, useCallback} from "react";
import {toast} from "react-toastify";
import {Box, Flex, Image, Text} from "rebass/styled-components";
import isEmpty from "lodash/isEmpty";

import {DELIVERY_PROVIDERS} from "../../../constants/order";

import {
  DateAndTimeIcon,
  RightChevronIcon,
  RoutesIcon,
  TruckIcon,
} from "../../../assets/images";

import {formatAddress} from "../../online-order/utils";
import {actionTypes} from "../reducer";
import useToggle from "../../../hooks/useToggle";
import orderSectionStyles from "../../../styles/order-section-styles";

import {
  AddressInstructionsDockModal,
  AddressDockModal,
  RecurringAddressDockModal,
  DeliveryWindowsDockModalForm,
} from "../../common/order-sections";
import {ToastError} from "../../common";
import {canUpdateOrderDelivery} from "../../../utils";
import {formatJSTimeToReadableTime, formatTimeWindow} from "../../../utils/date";
import {ORDER_STATUSES, RETURN_METHODS} from "../../order-summary/constants";
import {
  DELIVERY_TRACKING_ORDER_STATUSES,
  IN_STORE_PICKUP,
  TEXT_ME_WHEN_READY,
} from "../../../constants/order";
import {INTERVAL_DISPLAY} from "../../../constants/subscriptions";

const disableStatusesForAddressAndTimeWindow = ["EN_ROUTE_TO_CUSTOMER", "COMPLETED"];

const PickupAndDeliveryDetails = props => {
  const {
    selectedAddress,
    manageOrderState,
    generalDeliverySettings,
    onDemandDeliverySettings,
    ownDriverDeliverySettings,
    customerAddresses,
    orderStatus,
    intakeCompletedAt,
    showAddressSelection,
    showDeliveryWindows,
    serviceableByOnDemand,
    isProcessingCompleted,
    subscriptionsList,
    dispatch,
    shouldShowDeliveryWindows,
  } = props;

  const {
    isOpen: showAddressInstructions,
    toggle: toggleShowAddressInstructionsWithouCheck,
  } = useToggle();

  const toggleShowDeliveryWindowsWithoutCheck = () => {
    dispatch({type: actionTypes.TOGGLE_DELIVERY_WINDOWS});
  };

  const toggleShowAddressSelection = () => {
    dispatch({type: actionTypes.TOGGLE_ADDRESS_SELECTION});
  };

  const formattedAddress = useMemo(() => {
    return formatAddress({...selectedAddress, postalCode: ""});
  }, [selectedAddress]);

  const isPickupCompleted = useMemo(() => {
    return (
      manageOrderState?.orderDelivery?.pickup?.status ===
      DELIVERY_TRACKING_ORDER_STATUSES.completed
    );
  }, [manageOrderState]);

  const canUpdatePickup = canUpdateOrderDelivery(
    manageOrderState?.orderDelivery?.pickup?.status
  );

  const updateSelectedAddress = address => {
    dispatch({type: actionTypes.UPDATE_SELECTED_ADDRESS, payload: address || {}});
  };

  const handleAddressSave = address => {
    dispatch({type: actionTypes.SAVE_ADDRESS, payload: address || {}});
  };

  const hasSelectedAddressFactory = toggleFn => {
    if (selectedAddress?.googlePlacesId) {
      toggleFn();
    } else {
      toast.error(<ToastError message="Please select an address." />);
    }
  };

  const canUpdateOrderDeliveryFactory = (toggleFn, type) => {
    const cannotUpdatePickup =
      intakeCompletedAt ||
      (manageOrderState?.orderDelivery?.pickup?.status && !canUpdatePickup);
    const cannotUpdateDelivery = disableStatusesForAddressAndTimeWindow.includes(
      orderStatus
    );

    cannotUpdatePickup && cannotUpdateDelivery
      ? toast.error(<ToastError message={`Cannot update pickup/delivery ${type}`} />)
      : toggleFn();
  };

  const toggleShowAddressInstructions = () => {
    hasSelectedAddressFactory(toggleShowAddressInstructionsWithouCheck);
  };

  const toggleShowDeliveryWindows = () => {
    hasSelectedAddressFactory(toggleShowDeliveryWindowsWithoutCheck);
  };

  const onAddressChange = useCallback(
    address => {
      dispatch({
        type: actionTypes.SET_ADDRESS_TO_VALIDATE,
        payload: address || {},
      });
    },
    [dispatch]
  );

  const handleDeliveryWindowsChange = ({returnMethod, orderDelivery, subscription}) => {
    dispatch({
      type: actionTypes.UPDATE_ORDER_DELIVERY_WINDOWS,
      payload: {
        returnMethod,
        orderDelivery,
        subscription,
      },
    });
    toggleShowDeliveryWindowsWithoutCheck();
  };

  const headerPrefix = `${canUpdatePickup ? "Pickup & " : ""}Delivery`;
  const subHeaderPrefix = `${canUpdatePickup ? "Pickup / " : ""}Delivery`;

  const {pickup, delivery} = manageOrderState?.orderDelivery || {};

  const windows = {
    pickup: isPickupCompleted
      ? formatJSTimeToReadableTime(
          // Doordash delivery provider will not have routeDelivery object
          pickup?.deliveryProvider === DELIVERY_PROVIDERS.ownDriver
            ? pickup?.routeDelivery?.completedAt
            : pickup?.deliveredAt,
          manageOrderState?.timeZone,
          {monthShort: true}
        )
      : formatTimeWindow(pickup?.deliveryWindow, manageOrderState?.timeZone),

    delivery:
      delivery?.timingsId && manageOrderState?.returnMethod === RETURN_METHODS.delivery
        ? formatTimeWindow(delivery?.deliveryWindow, manageOrderState?.timeZone)
        : manageOrderState?.returnMethod === RETURN_METHODS.delivery
        ? null
        : isProcessingCompleted
        ? IN_STORE_PICKUP
        : TEXT_ME_WHEN_READY,
  };

  const togglePickupDeliveryWindow = () => {
    canUpdateOrderDeliveryFactory(toggleShowDeliveryWindows, "window(s)");
  };

  const toggleAddress = () => {
    canUpdateOrderDeliveryFactory(toggleShowAddressSelection, "address");
  };

  const skipInitialValidation = useMemo(() => {
    return (
      (isEmpty(manageOrderState?.orderDelivery?.pickup) ||
        manageOrderState?.orderDelivery?.pickup?.status === ORDER_STATUSES.COMPLETED) &&
      (manageOrderState?.returnMethod === RETURN_METHODS.inStorePickup ||
        isEmpty(manageOrderState?.orderDelivery?.delivery))
    );
  }, [manageOrderState?.orderDelivery]);

  const isOrderRecurring = !!manageOrderState?.subscription?.id;
  const isRecurringCancelled = !!manageOrderState?.subscription?.deletedAt;

  return (
    <Box>
      <Box {...styles.section.header}>{headerPrefix} Details</Box>
      {/* Address Selection */}
      <Flex {...styles.section.link.wrapper} onClick={toggleAddress}>
        <Box {...styles.section.link.iconWrapper}>
          <Image src={RoutesIcon} />
        </Box>
        <Flex {...styles.section.link.dataWrapper}>
          <Box {...styles.section.link.data}>
            {subHeaderPrefix} Address
            <Text {...styles.section.link.dataSubText}>{formattedAddress}</Text>
          </Box>
          {(!isOrderRecurring || isRecurringCancelled) && (
            <Image src={RightChevronIcon} {...styles.section.link.rightChevron} />
          )}
        </Flex>
      </Flex>
      {isOrderRecurring && !isRecurringCancelled ? (
        <RecurringAddressDockModal
          storeName={manageOrderState?.storeName}
          isOpen={showAddressSelection}
          toggle={toggleShowAddressSelection}
        />
      ) : (
        <AddressDockModal
          isOpen={showAddressSelection}
          toggle={toggleShowAddressSelection}
          customerAddresses={customerAddresses}
          onAddressChange={onAddressChange}
          selectedAddress={selectedAddress}
          onAddressSave={handleAddressSave}
        />
      )}

      {/* Address Instructions Changes */}
      <Flex {...styles.section.link.wrapper} onClick={toggleShowAddressInstructions}>
        <Box {...styles.section.link.iconWrapper}>
          <Image src={TruckIcon} />
        </Box>
        <Flex {...styles.section.link.dataWrapper}>
          <Box {...styles.section.link.data}>
            {subHeaderPrefix} Instructions
            <Text {...styles.section.link.dataSubText}>
              {selectedAddress?.instructions || (
                <i>Add {subHeaderPrefix.toLowerCase()} instructions</i>
              )}
            </Text>
          </Box>
          <Image src={RightChevronIcon} {...styles.section.link.rightChevron} />
        </Flex>
      </Flex>
      <AddressInstructionsDockModal
        selectedAddress={selectedAddress}
        updateSelectedAddress={updateSelectedAddress}
        isOpen={showAddressInstructions}
        toggle={toggleShowAddressInstructions}
      />

      {/* Delivery Times Selection */}
      <Flex
        {...styles.section.link.wrapper}
        {...styles.section.link.lastWrapper}
        onClick={togglePickupDeliveryWindow}
      >
        <Box {...styles.section.link.iconWrapper}>
          <Image src={DateAndTimeIcon} />
        </Box>
        <Flex {...styles.section.link.dataWrapper}>
          <Box {...styles.section.link.data}>
            {subHeaderPrefix} Time
            {windows.pickup || windows.delivery ? (
              <>
                {windows.pickup ? (
                  <Text {...styles.section.link.dataSubText}>
                    {isPickupCompleted ? "Picked up" : "Pickup"}: {windows.pickup || null}
                  </Text>
                ) : null}
                {windows.delivery ? (
                  <Text {...styles.section.link.dataSubText}>
                    Delivery: {windows.delivery || null}
                  </Text>
                ) : null}
              </>
            ) : (
              <Text {...styles.section.link.dataSubText}>
                <i>Add {subHeaderPrefix.toLowerCase()} time</i>
              </Text>
            )}
            {isOrderRecurring && (
              <Box {...styles.section.link.recurringContainer}>
                <Text {...styles.section.link.recurringText}>
                  {INTERVAL_DISPLAY[
                    manageOrderState?.subscription?.interval
                  ]?.toUpperCase()}
                </Text>
                {isRecurringCancelled && (
                  <Text {...styles.section.link.cancelledText}>- CANCELLED</Text>
                )}
              </Box>
            )}
          </Box>
          <Image src={RightChevronIcon} {...styles.section.link.rightChevron} />
        </Flex>
      </Flex>
      <DeliveryWindowsDockModalForm
        isOpen={showDeliveryWindows}
        toggle={toggleShowDeliveryWindows}
        orderType={manageOrderState?.orderType}
        timeZone={manageOrderState?.timeZone}
        returnMethod={manageOrderState?.returnMethod}
        orderDelivery={manageOrderState?.orderDelivery}
        customerAddress={selectedAddress}
        ownDeliveryStore={ownDriverDeliverySettings}
        onDemandDeliveryStore={serviceableByOnDemand ? onDemandDeliverySettings : {}}
        turnAroundInHours={generalDeliverySettings?.turnAroundInHours}
        recurringDiscountInPercent={generalDeliverySettings?.recurringDiscountInPercent}
        onServiceProviderTimeChange={handleDeliveryWindowsChange}
        intakeCompletedAt={intakeCompletedAt}
        isProcessingCompleted={isProcessingCompleted}
        subscription={manageOrderState?.subscription}
        prevSubscriptions={subscriptionsList}
        shouldShowDeliveryWindows={shouldShowDeliveryWindows}
        skipInitialValidation={skipInitialValidation}
      />
    </Box>
  );
};

const styles = {
  section: orderSectionStyles,
};

export default PickupAndDeliveryDetails;
