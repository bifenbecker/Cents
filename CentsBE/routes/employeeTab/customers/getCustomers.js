const { raw } = require('objection');
const StoreCustomer = require('../../../models/storeCustomer');
const customerQueries = require('../../../services/queries/customerQueries');
const { mapResponse, getUniqueItemsByKeys } = require('./search');

async function getUsers(req, res, next) {
    try {
        const users = await StoreCustomer.query()
            .select(
                'storeCustomers.id',
                raw(
                    'trim(concat("storeCustomers"."firstName", \' \',"storeCustomers"."lastName")) as "fullName"',
                ),
                'storeCustomers.email',
                'storeCustomers.phoneNumber',
                'storeCustomers.firstName',
                'storeCustomers.lastName',
                'storeCustomers.languageId',
                'storeCustomers.storeId',
                'storeCustomers.centsCustomerId',
                'centsCustomers.stripeCustomerId',
            )
            .join('centsCustomers', 'centsCustomers.id', 'storeCustomers.centsCustomerId')
            .where('storeId', req.currentStore.id)
            .limit(10);
        res.status(200).json({
            success: true,
            details: users,
        });
    } catch (error) {
        next(error);
    }
}

async function getCustomers(req, res, next) {
    try {
        const { businessId, id } = req.currentStore;
        const page = req.query.page || 1;
        let customers = await customerQueries.getCustomers(id, businessId, null, page, true);
        const storeCustomerList = customers.filter((customer) => customer.storeId === id);
        customers =
            storeCustomerList.length > 0
                ? storeCustomerList
                : getUniqueItemsByKeys(customers, 'id');

        res.status(200).json({
            success: true,
            totalCount: customers.length ? customers[0].totalCount : 0,
            details: customers.map((customer) => mapResponse(customer)),
        });
    } catch (error) {
        next(error);
    }
}
module.exports = exports = { getUsers, getCustomers };
