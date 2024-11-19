const router = require('express').Router();

const insights = require('./insights');
const getLanguages = require('./getLanguages');
const { searchUser } = require('./search');
const { addCustomer } = require('./addCustomer');
const { getCustomers } = require('./getAllCustomers');
const { getDetails } = require('./singleCustomerDetails');
const addSecondaryDetails = require('./addSecondaryDetails');
const singleCustomerInsights = require('./singleCustomerInsights');
const issueCredit = require('./addCreditsToCustomer');
const reasons = require('./creditReasons');
const {
    addEditCustomerValidations,
} = require('../../../validations/customers/addEditCustomerValidation');
const toggleCommercialCustomer = require('./toggleCommercial');

const setToggleCustomerPayload = require('../../../validations/customers/setToggleCommercialPayload');

const toggleCommercialCustomerValidator = require('../../../validations/customers/toggleCommercial');
const { getSubscriptionsList } = require('./recurringSubscriptions');
const { exportCustomerList } = require('./customersController');
const { getCustomerOrders } = require('./getCustomerOrders');

const locationPickerValidations = require('../../../validations/locations/locationPicker');
const insightsValidator = require('../../../validations/customers/insights');
const ordersValidator = require('../../../validations/customers/getCustomerOrdersValidator');
const pageValidator = require('../../../validations/pageValidation');
const singleRecordValidator = require('../../../validations/singleRecord');
const customers = require('./customersList');
const updateValidator = require('../../../validations/customers/updateCustomer');
const subscriptionsValidations = require('../../../validations/customers/recurringSubscriptions');

const cardOnFile = require('./cardOnFile');
const roleCheck = require('../../../middlewares/roleCheck');

router.get('/subscriptions', subscriptionsValidations, getSubscriptionsList);
router.get('/languages', getLanguages);
router.get('/orders', ordersValidator, getCustomerOrders);
router.get('/', locationPickerValidations, pageValidator, getCustomers);
router.get('/list', locationPickerValidations, pageValidator, customers);
router.get('/search', locationPickerValidations, pageValidator, searchUser);
router.get('/insights', locationPickerValidations, insights);
router.get('/insights/:id', insightsValidator, singleCustomerInsights);
router.get('/reasons', reasons);
router.post('/', addEditCustomerValidations, addCustomer);
router.get('/export', exportCustomerList);
router.use('/:id/card-on-file', singleRecordValidator, cardOnFile);
router.get('/:id', singleRecordValidator, getDetails);
router.put('/:id', updateValidator, addSecondaryDetails);
router.post('/issueCredit', roleCheck(['Business Admin', 'Business Owner']), issueCredit);
router.put(
    '/:id/toggle-commercial',
    toggleCommercialCustomerValidator,
    setToggleCustomerPayload,
    toggleCommercialCustomer,
);

module.exports = exports = router;
