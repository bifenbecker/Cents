const router = require('express').Router({ mergeParams: true });
const { getProducts } = require('./getProducts');

router.get('/', getProducts);

module.exports = exports = router;
