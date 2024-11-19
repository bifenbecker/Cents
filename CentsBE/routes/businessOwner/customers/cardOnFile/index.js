const router = require('express').Router({ mergeParams: true });

const detach = require('./detach');
const addCard = require('./addCard');
const getCards = require('./retrieveCards');

const addCardValidator = require('../../../../validations/customers/cardOnfile/addCard');
const getCardsValidator = require('../../../../validations/customers/cardOnfile/getCards');

router.post('/', addCardValidator, addCard);
router.get('/', getCardsValidator, getCards);
router.put('/detach', getCardsValidator, detach);

module.exports = exports = router;
