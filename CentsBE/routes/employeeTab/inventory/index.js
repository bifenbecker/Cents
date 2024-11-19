const router = require('express').Router();

const fetchInventory = require('./fetchInventory');
const scanProductForOrder = require('./scanProductForOrder');
const inventoryPricesValidation = require('../../../validations/employeeTab/washAndFold/inventoryPricesValidation');

router.get('/', inventoryPricesValidation, fetchInventory);
router.get('/scan', scanProductForOrder);

module.exports = exports = router;
