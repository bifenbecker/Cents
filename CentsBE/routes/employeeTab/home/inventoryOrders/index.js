const router = require('express').Router();

const create = require('./createOrder');
const voidOrder = require('./voidOrder');
const { getDetails } = require('./orderDetails');

const voidOrderValidator = require('../../../../validations/employeeTab/inventoryOrders/voidOrder');
const createOrderValidator = require('../../../../validations/employeeTab/inventoryOrders/createOrder');
const storeCustomerCheck = require('../../../../middlewares/checkCustomer');

router.post('/', createOrderValidator, storeCustomerCheck, create);
router.get('/:id', getDetails);
router.patch('/:id', voidOrderValidator, voidOrder);

module.exports = exports = router;
