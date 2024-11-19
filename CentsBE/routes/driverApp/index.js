const router = require('express').Router();

const signIn = require('./session');
const orders = require('./orders');
const scanBarcode = require('./scanBarcode');
const stores = require('./stores');
const shifts = require('./shifts');
const routes = require('./routes');
const pickUpOrders = require('./pickUpOrders');
const routeDeliveries = require('./routeDeliveries');
const orderDelivery = require('./orderDelivery');

const tokenAuth = require('../../middlewares/driverAppAuth');
const getScanditKey = require('../employeeTab/scandit');
const getFilestackKey = require('../businessOwner/admin/fileStack');

router.use('/sign-in', signIn);
router.use('/orders', tokenAuth, orders);
router.use('/stores', tokenAuth, stores);
router.use('/route-deliveries', tokenAuth, routeDeliveries);
router.use('/scan-barcode', tokenAuth, scanBarcode);
router.use('/stores', tokenAuth, stores);
router.use('/shifts', tokenAuth, shifts);
router.use('/routes', tokenAuth, routes);
router.use('/pickup-confirmation', tokenAuth, pickUpOrders);
router.use('/order-delivery', tokenAuth, orderDelivery);
router.use('/scandit', tokenAuth, getScanditKey);
router.use('/filestack', tokenAuth, getFilestackKey);

module.exports = exports = router;
