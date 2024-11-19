// Packages
const { transaction } = require('objection');

// Models
const ScaleDevice = require('../../../models/scaleDevice');
const ScaleDeviceStoreMap = require('../../../models/scaleDeviceStoreMap');

/**
 * Format the ScaleDevice data for our front-end
 *
 * @param {Object} device
 */
async function mapDeviceData(device) {
    const data = {
        id: device.id,
        deviceUuid: device.deviceUuid,
        pinNumber: device.pinNumber,
        storeName: device.store ? device.store.name : '--',
    };

    return data;
}

/**
 * Get all ScaleDevice objects in the Cents ecosystem
 *
 * @param {Object} req
 * @param {Object} res
 * @param {void} next
 */
async function getAllScaleDevices(req, res, next) {
    try {
        const scaleDevices = await ScaleDevice.query()
            .withGraphFetched('[store]')
            .orderBy('createdAt', 'desc');

        let formattedScaleDevices = scaleDevices.map((device) => mapDeviceData(device));

        formattedScaleDevices = await Promise.all(formattedScaleDevices);

        return res.json({
            success: true,
            scaleDevices: formattedScaleDevices,
            total: scaleDevices.length,
        });
    } catch (error) {
        return next(error);
    }
}

/**
 * Register a new ScaleDevice in the Cents ecosystem
 *
 * Optionally: attach that ScaleDevice to a Store
 *
 * @param {Object} req
 * @param {Object} res
 * @param {void} next
 */
async function registerNewScaleDevice(req, res, next) {
    let trx = null;

    try {
        const { pinNumber, deviceUuid, storeId } = req.body;

        trx = await transaction.start(ScaleDevice.knex());
        const newScaleDevice = await ScaleDevice.query(trx).insert({
            pinNumber,
            deviceUuid,
        });

        if (storeId) {
            await ScaleDeviceStoreMap.query(trx).insert({
                storeId,
                scaleDeviceId: newScaleDevice.id,
            });
        }

        await trx.commit();

        return res.json({
            success: true,
            scaleDevice: newScaleDevice,
        });
    } catch (error) {
        if (trx) {
            await trx.rollback();
        }

        return next(error);
    }
}

/**
 * Find an indvidual ScaleDevice model
 *
 * @param {Object} req
 * @param {Object} res
 * @param {void} next
 */
async function getIndividualScaleDevice(req, res, next) {
    try {
        const { id } = req.params;

        const scaleDevice = await ScaleDevice.query().withGraphFetched('[store]').findById(id);

        return res.json({
            success: true,
            scaleDevice,
        });
    } catch (error) {
        return next(error);
    }
}

/**
 * Assign a specific ScaleDevice to a Store.
 *
 * If a ScaleDevice is already assigned to a current store, just patch with new store
 * If not, then create a new ScaleDeviceStoreMap
 *
 * @param {Object} req
 * @param {Object} res
 * @param {void} next
 * @returns JSON
 */
async function attachStoreToScaleDevice(req, res, next) {
    let trx = null;

    try {
        const { id } = req.params;
        const { storeId } = req.body;
        const { scaleDeviceStoreMap } = req.constants;

        trx = await transaction.start(ScaleDeviceStoreMap.knex());

        if (scaleDeviceStoreMap) {
            await ScaleDeviceStoreMap.query(trx)
                .patch({
                    scaleDeviceId: id,
                    storeId,
                })
                .findById(scaleDeviceStoreMap.id)
                .returning('*');
        } else {
            await ScaleDeviceStoreMap.query(trx)
                .insert({
                    scaleDeviceId: id,
                    storeId,
                })
                .returning('*');
        }

        await trx.commit();

        const scaleDevice = await ScaleDevice.query().withGraphFetched('[store]').findById(id);

        return res.json({
            success: true,
            scaleDevice,
        });
    } catch (error) {
        if (trx) {
            await trx.rollback();
        }
        return next(error);
    }
}

/**
 * Search across our LaundromatBusiness models based on search input
 *
 * @param {Object} req
 * @param {Object} res
 * @param {void} next
 */
async function searchScaleDevices(req, res, next) {
    try {
        const { searchTerm } = req.query;
        const isSearchTermNumber = parseInt(searchTerm, 10);

        const scaleDevices = await ScaleDevice.query()
            .withGraphFetched('[store]')
            .select('scaleDevices.*')
            .join('scaleDeviceStoreMap', 'scaleDeviceStoreMap.scaleDeviceId', 'scaleDevices.id')
            .join('stores', 'scaleDeviceStoreMap.storeId', 'stores.id')
            .where('stores.name', 'ilike', `%${searchTerm}%`)
            .orWhere('scaleDevices.deviceUuid', 'ilike', `%${searchTerm}%`)
            .orWhere('scaleDevices.pinNumber', 'ilike', `%${searchTerm}%`)
            .modify((queryBuilder) => {
                if (isSearchTermNumber) {
                    queryBuilder.orWhere('scaleDevices.id', '=', `${searchTerm}`);
                }
            });

        let mappedScaleDevices = scaleDevices.map((item) => mapDeviceData(item));
        mappedScaleDevices = await Promise.all(mappedScaleDevices);

        return res.json({
            success: true,
            scaleDevices: mappedScaleDevices,
            total: scaleDevices.length,
        });
    } catch (error) {
        return next(error);
    }
}

module.exports = exports = {
    getAllScaleDevices,
    registerNewScaleDevice,
    getIndividualScaleDevice,
    attachStoreToScaleDevice,
    searchScaleDevices,
};
