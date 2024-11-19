const router = require('express').Router();

const { validatePromotion } = require('./promotions');

router.post('/validate', validatePromotion);

module.exports = exports = router;
