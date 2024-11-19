const OnDemandDelivery = require('../../../../services/locations/onDemandDelivery');
const OwnDeliverySettings = require('../../../../models/ownDeliverySettings');
const StoreQuery = require('../../../../queryHelpers/store');
const {
    getIsGeneralDeliverySettingsEnabled,
} = require('../../../../queryHelpers/getIsGeneralDeliverySettingsEnabled');
const { SHIFT_TYPES } = require('../../../../lib/constants');

const eventEmitter = require('../../../../config/eventEmitter');

/**
 * creates on demand delivery settings
 * @param {*} req holds delivery settings values
 * @param {*} res response
 * @param {*} next
 * @returns success
 */

const createOnDemadDeliverySettings = async (req, res, next) => {
    try {
        const { storeId } = req.params;
        const demandDelivery = new OnDemandDelivery(storeId, {
            subsidyInCents: req.body.subsidyInCents,
            returnOnlySubsidyInCents: req.body.returnOnlySubsidyInCents,
            shifts: req.body.shifts,
            shiftType: SHIFT_TYPES.CENTS_DELIVERY,
        });
        await demandDelivery.execute();
        const ownDeliverySettings = await OwnDeliverySettings.query().findOne({ storeId });
        const store = new StoreQuery(storeId);
        const storeSettings = await store.settings();

        eventEmitter.emit('storeSettingsCreated', storeId);

        return res.json({
            success: true,
            isOwndriverSettingsActive: ownDeliverySettings ? ownDeliverySettings.active : false,
            isGeneralDeliverySettingsEnabled: await getIsGeneralDeliverySettingsEnabled({
                storeSettings,
                driverSettings: ownDeliverySettings,
            }),
        });
    } catch (error) {
        return next(error);
    }
};

module.exports = exports = createOnDemadDeliverySettings;
