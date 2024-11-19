// order statuses
const statuses = {
    READY_FOR_PROCESSING: 'READY_FOR_PROCESSING',
    DESIGNATED_FOR_PROCESSING_AT_HUB: 'DESIGNATED_FOR_PROCESSING_AT_HUB',
    PROCESSING: 'PROCESSING',
    DROPPED_OFF_AT_HUB: 'DROPPED_OFF_AT_HUB',
    IN_TRANSIT_TO_HUB: 'IN_TRANSIT_TO_HUB',
    RECEIVED_AT_HUB_FOR_PROCESSING: 'RECEIVED_AT_HUB_FOR_PROCESSING',
    HUB_PROCESSING_COMPLETE: 'HUB_PROCESSING_COMPLETE',
    READY_FOR_PICKUP: 'READY_FOR_PICKUP',
    COMPLETED: 'COMPLETED',
    CANCELLED: 'CANCELLED',
    EN_ROUTE_TO_CUSTOMER: 'EN_ROUTE_TO_CUSTOMER',
    READY_FOR_DRIVER_PICKUP: 'READY_FOR_DRIVER_PICKUP',
    DRIVER_PICKED_UP_FROM_CUSTOMER: 'DRIVER_PICKED_UP_FROM_CUSTOMER',
    IN_TRANSIT_TO_STORE: 'IN_TRANSIT_TO_STORE',
    HUB_PROCESSING_ORDER: 'HUB_PROCESSING_ORDER',
    // online order form status
    SUBMITTED: 'SUBMITTED',
    READY_FOR_INTAKE: 'READY_FOR_INTAKE',
    DROPPED_OFF_AT_STORE: 'DROPPED_OFF_AT_STORE',
};
const inventoryOrderStatuses = {
    CREATED: 'CREATED',
    COMPLETED: 'COMPLETED',
    CANCELLED: 'CANCELLED',
};
const hubStatues = {
    IN_TRANSIT_TO_HUB: 'IN_TRANSIT_TO_HUB',
    RECEIVED_AT_HUB_FOR_PROCESSING: 'RECEIVED_AT_HUB_FOR_PROCESSING',
    HUB_PROCESSING_ORDER: 'HUB_PROCESSING_ORDER',
    HUB_PROCESSING_COMPLETE: 'HUB_PROCESSING_COMPLETE',
    IN_TRANSIT_TO_STORE: 'IN_TRANSIT_TO_STORE',
};
const onlineOrderStatuses = {
    SUBMITTED: 'SUBMITTED',
};
const productFields = {
    productName: 'productName',
    productImage: 'productImage',
    productDescription: 'description',
    categoryId: 'categoryId',
    sku: 'sku',
};
const serviceFields = {
    serviceName: 'name',
    serviceDescription: 'description',
    serviceCategoryId: 'serviceCategoryId',
    hasMinPrice: 'hasMinPrice',
};
const employeeCodeIgnoreStatus = [
    'RECEIVED_AT_HUB_FOR_PROCESSING',
    'DROPPED_OFF_AT_HUB',
    'IN_TRANSIT_TO_HUB',
    'IN_TRANSIT_TO_STORE',
    'DROPPED_OFF_AT_STORE',
    'DESIGNATED_FOR_PROCESSING_AT_HUB',
];
const languages = {
    1: 'english',
    2: 'spanish',
};
const weekMapping = {
    0: 'Sunday',
    1: 'Monday',
    2: 'Tuesday',
    3: 'Wednesday',
    4: 'Thursday',
    5: 'Friday',
    6: 'Saturday',
};
const billingIntervals = {
    day: 'daily',
    week: 'weekly',
    month: 'monthly',
    year: 'annual',
};
const locationType = {
    HUB: 'HUB',
    STORE: 'STORE',
    INTAKE_ONLY: 'INTAKE_ONLY',
    STANDALONE: 'STANDALONE',
    RESIDENTIAL: 'RESIDENTIAL',
};
const returnMethods = {
    IN_STORE_PICKUP: 'IN_STORE_PICKUP',
    DELIVERY: 'DELIVERY',
};
const shiftType = {
    SHIFT: 'SHIFT',
    OWN_DELIVERY: 'OWN_DELIVERY',
    CENTS_DELIVERY: 'CENTS_DELIVERY',
};
const deliveryBufferTimeInHours = 1;
const onDemandIntervalInMins = 30;
const servicePriceType = {
    IN_STORE: 'IN_STORE',
    DELIVERY: 'DELIVERY',
};
const deliveryProviders = {
    UBER: 'UBER',
    OWN_DRIVER: 'OWN_DRIVER',
    DOORDASH: 'DOORDASH',
};
const uberCancellationReasons = {
    OUT_OF_ITEMS: 'OUT_OF_ITEMS',
    KITCHEN_CLOSED: 'KITCHEN_CLOSED',
    CUSTOMER_CALLED_TO_CANCEL: 'CUSTOMER_CALLED_TO_CANCEL',
    RESTAURANT_TOO_BUSY: 'RESTAURANT_TOO_BUSY',
    CANNOT_COMPLETE_CUSTOMER_NOTE: 'CANNOT_COMPLETE_CUSTOMER_NOTE',
    OTHER: 'OTHER',
};
const uberCancellingParty = {
    MERCHANT: 'MERCHANT',
    CUSTOMER: 'CUSTOMER',
};
const orderDeliveryStatuses = {
    SCHEDULED: 'SCHEDULED',
    EN_ROUTE_TO_PICKUP: 'EN_ROUTE_TO_PICKUP',
    EN_ROUTE_TO_DROP_OFF: 'EN_ROUTE_TO_DROP_OFF',
    COMPLETED: 'COMPLETED',
    CANCELED: 'CANCELED',
    FAILED: 'FAILED',
    INTENT_CREATED: 'INTENT_CREATED',
};
const deliveryServices = {
    UBER_DELIVERY: 'Delivery - Uber',
    UBER_PICKUP: 'Pickup - On demand',
    OWN_DRIVER_DELIVERY: 'Delivery',
    OWN_DRIVER_PICKUP: 'Pickup',
    DOORDASH_DELIVERY: 'Delivery - DoorDash',
    DOORDASH_PICKUP: 'Pickup - On demand',
};
const routeStatuses = {
    STARTED: 'STARTED',
    COMPLETED: 'COMPLETED',
};
const routeDeliveryStatuses = {
    ASSIGNED: 'ASSIGNED',
    IN_PROGRESS: 'IN_PROGRESS',
    PICKED_UP: 'PICKED_UP',
    COMPLETED: 'COMPLETED',
    CANCELED: 'CANCELED',
};
const serviceOrderRouteDeliveryStatuses = {
    ASSIGNED: 'ASSIGNED',
    PICKED_UP: 'PICKED_UP',
    DROPPED_OFF: 'DROPPED_OFF',
};
const hubOrderRouteDeliveryTypes = {
    TO_HUB: 'TO_HUB',
    TO_STORE: 'TO_STORE',
};

