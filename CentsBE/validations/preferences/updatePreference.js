const Joi = require('joi');
const schema = require('./schema');
const getBusiness = require('../../utils/getBusiness');

async function validate(req, res, next) {
    const business = await getBusiness(req);
    req.body.businessId = business.id;
    const validator = Joi.object({ ...schema, id: Joi.number().integer().required() });

    const { error } = validator.validate(req.body);
    if (error) {
        res.status(400).json({ error: error.message });
    } else {
        next();
    }
}

module.exports = exports = validate;
