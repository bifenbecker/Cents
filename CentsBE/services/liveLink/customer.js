const { transaction } = require('objection');
const Model = require('../../models');
const createCustomer = require('../../uow/customer/createCentsCustomer');

const splitFullName = require('../../utils/splitFullName');

const TokenOperations = require('../tokenOperations/main');

const { createStripeCustomer } = require('../../uow/delivery/dropoff/createStripeCustomerUow');

async function addCustomer(data) {
    let trx = null;
    try {
        trx = await transaction.start(Model.knex());
        const { fullName, phoneNumber } = data;
        const { firstName, lastName } = splitFullName(fullName);
        const { centsCustomer } = await createCustomer({
            firstName,
            lastName,
            phoneNumber,
            languageId: 1,
            transaction: trx,
        });
        await createStripeCustomer({
            centsCustomerId: centsCustomer.id,
            transaction: trx,
        });
        await trx.commit();
        const jwtService = new TokenOperations({ id: centsCustomer.id });
        const customerAuthToken = jwtService.tokenGenerator(
            process.env.JWT_SECRET_LIVE_LINK_CUSTOMER,
        );
        return {
            customer: {
                firstName,
                lastName,
                phoneNumber,
            },
            customerAuthToken,
            latestOrderToken: '',
        };
    } catch (error) {
        if (trx) {
            await trx.rollback();
        }
        throw new Error(error.message);
    }
}

module.exports = exports = addCustomer;
