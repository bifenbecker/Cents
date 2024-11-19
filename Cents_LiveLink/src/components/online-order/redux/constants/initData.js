import {SERVICE_CATEGORY_TYPES} from "components/online-order/constants";
import {FETCHING_STATUS} from "constants/api";
import {ORDER_DELIVERY_TYPES} from "constants/order";
import {VIEWS} from "constants/order";

const initialData = {
  //Comes from Initial order data request
  initialOrderData: {
    data: {
      //comes from initial-order-data
      businessId: null, //comes from initial-order-data
      businessSettings: {
        allowInStoreTip: false,
        businessId: null,
        createdAt: null,
        dryCleaningEnabled: false,
        hangDryInstructions: null,
        hasConvenienceFee: false,
        id: null,
        isBagTrackingEnabled: false,
        isCustomPreferencesEnabled: false,
        isCustomUrl: false,
        isHangDryEnabled: false,
        isWeightAfterProcessing: false,
        isWeightBeforeProcessing: false,
        isWeightDuringIntake: false,
        isWeightReceivingAtStore: false,
        isWeightUpOnCompletion: false,
        receiptFooterMessage: "Thank you for your order.",
        requiresEmployeeCode: false,
        requiresRack: false,
        salesWeight: null,
        termsOfServiceUrl: null,
        updatedAt: null,
      },
      customerAddress: {}, //latestAddress is the same as customerAddress that comes from BE
      subscriptions: [],
      theme: {
        active: null,
        boldFont: "",
        borderRadius: "",
        businessId: null,
        businessName: "",
        createdAt: "",
        id: null,
        logoUrl: "",
        normalFont: "",
        primaryColor: "",
        secondaryColor: "",
        updatedAt: "",
      },
    },
    fetchingStatus: FETCHING_STATUS.INITIAL,
    error: {
      text: "",
      code: "",
    },
  },

  serviceTypeAvailability: {
    data: {
      offersLaundry: false, //requires storeId
      offersDryCleaning: false, //requires storeId
      hasDryCleaning: false,
      hasLaundry: false,
    },
    fetchingStatus: FETCHING_STATUS.INITIAL,
    error: {
      text: "",
      code: "",
    },
  },

  //Comes from nearStores request
  nearStoresData: {
    data: {
      onDemandDeliveryStore: {},
      ownDeliveryStore: {},
      recentCompletedStandardOrder: {},
      latestOrderDetails: {},
      addressTimeZone: null,
      deliveryDays: [],
      turnArounds: {},
    },
    fetchingStatus: FETCHING_STATUS.INITIAL,
    error: {
      text: "",
      code: "",
    },
  },

  returnWindows: {
    data: {},
    fetchingStatus: FETCHING_STATUS.INITIAL,
    error: {
      text: "",
      code: "",
    },
  },

  //User's new order config to be displayed on the review new order screen
  newOrderConfig: {
    servicePriceId: null, // Required
    serviceModifierIds: [],
    customerNotes: null,
    isHangDrySelected: false,
    hangDryInstructions: "",
    orderNotes: null,
    customerAddressId: null, // Required

    // Finishing up state
    subscription: {},
    orderDelivery: {
      pickup: {
        type: ORDER_DELIVERY_TYPES.pickup, // Required
        timingsId: null, // Required
        deliveryProvider: null, // Required (OWN_DRIVER, UBER)
        deliveryWindow: [], // Required ([start(unix timestamp), end(unix timestamp)])
        totalDeliveryCost: null, // Required - if not picked up, it will be estimate of uber only
        thirdPartyDeliveryId: null, // Required - if uber pickup, it's estimate id.
        courierTip: 0, // Required - For Doordash
        subsidyInCents: 0, // Required - For Doordash, 0 for own driver settings
        thirdPartyDeliveryInCents: 0, // Required - For Doordash,
      },
      delivery: {
        type: ORDER_DELIVERY_TYPES.return, // Required
        timingsId: null, // Required
        deliveryProvider: null, // Required (OWN_DRIVER, UBER)
        deliveryWindow: [], // Required ([start(unix timestamp), end(unix timestamp)])
        totalDeliveryCost: null, // Required - if not picked up, it will be estimate of uber only
        thirdPartyDeliveryId: null, // Required - if uber pickup, it's estimate id.
        courierTip: 0, // Required - For Doordash
        subsidyInCents: 0, // Required - For Doordash,  0 for own driver settings
        thirdPartyDeliveryInCents: 0, // Required - For Doordash,
      },
    },
    returnMethod: null, // DELIVERY, IN_STORE_PICKUP
    paymentToken: null, // Require - Card or apple pay token seleted
    promoCode: null, // Optional - promo code to apply to order
    bagCount: 1,
  },

  //Schedule state
  schedule: {
    currentStage: VIEWS.RECOMMENDED_PICKUP,
    pickup: null,
    returnInfo: null,
    selectedServices: [SERVICE_CATEGORY_TYPES.LAUNDRY],
    pickupDayIndex: 0,
    returnDayIndex: 0,
  },

  //StoreCustomerInfo!
  customerInfo: {
    data: {},
    fetchingStatus: FETCHING_STATUS.INITIAL,
    error: {
      text: "",
      code: "",
    },
  },

  currentCustomerAddress: null,
};

export default initialData;
