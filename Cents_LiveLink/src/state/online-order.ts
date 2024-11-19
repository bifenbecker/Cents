import {createState} from "@hookstate/core";
import {ORDER_DELIVERY_TYPES} from "../constants/order";

export const initOnlineOrderState = {
  // Init step
  businessId: null, // Required
  storeId: null, // Required
  customerAddressInfo: {}, // Required (Comes from google places)
  uberDeliveryEstimate: {}, // Required (If uber is selected)(Comes from BE which calls uber)
  addressTimeZone: null, // Required (Will come from google API only)

  // ORDER OBJECT TO SEND TO BACKEND.
  // Details State.
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
  isAuthorized: false,
  offersLaundry: false,
  offersDryCleaning: false,
  hasDryCleaning: false,
  hasLaundry: false,
  laundryTurnaroundTime: 24,
  dryCleaningTurnaroundTime: 24,
  turnAroundInHours: 24,
};

export const onlineOrderState = createState(initOnlineOrderState);
