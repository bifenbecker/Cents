const router = require('express').Router();

// Controller methods
const {
    voidOrder,
    editServiceOrderBagNotes,
    updatePromotionTipAndCredit,
} = require('./serviceOrderController');
const { getServicesAndProducts } = require('./servicesController');
const { createFullServiceTurn } = require('./createFullServiceTurn');
const getServiceOrderTurnList = require('./serviceOrderTurnList');
const getServiceOrderTurnsCount = require('./serviceOrderTurnsCount');

// Validators
const updatePostPayConvenienceFeeValidation = require('../../../../validations/orders/updatePostPayConvenienceFee');
const createTurnValidation = require('../../../../validations/machines/turns/createFullServiceTurnValidation');
const serviceOrderTurnListValidation = require('../../../../validations/orders/serviceOrderTurnList');
const setOrderCalculationsDetails = require('../../../../middlewares/setOrderCalculationsDetails');

router.get('/products-services/all', getServicesAndProducts);
router.put('/:id/cancel', voidOrder);
router.put(
    '/convenience-fee/update/:id',
    setOrderCalculationsDetails,
    updatePostPayConvenienceFeeValidation,
    updatePromotionTipAndCredit,
);
router.post('/:serviceOrderId/turn', createTurnValidation, createFullServiceTurn);
router.get('/:serviceOrderId/turns', serviceOrderTurnListValidation, getServiceOrderTurnList);
router.get('/:serviceOrderId/turns-count', getServiceOrderTurnsCount);

router.put('/:id/bag/notes/update', editServiceOrderBagNotes);

module.exports = exports = router;
