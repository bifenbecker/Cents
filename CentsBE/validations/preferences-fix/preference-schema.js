const Joi = require('joi');

const schema = Joi.object().keys({
    businessId: Joi.number().integer().required(),
    type: Joi.string()
        .pattern(/^(single|multi)$/)
        .required(),
    fieldName: Joi.string().required(),
    createdAt: Joi.date().allow(null),
    deletedAt: Joi.date().allow(null),
    updatedAt: Joi.date().allow(null),
    isDeleted: Joi.boolean().allow(null),
    id: Joi.number().integer().optional().allow(null),
});

module.exports = exports = schema;