const deviceStatuses = {
    ONLINE: 'ONLINE',
    OFFLINE: 'OFFLINE',
    IN_USE: 'IN_USE',
};

const serviceTypes = {
    SELF_SERVICE: 'SELF_SERVICE',
    CUSTOMER_SERVICE: 'CUSTOMER_SERVICE',
    TECHNICAL_SERVICE: 'TECHNICAL_SERVICE',
    FULL_SERVICE: 'FULL_SERVICE',
};
const turnStatuses = {
    CREATED: 'CREATED',
    ENABLED: 'ENABLED',
    STARTED: 'STARTED',
    RUNNING: 'RUNNING',
    COMPLETED: 'COMPLETED',
};

const TERMS_OF_SERVICE = 'http://bit.ly/washfold0';
const GOOGLE_DISTANCE_MATRIX_URL = 'https://maps.googleapis.com/maps/api/distancematrix/json';

const DEVICE_STATUS_MAPPINGS = {
    RUNNING: 'IN_USE',
    IDLE: 'ONLINE',
};

const DEVICE_PAYMENT_TYPES = {
    0: 'COIN',
    1: 'EMV',
    2: 'CLOUD',
    3: 'APP',
    4: 'EXTERNAL',
};

const CYCLE_MODES = {
    IDLE: 'IDLE',
    RUNNING: 'RUNNING',
};

