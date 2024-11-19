require('dotenv').config();

const router = require('express').Router();

const {
    generateDoorDashEstimate,
    createDoorDashReturnDelivery,
    getDoorDashDeliveryDetails,
} = require('./doorDashController');

const createDoorDashReturnDeliveryValidation = require('../../../validations/liveLink/delivery/return/createDoorDashReturnDelivery');

router.post('/estimate', generateDoorDashEstimate);
router.post(
    '/delivery/return/create',
    createDoorDashReturnDeliveryValidation,
    createDoorDashReturnDelivery,
);
router.get('/delivery/:id', getDoorDashDeliveryDetails);

module.exports = exports = router;
