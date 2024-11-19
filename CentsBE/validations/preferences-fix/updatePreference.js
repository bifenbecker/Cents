const schema = require('./preference-schema');
const getBusiness = require('../../utils/getBusiness');
const BusinessCustomerPreferences = require('../../models/businessCustomerPreferences');

async function validate(req, res, next) {
    const business = await getBusiness(req);
    req.body.businessId = business.id;
    req.constants = { business };

    const businessCustomerPreference = await BusinessCustomerPreferences.query().findById(
        req.body.id,
    );
    req.constants.businessCustomerPreferenceBeforeUpdate = businessCustomerPreference;

    const { error } = schema.validate(req.body);
    if (error) {
        res.status(400).json({ error: error.message });
    } else {
        next();
    }
}

module.exports = exports = validate;
