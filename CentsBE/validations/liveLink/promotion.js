const Joi = require('@hapi/joi');

const PromotionProgram = require('../../models/businessPromotionProgram');
const currentActiveServiceOrderItems = require('../../services/orders/queries/currentActiveServiceItems');

const { performValidations } = require('../../routes/employeeTab/promotions/promotions');

function typeValidation(inputObj) {
    const schema = Joi.object().keys({
        promoCode: Joi.string()
            .min(1)
            .required()
            .trim()
            .error(new Error('Promo Code is required.')),
    });
    const validate = Joi.validate(inputObj, schema);
    return validate;
}

async function findPromotion(promoCode, businessId) {
    const isPromotion = await PromotionProgram.query()
        .withGraphJoined('[storePromotions, promotionItems]')
        .where({
            'businessPromotionPrograms.businessId': Number(businessId),
        })
        .andWhere('businessPromotionPrograms.name', 'ilike', promoCode.trim());
    return isPromotion;
}

async function validatePromotion(req, res, next) {
    try {
        const isTypeValid = typeValidation(req.body);
        if (isTypeValid.error) {
            res.status(422).json({
                error: isTypeValid.error.message,
            });
            return;
        }
        const {
            promotionId,
            balanceDue,
            centsCustomerId,
            id,
            orderTotal,
            paymentStatus,
            businessId,
            storeId,
            orderType,
            previousTipOption: tipOption,
        } = req.constants.order;
        const { promoCode } = req.body;

        if (promoCode && promotionId) {
            res.status(409).json({
                error: 'Can not apply new promotion until you remove the previous one.',
            });
            return;
        }

        if ((balanceDue === 0 || paymentStatus === 'PAID') && orderType !== 'ONLINE') {
            res.status(409).json({
                error: 'Promotion can not be updated for a paid order.',
            });
            return;
        }

        const isPromotionProgram = await findPromotion(promoCode, businessId);
        if (!isPromotionProgram.length) {
            res.status(404).json({
                error: 'The promotion code is invalid or does not exist',
            });
            return;
        }

        const currentOrderItems = await currentActiveServiceOrderItems(id, true);
        const validatePromotion = await performValidations(
            {
                body: {
                    totalAmount: orderTotal,
                    orderItems: currentOrderItems,
                    customer: {
                        id: centsCustomerId,
                        centsCustomerId,
                    },
                },
            },
            isPromotionProgram,
            { id: storeId },
        );

        if (!validatePromotion.isValid) {
            res.status(422).json({
                success: false,
                error: validatePromotion.reason,
            });
            return;
        }

        const promotionDetails = isPromotionProgram[0];
        req.constants.order.promotionDetails = promotionDetails;
        req.constants.order.orderItems = currentOrderItems;
        req.constants.promotionId = promotionDetails.id;

        req.constants.orderCalculationAttributes.promotionId = promotionDetails.id;
        let tipAmount = tipOption;
        if (tipOption && tipOption.includes('$')) {
            tipAmount = Number(tipOption.replace('$', ''));
        }
        req.constants.orderCalculationAttributes.tipAmount = tipAmount;
        next();
    } catch (error) {
        next(error);
    }
}

module.exports = exports = validatePromotion;
