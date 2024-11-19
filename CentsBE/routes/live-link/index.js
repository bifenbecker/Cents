const router = require('express').Router();

const {
    getOrder,
    generateOtp,
    validateOtp,
    updateReturnMethod,
    updateOrder,
    getStoreSettings,
    processPaymentForOrder,
    getCustomerPhoneNumber,
    addPaymentMethodForCustomer,
    createOwnNetworkReturnDelivery,
    updatePaymentIntent,
    cancelReturnDelivery,
    getRouteDeliveryDetails,
    manageOrder,
    getPickUpAndDeliveryDetails,
    authorizeAdminUser,
} = require('./liveLinkController');

const {
    getStoreDeliverableServices,
    nearStores,
    getStoreFeaturedServices,
    getLatestCustomerAddress,
    getCustomerInformation,
    getDeliverySettings,
    getSelectedBusinessTheme,
    getSelectedStoreTheme,
    createOnlineOrder,
    voidOrder,
    getBusinessSettings,
    updateStoreCustomer,
    getPreferencesChoices,
    updatePreferenceOptionSelection,
    createPreferenceOptionSelection,
    deletePreferenceOptionSelection,
    getTurnaroundTimeForCategories,
    getBusinessByCustomUrl,
    getOrderInitialData,
    getReturnWindows,
} = require('./onlineOrderController');

const tipValidator = require('../../validations/liveLink/validateTip');
const otpTypeValidator = require('../../validations/liveLink/checkOtp');
const addCreditsValidator = require('../../validations/liveLink/credits');
const addPromotionValidator = require('../../validations/liveLink/promotion');
const removeCreditsValidator = require('../../validations/liveLink/removeCredits');

const phoneNumberTypeValidator = require('../../validations/liveLink/phoneNumber');

const removePromotionValidator = require('../../validations/liveLink/removePromotion');
const addPaymentMethodValidator = require('../../validations/customers/paymentMethods/addCustomerPaymentMethod');
const validateStore = require('../../validations/liveLink/store/validateStore');
const manageOrdervalidation = require('../../validations/liveLink/manageOrderDelivery');
const deliveryTimingSettingsValidation = require('../../validations/liveLink/deliveryTimingSettings');

const customerAndOrderTokenVerification = require('../../middlewares/liveLink/checkOrder');
const orderTokenVerification = require('../../middlewares/liveLink/orderTokenValidations');
const centsCustomerAuthToken = require('../../middlewares/liveLink/centsCustomerAuthToken');
const checkIfCustomerSignedIn = require('../../middlewares/liveLink/checkIfCustomerSignedIn');

const uber = require('./uber');
const customer = require('./customer');
const doordash = require('./doordash');
const store = require('./store');
const machine = require('./machine');

const nearStoresValidator = require('../../validations/liveLink/nearbyStores');
const createOnlineOrderValidator = require('../../validations/liveLink/createOrder');
const customerInfoByStoreValidation = require('../../validations/liveLink/customerInfoByStoreValidation');
const createOwnNetworkReturnDeliveryValidation = require('../../validations/liveLink/delivery/return/createOwnNetworkReturnDelivery');
const updatePaymentIntentValidation = require('../../validations/liveLink/updatePaymentIntent');
const cancelDeliveryValidation = require('../../validations/liveLink/delivery/cancelDelivery');

const setOrderCalculationsDetails = require('../../middlewares/setOrderCalculationsDetails');

const subscriptions = require('./subscriptions');
const setBusinessCustomer = require('../../middlewares/liveLink/setBusinessCustomer');

const baseValidator = [orderTokenVerification, customerAndOrderTokenVerification];

const updateStoreCustomerValidator = require('../../validations/preferences/updateStoreCustomer');
const updatePreferenceOptionSelectionValidator = require('../../validations/preferences/updatePreferenceOptionSelection');
const createPreferenceOptionSelectionValidator = require('../../validations/preferences/createPreferenceOptionSelection');

router.use('/uber', uber);
router.use('/customer', customer);
router.use('/doordash', doordash);
router.use('/stores/:storeId', centsCustomerAuthToken, validateStore, store);
router.use('/machine', machine);

