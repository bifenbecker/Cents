const Joi = require('@hapi/joi');

const JwtService = require('../../services/tokenOperations/main');

function typeValidation(inputObj) {
    const schema = Joi.object().keys({
        token: Joi.string().trim().required().error(new Error('Order token is required.')),
    });
    const validate = Joi.validate(inputObj, schema);
    return validate;
}

function validateToken(req, res, next) {
    try {
        let { token } = req.query;
        const isTypeValid = typeValidation({ token });
        if (isTypeValid.error) {
            res.status(422).json({
                error: isTypeValid.error.message,
            });
            return;
        }
        token = token.replace(/'|'/g, '');
        const jwtService = new JwtService(token);
        const isTokenValid = jwtService.verifyToken(process.env.JWT_SECRET_TOKEN_ORDER);
        req.constants = req.constants || {};
        req.constants.order = isTokenValid;
        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            res.status(403).json({
                error: 'Invalid order token.',
            });
            return;
        }
        next(error);
    }
}

module.exports = exports = validateToken;
