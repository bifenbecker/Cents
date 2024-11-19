const { transaction } = require('objection');
const argon2 = require('argon2');
const CentsCustomer = require('../../../models/centsCustomer');
const StoreCustomer = require('../../../models/storeCustomer');
const { passwordGenerator } = require('../../../utils/passwordGenerator');
const eventEmitter = require('../../../config/eventEmitter');

function splitFullName(fullName) {
    const name = fullName.split(' ');
    const firstName = name[0];
    const lastName = name.slice(1).join(' ');
    return { firstName, lastName };
}
async function addCustomer(req, res, next) {
    let trx = null;
    try {
        const { businessId, isNew, centsCustomerId } = req.constants;
        const { email, phoneNumber, languageId, fullName } = req.body;
        const { firstName, lastName } = splitFullName(fullName);
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
                        storeId: req.currentStore.id,
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
                details: {
                    id: customer.id,
                    centsCustomerId: customer.id,
                    fullName: `${customer.firstName} ${customer.lastName}`,
                    email: customer.email,
                    phoneNumber: customer.phoneNumber,
                    languageId: customer.languageId,
                    availableCredit: 0,
                    stripeCustomerId: customer.stripeCustomerId,
                    storeCustomerId: customer.storeCustomers[0].id,
                },
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
                storeId: req.currentStore.id,
                businessId,
                centsCustomerId,
            })
            .returning('*');
        const centsCustomer = await CentsCustomer.query().findById(centsCustomerId);

        eventEmitter.emit('indexCustomer', storeCustomer.id);
        res.status(200).json({
            success: true,
            details: {
                id: centsCustomerId,
                centsCustomerId,
                fullName,
                phoneNumber,
                email,
                languageId,
                availableCredit: 0,
                stripeCustomerId: centsCustomer.stripeCustomerId,
                storeCustomerId: storeCustomer.id,
            },
        });
    } catch (error) {
        if (trx) {
            await trx.rollback();
        }
        next(error);
    }
}

module.exports = exports = addCustomer;
