const Joi = require('joi');
const optionSchema = require('./option-schema');

async function validate(req, res, next) {
    const optionPayload = req.body;
    const updateOptionValidator = optionSchema.keys({
        businessCustomerPreferenceId: Joi.number().integer().required(),
        id: Joi.number().integer().required(),
    });

    const { error } = updateOptionValidator.validate(optionPayload);

    if (error) {
        res.status(400).json({ error: error.message });
    } else {
        next();
    }
}

module.exports = exports = validate;
