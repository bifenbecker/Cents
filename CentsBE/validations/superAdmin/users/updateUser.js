const Joi = require('@hapi/joi');

const User = require('../../../models/user');

function typeValidations(inputObj) {
    const schema = Joi.object().keys({
        field: Joi.string().required(),
        value: Joi.any().required(),
    });
    const validate = Joi.validate(inputObj, schema);
    return validate;
}

/**
 * Based on field and value, determine whether a phone number already exists
 *
 * @param {String} field
 * @param {Any} value
 * @returns {Boolean}
 */
async function validatePhoneNumber(field, value) {
    if (field !== 'phone') {
        return false;
    }

    const user = await User.query().findOne({
        phone: value,
    });

    if (user) {
        return true;
    }

    return false;
}

/**
 * Based on field and value, determine whether an email already exists
 *
 * @param {String} field
 * @param {Any} value
 * @returns {Boolean}
 */
async function validateEmailAddress(field, value) {
    if (field !== 'email') {
        return false;
    }

    const user = await User.query().findOne({
        email: value,
    });

    if (user) {
        return true;
    }

    return false;
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

        const { field, value } = req.body;
        const { id } = req.params;

        const user = await User.query().findById(id);
        if (!user) {
            res.status(409).json({
                error: 'Whoops! This user does not exist.',
            });
            return;
        }

        const phoneNumberExists = await validatePhoneNumber(field, value);
        if (phoneNumberExists) {
            res.status(409).json({
                error: 'Hold the phone! This number already exists in this bitch.',
            });
            return;
        }

        const emailAlreadyExists = await validateEmailAddress(field, value);
        if (emailAlreadyExists) {
            res.status(409).json({
                error: "You've got mail muhfucka! This email is taken by someone else.",
            });
            return;
        }

        next();
    } catch (error) {
        next(error);
    }
}

module.exports = exports = validateRequest;
