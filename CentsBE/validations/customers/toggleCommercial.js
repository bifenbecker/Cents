const Joi = require('@hapi/joi');

const BusinessCustomer = require('../../models/businessCustomer');
const getBusiness = require('../../utils/getBusiness');
const { ERROR_MESSAGES } = require('../../constants/error.messages');

function typeValidations(inputObj) {
    const schema = Joi.object().keys({
        id: Joi.number().integer().min(1).required(),
        isCommercial: Joi.boolean().required(),
        isInvoicingEnabled: Joi.boolean().optional(),
        commercialTierId: Joi.number().integer().min(1).optional(),
    });

    return Joi.validate(inputObj, schema);
}

async function validate(req, res, next) {
    try {
        const { id } = req.params;
        const isValid = typeValidations({ ...req.body, id });

        if (isValid.error) {
            res.status(422).json({
                error: isValid.error.details[0].message,
            });

            return;
        }

        const business = await getBusiness(req);

        req.constants = req.constants || {};

        const businessCustomer = await BusinessCustomer.query().findOne({
            businessId: business.id,
            centsCustomerId: id,
        });

        if (!businessCustomer) {
            res.status(404).json({
                error: ERROR_MESSAGES.CUSTOMER_NOT_FOUND,
            });

            return;
        }

        req.constants.businessId = business.id;
        req.constants.businessCustomer = businessCustomer;

        next();
    } catch (error) {
        next(error);
    }
}

module.exports = exports = validate;
