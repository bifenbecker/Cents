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
    customer.isDeleted = !user.isActive;
    customer.deletedAt = null;
    customer.createdAt = user.createdAt;
    customer.updatedAt = user.updatedAt;
    customer.languageId = user.languageId;

    let customerList = CentsCustomer.query(trx);
    if (customer.phoneNumber) {
        customerList = customerList.where('phoneNumber', customer.phoneNumber);
    } else if (customer.email) {
        customerList = customerList.where('email', customer.email);
    } else {
        customerList = customerList
            .where('email', customer.email)
            .where('firstName', customer.firstName)
            .where('lastName', customer.lastName);
    }
    customerList = await customerList;
    LoggerHandler('info', `Customer: ${JSON.stringify(customer)}`)
    if (!customerList.length) {
        return null;
    }
    customer.storeId = order.store.id;
    customer.businessId = order.store.businessId;
    customer.centsCustomerId = customerList[0]['id'];
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
    LoggerHandler('info', `storeCustomerList.length = ${storeCustomerList.length}`);
    if (storeCustomerList.length) {
        return null;
    }
    return await StoreCustomer.query(trx).insert(customer);
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
const migrateStoreCustomers = async (options) => {
    try {
        const ordersList = await ServiceOrders.query(options.trx)
            .withGraphFetched(`[user,store]`)
            .limit(options.noOfRowsToProcess)
            .offset(options.noOfRowsProcessed)
            .orderBy(`${ServiceOrders.tableName}.id`, 'desc');
        await getCustomersList(ordersList, options.trx);
        LoggerHandler('info', `ordersList Length: ${ordersList.length}`);
        if (ordersList.length > 0) {
            return migrateStoreCustomers({
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

module.exports.migrateStoreCustomers = migrateStoreCustomers;
