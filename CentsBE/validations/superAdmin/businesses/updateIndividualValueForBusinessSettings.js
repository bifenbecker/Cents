const Joi = require('@hapi/joi');

const Business = require('../../../models/laundromatBusiness');

/**
 * Determine if the business exists
 *
 * @param {Number} id
 */
async function findBusiness(id) {
    const business = await Business.query().findById(id);
    if (business) {
        return true;
    }
    return false;
}

function typeValidations(inputObj) {
    const schema = Joi.object().keys({
        id: Joi.number().required(),
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
        const businessExists = await findBusiness(req.body.id);
        if (!businessExists) {
            res.status(422).json({
                error: 'The business you are trying to update does not exist.',
            });
            return;
        }
        next();
    } catch (error) {
        next(error);
    }
}

module.exports = exports = validateRequest;
