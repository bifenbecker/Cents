const router = require('express').Router();

const getOrdersCount = require('./ordersCount');
const getOrders = require('./getOrders');
const updateOrderStatus = require('./updateOrderStatus');

const orderUpdateValidations = require('../../../validations/driverApp/updateOrder');

router.get('/count', getOrdersCount);
router.get('/list', getOrders);
router.post('/update', orderUpdateValidations, updateOrderStatus);

module.exports = exports = router;
