const Joi = require('@hapi/joi');
const RecurringSubscription = require('../../../models/recurringSubscription');

function typeValidation(inputObj) {
    const schema = Joi.object({
        isDeleted: Joi.boolean().optional(),
        cancelNextPickup: Joi.boolean().optional(),
        reinstateNextPickup: Joi.boolean().optional(),
        interval: Joi.number().integer().optional(),
        id: Joi.number().integer().required(),
    });
    const validate = Joi.validate(inputObj, schema);
    return validate;
}

async function validate(req, res, next) {
    try {
        const { id } = req.params;
        const isValid = typeValidation({ ...req.body, id });
        if (isValid.error) {
            res.status(422).json({
                error: isValid.error.details[0].message,
            });
            return;
        }
        const subscription = await RecurringSubscription.query()
            .withGraphFetched('[store.settings]')
            .where({ centsCustomerId: req.currentCustomer.id })
            .findById(id);
        if (!subscription) {
            throw new Error('Invalid subscription id');
        }
        req.constants = req.constants || {};
        req.constants.subscription = subscription;

        next();
    } catch (error) {
        next(error);
    }
}

module.exports = exports = validate;
