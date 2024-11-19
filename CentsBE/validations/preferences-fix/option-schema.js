const Joi = require('joi');

const schema = Joi.object().keys({
    value: Joi.string().required(),
    isDefault: Joi.boolean(),
    createdAt: Joi.date().allow(null),
    deletedAt: Joi.date().allow(null),
    updatedAt: Joi.date().allow(null),
    isDeleted: Joi.boolean().allow(null),
});

module.exports = exports = schema;
