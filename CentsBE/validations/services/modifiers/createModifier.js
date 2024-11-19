const Joi = require('@hapi/joi');
const Modifier = require('../../../models/modifiers');

const formatError = require('../../../utils/formatError');
const getBusiness = require('../../../utils/getBusiness');

function typeValidations(inputObj) {
    const schema = Joi.object().keys({
        name: Joi.string().trim().min(3).required(),
        price: Joi.number().precision(3).strict().min(0).required(),
        description: Joi.string().optional().allow(null, ''),
    });
    const validate = Joi.validate(inputObj, schema, { convert: false });
    return validate;
}

async function dbValidations(req, res, next) {
    try {
        const isValid = typeValidations(req.body);
        if (isValid.error) {
            res.status(422).json({
                error: formatError(isValid.error),
            });
            return;
        }
        const business = await getBusiness(req);
        const isModifier = await Modifier.query()
            .where('name', 'ilike', req.body.name.trim())
            .andWhere('businessId', business.id);
        if (isModifier.length) {
            res.status(409).json({
                error: `${req.body.name} already exists.`,
            });
            return;
        }
        req.constants = req.constants || {};
        req.constants.businessId = business.id;
        next();
    } catch (error) {
        next(error);
    }
}

module.exports = exports = dbValidations;
