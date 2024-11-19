const Joi = require('joi');

async function validate(req, res, next) {
    const payload = req.body;
    const validator = Joi.object().keys({
        previousDefaultOptionId: Joi.number().integer().required(),
        newDefaultOptionId: Joi.number().integer().required(),
    });

    const { error } = validator.validate(payload);

    if (error) {
        res.status(400).json({ error: error.message });
    } else {
        next();
    }
}

module.exports = exports = validate;
