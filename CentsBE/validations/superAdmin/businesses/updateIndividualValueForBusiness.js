const Joi = require('@hapi/joi');

const Business = require('../../../models/laundromatBusiness');

/**
 * Determine if the business-to-create already exists
 *
 * @param {Object} businessData
 */
async function findBusiness(field, data) {
    if (field === 'name') {
        const business = await Business.query().findOne({
            name: data,
        });
        if (business) {
            return true;
        }
    }
    return false;
}

function typeValidations(inputObj) {
    const schema = Joi.object().keys({
        field: Joi.string().required(),
        value: Joi.any().required(),
        name: Joi.string().required(),
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
        const businessExists = await findBusiness(req.body.field, req.body.value);
        if (businessExists) {
            res.status(422).json({
                error: 'The business name you selected already exists in our system.',
            });
            return;
        }
        next();
    } catch (error) {
        next(error);
    }
}

module.exports = exports = validateRequest;
