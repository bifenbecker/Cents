const Joi = require('@hapi/joi');

const validateQrCodeHash = (qrCodeHash) => {
    const schema = Joi.string().required().alphanum().min(4).max(25);
    return Joi.validate(qrCodeHash, schema);
};

module.exports = validateQrCodeHash;
