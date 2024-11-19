const Joi = require('@hapi/joi');

/**
 * Determine whether all required fields are present
 *
 * @param {Object} inputObj
 */
function typeValidations(inputObj) {
    const schema = Joi.object().keys({
        centsCustomerId: Joi.number().required(),
        address: Joi.object()
            .keys({
                address1: Joi.string().required(),
                address2: Joi.string().allow(null, ''),
                centsCustomerId: Joi.number().allow(null, ''),
                city: Joi.string().required(),
                countryCode: Joi.string().allow(null, ''),
                createdAt: Joi.date().allow(null, ''),
                firstLevelSubdivisionCode: Joi.string().required(),
                googlePlacesId: Joi.string().allow(null, ''),
                id: Joi.number().allow(null, ''),
                instructions: Joi.string().allow(null, ''),
                lat: Joi.number().allow(null, ''),
                leaveAtDoor: Joi.boolean().allow(null, ''),
                lng: Joi.number().allow(null, ''),
                postalCode: Joi.string().required(),
                updatedAt: Joi.date().allow(null, ''),
            })
            .required(),
        customerAddressId: Joi.number().required(),
    });

    const validate = Joi.validate(inputObj, schema);
    return validate;
}

/**
 * Validate the incoming customer creation request.
 *
 * @param {Object} payload
 * @param {Object} res
 * @param {void} next
 */
async function validateRequest(payload, res, next) {
    try {
        const isValid = typeValidations(payload);

        if (isValid.error) {
            res.status(422).json({
                error: isValid.error.message,
            });
            return;
        }

        next();
    } catch (error) {
        next(error);
    }
}

function validateForRequestBody(req, res, next) {
    try {
        validateRequest(req.body, res, next);
    } catch (error) {
        next(error);
    }
}

function validateForRequestWithParams(req, res, next) {
    try {
        const { id } = req.params;
        const payload = {
            centsCustomerId: id,
            customerAddressId: req.body.address.id,
            ...req.body,
        };
        validateRequest(payload, res, next);
    } catch (error) {
        next(error);
    }
}

module.exports = exports = {
    validateForRequestBody,
    validateForRequestWithParams,
};
