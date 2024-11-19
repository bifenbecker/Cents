const router = require('express').Router();

const getOrderLiveLink = require('../../../utils/getOrderLiveLink');

// Controller methods
const {
    getServiceOrders,
    getIndividualServiceOrder,
    updateServiceOrderStatus,
} = require('./serviceOrdersController');

// Validators
const updateServiceOrderStatusValidation = require('../../../validations/superAdmin/serviceOrders/updateServiceOrderStatus');
const orderIdValidation = require('../../../validations/orders/singleOrder');

router.get('/', getServiceOrders);
router.get('/:id', getIndividualServiceOrder);
router.get('/:id/live-link', orderIdValidation, getOrderLiveLink);
router.put('/:id/status/update', updateServiceOrderStatusValidation, updateServiceOrderStatus);

module.exports = exports = router;
