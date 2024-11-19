const { transaction } = require('objection');
const StoreCustomer = require('../models/storeCustomer');
const CentsCustomer = require('../models/centsCustomer');

async function checkStoreCustomer(req, res, next) {
    let trx = null;
    try {
        const { id } = req.body.customer;
        const { businessId } = req.currentStore;
        const centsCustomer = await CentsCustomer.query().findById(id);
        let storeCustomer = await StoreCustomer.query().findOne({
            centsCustomerId: id,
            storeId: req.currentStore.id,
        });
        if (!storeCustomer) {
            const { firstName, lastName, email, phoneNumber, languageId } = centsCustomer;
            trx = await transaction.start(StoreCustomer.knex());
            storeCustomer = await StoreCustomer.query(trx)
                .insert({
                    centsCustomerId: id,
                    storeId: req.currentStore.id,
                    businessId,
                    firstName,
                    lastName,
                    email,
                    phoneNumber,
                    languageId,
                })
                .returning('*');
            await trx.commit();
        }
        req.body.centsCustomerId = id;
        req.body.customer = {
            ...req.body.customer,
            storeCustomerId: storeCustomer.id,
            fullName: `${centsCustomer.firstName} ${centsCustomer.lastName}`,
            phoneNumber: centsCustomer.phoneNumber,
        };
        next();
    } catch (error) {
        if (trx) {
            await trx.rollback();
        }
        next(error);
    }
}

module.exports = exports = checkStoreCustomer;
