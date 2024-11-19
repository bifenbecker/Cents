const Joi = require('@hapi/joi');
const TaxRate = require('../../models/taxRate');
const getBusiness = require('../../utils/getBusiness');
const formatError = require('../../utils/formatError');

function typeValidation(input) {
    const schema = Joi.object().keys({
        name: Joi.string().required().trim().max(50),
        rate: Joi.number().precision(3).strict().min(0).max(100).required(),
        taxAgency: Joi.string().required().trim().max(50),
    });

    const error = Joi.validate(input, schema);
    return error;
}

module.exports = exports = async function createTaxValidation(req, res, next) {
    try {
        const isValid = typeValidation(req.body);
        if (isValid.error) {
            res.status(422).json({
                error: formatError(isValid.error),
            });
            return;
        }
        const business = await getBusiness(req);
        const taxRateAlreadyExists = await TaxRate.query()
            .where('businessId', business.id)
            .where('name', req.body.name)
            .first();
        if (typeof taxRateAlreadyExists !== 'undefined') {
            res.status(422).json({
                error: 'Tax Name already exists',
            });
            return;
        }

        next();
    } catch (error) {
        next(error);
    }
};
