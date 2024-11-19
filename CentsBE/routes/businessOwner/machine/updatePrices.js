const { transaction } = require('objection');
const Price = require('../../../models/machinePricing');

const updateObject = require('../../../commons/pricing').updatePricing;
const validate = require('../../../validations/updatePricing');
const createObject = require('../../../commons/pricing').createPricing;
const dbValidation = require('../../../validations/machineDbValidations/updatePricing');
const formatError = require('../../../utils/formatError');

const updatePricing = async (req, res, next) => {
    let trx = null;
    try {
        const isValid = validate(req.body);
        if (isValid.error) {
            res.json({
                error: formatError(isValid.error),
            });
        } else {
            const isDbValid = await dbValidation(req.body);
            if (isDbValid.length) {
                res.status(422).json({
                    error: isDbValid,
                });
            } else {
                trx = await transaction.start(Price.knex());
                const previousRecords = updateObject(req.body.prices);
                const updatePromise = previousRecords.map(async (record) =>
                    Price.query(trx).patch(record).findById(record.id),
                );
                await Promise.all(updatePromise);
                const newRecords = createObject(req.body.prices, req.body.machineId);
                const newPrices = await Price.query(trx).insert(newRecords);
                await trx.commit();
                res.json({
                    success: true,
                    newPrices,
                });
            }
        }
    } catch (error) {
        if (trx) {
            await trx.rollback();
        }
        next(error);
    }
};

module.exports = exports = updatePricing;
