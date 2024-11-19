const Joi = require('@hapi/joi');

const StoreCustomer = require('../../models/storeCustomer');
const getBusiness = require('../../utils/getBusiness');

function typeValidations(inputObj) {
    const schema = Joi.object().keys({
        id: Joi.number().integer().min(1).required(),
    });
    const validate = Joi.validate(inputObj, schema);
    return validate;
}

async function validateReq(req, res, next) {
    try {
        const { id } = req.params;
        const isValid = typeValidations({ id });
        if (isValid.error) {
            res.status(422).json({
                error: isValid.error.message,
            });
            return;
        }
        const business = await getBusiness(req);
        const isCustomer = await StoreCustomer.query().findOne({
            centsCustomerId: id,
            businessId: business.id,
        });
        if (!isCustomer) {
            res.status(404).json({
                error: 'Customer not found.',
            });
            return;
        }
        req.constants = { businessId: business.id };
        next();
    } catch (error) {
        next(error);
    }
}

module.exports = exports = validateReq;
