require('dotenv').config();

const router = require('express').Router();

const { getUberDelivery } = require('./uberDeliveryController');
const {
    getReadyOwnNetworkDeliveries,
    getOwnNetworkTimeWindows,
    markPickupDeliveryAsComplete,
} = require('./ownNetworkDeliveryController');
const { getDoorDashDeliveryDetails } = require('./doorDashController');

const markPickupDeliveryAsCompleteValidation = require('../../../validations/employeeTab/delivery/markPickupDeliveryAsComplete');

router.get('/uber/:orderDeliveryId', getUberDelivery);
router.get('/own-network/ready/all', getReadyOwnNetworkDeliveries);
router.get('/own-network/time-windows', getOwnNetworkTimeWindows);
router.put(
    '/own-network/status/complete',
    markPickupDeliveryAsCompleteValidation,
    markPickupDeliveryAsComplete,
);
router.get('/doordash/:id', getDoorDashDeliveryDetails);

module.exports = exports = router;
