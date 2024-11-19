const Joi = require('@hapi/joi');

const Business = require('../../models/laundromatBusiness');

/**
 * Determine if the business exists using incoming data
 *
 * @param {Number} id
 */
async function getBusiness(id) {
    const business = await Business.query().findById(id);
    return business;
}

/**
 * Determine whether all required fields are present
 *
 * @param {Object} inputObj
 */
function typeValidations(inputObj) {
    const schema = Joi.object().keys({
        businessId: Joi.number().required(),
        paymentToken: Joi.string().required(),
        recurringItems: Joi.array()
            .items(
                Joi.object().keys({
                    billingFrequency: Joi.string().required(),
                    businessId: Joi.number().required(),
                    createdAt: Joi.date().allow(null, ''),
                    deletedAt: Joi.date().allow(null, ''),
                    id: Joi.number().required(),
                    isDeleted: Joi.boolean().required(),
                    name: Joi.string().required(),
                    quantity: Joi.number().required(),
                    stripePriceId: Joi.string().required(),
                    stripeProductId: Joi.string().required(),
                    unitPrice: Joi.number().required(),
                    updatedAt: Joi.date().allow(null, ''),
                }),
            )
            .required(),
        oneTimeItems: Joi.array()
            .items(
                Joi.object().keys({
                    billingFrequency: Joi.string().required(),
                    businessId: Joi.number().required(),
                    createdAt: Joi.date().allow(null, ''),
                    deletedAt: Joi.date().allow(null, ''),
                    id: Joi.number().required(),
                    isDeleted: Joi.boolean().required(),
                    name: Joi.string().required(),
                    quantity: Joi.number().required(),
                    stripePriceId: Joi.string().required(),
                    stripeProductId: Joi.string().required(),
                    unitPrice: Joi.number().required(),
                    updatedAt: Joi.date().allow(null, ''),
                }),
            )
            .required(),
    });

    const validate = Joi.validate(inputObj, schema);
    return validate;
}

/**
 * Validate the incoming subscription payment request.
 *
 * The rules are as follows:
 *
 * 1) Business cannot pay for a subscription they have already paid for;
 *
 * @param {Object} req
 * @param {Object} res
 * @param {void} next
 */
async function validateRequest(req, res, next) {
    try {
        const isValid = typeValidations(req.body);

        if (isValid.error) {
            res.status(422).json({
                error: isValid.error.message,
            });
            return;
        }

        const business = await getBusiness(req.body.businessId);

        if (business.subscriptionId) {
            res.status(422).json({
                error: 'You have already paid for a subscription! You are now able to enjoy Cents :)',
            });
            return;
        }

        next();
    } catch (error) {
        next(error);
    }
}

module.exports = exports = validateRequest;
