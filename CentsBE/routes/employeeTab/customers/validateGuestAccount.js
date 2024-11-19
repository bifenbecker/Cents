const argon2 = require('argon2');
const { transaction } = require('objection');

const CentsCustomer = require('../../../models/centsCustomer');
const StoreCustomer = require('../../../models/storeCustomer');

const { passwordGenerator } = require('../../../utils/passwordGenerator');

async function validateGuestAccount(req, res, next) {
    let trx = null;
    try {
        const { currentStore } = req;
        const isGuestAccount = await CentsCustomer.query()
            .where({ email: `guest_account_${currentStore.id}@trycents.com` })
            .first();
        // guest customer exists with current store email.
        if (isGuestAccount) {
            const storeCustomer = await StoreCustomer.query().findOne({
                storeId: currentStore.id,
                centsCustomerId: isGuestAccount.id,
            });
            res.status(200).json({
                success: true,
                customer: {
                    fullName: `${storeCustomer.firstName} ${storeCustomer.lastName}`,
                    email: storeCustomer.email,
                    phoneNumber: storeCustomer.phoneNumber,
                    centsCustomerId: storeCustomer.centsCustomerId,
                    id: storeCustomer.centsCustomerId,
                    availableCredit: 0,
                    stripeCustomerId: isGuestAccount.stripeCustomerId,
                },
            });
            return;
        }
        // create a new customer.
        const randomFourDigits = Math.floor(1000 + Math.random() * 9000);
        const password = await argon2.hash(passwordGenerator());
        const customer = {
            firstName: 'Guest',
            lastName: 'Account',
            phoneNumber: `555555${randomFourDigits}`,
            email: `guest_account_${currentStore.id}@trycents.com`,
            password,
            storeCustomers: [
                {
                    firstName: 'Guest',
                    lastName: 'Account',
                    phoneNumber: `555555${randomFourDigits}`,
                    email: `guest_account_${currentStore.id}@trycents.com`,
                    storeId: req.currentStore.id,
                    businessId: req.currentStore.businessId,
                },
            ],
        };
        trx = await transaction.start(CentsCustomer.knex());
        const centsCustomer = await CentsCustomer.query(trx).insertGraphAndFetch(customer);
        await trx.commit();
        const { storeCustomers } = centsCustomer;
        res.status(200).json({
            success: true,
            customer: {
                id: centsCustomer.id,
                centsCustomerId: centsCustomer.id,
                fullName: `${storeCustomers[0].firstName} ${storeCustomers[0].lastName}`,
                email: storeCustomers[0].email,
                phoneNumber: storeCustomers[0].phoneNumber,
                languageId: centsCustomer.languageId,
                availableCredit: 0,
                stripeCustomerId: customer.stripeCustomerId,
            },
        });
    } catch (error) {
        if (trx) {
            await trx.rollback();
        }
        next(error);
    }
}

module.exports = exports = validateGuestAccount;
