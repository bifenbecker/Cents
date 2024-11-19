const router = require('express').Router();
const requestOtp = require('./requestOtp');
const { verifyOtp } = require('./verifyOtp');
const tokenAuth = require('../../middlewares/employeeTabAuth');
const customerTokenAuth = require('../../middlewares/customerResidentialAuth');
const verifyCustomer = require('./verifyCustomer');
const createCustomer = require('./createCustomer');
const createOrder = require('./createOrder');
const cancelOrder = require('./cancelOrder');
const getActiveOrders = require('./getActiveOrders');
const sendLiveLink = require('./sendLiveLink');
const featuredService = require('./featuredService');
const residentialScandit = require('./residentialScandit');
const getResidenceTheme = require('./getResidenceTheme');
const getActiveOrderLiveLinks = require('./getActiveOrderLiveLinks');

const requestOtpValidation = require('../../validations/otp/requestOtp');
const verifyOtpValidation = require('../../validations/otp/verifyOtp');
const createCustomerValidation = require('../../validations/customers/createCustomer');
const createOrderValidation = require('../../validations/orders/residentialOrder');

router.post('/request-otp', tokenAuth, requestOtpValidation, requestOtp);
router.post('/verify-otp', tokenAuth, verifyOtpValidation, verifyOtp);
router.get('/verify-customer', tokenAuth, verifyCustomer);
router.post('/create-customer', tokenAuth, createCustomerValidation, createCustomer);
router.post('/create-order', tokenAuth, customerTokenAuth, createOrderValidation, createOrder);
router.patch('/cancel-order/:id', tokenAuth, customerTokenAuth, cancelOrder);
router.get('/active-orders', tokenAuth, customerTokenAuth, getActiveOrders);
router.get('/send-order-link/:id', tokenAuth, customerTokenAuth, sendLiveLink);
router.get('/featured-service', tokenAuth, featuredService);
router.get('/scandit', tokenAuth, residentialScandit);
router.get('/store/:id/theme', tokenAuth, getResidenceTheme);
router.get('/store/:id/active-orders/links', tokenAuth, getActiveOrderLiveLinks);

module.exports = router;
