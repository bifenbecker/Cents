const router = require('express').Router();

const createPromotiomProgram = require('../../../../validations/promotions/createPromotionProgram');
const updatePromotionProgram = require('../../../../validations/promotions/updatePromotionProgram');

const {
    getAllPromotionsForBusiness,
    createPromotion,
    getIndividualPromotionProgram,
    updatePromotion,
} = require('./promotions');

router.get('/index', getAllPromotionsForBusiness);
router.get('/:id', getIndividualPromotionProgram);
router.post('/create', createPromotiomProgram, createPromotion);
router.put('/update/:id', updatePromotionProgram, updatePromotion);

module.exports = router;
