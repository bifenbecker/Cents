const Joi = require('@hapi/joi');
const CentsCustomer = require('../../../models/centsCustomer');

function typeValidations(inputObj) {
    const schema = Joi.object().keys({
        orderId: Joi.number().optional(),
        centsCustomerId: Joi.number().required(),
    });
    const validate = Joi.validate(inputObj, schema);
    return validate;
}
async function validateRequest(req, res, next) {
    try {
        if (!req.query.centsCustomerId) {
            const customer = await CentsCustomer.query().findOne({
                email: `guest_account_${req.currentStore.id}@trycents.com`,
            });

            req.query.centsCustomerId = customer.id;
        }

        const isValid = typeValidations(req.query);
        if (isValid.error) {
            res.status(422).json({
                error: isValid.error.message,
            });
            return;
        }

        const { centsCustomerId } = req.query;

        const centsCustomer = await CentsCustomer.query().findById(centsCustomerId);

        if (!centsCustomer) {
            res.status(422).json({
                error: 'Invalid customer id',
            });
            return;
        }

        next();
    } catch (error) {
        next(error);
    }
}

module.exports = exports = validateRequest;
