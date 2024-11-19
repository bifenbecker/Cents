const Joi = require('@hapi/joi');
const { findCustomer } = require('../../../services/liveLink/queries/customer');

function typeValidation(inputObj) {
    const schema = Joi.object().keys({
        fullName: Joi.string()
            .trim()
            .min(2)
            .required()
            .error(new Error('Full name is required. Full name must have at least 2 letters.')),
        phoneNumber: Joi.string()
            .trim()
            .length(10)
            .regex(new RegExp('^[0-9]+$'))
            .error(new Error('Phone number is required. Phone number must have 10 digits.'))
            .required(),
    });
    const validate = Joi.validate(inputObj, schema);
    return validate;
}

async function validateRequest(req, res, next) {
    try {
        const isTypeValid = typeValidation(req.body);
        if (isTypeValid.error) {
            res.status(422).json({
                error: isTypeValid.error.message,
            });
            return;
        }
        const { phoneNumber } = req.body;
        const isCustomer = await findCustomer(phoneNumber);
        if (isCustomer) {
            const line1 =
                "The phone number that you've entered is associated with another account.";
            const line2 =
                'Please retry with a new phone number to sign up or request otp to sign in.';
            res.status(409).json({
                error: `${line1} ${line2}`,
            });
            return;
        }
        next();
    } catch (error) {
        next(error);
    }
}

module.exports = exports = validateRequest;
