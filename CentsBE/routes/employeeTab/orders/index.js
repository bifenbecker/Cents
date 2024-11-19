const router = require('express').Router();

const serviceOrders = require('./serviceOrders');
const { getOrdersCount } = require('./orderController');

router.use('/service-orders', serviceOrders);
router.use('/order-count', getOrdersCount);

module.exports = exports = router;
