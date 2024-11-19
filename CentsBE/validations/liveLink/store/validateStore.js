const Joi = require('@hapi/joi');
const Store = require('../../../models/store');

function storeIdTypeValidations(params) {
    const schema = Joi.object().keys({
        storeId: Joi.number()
            .required()
            .error(() => 'storeId must be a number'),
    });
    return Joi.validate(params, schema);
}

async function validateStore(req, res, next) {
    try {
        const { storeId } = req.params;
        const isValid = storeIdTypeValidations({ storeId });
        if (isValid.error) {
            res.status(422).json({
                error: isValid.error.message,
            });
            return;
        }
        const store = await Store.query().where({ id: storeId }).first('id');
        if (!store || !store.id) {
            res.status(422).json({
                error: 'Store not available',
            });
            return;
        }
        next();
    } catch (error) {
        next(error);
    }
}

module.exports = validateStore;
