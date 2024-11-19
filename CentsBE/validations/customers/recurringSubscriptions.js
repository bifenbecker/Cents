const Joi = require('@hapi/joi');
const CentsCustomer = require('../../models/centsCustomer');
const Store = require('../../models/store');
const getBusiness = require('../../utils/getBusiness');

function typeValidations(inputObj) {
    const schema = Joi.object().keys({
        id: Joi.string()
            .regex(new RegExp('^[0-9]+$'))
            .required()
            .error(new Error('id must be a positive integer.')),
        storeIds: Joi.array()
            .items(
                Joi.number()
                    .integer()
                    .min(1)
                    .error(() => 'id must be greater than equal to 1.')
                    .required(),
            )
            .min(1)
            .required(),
    });
    const validate = Joi.validate(inputObj, schema);
    return validate;
}

async function validateReq(req, res, next) {
    try {
        const { id, storeIds } = req.query;
        const isValid = typeValidations(req.query);
        if (isValid.error) {
            res.status(422).json({
                error: isValid.error.message,
            });
            return;
        }
        const business = await getBusiness(req);
        const validStores = await Store.query()
            .whereIn('id', storeIds)
            .andWhere('businessId', business.id);
        if (validStores.length !== storeIds.length) {
            res.status(409).json({
                error: 'Invalid store id(s).',
            });
            return;
        }
        const customer = await CentsCustomer.query().findById(Number(id));
        if (!customer) {
            res.status(404).json({
                error: 'Customer could not be found',
            });
            return;
        }
        req.centsCustomer = customer;
        req.storeIds = storeIds;
        next();
    } catch (error) {
        next(error);
    }
}

module.exports = exports = validateReq;
