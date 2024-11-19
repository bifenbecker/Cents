require('dotenv').config();

const router = require('express').Router();

const laundryCardRoutes = require('./laundryCard');

router.use('/laundryCard', laundryCardRoutes);

module.exports = exports = router;
