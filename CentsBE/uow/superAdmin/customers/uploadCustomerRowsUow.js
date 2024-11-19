// packages
const { transaction } = require('objection');

// models
const Store = require('../../../models/store');
const CentsCustomer = require('../../../models/centsCustomer');
const StoreCustomer = require('../../../models/storeCustomer');

// utils
const passwordGenerator = require('../../../utils/passwordGenerator').hashPasswordGenerator;
const eventEmitter = require('../../../config/eventEmitter');

/**
 * find the CentsCustomer based on either the phone number or email
 *
 * @param {String} email
 * @param {String} phoneNumber
 */
async function findCentsCustomerId(email, phoneNumber) {
    if (email) {
        const isEmailPresent = await CentsCustomer.query()
            .select('centsCustomers.id')
            .where('centsCustomers.email', 'ilike', email.trim());
        if (isEmailPresent.length) {
            return isEmailPresent[0].id;
        }
    }
    // check for phone number.
    if (phoneNumber) {
        const isPhoneNumberPresent = await CentsCustomer.query()
            .select('centsCustomers.id')
            .where('phoneNumber', 'ilike', phoneNumber.trim());
        if (isPhoneNumberPresent.length) {
            return isPhoneNumberPresent[0].id;
        }
    }
    return null;
    // check for email
}

/**
 * Find the StoreCustomer based on the store and CentsCustomer models
 *
 * @param {Number} storeId
 * @param {Number} centsCustomerId
 */
async function findStoreCustomer(storeId, centsCustomerId) {
    const isStoreCustomer = await StoreCustomer.query().findOne({
        storeId,
        centsCustomerId,
    });
    return !!isStoreCustomer;
}

/**
 * Build the StoreCustomer payload
 *
 * @param {Object} row
 * @param {Number} businessId
 * @param {Array} stores
 * @param {Number} centsCustomerId
 */
function storeCustomerBuilder(row, businessId, stores, centsCustomerId = null) {
    return stores.map((store) => {
        const customer = { ...row, storeId: store, businessId };
        if (centsCustomerId) {
            customer.centsCustomerId = centsCustomerId;
        }
        return customer;
    });
}

/**
 * Build the CentsCustomer insert payload
 *
 * @param {Object} row
 * @param {Number} businessId
 * @param {Array} stores
 */
async function centsCustomerBuilder(row, businessId, stores) {
    const password = await passwordGenerator();
    return {
        ...row,
        password,
        storeCustomers: storeCustomerBuilder(row, businessId, stores),
    };
}

/**
 * Add the rows of customers as either CentsCustomer or StoreCustomer
 *
 * @param {Object} row
 * @param {Number} businessId
 * @param {Array} fetchedStores
 */
async function processRecords(row, businessId, fetchedStores) {
    let trx = null;
    const isCustomer = await findCentsCustomerId(row.email, row.phoneNumber);
    if (isCustomer) {
        const isStoreCustomer = await findStoreCustomer(fetchedStores[0], isCustomer);
        if (!isStoreCustomer) {
            trx = await transaction.start(StoreCustomer.knex());
            const storeCustomer = await StoreCustomer.query(trx).insert(
                storeCustomerBuilder(row, businessId, fetchedStores, isCustomer),
            );
            await trx.commit();
            eventEmitter.emit('indexCustomer', storeCustomer.id);
            return storeCustomer;
        }
    } else {
        trx = await transaction.start(CentsCustomer.knex());
        const newCentsCustomer = await centsCustomerBuilder(row, businessId, fetchedStores);
        const centsCustomer = await CentsCustomer.query(trx).insertGraph(newCentsCustomer);
        await trx.commit();
        const { storeCustomers } = centsCustomer;
        if (storeCustomers && storeCustomers.length) {
            storeCustomers.map((storeCustomer) =>
                eventEmitter.emit('indexCustomer', storeCustomer.id),
            );
        }
        return centsCustomer;
    }
    return null;
}

/**
 * Read the file to upload and return rows
 *
 * @param {Object} payload
 */
async function uploadCustomerRows(payload) {
    try {
        const newPayload = payload;
        const { businessId, selectedStores, fileRecords } = newPayload;
        let storesToUpload = selectedStores;

        if (storesToUpload.length === 0) {
            storesToUpload = await Store.query().where({ businessId });
        }

        const results = fileRecords.map((record) =>
            processRecords(record, businessId, storesToUpload),
        );
        await Promise.all(results);

        return newPayload;
    } catch (error) {
        throw Error(error.message);
    }
}

module.exports = exports = uploadCustomerRows;
