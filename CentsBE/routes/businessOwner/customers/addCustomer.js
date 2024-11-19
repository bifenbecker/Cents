const { transaction } = require('objection');
const argon2 = require('argon2');
const { getDetailsLogic } = require('./singleCustomerDetails');
const CentsCustomer = require('../../../models/centsCustomer');
const StoreCustomer = require('../../../models/storeCustomer');
const { passwordGenerator } = require('../../../utils/passwordGenerator');
const eventEmitter = require('../../../config/eventEmitter');

async function addCustomer(req, res, next) {
    let trx = null;
    try {
        const { businessId, isNew, centsCustomerId } = req.constants;
        const { firstName, lastName, email, phoneNumber, storeId, languageId = 1 } = req.body;
        const password = await argon2.hash(passwordGenerator());
        if (isNew) {
            const insertObject = {
                firstName,
                lastName,
                email,
                phoneNumber,
                languageId,
                password,
                storeCustomers: [
                    {
                        firstName,
                        lastName,
                        email,
                        phoneNumber,
                        storeId,
                        businessId,
                        languageId,
                    },
                ],
            };
            trx = await transaction.start(CentsCustomer.knex());
            const customer = await CentsCustomer.query(trx)
                .insertGraphAndFetch(insertObject)
                .returning('*');
            await trx.commit();
            eventEmitter.emit('indexCustomer', customer.storeCustomers[0].id);
            res.status(200).json({
                success: true,
                details: await getDetailsLogic(customer.id, businessId),
            });
            return;
        }
        const storeCustomer = await StoreCustomer.query()
            .insert({
                firstName,
                lastName,
                phoneNumber,
                email,
                languageId,
                storeId,
                businessId,
                centsCustomerId,
            })
            .returning('*');
        const centsCustomer = await CentsCustomer.query().findById(centsCustomerId);
        eventEmitter.emit('indexCustomer', storeCustomer.id);

        res.status(200).json({
            success: true,
            details: await getDetailsLogic(centsCustomer.id, businessId),
        });
    } catch (error) {
        if (trx) {
            await trx.rollback();
        }
        next(error);
    }
}

module.exports = {
    addCustomer,
};
