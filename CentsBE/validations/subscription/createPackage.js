const Joi = require('@hapi/joi');

const User = require('../../models/user');
const Business = require('../../models/laundromatBusiness');

/**
 * Determine if the Business Owner already exists using incoming data
 *
 * @param {Object} customerData
 */
async function getBusinessOwner(customerData) {
    const businessOwner = await User.query().where({
        phone: customerData.phone,
    });

    return businessOwner;
}

/**
 * Determine if the business exists using incoming data
 *
 * @param {String} name
 */
async function getBusiness(name) {
    const business = await Business.query().where({ name });
    return business;
}

/**
 * Determine whether all required fields are present
 *
 * @param {Object} inputObj
 */
function typeValidations(inputObj) {
    const schema = Joi.object().keys({
        businessName: Joi.string().required(),
        customer: Joi.object().keys({
            firstname: Joi.string().required(),
            lastname: Joi.string().required(),
            phone: Joi.string().required(),
            email: Joi.string().email().required(),
        }),
        address: Joi.object()
            .keys({
                address: Joi.string().required(),
                city: Joi.string().required(),
                state: Joi.string().required(),
                zipCode: Joi.number().required(),
                country: Joi.string().required(),
            })
            .allow(null, ''),
        subscriptionProducts: Joi.array()
            .items(
                Joi.object().keys({
                    productImages: Joi.array().allow(null, ''),
                    stripeProductId: Joi.string().required(),
                    stripePriceId: Joi.string().required(),
                    unitPrice: Joi.number().required(),
                    billingFrequency: Joi.string().required(),
                    name: Joi.string().required(),
                    quantity: Joi.number().required(),
                }),
            )
            .required(),
    });

    const validate = Joi.validate(inputObj, schema);
    return validate;
}

/**
 * Validate the incoming package creation request.
 *
 * The rules are as follows:
 *
 * 1) Business Owner user cannot already exist;
 * 2) LaundromatBusiness cannot already exist;
 * 3) Any validation of SubscriptionProduct? replace them or delete existing?
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

        const businessOwner = await getBusinessOwner(req.body.customer);

        if (businessOwner.length > 0) {
            res.status(422).json({
                error: 'The business owner you are attempting to create already exists. Please check to see whether this customer already owns a laundromat in our system.',
            });
            return;
        }

        const business = await getBusiness(req.body.businessName);

        if (business.length > 0) {
            res.status(422).json({
                error: 'The business owner you are attempting to create already exists.',
            });
            return;
        }

        next();
    } catch (error) {
        next(error);
    }
}

module.exports = exports = validateRequest;
