const router = require('express').Router();

const businessOwnerHandler = require('./businessOwner');
const deviceHandler = require('./device');
const subscriptionPackage = require('./package');
const authentication = require('./authentication');
const serviceOrders = require('./serviceOrders');
const inventoryOrders = require('./inventoryOrders');
const stores = require('./stores');
const businesses = require('./businesses');
const themes = require('./themes');
const users = require('./users');
const roles = require('./roles');
const scaleDevices = require('./scaleDevice');
const customers = require('./customers');
const partners = require('./partners');
const payments = require('./payments');
const orderDeliveries = require('./orderDelivery');
const stripeAccount = require('./stripeAccount');

router.use('/business-owners', businessOwnerHandler);
router.use('/devices', deviceHandler);
router.use('/package', subscriptionPackage);
router.use('/authentication', authentication);
router.use('/service-orders', serviceOrders);
router.use('/inventory-orders', inventoryOrders);
router.use('/stores', stores);
router.use('/themes', themes);
router.use('/businesses', businesses);
router.use('/users', users);
router.use('/roles', roles);
router.use('/scaleDevices', scaleDevices);
router.use('/customers', customers);
router.use('/partners', partners);
router.use('/payments', payments);
router.use('/order-deliveries', orderDeliveries);
router.use('/stripe-account', stripeAccount);

module.exports = exports = router;
