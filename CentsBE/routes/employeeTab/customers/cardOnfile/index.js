const router = require('express').Router({ mergeParams: true });

const getCards = require('./getCards');

const singleRecordValidator = require('../../../../validations/singleRecord');
const getCardValidator = require('../../../../validations/customers/cardOnfile/getCards');

router.get('/', singleRecordValidator, getCardValidator, getCards);

module.exports = exports = router;
