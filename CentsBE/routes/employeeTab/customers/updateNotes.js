const Joi = require('@hapi/joi');
const eventEmitter = require('../../../config/eventEmitter');
const StoreCustomer = require('../../../models/storeCustomer');

function typeValidations(inputObj) {
    const schema = Joi.object().keys({
        notes: Joi.string().required().allow(null, ''),
        id: Joi.number().required(),
    });
    const validate = Joi.validate(inputObj, schema);
    return validate;
}

async function updateCustomerNotes(req, res, next) {
    try {
        const { id } = req.params;
        const { businessId } = req.currentStore;
        const { notes } = req.body;

        const isValid = typeValidations({
            notes,
            id,
        });
        if (isValid.error) {
            res.status(422).json({
                error: isValid.error.message,
            });
            return;
        }

        const storeCustomer = await StoreCustomer.query()
            .patch({
                notes,
            })
            .where('centsCustomerId', id)
            .andWhere('businessId', businessId);
        eventEmitter.emit('indexCustomer', storeCustomer.id);

        res.json({
            success: true,
        });
    } catch (error) {
        next(error);
    }
}

module.exports = exports = updateCustomerNotes;
