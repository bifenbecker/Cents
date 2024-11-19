const router = require('express').Router();

// Controller methods
const { updateOrderDeliveryStatus } = require('./orderDeliveryController');

// Validators
const updateOrderDeliveryStatusValidation = require('../../../validations/orderDelivery/updateOrderDeliveryStatus');

router.put('/:id/status/update', updateOrderDeliveryStatusValidation, updateOrderDeliveryStatus);

module.exports = exports = router;
