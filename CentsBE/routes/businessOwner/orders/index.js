const router = require('express').Router();

const insights = require('./insights');
const ordersList = require('./ordersList');
const orderDetails = require('./orderDetails');
const { getOrdersReport } = require('./ordersReport');
const { getTransactionsReport } = require('../reports/transactionsReport');
const getSalesReport = require('./salesReport');
const getOrderLiveLink = require('../../../utils/getOrderLiveLink');

const updateOrderDeliveryStatus = require('./updateOrderDeliveryStatus');
const updateOrderDeliveryStatusValidation = require('../../../validations/orderDelivery/updateOrderDeliveryStatus');
const ordersListValidator = require('../../../validations/orders/list');
const locationPickerValidations = require('../../../validations/locations/locationPicker');
const orderDetailsValidator = require('../../../validations/orders/singleOrder');
const transactionsReportValidator = require('../../../validations/reports/transactionsReport');
const inventoryOrderDetails = require('./inventoryOrderDetails').getDetails;
const voidOrder = require('./voidOrder');
const getCustomerPreferenceChoices = require('./customerPreferencesChoices');
const getCustomerPreferenceChoiceFixed = require('./customerPreferencesChoicesNew');
const { getInvoicingCustomerOrders, validationSchema } = require('./getInvoicingCustomerOrders');
const validateParameters = require('../../../utils/validateParameters');

router.get('/getTransactionsReport', transactionsReportValidator, getTransactionsReport);
router.get('/getOrdersReport', getOrdersReport);
router.get('/getSalesReport', getSalesReport);
router.get(
    '/invoicingCustomerOrdersReport',
    validateParameters(validationSchema, (req) => req.query),
    getInvoicingCustomerOrders,
);
router.get('/', ordersListValidator, locationPickerValidations, ordersList);
router.get('/insights', locationPickerValidations, insights);
router.get('/:id', orderDetailsValidator, orderDetails);
router.get('/:id/live-link', orderDetailsValidator, getOrderLiveLink);
router.get('/inventory/:id', orderDetailsValidator, inventoryOrderDetails);
router.patch('/:id/cancel', voidOrder);
router.get('/business/:businessId', getCustomerPreferenceChoices);
router.get('/business/:businessId/preferences-choices', getCustomerPreferenceChoiceFixed);
router.put(
    '/delivery/:id/status/update',
    updateOrderDeliveryStatusValidation,
    updateOrderDeliveryStatus,
);

module.exports = router;
