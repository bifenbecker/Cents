const router = require('express').Router();
const cancelOrderDelivery = require('./cancelOrderDelivery');
const cancelOrderDeliveryValidation = require('../../../validations/driverApp/cancelOrderDelivery');

router.post('/:id/cancel', cancelOrderDeliveryValidation, cancelOrderDelivery);

module.exports = exports = router;
