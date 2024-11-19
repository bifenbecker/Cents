const Joi = require('joi');

function validate(req, res, next) {
    const validator = Joi.object({
        notes: Joi.string().optional(),
        isHangDrySelected: Joi.boolean().optional(),
        hangDryInstructions: Joi.string().optional().allow('', null),
    });

    const { error } = validator.validate(req.body);
    if (error) {
        res.status(400).json({ error: error.message });
    } else {
        next();
    }
}

module.exports = exports = validate;
