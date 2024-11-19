// packages
const argon2 = require('argon2');
const { transaction, raw } = require('objection');
const momenttz = require('moment-timezone');

// Models
const Store = require('../../../models/store');
const ServiceOrder = require('../../../models/serviceOrders');
const InventoryOrder = require('../../../models/inventoryOrders');
const StoreSettings = require('../../../models/storeSettings');
const PrinterStoreSettings = require('../../../models/printerStoreSettings');
const CentsDeliverySettings = require('../../../models/centsDeliverySettings');

// Services
const eventEmitter = require('../../../config/eventEmitter');

// Utils
const mapServiceOrderData = require('../../../utils/superAdmin/mapServiceOrderData');
const mapInventoryOrderData = require('../../../utils/superAdmin/mapInventoryOrderData');

/**
 * Format each store with appropriate details for front-end
 *
 * @param {Object} store
 */
async function mapStoreData(store) {
    const mappedData = {};

    mappedData.id = store.id;
    mappedData.name = store.name;
    mappedData.businessName = store.laundromatBusiness.name;
    mappedData.regionName = store.district ? store.district.region.name : '--';
    mappedData.districtName = store.district ? store.district.name : '--';
    mappedData.address = store.address;
    mappedData.city = store.city;
    mappedData.state = store.state;
    mappedData.zipCode = store.zipCode;
    mappedData.phoneNumber = store.phoneNumber;
    mappedData.createdAt = store.createdAt;
    mappedData.isHub = store.isHub;
    mappedData.stripeLocationId = store.stripeLocationId;
    mappedData.dcaLicense = store.dcaLicense;
    mappedData.commercialDcaLicense = store.commercialDcaLicense;
    mappedData.uberStoreUuid = store.uberStoreUuid;

    return mappedData;
}

/**
 * Retrieve operational stats for the store.
 *
 * Stats include:
 *
 * 1) date of first transaction
 * 2) date of most recent transaction
 * 3) total amount transacted (online orders)
 * 4) total amount transacted (walk-in)
 *
 * @param {Number} storeId
 * @param {Object} settings
 */
async function getStoreOperationalStats(storeId, settings) {
    const { timeZone } = settings;
    const firstTransactionDate = await ServiceOrder.query()
        .select('serviceOrders.createdAt')
        .findOne({
            storeId,
            status: 'COMPLETED',
        })
        .orderBy('createdAt', 'asc')
        .limit(1);
    const latestTransactionDate = await ServiceOrder.query()
        .select('serviceOrders.createdAt')
        .findOne({
            storeId,
            status: 'COMPLETED',
        })
        .orderBy('createdAt', 'desc')
        .limit(1);
    const totalOnlineTransactions = await ServiceOrder.query()
        .sum('serviceOrders.netOrderTotal')
        .where({
            storeId,
            status: 'COMPLETED',
            orderType: 'ONLINE',
        });
    const totalWalkInTransactions = await ServiceOrder.query()
        .sum('serviceOrders.netOrderTotal')
        .where({
            storeId,
            status: 'COMPLETED',
            orderType: 'SERVICE',
        });

    return {
        firstTransactionDate: firstTransactionDate
            ? momenttz(firstTransactionDate.createdAt).tz(timeZone).format('MM-DD-YYYY')
            : null,
        latestTransactionDate: latestTransactionDate
            ? momenttz(latestTransactionDate.createdAt).tz(timeZone).format('MM-DD-YYYY')
            : null,
        totalOnlineTransactions:
            totalOnlineTransactions.length > 0 ? totalOnlineTransactions[0].sum : null,
        totalWalkInTransactions:
            totalWalkInTransactions.length > 0 ? totalWalkInTransactions[0].sum : null,
    };
}

/**
 * Get all Stores in the Cents ecosystem
 *
 * @param {Object} req
 * @param {Object} res
 * @param {void} next
 */
async function getAllStores(req, res, next) {
    try {
        const stores = await Store.query()
            .withGraphFetched(
                `[
                laundromatBusiness,
                district.[region],
            ]`,
            )
            .orderBy('createdAt', 'desc');

        let mappedStores = stores.map((item) => mapStoreData(item));
        mappedStores = await Promise.all(mappedStores);

        return res.json({
            success: true,
            stores: mappedStores,
            total: mappedStores.length,
        });
    } catch (error) {
        return next(error);
    }
}

/**
 * Retrieves an individual store given an id
 *
 * @param {Object} res
 * @param {Object} res
 * @param {void} next
 *
 */
async function getIndividualStore(req, res, next) {
    try {
        const { id } = req.params;

        const store = await Store.query()
            .withGraphFetched('[settings, laundromatBusiness, printerSettings, centsDelivery]')
            .findById(id);
        const stats = await getStoreOperationalStats(id, store.settings);

        return res.json({
            success: true,
            store,
            stats,
        });
    } catch (error) {
        return next(error);
    }
}

