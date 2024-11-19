const Joi = require('@hapi/joi');

/**
 * Determine whether the password contains a capital letter
 *
 * @param {String} password
 */
function hasCapitalLetter(password) {
    return /[A-Z]/.test(password);
}

/**
 * Determine whether the password contains a number
 *
 * @param {String} password
 */
function hasNumber(password) {
    return /\d/.test(password);
}

/**
 * Determine whether the password contains a special character
 *
 * @param {String} password
 */
function hasSpecialCharacter(password) {
    return /\W/.test(password);
}

function typeValidations(inputObj) {
    const schema = Joi.object().keys({
        password: Joi.string().required(),
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

        const { password } = req.body;

        const passesCapitalLetters = hasCapitalLetter(password);
        const passesNumbers = hasNumber(password);
        const passesSpecialCharacter = hasSpecialCharacter(password);

        if (!passesCapitalLetters) {
            res.status(422).json({
                error: 'Your password needs to contain at least one capital letter',
            });
            return;
        }

        if (!passesNumbers) {
            res.status(422).json({
                error: 'Your password needs to contain at least one number',
            });
            return;
        }

        if (!passesSpecialCharacter) {
            res.status(422).json({
                error: 'Your password needs to contain at least one valid special character',
            });
            return;
        }

        next();
    } catch (error) {
        next(error);
    }
}

module.exports = exports = validateRequest;
