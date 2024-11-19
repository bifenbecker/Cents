const router = require('express').Router();
const getOrder = require('./getOrderBarcode');

router.get('/', getOrder);

module.exports = exports = router;
