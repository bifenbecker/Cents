import {onlineOrderState} from "state/online-order";

export const setOnlineOrderState = (state) => {
  const {initialOrderData, schedule, currentCustomerAddress, nearStoresData} = state;
  const hookState = {
    businessId: initialOrderData.data.businessId,
    storeId: schedule.pickup.storeId,
    offersDryCleaning: nearStoresData.data.availableServices.hasDryCleaning,
    offersLaundry: nearStoresData.data.availableServices.hasLaundry,
    laundryTurnaroundTime:
      nearStoresData.data.turnArounds.ownDeliveryStore.laundryTurnAroundInHours ||
      nearStoresData.data.turnArounds.onDemandDeliveryStore.laundryTurnAroundInHours,
    dryCleaningTurnaroundTime:
      nearStoresData.data.turnArounds.ownDeliveryStore.dryCleaningTurnAroundInHours ||
      nearStoresData.data.turnArounds.onDemandDeliveryStore.dryCleaningTurnAroundInHours,
    turnAroundInHours:
      nearStoresData.data.availableServices.storeSettings.turnAroundInHours,
    customerAddressInfo: currentCustomerAddress,
    addressTimeZone: schedule.pickup.timeZone,
    returnMethod: schedule?.returnInfo ? "IN_STORE_PICKUP" : "RETURN",
    orderDelivery: {
      pickup: {
        timingsId: schedule.pickup.id,
        storeId: schedule.pickup.storeId,
        type: "PICKUP",
        deliveryWindow: [1664276400000, 1664316000000],
        deliveryProvider: schedule.pickup.type,
        doorDashEstimate: null,
        courierTip: 0,
        pickupAt: null,
        subsidyInCents: 0,
        thirdPartyDeliveryCostInCents: 0,
        thirdPartyDeliveryId: null,
        totalDeliveryCost: (schedule.pickup.deliveryFeeInCents * 2).toFixed(2),
      },
      delivery: {
        timingsId: schedule.returnInfo.id,
        storeId: schedule.returnInfo.storeId,
        type: "RETURN",
        deliveryWindow: [1664362800000, 1664402400000],
        deliveryProvider: schedule.returnInfo.type,
        doorDashEstimate: null,
        courierTip: 0,
        pickupAt: null,
        subsidyInCents: 0,
        thirdPartyDeliveryCostInCents: 0,
        thirdPartyDeliveryId: null,
        totalDeliveryCost: (schedule.returnInfo.deliveryFeeInCents * 2).toFixed(2),
      },
    },
    storeState:
      nearStoresData?.data.ownDeliveryStore?.state ||
      nearStoresData?.data.onDemandDeliveryStore?.state,
    subscription: {
      // interval: 2,
      // pickupWindow: [1664276400000, 1664316000000],
      // returnWindow: [1664362800000, 1664402400000],
      // modifierIds: [],
      // pickupTimingsId: 3560,
      // deliveryTimingsId: 3561,
    },
  };
  console.log("hookState: ", hookState);
  onlineOrderState.merge(hookState);
  console.log("hookState212: ", onlineOrderState.get());
};