const DEVICE_PAYMENT_MAPPING = {
    COIN: 0,
    EMV: 1,
    CLOUD: 2,
    APP: 3,
    EXTERNAL: 4,
};

const doorDashWebhookEventStatuses = {
    delivery_created: 'SCHEDULED',
    dasher_confirmed: 'SCHEDULED',
    dasher_enroute_to_pickup: 'EN_ROUTE_TO_PICKUP',
    dasher_confirmed_store_arrival: 'EN_ROUTE_TO_PICKUP',
    dasher_picked_up: 'EN_ROUTE_TO_DROP_OFF',
    dasher_enroute_to_dropoff: 'EN_ROUTE_TO_DROP_OFF',
    dasher_confirmed_consumer_arrival: 'EN_ROUTE_TO_DROP_OFF',
    dasher_dropped_off: 'COMPLETED',
    delivery_cancelled: 'CANCELED',
};

const orderSmsEvents = {
    ONLINE_ORDER_CREATED: 'orders.onlineOrderCreated',
    ORDER_CREATED: 'orders.created',
    INTAKE_COMPLETED: 'orders.intakeCompleted',
    IN_TRANSIT_TO_STORE: 'orders.inTransitToStore',
    DROPPED_OFF_AT_STORE: 'orders.droppedOffAtStore',
    EN_ROUTE_TO_PICKUP: 'orders.enRouteToPickup',
    EN_ROUTE_TO_DROP_OFF: 'orders.enRouteToDropOff',
    ROUTE_DELIVERY_CANCELED: 'orders.routeDelivery.canceled',
    ROUTE_DELIVERY_COMPLETED: 'orders.routeDelivery.completed',
    PICK_UP_ORDER_CANCELED: 'orders.pickupOrder.canceled',
    DELIVERY_ORDER_CANCELED: 'orders.deliveryOrder.canceled',
    READY_FOR_PICKUP: 'orders.readyForPickup',
    SEND_LIVE_LINK: 'orders.notifyLiveLink',
    ORDER_COMPLETED: 'orders.completed',
    INTENT_ORDER_DELIVERY_NOTIFICATION: 'orders.intentOrderDeliveryNotification',
    INTENT_ORDER_PICKUP_NOTIFICATION: 'orders.intentOrderPickupNotification',
    ORDER_PAYMENT_FAILED: 'orders.orderPaymentFailed',
    ORDER_PROCESSING_DELAYED: 'orders.processingDelayed',
    RECURRING_ONLINE_ORDER: 'orders.recurringOnlineOrder',
    EN_ROUTE_ETA_UPDATED: 'orders.enRouteEtaUpdated',
    READY_FOR_PICKUP_SCHEDULED: 'orders.readyForPickupScheduled',
};

const emailNotificationEvents = {
    ADMIN_ACCESS_PASSWORD_RESET: 'adminAccess.PasswordReset',
    MANAGER_ACCESS_PASSWORD_RESET: 'isManager.passwordReset',
    FORGOT_PASSWORD: 'forgotPassword',
    VERIFY_ACCOUNT: 'verifyAccount',
    CENTS_QUOTE: 'centsQuote',
    RESET_PASSWORD: 'resetPassword',
    INTENT_ORDER_PICKUP_NOTIFICATION: 'orders.intentOrderPickupNotification',
};

const USER_TYPES = {
    SUPER_ADMIN: 'Super Admin',
    BUSINESS_OWNER: 'Business Owner',
    EMPLOYEE: 'Employee',
    BUSINESS_ADMIN: 'Business Admin',
    BUSINESS_MANAGER: 'Business Manager',
    CUSTOMER: 'Customer',
};

