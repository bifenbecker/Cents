const router = require('express').Router();

const pickUpConfimation = require('./pickUpConfimation');

router.post('/', pickUpConfimation);

module.exports = exports = router;
