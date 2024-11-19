import pick from "lodash/pick";
import isEmpty from "lodash/isEmpty";
import {DELIVERY_PROVIDERS, orderChoices, RETURN_METHODS} from "../../../constants/order";
import {canUpdateOrderDelivery} from "../../../utils";
import {onDemandDeliveryTypes} from "../../online-order/constants";

import OrderDeliveryValidator from "../../../services/order-delivery-validator";

export const orderDeliveryPayload = [
  "id",
  "type",
  "timingsId",
  "courierTip",
  "deliveryWindow",
  "deliveryProvider",
  "totalDeliveryCost",
  "thirdPartyDeliveryId",
  "centsCustomerAddressId",
  "subsidyInCents",
  "thirdPartyDeliveryCostInCents",
];

const orderDeliveryKeys = [
  ...orderDeliveryPayload,
  "status",
  "deliveredAt",
  "routeDelivery",
];

export const manageOrderPayload = [
  "id",
  "customerNotes",
  "orderNotes",
  "returnMethod",
  "isPickupCancelled",
  "paymentToken",
  "orderDelivery",
  "servicePriceId",
  "modifierIds",
  "subscription",
];

const getOrderDeliveryFields = (pickupOrDelivery) => {
  if (!Object.keys(pickupOrDelivery || {}).length) {
    return {};
  }
  const requiredObject = pick(pickupOrDelivery || {}, orderDeliveryKeys);
  requiredObject.totalDeliveryCost = requiredObject.totalDeliveryCost || 0;
  requiredObject.subsidyInCents = requiredObject.subsidyInCents || 0;
  requiredObject.thirdPartyDeliveryCostInCents =
    requiredObject.thirdPartyDeliveryCostInCents || 0;
  requiredObject.courierTip = requiredObject.courierTip || 0;
  return requiredObject;
};

const resetWindows = (
  orderDelivery,
  ownDriverDeliverySettings,
  onDemandDeliverySettings
) => {
  return {
    ...orderDelivery,
    timingsId: null,
    courierTip: 0,
    deliveryWindow: [],
    totalDeliveryCost: 0,
    thirdPartyDeliveryId: null,
    deliveryProvider:
      !ownDriverDeliverySettings?.active &&
      orderDelivery.deliveryProvider === DELIVERY_PROVIDERS.ownDriver
        ? DELIVERY_PROVIDERS.doorDash
        : !onDemandDeliverySettings?.dayWiseWindows?.length &&
          orderDelivery.deliveryProvider === DELIVERY_PROVIDERS.doorDash
        ? DELIVERY_PROVIDERS.ownDriver
        : orderDelivery.deliveryProvider,
  };
};

export const setInitState = (prevState, payload) => {
  const {
    order,
    customerInfo,
    onDemandDeliverySettings,
    generalDeliverySettings,
    pickup,
    delivery,
    services,
    servicePriceId,
    modifierIds,
    subscriptionsList,
  } = payload;

  const isPickupNotDone = canUpdateOrderDelivery(pickup?.status);
  const addressIdToValidate =
    (isPickupNotDone && pickup?.centsCustomerAddressId
      ? pickup?.centsCustomerAddressId
      : delivery?.centsCustomerAddressId || pickup?.centsCustomerAddressId) || null;
  const customerAddresses = customerInfo?.addresses || [];
  const addressToValidate =
    customerAddresses.find(({id}) => id === addressIdToValidate) || {};
  const hasAddressToValidate = !!Object.keys(addressToValidate).length;

  return {
    ...prevState,
    onDemandDeliverySettings,
    generalDeliverySettings,
    initLoading: false,
    addressToValidate,
    customerInfo,
    customerAddresses,
    pickup,
    delivery,
    services,
    subscriptionsList,
    // Set loading to true if address to validate exists
    // indicating that validate address serviceability is being called
    loading: hasAddressToValidate,
    initialAddressValidation: hasAddressToValidate,
    showAddressSelection:
      order.returnMethod === RETURN_METHODS.delivery && !hasAddressToValidate,
    manageOrderState: {
      id: order.orderId,
      storeId: order.store?.id,
      storeName: order.store?.name,
      orderType: order.orderType,
      intakeCompletedAt: order.intakeCompletedAt,
      isProcessingCompleted: order.isProcessingCompleted,
      timeZone: order.store.timeZone,
      status: order.status,
      customerNotes: order.customer?.notes || "",
      isHangDrySelected: order.customer?.isHangDrySelected || false,
      hangDryInstructions: order.customer?.hangDryInstructions || "",
      orderNotes: order.orderNotes || "",
      returnMethod:
        order.returnMethod || (isEmpty(delivery) ? RETURN_METHODS.inStorePickup : ""),
      orderDelivery: {
        pickup: getOrderDeliveryFields(pickup),
        delivery: getOrderDeliveryFields(delivery),
      },
      paymentToken: payload?.paymentToken || "",
      subscription: order?.subscription?.recurringSubscription || {},
      servicePriceId: servicePriceId || null,
      modifierIds: modifierIds || [],
    },
  };
};

