const Joi = require('@hapi/joi');

const User = require('../../models/user');

const emailValidation = require('../signUpValidations/email');
const phoneNumberValidation = require('../signUpValidations/phoneNumber');

const getBusiness = require('../../utils/getBusiness');
const formatError = require('../../utils/formatError');

function typeValidations(input) {
    const schema = Joi.object().keys({
        userId: Joi.number().required(),
        field: Joi.string()
            .required()
            .allow('boFullName', 'boEmail', 'boPhoneNumber')
            .only()
            .error(() => 'Invalid Field'),
        value: Joi.string()
            .allow('')
            .required()
            .when('field', {
                is: 'boEmail',
                then: Joi.string()
                    .email()
                    .allow('')
                    .error(() => 'Invalid Email'),
            }),
    });
    const error = Joi.validate(input, schema);
    return error;
}

async function verifyDetails(req, res, next) {
    try {
        const userId = req.params.id;
        req.body.userId = userId;
        const business = await getBusiness(req);

        const isValid = typeValidations(req.body);
        if (isValid.error) {
            res.status(422).json({
                error: formatError(isValid.error),
            });
            return;
        }
        const isUser = await User.query().findOne('id', req.body.userId);
        if (!isUser) {
            res.status(404).json({
                error: 'User not found.',
            });
            return;
        }
        const inputField = req.body.field;
        if (inputField === 'boEmail') {
            const isEmailValid = await emailValidation(
                req.body.value.toUpperCase(),
                'Business Owner',
                'Customer',
                req.body.userId,
                business.id,
            );
            if (isEmailValid.error) {
                res.status(409).json({
                    error: 'Email already exists.',
                });
                return;
            }
        }
        if (inputField === 'boPhoneNumber') {
            const isPhoneNumberInvalid = await phoneNumberValidation(
                req.body.value,
                req.body.userId,
            );
            if (isPhoneNumberInvalid) {
                res.status(409).json({
                    error: 'Phone number already exists.',
                });
                return;
            }
        }
        next();
    } catch (error) {
        next(error);
    }
}

module.exports = exports = verifyDetails;
