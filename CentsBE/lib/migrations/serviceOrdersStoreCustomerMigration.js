const ServiceOrders = require('../../models/serviceOrders');
const CentsCustomer = require('../../models/centsCustomer');
const StoreCustomer = require('../../models/storeCustomer');
const LoggerHandler = require('../../LoggerHandler/LoggerHandler');

const syncCentsCustomer = async (order, trx) => {
    const user = order.user;
    const customer = {};
    customer.firstName = user.firstname;
    customer.lastName = user.lastname;
    customer.email = user.email;
    customer.phoneNumber = user.phone;
    customer.storeId = order.store.id;
    customer.businessId = order.store.businessId;
    let storeCustomerList = StoreCustomer.query(trx)
        .where('storeId', customer.storeId)
        .where('businessId', customer.businessId);
    if (customer.phoneNumber) {
        storeCustomerList = storeCustomerList.where('phoneNumber', customer.phoneNumber);
    } else if (customer.email) {
        storeCustomerList = storeCustomerList.where('email', customer.email);
    } else {
        storeCustomerList = storeCustomerList
            .where('firstName', customer.firstName)
            .where('lastName', customer.lastName);
    }
    storeCustomerList = await storeCustomerList;
    if (!storeCustomerList.length) {
        return null;
    }
    return await ServiceOrders.query(trx)
        .patch({ storeCustomerId: storeCustomerList[0].id })
        .where('id', order.id);
};

const getCustomersList = async (ordersList, trx) => {
    if (!ordersList.length) {
        return [];
    }
    return await ordersList.reduce(async (acc, currentVal) => {
        await acc;
        await syncCentsCustomer(currentVal, trx);
    }, Promise.resolve());
};
const serviceOrdersStoreCustomerMigration = async (options) => {
    try {
        const ordersList = await ServiceOrders.query(options.trx)
            .withGraphFetched(`[user,store]`)
            .limit(options.noOfRowsToProcess)
            .offset(options.noOfRowsProcessed)
            .orderBy(`${ServiceOrders.tableName}.id`, 'desc');
        await getCustomersList(ordersList, options.trx);
        LoggerHandler('info', `ordersList Length: ${ordersList.length}`);
        if (ordersList.length > 0) {
            return serviceOrdersStoreCustomerMigration({
                ...options,
                noOfRowsProcessed: options.noOfRowsProcessed + ordersList.length,
            });
        }
        return null;
    } catch (err) {
        LoggerHandler('error', err);
        return null;
    }
};

module.exports.serviceOrdersStoreCustomerMigration = serviceOrdersStoreCustomerMigration;