export const updateManageOrderState = (prevState, payload) => {
  return {
    ...prevState,
    manageOrderState: {
      ...prevState.manageOrderState,
      [payload.field]: payload.value,
    },
  };
};

export const updateSingleState = (prevState, field, value) => {
  return {
    ...prevState,
    [field]: value,
  };
};

export const toggleSingleState = (prevState, field) => {
  return {
    ...prevState,
    [field]: !prevState[field],
  };
};

export const updatePaymentMethod = (prevState, payload) => {
  const currentSubscription = prevState.manageOrderState.subscription || {};
  if (
    !isEmpty(currentSubscription) &&
    payload.choice === orderChoices.currentAndFutureOrders
  ) {
    currentSubscription.paymentToken = payload.paymentToken;
  }
  return {
    ...prevState,
    manageOrderState: {
      ...prevState.manageOrderState,
      paymentToken: payload.paymentToken,
      subscription: currentSubscription,
    },
  };
};

export const saveAddressSelection = (prevState, payload) => {
  const orderDelivery = {...(prevState?.manageOrderState?.orderDelivery || {})};
  let updatedPickup = orderDelivery?.pickup || {};
  let updatedDelivery = orderDelivery?.delivery || {};
  let isPickupValid = true;
  let isDeliveryValid = true;
  const {isProcessingCompleted, timeZone, intakeCompletedAt, orderType, returnMethod} =
    prevState.manageOrderState;

  const orderDeliveryValidator = new OrderDeliveryValidator({
    pickup: updatedPickup,
    delivery: updatedDelivery,
    timeZone,
    isProcessingCompleted,
    intakeCompletedAtInMillis: intakeCompletedAt
      ? new Date(intakeCompletedAt).getTime()
      : null,
    turnAroundInHours: prevState?.generalDeliverySettings?.turnAroundInHours,
    orderType,
    returnMethod,
    bufferTimeInHours: payload?.ownDriverDeliverySettings?.deliveryWindowBufferInHours,
  });

  const isPickupUpdatable = !orderDeliveryValidator.isPickupNotUpdatable();
  const isReturnUpdatable = !orderDeliveryValidator.isReturnNotUpdatable();

  if (prevState.initialAddressValidation) {
    // Address added is the initial address.

    // Check if the windows are in the past.
    // If windows are in the past, we need to open the windows selection.
    // else continue. Don't open windows selection.
    isPickupValid = orderDeliveryValidator.isPickupValid();
    isDeliveryValid =
      returnMethod === RETURN_METHODS.inStorePickup ||
      orderDeliveryValidator.isReturnValid();
    // No need to reset windows as it will be taken care in the windows selection.
  } else {
    // Address changed from initial address.
    // Reset windows and open windows selection.
    if (isPickupUpdatable) {
      updatedPickup = resetWindows(
        updatedPickup,
        payload.ownDriverDeliverySettings,
        prevState.onDemandDeliverySettings
      );
      isPickupValid = false;
    }

    if (isReturnUpdatable) {
      updatedDelivery = resetWindows(
        updatedDelivery,
        payload.ownDriverDeliverySettings,
        prevState.onDemandDeliverySettings
      );
      isDeliveryValid = false;
    }
  }

  if (isPickupUpdatable) {
    updatedPickup.centsCustomerAddressId = payload.address?.id;
  }
  if (isReturnUpdatable) {
    updatedDelivery.centsCustomerAddressId = payload.address?.id;
  }

  return {
    ...prevState,
    loading: false,
    selectedAddressId: payload.address?.id,
    customerAddresses: fetchUpdatedCustomerAddress(prevState, payload.address),
    ownDriverDeliverySettings: payload.ownDriverDeliverySettings,
    initialAddressValidation: false,
    manageOrderState: {
      ...prevState.manageOrderState,
      orderDelivery: {
        pickup: updatedPickup,
        delivery: updatedDelivery,
      },
    },
    showAddressSelection: false,
    showDeliveryWindows:
      !isPickupValid || !isDeliveryValid || payload.shouldShowDeliveryWindows,
    serviceableByOnDemand: payload.serviceableByOnDemand,
    addressToValidate: {},
  };
};

