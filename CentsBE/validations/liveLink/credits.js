const Joi = require('@hapi/joi');

const applyToFixed = require('../../utils/applyToFixed');

function typeValidations(inputObj) {
    const schema = Joi.object().keys({
        appliedCredits: Joi.number()
            .required()
            .min(0.01)
            .error(new Error('appliedCredits is required and should be greater than 0.01')),
    });
    const validate = Joi.validate(inputObj, schema);
    return validate;
}

async function validateCredits(req, res, next) {
    try {
        const isTypeValid = typeValidations(req.body);
        if (isTypeValid.error) {
            res.status(422).json({
                error: isTypeValid.error.message,
            });
            return;
        }
        const { appliedCredits } = req.body;
        const {
            availableCredits,
            balanceDue,
            creditAmount,
            paymentStatus,
            orderType,
            netOrderTotal,
        } = req.constants.order;

        if (creditAmount) {
            res.status(409).json({
                error: 'Can not apply new credits. To apply new credits please remove the previous ones.',
            });
            return;
        }

        if (appliedCredits > availableCredits) {
            res.status(409).json({
                error: `Can not apply ${applyToFixed(appliedCredits)} as you have ${applyToFixed(
                    availableCredits,
                )} credits available.`,
                availableCredits: applyToFixed(availableCredits),
            });
            return;
        }

        if (appliedCredits > balanceDue && orderType !== 'ONLINE') {
            res.status(409).json({
                error: `Can not apply ${applyToFixed(
                    appliedCredits,
                )} as current balance due is ${applyToFixed(balanceDue)}.`,
                balanceDue: applyToFixed(balanceDue),
            });
            return;
        }

        if ((balanceDue === 0 || paymentStatus === 'PAID') && orderType !== 'ONLINE') {
            res.status(409).json({
                error: 'Credits can not be updated for a paid order.',
            });
            return;
        }
        if (appliedCredits > netOrderTotal && orderType === 'ONLINE') {
            res.status(409).json({
                error: `Can not apply ${applyToFixed(
                    appliedCredits,
                )} as current balance due is ${applyToFixed(netOrderTotal)}.`,
                netOrderTotal: applyToFixed(netOrderTotal),
            });
            return;
        }
        req.constants.orderCalculationAttributes.creditAmount = Number(req.body.appliedCredits);
        next();
    } catch (error) {
        next(error);
    }
}

module.exports = exports = validateCredits;
