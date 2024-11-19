const Joi = require('@hapi/joi');
const { getBusinessId } = require('./machinesCommonValidations');

function typeValidations(inputObj) {
    const schema = Joi.object().keys({
        id: Joi.string()
            .regex(new RegExp('^[0-9]+$'))
            .required()
            .error(new Error('id must be a positive integer.')),
    });
    const validate = Joi.validate(inputObj, schema);
    return validate;
}

async function getMachineDetailsValidation(req, res, next) {
    try {
        const isValid = typeValidations(req.params);
        if (isValid.error) {
            res.status(422).json({
                error: isValid.error.message || isValid.error.details[0].message,
            });
            return;
        }
        const businessId = await getBusinessId(req);

        if (!businessId) {
            res.status(404).json({
                error: 'business not found',
            });
            return;
        }
        req.constants = { businessId };
        next();
    } catch (error) {
        next(error);
    }
}

module.exports = exports = getMachineDetailsValidation;
