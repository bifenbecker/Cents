import React, {useMemo} from "react";
import {Downgraded, useHookstate} from "@hookstate/core";

import {onlineOrderState} from "../../../../../../state/online-order";

import {DeliveryWindowsDockModalForm} from "../../../../../common/order-sections";

import {businessSettingsSelectors} from "../../../../../../features/business/redux";
import {useAppSelector} from "app/hooks";

const DeliveryWindows = (props) => {
  const {
    generalDeliverySettings,
    onDemandDeliverySettings,
    ownDriverDeliverySettings,
    isOpen,
    toggle,
    subscriptions,
  } = props;

  const businessSettings = useAppSelector(
    businessSettingsSelectors.getBusinessSettingsFromRedux
  );
  const orderDeliveryState = useHookstate(onlineOrderState.orderDelivery);
  const returnMethodState = useHookstate(onlineOrderState.returnMethod);
  const subscriptionState = useHookstate(onlineOrderState.subscription);
  const orderDelivery = orderDeliveryState.attach(Downgraded).value;
  const returnMethod = returnMethodState.attach(Downgraded).value;
  const laundryTurnaround = onlineOrderState.laundryTurnaroundTime.get();
  const dryCleaningTurnaround = onlineOrderState.dryCleaningTurnaroundTime.get();
  const turnaroundForCategory = useMemo(() => {
    return Math.max(laundryTurnaround, dryCleaningTurnaround);
  }, [laundryTurnaround, dryCleaningTurnaround]);

  const onDeliveryWindowsUpdate = ({
    returnMethod,
    subscription,
    orderDelivery: updatedOrderDelivery,
  }) => {
    orderDeliveryState.set(updatedOrderDelivery);
    returnMethodState.set(returnMethod);
    subscriptionState.set(subscription);
    toggle();
  };

  return (
    <DeliveryWindowsDockModalForm
      isOpen={isOpen}
      toggle={toggle}
      orderDelivery={orderDelivery}
      returnMethod={returnMethod}
      timeZone={onlineOrderState.addressTimeZone.get()}
      customerAddress={onlineOrderState.customerAddressInfo.get()}
      turnAroundInHours={
        businessSettings?.dryCleaningEnabled && turnaroundForCategory
          ? turnaroundForCategory
          : generalDeliverySettings?.turnAroundInHours
      }
      ownDeliveryStore={{
        storeId: onlineOrderState.storeId.value,
        ...ownDriverDeliverySettings,
      }}
      onDemandDeliveryStore={{
        storeId: onlineOrderState.storeId.value,
        ...onDemandDeliverySettings,
      }}
      onServiceProviderTimeChange={onDeliveryWindowsUpdate}
      autoUpdateSubscription
      recurringDiscountInPercent={generalDeliverySettings?.recurringDiscountInPercent}
      subscription={subscriptionState.attach(Downgraded).value}
      showSubscriptionBanner
      prevSubscriptions={subscriptions}
    />
  );
};

export default DeliveryWindows;
