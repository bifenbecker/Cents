const Joi = require('@hapi/joi');

const ServiceOrder = require('../../../models/serviceOrders');

function typeValidations(inputObj) {
    const schema = Joi.object().keys({
        orderTotal: Joi.number().required().error(new Error('Order total is required.')),
        netOrderTotal: Joi.number().required().error(new Error('Net order total is required.')),
        type: Joi.string().valid('ADDING', 'REMOVING').required(),
        creditApplied: Joi.when('type', {
            is: Joi.string().valid('ADDING'),
            then: Joi.number().min(0).required().error(new Error('Credit Applied is required.')),
            otherwise: Joi.any(), // should be forbidden ideally.
        }),
    });
    const validate = Joi.validate(inputObj, schema);
    return validate;
}

async function validateRequest(req, res, next) {
    try {
        const {
            body,
            params: { id },
        } = req;
        const isTypeValid = typeValidations(body);
        if (isTypeValid.error) {
            res.status(422).json({ error: isTypeValid.error.message });
            return;
        }
        const orderDetails = await ServiceOrder.query()
            .withGraphJoined('storeCustomer', {
                joinOperation: 'innerJoin',
            })
            .where('serviceOrders.id', id)
            .first();
        if (!orderDetails) {
            res.status(404).json({
                error: 'Order not found.',
            });
            return;
        }
        const {
            creditAmount,
            storeCustomer: { creditAmount: availableCredits },
            balanceDue,
            storeId,
            hubId,
        } = orderDetails;
        if (storeId !== req.currentStore.id && hubId !== req.currentStore.id) {
            res.status(404).json({ error: 'order not found' });
            return;
        }
        const { creditApplied, type } = req.body;
        if (type === 'REMOVING') {
            if (!creditAmount) {
                res.status(409).json({
                    error: 'Can not remove credits as credits were not applied.',
                });
                return;
            }
            if (creditApplied) {
                res.status(422).json({
                    error: 'Credit applied is not allowed with type REMOVING.',
                });
                return;
            }
        }
        if (type === 'ADDING') {
            if (creditApplied > availableCredits) {
                res.status(409).json({
                    error: `Can not apply ${creditApplied} as currently there are ${Number(
                        availableCredits,
                    ).toFixed(2)} credits available.`,
                });
                return;
            }
            if (creditApplied > balanceDue) {
                res.status(409).json({
                    error: `Can not apply ${creditApplied} as current balance due is ${Number(
                        balanceDue,
                    ).toFixed(2)}.`,
                });
                return;
            }
        }
        req.constants = req.constants || {};
        req.constants.orderDetails = orderDetails;
        next();
    } catch (error) {
        next(error);
    }
}

module.exports = exports = validateRequest;
