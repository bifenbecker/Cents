const Joi = require('@hapi/joi');

function validateTasks(inputObj) {
    const schema = Joi.object().keys({
        id: Joi.number().integer(),
        name: Joi.string(),
        description: Joi.string().required(),
        isPhotoNeeded: Joi.boolean().optional(),
    });
    const error = Joi.validate(inputObj, schema);
    return error;
}

module.exports = exports = validateTasks;
