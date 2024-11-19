const Joi = require('@hapi/joi');

const CentsCustomerAddress = require('../../../models/centsCustomerAddress');

/**
 * Determine if the address exists for the customer
 *
 * @param {Object} address
 * @param {Number} centsCustomerId
 */
async function getCentsCustomerAddress(address, centsCustomerId) {
    const verifiedAddress = await CentsCustomerAddress.query().where({
        address1: address.address1,
        address2: address.address2 ? address.address2 : null,
        city: address.city,
        firstLevelSubdivisionCode: address.firstLevelSubdivisionCode,
        postalCode: address.postalCode,
        centsCustomerId,
    });
    return verifiedAddress;
}

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
                city: Joi.string().required(),
                firstLevelSubdivisionCode: Joi.string().required(),
                postalCode: Joi.string().required(),
            })
            .required(),
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

        const address = await getCentsCustomerAddress(payload.address, payload.centsCustomerId);

        if (address.length > 0) {
            res.status(422).json({
                error: "We've already got this address on file for you. If you want to change the address, please go back and edit the address instead.",
            });
            return;
        }

        next();
    } catch (error) {
        next(error);
    }
}

function validateForRequestBody(req, res, next) {
    return validateRequest(req.body, res, next);
}

function validateForRequestWithParams(req, res, next) {
    const { id } = req.params;
    const payload = {
        centsCustomerId: id,
        ...req.body,
    };
    return validateRequest(payload, res, next);
}

module.exports = exports = {
    validateForRequestBody,
    validateForRequestWithParams,
};
