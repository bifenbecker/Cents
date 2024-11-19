const { task, desc } = require('jake');
const { transaction, raw } = require('objection');

const User = require('../models/user');
const CentsCustomer = require('../models/centsCustomer');
const StoreCustomer = require('../models/storeCustomer');

const LoggerHandler = require('../LoggerHandler/LoggerHandler');

desc('For some customer, the value of phone number is null.');

async function fetchCustomers() {
    const customers = await CentsCustomer.query().where('phoneNumber', null);
    return customers;
}

async function updateCustomer(centsCustomer, trx) {
    const { id, email, firstName, lastName } = centsCustomer;
    let user = User.query(trx)
        .select(raw('coalesce(users.phone, "secondaryDetails"."phoneNumber") as "phoneNumber"'))
        .join('secondaryDetails', 'secondaryDetails.userId', 'users.id');
    if (email) {
        user = user.where('users.email', 'ilike', email);
    } else {
        user = user
            .where('users.firstname', 'ilike', firstName)
            .andWhere('users.lastname', 'ilike', lastName);
    }
    user = await user.limit(1).first();
    await CentsCustomer.query(trx)
        .patch({
            phoneNumber: user.phoneNumber,
        })
        .findById(id);
    await StoreCustomer.query(trx)
        .patch({
            phoneNumber: user.phoneNumber,
        })
        .where({
            centsCustomerId: id,
        });
}

task('add_missing_details', async () => {
    let trx = null;
    try {
        const customers = await fetchCustomers();
        trx = await transaction.start(CentsCustomer.knex());
        const result = customers.map((customer) => updateCustomer(customer, trx));
        await Promise.all(result);
        await trx.commit();
    } catch (error) {
        if (trx) {
            await trx.rollback();
        }
        LoggerHandler('error', 'error occurred while adding missing phone number for customers.');
        LoggerHandler('error', error);
    }
});
