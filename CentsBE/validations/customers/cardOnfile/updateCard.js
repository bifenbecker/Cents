const Joi = require('@hapi/joi');

const StoreCustomer = require('../../../models/storeCustomer');

const getBusiness = require('../../../utils/getBusiness');

function typeValidations(inputObj) {
    const schema = Joi.object().keys({
        id: Joi.string().required(),
        card: Joi.object()
            .keys({
                expMonth: Joi.number().integer().min(1).max(12).optional(),
                expYear: Joi.number().integer().optional(),
                zipCode: Joi.string().regex(/(^\d{5}$)|(^\d{5}-\d{4}$)/),
                email: Joi.string().email().optional(),
            })
            .min(1)
            .required(),
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
        const { customer } = req.constants;
        if (!customer.stripeCustomerId) {
            res.status(409).json({
                error: 'There are no cards for the customer.',
            });
            return;
        }
        const business = await getBusiness(req);
        const isStoreCustomer = await StoreCustomer.query().findOne({
            centsCustomerId: customer.id,
            businessId: business.id,
        });
        if (!isStoreCustomer) {
            res.status(404).json({
                error: 'Customer not found.',
            });
            return;
        }
        next();
    } catch (error) {
        next(error);
    }
}

module.exports = exports = validateRequest;
