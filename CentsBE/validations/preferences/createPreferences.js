const Joi = require('joi');
const getBusiness = require('../../utils/getBusiness');
const schema = require('./schema');

async function validate(req, res, next) {
    const business = await getBusiness(req);
    const preferences = req.body.map((pref) => {
        pref.businessId = business.id;
        return pref;
    });

    const preferencesValidator = Joi.array().items(schema).min(1);
    const { error } = preferencesValidator.validate(preferences);

    if (error) {
        res.status(400).json({ error: error.message });
    } else {
        next();
    }
}

module.exports = exports = validate;
