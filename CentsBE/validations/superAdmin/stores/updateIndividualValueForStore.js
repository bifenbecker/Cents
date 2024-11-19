const Joi = require('@hapi/joi');

const Store = require('../../../models/store');

const booleanValues = [
    'hasDeliveryEnabled',
    'hasCashDrawer',
    'hasCashEnabled',
    'hasCciEnabled',
    'hasEsdEnabled',
    'hasReceiptPrinter',
    'isBagTrackingEnabled',
    'isHub',
    'isIntakeOnly',
    'offersFullService',
    'autoScheduleReturnEnabled',
    'hasOtherPaymentMethods',
];

function typeValidations(inputObj) {
    const schema = Joi.object().keys({
        field: Joi.string().required(),
        value: Joi.any().required(),
    });
    const validate = Joi.validate(inputObj, schema);
    return validate;
}

async function validateRequest(req, res, next) {
    try {
        const isValid = typeValidations(req.body);
        if (isValid.error) {
            res.status(422).json({
                error: isValid.error.message,
            });
            return;
        }

        const { field, value } = req.body;
        const { id } = req.params;
        const store = await Store.query().findById(id);

        if (!store) {
            res.status(409).json({
                error: 'Whoops! This store does not exist.',
            });
            return;
        }

        if (booleanValues.includes(field) && typeof value !== 'boolean') {
            res.status(422).json({
                error: 'We expected a true of false value for this but received something else.',
            });
            return;
        }

        next();
    } catch (error) {
        next(error);
    }
}

module.exports = exports = validateRequest;