const userRoles = {
    [USER_TYPES.BUSINESS_OWNER]: 'owner',
    [USER_TYPES.BUSINESS_ADMIN]: 'admin',
    [USER_TYPES.SUPER_ADMIN]: 'superAdmin',
    [USER_TYPES.BUSINESS_MANAGER]: 'manager',
};

const ADMIN_ROLES = [
    USER_TYPES.SUPER_ADMIN,
    USER_TYPES.BUSINESS_OWNER,
    USER_TYPES.BUSINESS_ADMIN,
    USER_TYPES.BUSINESS_MANAGER,
];

const envVariables = {
    GOOGLE_PLACES_FIND_URL: 'https://maps.googleapis.com/maps/api/place/findplacefromtext/json',
    GOOGLE_TIMEZONE_URL: 'https://maps.googleapis.com/maps/api/timezone/json',
    GOOGLE_PLACES_DETAILS_URL: 'https://maps.googleapis.com/maps/api/place/details/json',
    CRON_EXPRESSION: '0 14 * * *',
};

const livelinkImageKeys = {
    DELIVERY_ORDER_COMPLETED: 'DELIVERY_ORDER_COMPLETED',
    IN_STORE_PICKUP_COMPLETED: 'ORDER_COMPLETED',
    READY_FOR_CUSTOMER_PICKUP: 'READY_FOR_CUSTOMER_PICKUP',
    STD_DELIVERY_IN_PROGRESS: 'STD_DELIVERY_IN_PROGRESS',
    ON_DEMAND_DELIVERY_IN_PROGRESS: 'ON_DEMAND_DELIVERY_IN_PROGRESS',
    PROCESSING: 'PROCESSING',
    ORDER_CREATED: 'ORDER_CREATED',
    ORDER_CANCELED: 'ORDER_CANCELED',
    STD_PICKUP_SCHEDULED: 'STD_PICKUP_SCHEDULED',
    ON_DEMAND_PICKUP_SCHEDULED: 'ON_DEMAND_PICKUP_SCHEDULED',
    STD_PICKUP_INITIATED: 'STD_PICKUP_INITIATED',
    ON_DEMAND_PICKUP_INITIATED: 'ON_DEMAND_PICKUP_INITIATED',
    STD_PICKUP_COMPLETED: 'STD_PICKUP_COMPLETED',
    ON_DEMAND_PICKUP_COMPLETED: 'ON_DEMAND_PICKUP_COMPLETED',
};

const scheduledJobStatuses = {
    COMPLETED: 'COMPLETED',
    CANCELED: 'CANCELED',
    FAILED: 'FAILED',
    SCHEDULED: 'SCHEDULED',
    STARTED: 'STARTED',
};

const pricingTiersTypes = {
    COMMERCIAL: 'COMMERCIAL',
    DELIVERY: 'DELIVERY',
};
const origins = {
    LIVE_LINK: 'LIVE_LINK',
    DRIVER_APP: 'DRIVER_APP',
    EMPLOYEE_APP: 'EMPLOYEE_APP',
    INTERNAL_MANAGER: 'INTERNAL_MANAGER',
    RESIDENTIAL_APP: 'RESIDENTIAL_APP',
    BUSINESS_MANAGER: 'BUSINESS_MANAGER',
};

const paymentStatuses = {
    PAID: 'PAID',
    BALANCE_DUE: 'BALANCE_DUE',
    PENDING: 'PENDING',
    INVOICING: 'INVOICING',
};

const deliveryPriceTypes = {
    RETAIL: 'RETAIL',
    DELIVERY_TIER: 'DELIVERY_TIER',
};
const rrule = {
    frequency: {
        SECONDLY: 1,
        MINUTELY: 2,
        HOURLY: 3,
        DAILY: 4,
        WEEKLY: 5,
        MONTHLY: 6,
        YEARLY: 7,
    },
    days: {
        MONDAY: 1,
        TUESDAY: 2,
        WEDNESDAY: 3,
        THURSDAY: 4,
        FRIDAY: 5,
        SATURDAY: 6,
        SUNDAY: 7,
    },
};

