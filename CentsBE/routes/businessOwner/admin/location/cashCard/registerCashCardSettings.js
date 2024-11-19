const { transaction } = require('objection');

const Store = require('../../../../../models/store');
const EsdReader = require('../../../../../models/esdReader');
const CciSettings = require('../../../../../models/cciSetting');
const LaundroworksSettings = require('../../../../../models/laundroworksSettings');
const SpyderWashSettings = require('../../../../../models/spyderWashSettings');

/**
 * If CCI is enabled, either store or update CCI settings
 *
 * @param {Object} request
 * @param {Number} storeId
 * @param {void} trx
 */
async function storeCciSettings(request, storeId, trx) {
    let settings;

    const currentCciSettings = await CciSettings.query().findOne({
        storeId,
    });

    if (currentCciSettings) {
        settings = await CciSettings.query(trx)
            .patch({
                username: request.username,
                password: request.password,
                cciStoreId: request.cciStoreId,
                machineId: 350,
            })
            .findById(currentCciSettings.id)
            .returning('*');
    } else {
        settings = await CciSettings.query(trx).insert({
            username: request.username,
            password: request.password,
            cciStoreId: request.cciStoreId,
            machineId: 350,
            storeId,
        });
    }

    return settings;
}

/**
 * If Laundroworks is enabled, either store or update LaundroworksSettings
 *
 * @param {Object} request
 * @param {Number} storeId
 * @param {void} trx
 * @returns {Object}
 */
async function storeLaundroworksSettings(request, storeId, trx) {
    let settings;

    const currentLaundroworksSettings = await LaundroworksSettings.query().findOne({
        storeId,
    });

    if (currentLaundroworksSettings) {
        settings = await LaundroworksSettings.query(trx)
            .patch({
                username: request.laundroworksUsername,
                password: request.laundroworksPassword,
                customerKey: request.customerKey,
                laundroworksLocationId: request.laundroworksLocationId,
                laundroworksPosNumber: request.laundroworksPosNumber,
            })
            .findById(currentLaundroworksSettings.id)
            .returning('*');
    } else {
        settings = await LaundroworksSettings.query(trx).insert({
            username: request.laundroworksUsername,
            password: request.laundroworksPassword,
            customerKey: request.customerKey,
            laundroworksLocationId: request.laundroworksLocationId,
            laundroworksPosNumber: request.laundroworksPosNumber,
            storeId,
        });
    }

    return settings;
}

/**
 * If SpyderWash is enabled, either store or update SpyderWashSettings
 *
 * @param {Object} request
 * @param {Number} storeId
 * @param {void} trx
 * @returns {Object}
 */
async function storeSpyderWashSettings(request, storeId, trx) {
    let settings;

    const currentSpyderWashSettings = await SpyderWashSettings.query().findOne({
        storeId,
    });

    if (currentSpyderWashSettings) {
        settings = await SpyderWashSettings.query(trx)
            .patch({
                email: process.env.SPYDERWASH_EMAIL,
                password: process.env.SPYDERWASH_PASSWORD,
                posId: process.env.SPYDERWASH_POSID,
                operatorCode: request.spyderWashOperatorCode,
                locationCode: request.spyderWashLocationCode,
            })
            .findById(currentSpyderWashSettings.id)
            .returning('*');
    } else {
        settings = await SpyderWashSettings.query(trx).insert({
            email: process.env.SPYDERWASH_EMAIL,
            password: process.env.SPYDERWASH_PASSWORD,
            posId: process.env.SPYDERWASH_POSID,
            operatorCode: request.spyderWashOperatorCode,
            locationCode: request.spyderWashLocationCode,
            storeId,
        });
    }

    return settings;
}

/**
 * If ESD is set to be enabled, either register a new reader or update the current reader settings
 *
 * @param {Object} request
 * @param {Object} currentEsdReader
 * @param {Number} storeId
 * @param {void} trx
 */
async function storeEsdReader(request, currentEsdReader, storeId, trx) {
    let reader;

    if (!currentEsdReader) {
        reader = await EsdReader.query(trx).insert({
            esdLocationId: request.esdLocationId,
            deviceSerialNumber: request.deviceSerialNumber,
            storeId,
        });
    } else {
        reader = await EsdReader.query(trx)
            .patch({
                esdLocationId: request.esdLocationId,
                deviceSerialNumber: request.deviceSerialNumber,
                storeId,
            })
            .findById(currentEsdReader.id)
            .returning('*');
    }

    return reader;
}

async function registerCashCardSettings(req, res, next) {
    let trx = null;

    try {
        const { id } = req.params;
        const {
            hasCciEnabled,
            hasEsdEnabled,
            hasCashEnabled,
            hasCashDrawer,
            hasLaundroworksEnabled,
            hasSpyderWashEnabled,
            hasOtherPaymentMethods,
        } = req.body;
        const { currentEsdReader } = req.constants;

        let reader = null;
        let settings = null;
        let laundroworksSettings = null;
        let spyderWashSettings = null;

        trx = hasEsdEnabled
            ? await transaction.start(EsdReader.knex())
            : await transaction.start(CciSettings.knex());

        await Store.query(trx)
            .findById(Number(id))
            .patch({
                hasEsdEnabled: hasEsdEnabled || false,
                hasCciEnabled: hasCciEnabled || false,
                hasLaundroworksEnabled: hasLaundroworksEnabled || false,
                hasSpyderWashEnabled: hasSpyderWashEnabled || false,
                hasCashEnabled,
                hasCashDrawer,
                hasOtherPaymentMethods: hasOtherPaymentMethods || false,
            })
            .returning('*');

        if (hasEsdEnabled) {
            reader = await storeEsdReader(req.body, currentEsdReader, id, trx);
        }

        if (hasCciEnabled) {
            settings = await storeCciSettings(req.body, id, trx);
        }

        if (hasLaundroworksEnabled) {
            laundroworksSettings = await storeLaundroworksSettings(req.body, id, trx);
        }

        if (hasSpyderWashEnabled) {
            spyderWashSettings = await storeSpyderWashSettings(req.body, id, trx);
        }

        await trx.commit();

        return res.json({
            reader,
            cciSettings: settings,
            laundroworksSettings,
            spyderWashSettings,
            success: true,
        });
    } catch (error) {
        if (trx) {
            await trx.rollback();
        }
        return next(error);
    }
}

module.exports = registerCashCardSettings;
