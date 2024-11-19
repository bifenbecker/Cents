import React from "react";

import {useHistory, useParams} from "react-router-dom";
import isEmpty from "lodash/isEmpty";

import {ORDER_DELIVERY_TYPES} from "../../../constants/order";
import {onlineOrderState} from "../../../state/online-order";

import {DeliveryWindowsDockModalForm} from "../../common/order-sections";
import {createTheme, ThemeProvider} from "@material-ui/core/styles";
import {typography} from "components/online-order/orderTheme";

import {businessSettingsSelectors} from "../../../features/business/redux";
import {useAppSelector} from "app/hooks";

const SchedulePickupAndDelivery = (props) => {
  const {
    isOpen,
    toggle,
    deliverySettings,
    timeZone,
    address,
    subscriptions,
    cloneOrderType,
    isCommercial,
    turnAroundInHours,
    businessId,
    setLoading,
  } = props;
  const history = useHistory();
  const {businessId: encodedBusinessId} = useParams();
  const businessSettings = useAppSelector(
    businessSettingsSelectors.getBusinessSettingsFromRedux
  );

  const doordashStores = process.env.REACT_APP_DOORDASH_STORES?.split(",");

  const initDeliveryProvider = deliverySettings?.ownDeliveryStore?.storeId
    ? "OWN_DRIVER"
    : deliverySettings?.onDemandDeliveryStore?.storeId &&
      (deliverySettings?.onDemandDeliveryStore?.doorDashEnabled ||
        doordashStores?.includes(
          deliverySettings?.onDemandDeliveryStore?.storeId.toString()
        ))
    ? "DOORDASH"
    : "OWN_DRIVER";

  const initOrderDelivery = {
    pickup: {
      timingsId: null,
      deliveryWindow: [],
      totalDeliveryCost: 0,
      thirdPartyDeliveryId: null,
      type: ORDER_DELIVERY_TYPES.pickup,
      deliveryProvider: initDeliveryProvider,
    },
    delivery: {
      timingsId: null,
      deliveryWindow: [],
      totalDeliveryCost: 0,
      thirdPartyDeliveryId: null,
      type: ORDER_DELIVERY_TYPES.return,
      deliveryProvider: initDeliveryProvider,
    },
  };

  const setOnlineOrderState = ({
    returnMethod,
    orderDelivery: updatedOrderDelivery,
    subscription,
  }) => {
    onlineOrderState.merge({
      businessId,
      storeId: deliverySettings?.ownDeliveryStore?.storeId
        ? deliverySettings?.ownDeliveryStore?.storeId
        : deliverySettings?.onDemandDeliveryStore?.storeId
        ? deliverySettings?.onDemandDeliveryStore?.storeId
        : null,
      customerAddressInfo: address,
      addressTimeZone: timeZone,
      returnMethod,
      orderDelivery: updatedOrderDelivery,
      storeState: deliverySettings?.ownDeliveryStore?.storeId
        ? deliverySettings?.ownDeliveryStore?.state
        : deliverySettings?.onDemandDeliveryStore?.storeId
        ? deliverySettings?.onDemandDeliveryStore?.state
        : null,
      subscription,
    });
    toggle();
    history.push(`/order/business/${encodedBusinessId}/new`, cloneOrderType);
  };

  const calculateRecurringDiscount = (deliverySettings) => {
    if (isCommercial) {
      return 0;
    }
    return deliverySettings?.ownDeliveryStore?.storeId
      ? deliverySettings?.ownDeliveryStore?.recurringDiscountInPercent
      : deliverySettings?.onDemandDeliveryStore?.recurringDiscountInPercent;
  };

  const scheduleTheme = (theme) =>
    createTheme({
      ...theme,
      ...typography,
      filterClass:
        theme?.palette?.primary?.main === "#3a7f2e" ? "filter-green" : "filter-blue",
    });

  return (
    <ThemeProvider theme={scheduleTheme}>
      <DeliveryWindowsDockModalForm
        isOpen={isOpen}
        toggle={toggle}
        setLoading={setLoading}
        timeZone={timeZone}
        returnMethod={onlineOrderState?.returnMethod?.get()}
        orderDelivery={
          isEmpty(onlineOrderState?.orderDelivery?.get())
            ? initOrderDelivery
            : onlineOrderState?.orderDelivery?.get()
        }
        customerAddress={address}
        ownDeliveryStore={
          isEmpty(deliverySettings?.ownDeliveryStore)
            ? {}
            : {...deliverySettings?.ownDeliveryStore}
        }
        turnAroundInHours={
          businessSettings?.dryCleaningEnabled && turnAroundInHours
            ? turnAroundInHours
            : deliverySettings?.ownDeliveryStore?.storeId
            ? deliverySettings?.ownDeliveryStore?.turnAroundInHours
            : deliverySettings?.onDemandDeliveryStore?.turnAroundInHours
        }
        onDemandDeliveryStore={
          isEmpty(deliverySettings?.onDemandDeliveryStore)
            ? {}
            : {...deliverySettings?.onDemandDeliveryStore}
        }
        recurringDiscountInPercent={calculateRecurringDiscount(deliverySettings)}
        onServiceProviderTimeChange={setOnlineOrderState}
        prevSubscriptions={subscriptions}
        canCreateSubscription
        skipInitialValidation
      />
    </ThemeProvider>
  );
};

export default SchedulePickupAndDelivery;