const DURATIONS = {
    TURN_MAX_TIME: 2400000, // 40 Minutes in milliseconds.
};

const ORDER_DELIVERY_TYPES = {
    PICKUP: 'PICKUP',
    RETURN: 'RETURN',
};

const paymentTimings = {
    'POST-PAY': 'POST-PAY',
    'PRE-PAY': 'PRE-PAY',
};

const ORDER_TYPES = {
    ONLINE: 'ONLINE',
    RESIDENTIAL: 'RESIDENTIAL',
    SERVICE: 'SERVICE',
};

const serviceCategoryTypes = {
    DRY_CLEANING: 'DRY_CLEANING',
    LAUNDRY: 'LAUNDRY',
    ALTERATIONS: 'ALTERATIONS',
};

const pricingStructureTypes = {
    PER_POUND: 'PER_POUND',
    FIXED_PRICE: 'FIXED_PRICE',
};

const MACHINE_LOAD_TYPES = {
    WARM: 'Warm',
    COLD: 'Cold',
    HOT: 'Hot',
};

const MACHINE_TYPES = {
    WASHER: 'WASHER',
    DRYER: 'DRYER',
};

const PENNY_MODE = {
    SERIAL: 'SERIAL',
    PULSE: 'PULSE',
};

const PAYMENT_METHOD_PROVIDERS = {
    STRIPE: 'stripe',
};

const CREDIT_REASON_NAMES = {
    CUSTOMER_SERVICE: 'Customer Service',
    PROMOTION: 'Promotion',
    REFUND: 'Refund',
    ORDER_ADJUSTMENT: 'Order Adjustment',
};

const ORDERABLE_TYPES = {
    TURN: 'Turn',
    SERVICE_ORDER: 'ServiceOrder',
    INVENTORY_ORDER: 'InventoryOrder',
};

const CENTS_IN_A_DOLLAR = 100;

const TIMEZONES = {
    UTC: 'UTC',
};

const MACHINE_PAYMENT_TYPES = {
    COIN: 'COIN',
    EMV: 'EMV',
    CLOUD: 'CLOUD',
    APP: 'APP',
    EXTERNAL: 'EXTERNAL',
};

const ARCHIVED_USER_EMAIL_PREFIX = '@archived';

const REPORT_TYPES = {
    salesDetailReport: 'salesDetailReport',
    allCustomersList: 'allCustomersList',
    stripePayoutReport: 'stripePayoutReport',
    stripeRefundsReport: 'stripeRefundsReport',
    deliveriesReport: 'deliveriesReport',
    subscriptionsReport: 'subscriptionsReport',
    laborReport: 'laborReport',
    transactionsReport: 'transactionsReport',
};

const CREDIT_REASON_TYPES = {
    CUSTOMER_SERVICE: 1,
    PROMOTION: 2,
    REFUND: 3,
    ORDER_ADJUSTMENT: 4,
};

const CURRENCY_TYPES = {
    USD: 'usd',
};

const PAYMENT_INTENT_STATUSES = {
    SUCCEEDED: 'succeeded',
    CANCELED: 'canceled',
    REQUIRES_PAYMENT_METHOD: 'requires_payment_method',
    REQUIRES_CONFIRMATION: 'requires_confirmation',
    REQUIRES_ACTION: 'requires_action',
    PROCESSING: 'processing',
};

const APPLICATION_FEE = 0.04;

const ORDER_STATUS_PARAM_VALUES = {
    COMPLETED: statuses.COMPLETED,
    COMPLETED_ACTIVE: `${statuses.COMPLETED}_AND_ACTIVE`,
    COMPLETED_CANCELLED: `${statuses.COMPLETED}_AND_${statuses.CANCELLED}`,
    COMPLETED_ACTIVE_CANCELLED: `${statuses.COMPLETED}_AND_ACTIVE_AND_${statuses.CANCELLED}`,
    ACTIVE: 'ACTIVE',
    ACTIVE_CANCELLED: `ACTIVE_AND_${statuses.CANCELLED}`,
    CANCELLED: statuses.CANCELLED,
};

