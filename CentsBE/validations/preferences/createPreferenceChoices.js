const Joi = require('joi');

async function validate(req, res, next) {
    const validator = Joi.object({
        optionId: Joi.number().integer().required(),
        choice: Joi.string().required().allow(''),
    }).min(1);

    const { error } = validator.validate(req.body);

    if (error) {
        res.status(400).json({ error: error.message });
    } else {
        next();
    }
}

module.exports = exports = validate;
