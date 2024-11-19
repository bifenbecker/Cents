const router = require('express').Router();

// Controller methods
const {
    getInventoryOrders,
    getIndividualInventoryOrder,
    updateInventoryOrderStatus,
} = require('./inventoryOrdersController');

// Validators
const updateInventoryOrderStatusValidation = require('../../../validations/superAdmin/inventoryOrders/updateInventoryOrderStatus');

router.get('/', getInventoryOrders);
router.get('/:id', getIndividualInventoryOrder);
router.put('/:id/status/update', updateInventoryOrderStatusValidation, updateInventoryOrderStatus);

module.exports = exports = router;