const RECORDS_PER_PAGE_DEFAULT = 20;

const MACHINE_PRICING_TYPES = {
    BASE_VEND: 'BASE_VEND',
    LOAD_TEMPERATURE: 'LOAD_TEMPERATURE',
    MACHINE_MODIFIER: 'MACHINE_MODIFIER',
    TOP_OFF: 'TOP_OFF',
    TOP_OFF_FULL_CYCLE: 'TOP_OFF_FULL_CYCLE',
};

const STRIPE_TERMINAL_WEBHOOK_EVENT_TYPES = {
    ACTION_SUCCEEDED: 'terminal.reader.action_succeeded',
    ACTION_FAILED: 'terminal.reader.action_failed',
};

const MACHINE_PRICING_LABELS = {
    BASE_VEND: 'Base Vend',
};

const NAMED_DAYS = {
    TODAY: 'Today',
};

const DELIVERY_TIMING_TYPES = {
    PICKUP: 'PICKUP',
    ALL: 'ALL',
    RETURN: 'RETURN',
};

module.exports = {
    livelinkImageKeys,
    statuses,
    inventoryOrderStatuses,
    hubStatues,
    productFields,
    serviceFields,
    employeeCodeIgnoreStatus,
    languages,
    weekMapping,
    billingIntervals,
    locationType,
    shiftType,
    servicePriceType,
    deliveryProviders,
    uberCancellationReasons,
    uberCancellingParty,
    deliveryBufferTimeInHours,
    onDemandIntervalInMins,
    deliveryServices,
    onlineOrderStatuses,
    orderDeliveryStatuses,
    TERMS_OF_SERVICE,
    returnMethods,
    GOOGLE_DISTANCE_MATRIX_URL,
    routeStatuses,
    routeDeliveryStatuses,
    hubOrderRouteDeliveryTypes,
    serviceOrderRouteDeliveryStatuses,
    deviceStatuses,
    serviceTypes,
    turnStatuses,
    DEVICE_STATUS_MAPPINGS,
    DEVICE_PAYMENT_TYPES,
    CYCLE_MODES,
    DEVICE_PAYMENT_MAPPING,
    doorDashWebhookEventStatuses,
    orderSmsEvents,
    emailNotificationEvents,
    userRoles,
    ADMIN_ROLES,
    envVariables,
    scheduledJobStatuses,
    pricingTiersTypes,
    origins,
    paymentStatuses,
    deliveryPriceTypes,
    rrule,
    DURATIONS,
    ORDER_DELIVERY_TYPES,
    paymentTimings,
    ORDER_TYPES,
    serviceCategoryTypes,
    pricingStructureTypes,
    MACHINE_LOAD_TYPES,
    MACHINE_TYPES,
    PAYMENT_METHOD_PROVIDERS,
    TIMEZONES,
    MACHINE_PAYMENT_TYPES,
    USER_TYPES,
    ARCHIVED_USER_EMAIL_PREFIX,
    REPORT_TYPES,
    CREDIT_REASON_TYPES,
    CREDIT_REASON_NAMES,
    CURRENCY_TYPES,
    ORDERABLE_TYPES,
    APPLICATION_FEE,
    CENTS_IN_A_DOLLAR,
    PAYMENT_INTENT_STATUSES,
    ORDER_STATUS_PARAM_VALUES,
    RECORDS_PER_PAGE_DEFAULT,
    PENNY_MODE,
    MACHINE_PRICING_TYPES,
    STRIPE_TERMINAL_WEBHOOK_EVENT_TYPES,
    MACHINE_PRICING_LABELS,
    NAMED_DAYS,
    DELIVERY_TIMING_TYPES,
};
