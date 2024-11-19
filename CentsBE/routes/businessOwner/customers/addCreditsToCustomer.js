const { transaction } = require('objection');
const Joi = require('@hapi/joi');
const creditHistory = require('../../../models/creditHistory');
const getBusiness = require('../../../utils/getBusiness');
const eventEmitter = require('../../../config/eventEmitter');
const StoreCustomer = require('../../../models/storeCustomer');

function typeValidations(inputObj) {
    const schema = Joi.object().keys({
        reasonId: Joi.number().integer().required(),
        creditAmount: Joi.number().precision(6).strict().min(0).max(100).required(),
        customerId: Joi.number().integer().required(),
    });
    const error = Joi.validate(inputObj, schema);
    return error;
}

async function addCreditToCustomer(req, res, next) {
    let trx = null;
    try {
        trx = await transaction.start(creditHistory.knex());
        const isValid = typeValidations(req.body);
        if (isValid.error) {
            res.status(422).json({
                error: isValid.error.message.split('[')[1].split(']')[0].replace(/["']/g, ''),
            });
            return;
        }
        const business = await getBusiness(req);
        const credits = await creditHistory
            .query(trx)
            .insert({
                businessId: business.id,
                reasonId: req.body.reasonId,
                amount: req.body.creditAmount,
                customerId: req.body.customerId,
            })
            .returning('*');
        const storeCustomer = await StoreCustomer.query(trx).findOne({
            businessId: business.id,
            centsCustomerId: req.body.customerId,
        });
        await trx.commit();
        eventEmitter.emit('indexCustomer', storeCustomer.id);
        res.status(200).json({
            success: true,
            credits,
        });
    } catch (error) {
        if (trx) {
            await trx.rollback();
        }
        next(error);
    }
}

module.exports = addCreditToCustomer;
