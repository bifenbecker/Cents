const router = require('express').Router();

const getItemsForSale = require('./getItemsForSale');

router.get('/for-sale/list', getItemsForSale);

module.exports = router;
