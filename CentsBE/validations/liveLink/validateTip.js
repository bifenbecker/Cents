const Joi = require('@hapi/joi');

function typeValidation(inputObj) {
    const schema = Joi.object().keys({
        isTipRemoved: Joi.boolean().required().error(new Error('isTipRemoved is required.')),
        appliedTip: Joi.when('isTipRemoved', {
            is: true,
            then: Joi.string().optional(),
            otherwise: Joi.string().required().error(new Error('appliedTip is required.')),
        }),
    });
    const validate = Joi.validate(inputObj, schema);
    return validate;
}

async function validateTip(req, res, next) {
    try {
        const isTypeValid = typeValidation(req.body);
        if (isTypeValid.error) {
            res.status(422).json({
                error: isTypeValid.error.message,
            });
            return;
        }
        const { isTipRemoved, appliedTip } = req.body;
        const { balanceDue, paymentStatus, orderType } = req.constants.order;
        let { tipAmount = 0 } = req.constants.order;
        if ((balanceDue === 0 || paymentStatus === 'PAID') && orderType !== 'ONLINE') {
            res.status(409).json({
                error: 'Can not update tip as order is already paid.',
            });
            return;
        }
        if (isTipRemoved && !tipAmount) {
            res.status(409).json({
                error: 'Tip can not be removed as it was not previously applied.',
            });
            return;
        }
        if (appliedTip && appliedTip < 0.1) {
            res.status(404).json({
                error: 'Tip must be greater than 10 cents.',
            });
            return;
        }

        const { orderCalculationAttributes } = req.constants;
        if (isTipRemoved) {
            orderCalculationAttributes.tipAmount = 0;
            orderCalculationAttributes.tipOption = null;
        } else {
            if (appliedTip.includes('$')) {
                tipAmount = Number(appliedTip.replace('$', ''));
                orderCalculationAttributes.tipAmount = tipAmount;
            } else {
                orderCalculationAttributes.tipAmount = appliedTip;
            }
        }
        next();
    } catch (error) {
        next(error);
    }
}

module.exports = exports = validateTip;
