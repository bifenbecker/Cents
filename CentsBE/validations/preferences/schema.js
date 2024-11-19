const Joi = require('joi');

const optionItemSchema = {
    value: Joi.string().required(),
    isDefault: Joi.boolean(),
};

const schema = {
    businessId: Joi.number().integer().required(),
    type: Joi.string()
        .pattern(/^(single|multi)$/)
        .required(),
    fieldName: Joi.string().required(),
    options: Joi.array().items(optionItemSchema).required(),
    createdAt: Joi.date().allow(null),
    deletedAt: Joi.date().allow(null),
    updatedAt: Joi.date().allow(null),
    isDeleted: Joi.boolean().allow(null),
};

module.exports = exports = schema;
