const Joi = require('@hapi/joi');
const getBusiness = require('../../utils/getBusiness');
const { pricingTiersTypes } = require('../../constants/constants');

function typeValidations(inputObj) {
    const schema = Joi.object().keys({
        type: Joi.string()
            .valid(pricingTiersTypes.COMMERCIAL, pricingTiersTypes.DELIVERY)
            .required()
            .error(() => 'type is required and must be commecial or delivery'),
        keyword: Joi.string().optional().allow('', null),
    });
    const validate = Joi.validate(inputObj, schema);
    return validate;
}

async function validateRequest(req, res, next) {
    try {
        const { type, keyword } = req.query;
        const isValid = typeValidations({ type, keyword });
        if (isValid.error) {
            res.status(422).json({
                error: isValid.error.details[0].message,
            });
            return;
        }
        const business = await getBusiness(req);
        req.constants = req.constants || {};
        req.constants = { business };
        next();
    } catch (error) {
        next(error);
    }
}

module.exports = exports = validateRequest;