/**
 * Update a single item within the Store model
 *
 * @param {Object} req
 * @param {Object} res
 * @param {void} next
 */
async function updateIndividualValueForStore(req, res, next) {
    let trx = null;

    try {
        const { id } = req.params;
        const { field, value } = req.body;
        trx = await transaction.start(Store.knex());

        const store = await Store.query(trx)
            .withGraphFetched('[settings, laundromatBusiness, printerSettings, centsDelivery]')
            .patch({
                [field]: value,
            })
            .findById(id)
            .returning('*');

        await trx.commit();

        eventEmitter.emit('storeUpdated', store.id);

        return res.json({
            success: true,
            store,
        });
    } catch (error) {
        if (trx) {
            await trx.rollback();
        }
        return next(error);
    }
}

/**
 * Update a single item within the StoreSettings model
 *
 * @param {Object} req
 * @param {Object} res
 * @param {void} next
 */
async function updateIndividualValueForStoreSettings(req, res, next) {
    let trx = null;

    try {
        const { id } = req.params;
        const { field, value } = req.body;
        trx = await transaction.start(StoreSettings.knex());

        await StoreSettings.query(trx)
            .patch({
                [field]: value,
            })
            .where({
                storeId: id,
            });
        await trx.commit();

        const store = await Store.query()
            .withGraphFetched('[settings, laundromatBusiness, printerSettings, centsDelivery]')
            .findById(id);

        eventEmitter.emit('storeUpdated', id);

        return res.json({
            success: true,
            store,
        });
    } catch (error) {
        if (trx) {
            await trx.rollback();
        }
        return next(error);
    }
}

/**
 * Retrieve the store's ServiceOrder volume per month for the current year
 *
 * @param {Object} req
 * @param {Object} res
 * @param {void} next
 * @returns
 */
async function getServiceOrderVolumePerMonth(req, res, next) {
    try {
        const { id } = req.params;
        const date = new Date();
        const currentYear = date.getFullYear();

        const serviceOrders = await ServiceOrder.query()
            .select(raw('count(id) as count, date_part(\'month\', "placedAt") as "month"'))
            .where({
                storeId: id,
            })
            .andWhere(raw(`date_part('year', "placedAt") = ${currentYear}`))
            .groupBy(raw('date_part(\'month\', "placedAt")'));

        const months = serviceOrders.map((data) => data.month);
        const serviceOrderCount = serviceOrders.map((data) => data.count);

        return res.json({
            success: true,
            months,
            serviceOrderCount,
        });
    } catch (error) {
        return next(error);
    }
}

/**
 * Get the number of service orders recorded at the given store in the current month
 *
 * @param {Object} req
 * @param {Object} res
 * @param {void} next
 * @returns JSON
 */
async function getCurrentMonthServiceOrderCount(req, res, next) {
    try {
        const { id } = req.params;
        const date = new Date();
        const currentMonth = date.getMonth();
        const actualMonth = currentMonth + 1;

        const serviceOrders = await ServiceOrder.query()
            .select(raw('count(id) as count, date_part(\'month\', "placedAt") as "month"'))
            .where({
                storeId: id,
            })
            .andWhere(raw(`date_part('month', "placedAt") = ${actualMonth}`))
            .groupBy(raw('date_part(\'month\', "placedAt")'));

        return res.json({
            success: true,
            countData: serviceOrders[0].count,
        });
    } catch (error) {
        return next(error);
    }
}

/**
 * Update a single item within the PrinterStoreSettings model
 *
 * @param {Object} req
 * @param {Object} res
 * @param {void} next
 */
async function updateValueForPrinterSettings(req, res, next) {
    let trx = null;

    try {
        const { id } = req.params;
        const { field, value } = req.body;
        trx = await transaction.start(StoreSettings.knex());

        await PrinterStoreSettings.query(trx)
            .patch({
                [field]: value,
            })
            .where({
                storeId: id,
            });
        await trx.commit();

        const store = await Store.query()
            .withGraphFetched('[settings, laundromatBusiness, printerSettings, centsDelivery]')
            .findById(id);

        eventEmitter.emit('storeUpdated', id);

        return res.json({
            success: true,
            store,
        });
    } catch (error) {
        if (trx) {
            await trx.rollback();
        }
        return next(error);
    }
}

/**
 * Search across our Store models based on search input
 *
 * @param {Object} req
 * @param {Object} res
 * @param {void} next
 */