export const updateCustomerAddresses = (prevState, address) => {
  return {
    ...prevState,
    customerAddresses: fetchUpdatedCustomerAddress(prevState, address),
  };
};

export const updateCustomerInfoState = (prevState, payload) => {
  return {
    ...prevState,
    customerInfo: {
      ...payload,
    },
  };
};

const fetchUpdatedCustomerAddress = (prevState, address) => {
  const customerAddresses = [...prevState.customerAddresses];
  const idx = customerAddresses.findIndex(({id}) => address.id === id);
  if (idx > -1) {
    customerAddresses.splice(idx, 1, {...customerAddresses[idx], ...address});
  } else {
    customerAddresses.push(address);
  }

  return customerAddresses;
};

export const updateNotesAndPreferences = (prevState, payload) => {
  return {
    ...prevState,
    manageOrderState: {
      ...prevState.manageOrderState,
      customerNotes: payload?.customerNotes,
      orderNotes: payload?.orderNotes,
      isHangDrySelected: payload?.isHangDrySelected,
      hangDryInstructions: payload?.hangDryInstructions,
    },
  };
};

export const validateAddressError = (prevState, payload) => {
  return {
    ...prevState,
    addressToValidate: {},
    loading: false,
    customerAddresses: prevState.customerAddresses.map((address) => {
      return {
        ...address,
        disabled: address.disabled || address.id === payload,
      };
    }),
    initialAddressValidation: false,
  };
};

export const updateCourierTip = (prevState, payload) => {
  return {
    ...prevState,
    manageOrderState: {
      ...prevState.manageOrderState,
      orderDelivery: {
        ...prevState.manageOrderState.orderDelivery,
        ...(payload.field === onDemandDeliveryTypes.pickupAndDelivery
          ? {
              pickup: {
                ...prevState.manageOrderState.orderDelivery.pickup,
                courierTip: payload.value / 2,
              },
              delivery: {
                ...prevState.manageOrderState.orderDelivery.delivery,
                courierTip: payload.value / 2,
              },
            }
          : payload.field === onDemandDeliveryTypes.pickup
          ? {
              pickup: {
                ...prevState.manageOrderState.orderDelivery.pickup,
                courierTip: payload.value,
              },
            }
          : {
              delivery: {
                ...prevState.manageOrderState.orderDelivery.delivery,
                courierTip: payload.value,
              },
            }),
      },
    },
  };
};

export const updateOrderDeliveryWindows = (prevState, payload = {}) => {
  const {returnMethod, orderDelivery, subscription} = payload;
  return {
    ...prevState,
    manageOrderState: {
      ...prevState.manageOrderState,
      returnMethod,
      orderDelivery: {
        ...prevState.manageOrderState.orderDelivery,
        ...(canUpdateOrderDelivery(
          prevState.manageOrderState?.orderDelivery?.pickup?.status
        )
          ? {
              pickup: {
                ...prevState?.manageOrderState?.orderDelivery?.pickup,
                ...orderDelivery?.pickup,
              },
            }
          : {}),
        delivery:
          returnMethod === RETURN_METHODS.inStorePickup
            ? prevState?.manageOrderState?.orderDelivery?.delivery?.id
              ? {...prevState?.manageOrderState?.orderDelivery?.delivery}
              : {}
            : {
                ...prevState?.manageOrderState?.orderDelivery?.delivery,
                ...orderDelivery?.delivery,
              },
      },
      subscription: prevState?.manageOrderState?.subscription?.id
        ? {
            ...prevState.manageOrderState.subscription,
            ...subscription,
          }
        : {},
    },
  };
};

export const updateServicesAndModifiers = (prevState, payload) => {
  const currentSubscription = prevState.manageOrderState.subscription || {};
  if (
    !isEmpty(currentSubscription) &&
    payload.choice === orderChoices.currentAndFutureOrders
  ) {
    currentSubscription.servicePriceId = payload.servicePriceId;
    currentSubscription.modifierIds = payload.modifierIds;
  }
  return {
    ...prevState,
    manageOrderState: {
      ...prevState.manageOrderState,
      servicePriceId: payload.servicePriceId,
      modifierIds: payload.modifierIds,
      subscription: currentSubscription,
    },
  };
};
