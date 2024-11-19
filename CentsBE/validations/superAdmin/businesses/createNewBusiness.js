const Joi = require('@hapi/joi');

const User = require('../../../models/user');
const Business = require('../../../models/laundromatBusiness');
const twilio = require('../../../utils/sms/index');

/**
 * Use Twilio API to validate whether US phone number is real.
 *
 * @param {String} customerPhoneNumber
 */
async function validatePhoneNumber(customerPhoneNumber) {
    try {
        const validation = await twilio.lookups
            .phoneNumbers(customerPhoneNumber)
            .fetch({ countryCode: 'US' });
        return validation;
    } catch (error) {
        return null;
    }
}

/**
 * Determine if user-to-create already exists
 *
 * @param {Object} userData
 */
async function findUser(userData) {
    const user = await User.query()
        .where('phone', userData.phone)
        .orWhere('email', userData.email)
        .first();

    return user;
}

/**
 * Determine if the business-to-create already exists
 *
 * @param {Object} businessData
 */
async function findBusiness(businessData) {
    const business = await Business.query()
        .where({
            name: businessData.name,
        })
        .first();

    return business;
}

function typeValidations(inputObj) {
    const schema = Joi.object().keys({
        user: Joi.object().keys({
            firstName: Joi.string().required(),
            lastName: Joi.string().required(),
            phone: Joi.string().required(),
            email: Joi.string().email().required(),
            password: Joi.string().required(),
        }),
        business: Joi.object().keys({
            name: Joi.string().required(),
            address: Joi.string().required(),
            city: Joi.string().required(),
            state: Joi.string().required(),
            zipCode: Joi.string().required(),
        }),
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

        const { user, business } = req.body;

        const userExists = await findUser(user);

        if (userExists) {
            res.status(409).json({
                error: 'The user you are trying to create already exists in our system.',
            });
            return;
        }

        const businessExists = await findBusiness(business);

        if (businessExists) {
            res.status(409).json({
                error: 'The business you are trying to create already exists in our system.',
            });
            return;
        }

        const phoneNumber = await validatePhoneNumber(user.phone);

        if (!phoneNumber) {
            res.status(422).json({
                error: 'The phone number you have provided is not a valid phone number.',
            });
            return;
        }

        next();
    } catch (error) {
        next(error);
    }
}

module.exports = exports = validateRequest;