async function searchStores(req, res, next) {
    try {
        const { searchTerm } = req.query;
        const isSearchTermNumber = parseInt(searchTerm, 10);

        const stores = await Store.query()
            .withGraphFetched(
                `[
                laundromatBusiness,
                district.[region],
            ]`,
            )
            .select('stores.*')
            .join('laundromatBusiness', 'laundromatBusiness.id', 'stores.businessId')
            .where('stores.name', 'ilike', `%${searchTerm}%`)
            .orWhere('stores.address', 'ilike', `%${searchTerm}%`)
            .orWhere('stores.city', 'ilike', `%${searchTerm}%`)
            .orWhere('stores.state', 'ilike', `%${searchTerm}%`)
            .orWhere('laundromatBusiness.name', 'ilike', `%${searchTerm}%`)
            .modify((queryBuilder) => {
                if (isSearchTermNumber) {
                    queryBuilder.orWhere('stores.id', '=', `${searchTerm}`);
                }
            });

        let mappedStores = stores.map((item) => mapStoreData(item));
        mappedStores = await Promise.all(mappedStores);

        return res.json({
            success: true,
            stores: mappedStores,
            total: mappedStores.length,
        });
    } catch (error) {
        return next(error);
    }
}

/**
 * Update the password for a specific store.
 *
 * @param {Object} req
 * @param {Object} res
 * @param {void} next
 */
async function updateStorePassword(req, res, next) {
    let trx = null;

    try {
        trx = await transaction.start(Store.knex());

        const { password } = req.body;
        const { id } = req.params;
        const hashedPassword = await argon2.hash(password);

        const store = await Store.query(trx)
            .patch({
                password: hashedPassword,
            })
            .findById(id)
            .withGraphFetched('[settings, laundromatBusiness, printerSettings, centsDelivery]')
            .returning('*');

        await trx.commit();

        return res.json({
            success: true,
            store,
        });
    } catch (error) {
        if (trx) {
            await trx.rollback();
        }
        return next(error);
    }
}

/**
 * Get the Service Orders for a specific store with customer,
 * and store data, and paginate by 20.
 *
 * @param {Object} req
 * @param {Object} res
 * @param {void} next
 */
async function getStoreServiceOrders(req, res, next) {
    const { id } = req.params;
    const { pageNumber } = req.query;
    const serviceOrders = await ServiceOrder.query()
        .withGraphFetched(
            `[
                storeCustomer.[centsCustomer],
                store
            ]`,
        )
        .page(pageNumber, 20)
        .orderBy('createdAt', 'desc')
        .where({
            storeId: id,
        });

    let mappedServiceOrders = serviceOrders.results.map((item) => mapServiceOrderData(item));
    mappedServiceOrders = await Promise.all(mappedServiceOrders);

    return res.json({
        success: true,
        serviceOrders: mappedServiceOrders,
        total: serviceOrders.total,
    });
}

/**
 * Get the Inventory Orders for a specific store, with customer,
 * business and payments, and and paginate by 20.
 *
 * @param {Object} req
 * @param {Object} res
 * @param {void} next
 */
async function getStoreInventoryOrders(req, res, next) {
    const { id } = req.params;
    const { pageNumber } = req.query;
    const inventoryOrders = await InventoryOrder.query()
        .withGraphFetched(
            `[
                customer,
                store.[laundromatBusiness],
                order.[payments]
            ]`,
        )
        .page(pageNumber, 20)
        .orderBy('createdAt', 'desc')
        .where({
            storeId: id,
        });

    let mappedInventoryOrders = inventoryOrders.results.map((item) => mapInventoryOrderData(item));
    mappedInventoryOrders = await Promise.all(mappedInventoryOrders);

    return res.json({
        success: true,
        inventoryOrders: mappedInventoryOrders,
        total: inventoryOrders.total,
    });
}

/**
 * Turn DoorDash on or off for a given store
 *
 * @param {Object} req
 * @param {Object} res
 * @param {void} next
 */
async function toggleDoorDashSettings(req, res, next) {
    let trx = null;
    try {
        const { id } = req.params;

        trx = await transaction.start(CentsDeliverySettings.knex());

        await CentsDeliverySettings.query(trx)
            .patch({
                doorDashEnabled: raw('NOT ??', ['doorDashEnabled']),
            })
            .findOne({
                storeId: id,
            })
            .returning('*');

        await trx.commit();
        eventEmitter.emit('storeUpdated', id);
        return res.json({
            success: true,
        });
    } catch (error) {
        if (trx) {
            await trx.rollback();
        }
        return next(error);
    }
}

module.exports = exports = {
    getAllStores,
    getIndividualStore,
    updateIndividualValueForStore,
    getServiceOrderVolumePerMonth,
    getCurrentMonthServiceOrderCount,
    updateIndividualValueForStoreSettings,
    updateValueForPrinterSettings,
    searchStores,
    updateStorePassword,
    getStoreServiceOrders,
    getStoreInventoryOrders,
    toggleDoorDashSettings,
};
