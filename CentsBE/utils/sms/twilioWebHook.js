const router = require('express').Router();
const { urlencoded } = require('body-parser');
const orderRating = require('./rating');

/*
    Twilio WebHook:
    urlencoded needs to be passed as a middleware, else the req.body object will be empty.
*/
router.post('/', urlencoded({ extended: false }), orderRating);

module.exports = exports = router;
