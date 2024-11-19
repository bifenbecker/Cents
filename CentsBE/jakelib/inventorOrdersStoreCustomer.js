const { task, desc } = require('jake');
const { transaction } = require('objection');

const InventoryOrder = require('../models/inventoryOrders');
const CentsCustomer = require('../models/centsCustomer');
const StoreCustomer = require('../models/storeCustomer');
const SecondaryDetails = require('../models/secondaryDetails');

const LoggerHandler = require('../LoggerHandler/LoggerHandler');

desc('Add storeCustomer id to inventory orders.');

async function getCurrentUserDetails() {
    const details = await InventoryOrder.query()
        .select(
            'inventoryOrders.id as orderId',
            'inventoryOrders.storeId as storeId',
            'inventoryOrders.customerId as userId',
            'users.firstname as firstName',
            'users.lastname as lastName',
            'users.email as email',
            'users.phone as phoneNumber',
            'users.languageId as languageId',
            'users.createdAt as createdAt',
            'users.updatedAt as updatedAt',
            'stores.businessId as businessId',
        )
        .join('users', 'users.id', 'inventoryOrders.customerId')
        .join('stores', 'stores.id', 'inventoryOrders.storeId');
    return details;
}
async function patchOrders(userId, storeCustomerId, storeId, trx) {
    await InventoryOrder.query(trx)
        .patch({
            storeCustomerId,
        })
        .where({
            storeId,
            customerId: userId,
        });
}
/**
 * There could be following scenarios:
 * 1. Customer details exist in both centsCustomers and storeCustomers table.
 * 2. Customer details exist in centsCustomer table but not in storeCustomers table.
 * 3. Customer is a new customer i.e the details don't exist in centsCustomers table.
 */
async function addDetails(details, trx) {
    // check if customer exists
    let isCustomer = CentsCustomer.query(trx);
    if (details.email) {
        isCustomer = isCustomer.where('email', 'ilike', details.email);
    } else {
        isCustomer = isCustomer.where('phoneNumber', details.phoneNumber);
    }
    isCustomer = await isCustomer;
    if (isCustomer.length) {
        // look if record exists in storeCustomers table.
        const isStoreCustomer = await StoreCustomer.query(trx).where({
            centsCustomerId: isCustomer[0].id,
            storeId: details.storeId,
        });
        if (!isStoreCustomer.length) {
            // create a new record for the customer.
            const secondaryDetails = await SecondaryDetails.query(trx).findOne({
                userId: details.userId,
                businessId: details.businessId,
            });
            const storeCustomer = await StoreCustomer.query(trx)
                .insert({
                    firstName: details.firstName,
                    lastName: details.lastName,
                    phoneNumber: secondaryDetails.phoneNumber
                        ? secondaryDetails.phoneNumber
                        : isCustomer[0].phoneNumber,
                    email: secondaryDetails.email ? secondaryDetails.email : isCustomer[0].email,
                    businessId: details.businessId,
                    storeId: details.storeId,
                    centsCustomerId: isCustomer[0].id,
                    languageId: details.languageId || 1,
                    createdAt: details.createdAt,
                    updatedAt: details.updatedAt,
                })
                .returning('*');
            await patchOrders(details.userId, storeCustomer.id, details.storeId, trx);
        } else {
            // customer already exists.
            await patchOrders(details.userId, isStoreCustomer[0].id, details.storeId, trx);
        }
    } else {
        // add a new customer.
        const centsCustomer = await CentsCustomer.query(trx)
            .insert({
                firstName: details.firstName,
                lastName: details.lastName,
                email: details.email,
                phoneNumber: details.phoneNumber,
                languageId: details.languageId || 1,
                createdAt: details.createdAt,
                updatedAt: details.updatedAt,
            })
            .returning('*');
        const secondaryDetails = await SecondaryDetails.query().findOne({
            userId: details.userId,
            businessId: details.businessId,
        });
        const storeCustomer = await StoreCustomer.query(trx)
            .insert({
                firstName: details.firstName,
                lastName: details.lastName,
                phoneNumber: secondaryDetails.phoneNumber
                    ? secondaryDetails.phoneNumber
                    : isCustomer[0].phoneNumber,
                email: secondaryDetails.email ? secondaryDetails.email : isCustomer[0].email,
                businessId: details.businessId,
                storeId: details.storeId,
                centsCustomerId: centsCustomer.id,
                languageId: secondaryDetails.languageId
                    ? secondaryDetails.languageId
                    : isCustomer[0].languageId,
                createdAt: details.createdAt,
                updatedAt: details.updatedAt,
            })
            .returning('*');
        await patchOrders(details.userId, storeCustomer.id, details.storeId, trx);
    }
}
task('add_store_customerId_inventory_orders', async () => {
    let trx = null;
    try {
        const details = await getCurrentUserDetails();
        trx = await transaction.start(CentsCustomer.knex());
        const patchOperation = details.map((detail) => addDetails(detail, trx));
        await Promise.all(patchOperation);
        await trx.commit();
    } catch (error) {
        if (trx) {
            await trx.rollback();
        }
        LoggerHandler(
            'error',
            'error occurred while mapping store customers to inventory orders table.',
        );
        LoggerHandler('error', error);
    }
});
