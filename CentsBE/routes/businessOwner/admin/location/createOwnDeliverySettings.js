const OwnDelivery = require('../../../../services/locations/ownDelivery');
const CentsDeliverySettings = require('../../../../models/centsDeliverySettings');
const StoreQuery = require('../../../../queryHelpers/store');
const {
    getIsGeneralDeliverySettingsEnabled,
} = require('../../../../queryHelpers/getIsGeneralDeliverySettingsEnabled');

const { SHIFT_TYPES } = require('../../../../lib/constants');

const eventEmitter = require('../../../../config/eventEmitter');

/**
 * creates own delivery settings
 * @param {*} req holds delivery settings values
 * @param {*} res response
 * @param {*} next
 * @returns success
 */

const createOwnDeliverySettings = async (req, res, next) => {
    try {
        const { storeId } = req.params;
        const {
            zipCodes,
            hasZones,
            zones,
            deliveryFeeInCents,
            shifts,
            deliveryTierId,
            returnDeliveryFeeInCents,
        } = req.body;
        const ownDelivery = new OwnDelivery(storeId, {
            zipCodes,
            hasZones,
            zones,
            deliveryFeeInCents,
            shifts,
            shiftType: SHIFT_TYPES.OWN_DELIVERY,
            deliveryTierId,
            returnDeliveryFeeInCents,
        });
        await ownDelivery.execute();
        const centsDeliverySettings = await CentsDeliverySettings.query().findOne({ storeId });
        const store = new StoreQuery(storeId);
        const storeSettings = await store.settings();

        eventEmitter.emit('storeSettingsCreated', storeId);

        return res.json({
            success: true,
            isOnDemandSettingsActive: centsDeliverySettings ? centsDeliverySettings.active : false,
            isGeneralDeliverySettingsEnabled: await getIsGeneralDeliverySettingsEnabled({
                storeSettings,
                driverSettings: {
                    hasZones,
                    zones,
                },
            }),
        });
    } catch (error) {
        return next(error);
    }
};

module.exports = exports = createOwnDeliverySettings;
