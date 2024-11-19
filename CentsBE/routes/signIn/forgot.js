const jwt = require('jsonwebtoken');
const Joi = require('@hapi/joi');
const formatError = require('../../utils/formatError');

const User = require('../../models/user');
const eventEmitter = require('../../config/eventEmitter');
const { emailNotificationEvents } = require('../../constants/constants');

const typeValidations = (input) => {
    const validationSchema = Joi.object().keys({
        email: Joi.string().required().email(),
    });
    const error = Joi.validate(input, validationSchema);
    return error;
};

const forgotPassword = async (req, res, next) => {
    try {
        const isValid = typeValidations(req.body);
        if (isValid.error) {
            res.status(422).json({
                error: formatError(isValid.error),
            });
            return;
        }
        const user = await User.query().findOne('email', 'ilike', req.body.email);
        if (!user) {
            res.status(400).json({
                error: 'User not found.',
            });
            return;
        }
        const token = jwt.sign({ email: user.email }, process.env.JWT_SECRET_TOKEN);
        await User.query()
            .patch({
                resetPasswordToken: token,
            })
            .where('id', '=', user.id);
        user.resetPasswordToken = token;
        eventEmitter.emit('emailNotification', emailNotificationEvents.FORGOT_PASSWORD, { user });

        res.status(200).json({
            success: true,
        });
    } catch (error) {
        next(error);
    }
};

module.exports = exports = forgotPassword;