router.get('/', baseValidator, getOrder);
router.post('/payment/process', processPaymentForOrder);
router.get('/settings', baseValidator, getStoreSettings);
router.patch('/tip', baseValidator, setOrderCalculationsDetails, tipValidator, updateOrder);
router.put('/return-method', baseValidator, updateReturnMethod);
router.put('/payment-method', baseValidator, updatePaymentIntentValidation, updatePaymentIntent);
router.get(
    '/order-delivery/:orderDeliveryId/route-details',
    baseValidator,
    getRouteDeliveryDetails,
);
router.get('/order-deliveries', baseValidator, getPickUpAndDeliveryDetails);
router.post('/request-otp', phoneNumberTypeValidator, generateOtp);
router.get('/verify-order', orderTokenVerification, getCustomerPhoneNumber);

router.post('/authorize-admin', authorizeAdminUser);
// Online order form.
router.get('/near-stores', nearStoresValidator, checkIfCustomerSignedIn, nearStores);
router.get('/return-windows', getReturnWindows);
router.get(
    '/stores/:storeId/deliverable-services',
    centsCustomerAuthToken,
    setBusinessCustomer,
    getStoreDeliverableServices,
);

router.get(
    '/stores/:storeId/featured-services',
    centsCustomerAuthToken,
    setBusinessCustomer,
    getStoreFeaturedServices,
);
// TODO: Remove getDeliverySettings
router.get('/stores/:storeId/delivery-settings', centsCustomerAuthToken, getDeliverySettings);
router.get('/business/custom/:customUrl', getBusinessByCustomUrl);
router.get('/initial-order-data', centsCustomerAuthToken, getOrderInitialData);
router.get('/business-theme/:encodedId', getSelectedBusinessTheme);
router.get('/store-theme/:encodedId', getSelectedStoreTheme);
router.get('/business-settings/:businessId', getBusinessSettings);
router.get(
    '/customer/:storeId/info',
    centsCustomerAuthToken,
    customerInfoByStoreValidation,
    getCustomerInformation,
);
router.patch(
    '/customer-store/:businessId',
    centsCustomerAuthToken,
    updateStoreCustomerValidator,
    updateStoreCustomer,
);
router.get('/customer/addresses/latest', centsCustomerAuthToken, getLatestCustomerAddress);
router.post(
    '/stores/:storeId/order',
    centsCustomerAuthToken,
    setBusinessCustomer,
    createOnlineOrderValidator,
    deliveryTimingSettingsValidation,
    createOnlineOrder,
);

router.patch(
    '/add-credits',
    baseValidator,
    setOrderCalculationsDetails,
    addCreditsValidator,
    updateOrder,
);
router.patch(
    '/add-promotion',
    baseValidator,
    setOrderCalculationsDetails,
    addPromotionValidator,
    updateOrder,
);

router.post('/verify-otp', phoneNumberTypeValidator, otpTypeValidator, validateOtp);

router.patch(
    '/remove-credits',
    baseValidator,
    setOrderCalculationsDetails,
    removeCreditsValidator,
    updateOrder,
);
router.patch(
    '/remove-promotion',
    baseValidator,
    setOrderCalculationsDetails,
    removePromotionValidator,
    updateOrder,
);
router.post('/payment-methods/create', addPaymentMethodValidator, addPaymentMethodForCustomer);
router.post(
    '/delivery/return/own',
    createOwnNetworkReturnDeliveryValidation,
    createOwnNetworkReturnDelivery,
);
router.post('/delivery/uber/cancel', cancelDeliveryValidation, cancelReturnDelivery);

router.get(
    '/preference-choices/business/:businessId',
    centsCustomerAuthToken,
    getPreferencesChoices,
);

router.patch(
    '/preference-choices/selections/:id',
    centsCustomerAuthToken,
    updatePreferenceOptionSelectionValidator,
    updatePreferenceOptionSelection,
);

router.post(
    '/preference-choices/selections',
    centsCustomerAuthToken,
    createPreferenceOptionSelectionValidator,
    createPreferenceOptionSelection,
);

router.delete(
    '/preference-choices/selections/:id',
    centsCustomerAuthToken,
    deletePreferenceOptionSelection,
);

// void order
router.patch('/order/cancel', baseValidator, voidOrder);

// manage Order
router.put(
    '/live-link/manage',
    baseValidator,
    manageOrdervalidation,
    deliveryTimingSettingsValidation,
    manageOrder,
);

// subscriptions
router.use('/subscriptions', centsCustomerAuthToken, subscriptions);

router.get('/categories/turnaround-time', centsCustomerAuthToken, getTurnaroundTimeForCategories);

module.exports = exports = router;
