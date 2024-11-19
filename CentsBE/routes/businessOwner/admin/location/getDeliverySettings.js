const GeneralDeliverySettingsService = require('../../../../services/deliverySettings/generalDeliverySettings');
const DeliveryWindows = require('../../../../services/shifts/shifts');
const { SHIFT_TYPES } = require('../../../../lib/constants');
const { getGroupedShiftTimings } = require('../../../../utils/shifts');
const { deliveryPriceTypes } = require('../../../../constants/constants');
const OwnDriverDeliverySettingsQuery = require('../../../../queryHelpers/ownDriverDeliverySettings');

const Store = require('../../../../models/store');

async function generalDeliverySettings(req, res, next) {
    try {
        const { storeId } = req.params;

        const store = await Store.query().withGraphFetched('laundromatBusiness').findById(storeId);
        const canEnableDeliverySettings = !!store.laundromatBusiness.merchantId;

        if (!canEnableDeliverySettings) {
            res.status(200).json({
                canEnableDeliverySettings,
                generalDeliverySettings: {},
                onDemandDeliverySettings: {},
                ownDriverDeliverySettings: {},
            });
            return;
        }

        const deliveryTiers = [];
        const deliverySettingsService = new GeneralDeliverySettingsService(storeId);
        const deliveryWindowService = new DeliveryWindows();

        const generalDeliverySettings = (await deliverySettingsService.storeSettings()) || {};

        const hasDeliveryTier =
            generalDeliverySettings.deliveryPriceType === deliveryPriceTypes.DELIVERY_TIER;
        if (hasDeliveryTier && generalDeliverySettings.deliveryTier) {
            deliveryTiers.push(generalDeliverySettings.deliveryTier.id);
        }
        generalDeliverySettings.deliveryTier = generalDeliverySettings.deliveryTier || {};

        const ownDriverDeliverySettings =
            (await deliverySettingsService.ownDeliverySettings()) || {};
        const ownDriverDeliverySettingsQuery = new OwnDriverDeliverySettingsQuery(storeId);
        ownDriverDeliverySettingsQuery.setDeliveryTierIds(deliveryTiers);
        if (ownDriverDeliverySettings && ownDriverDeliverySettings.id) {
            ownDriverDeliverySettings.zones = await deliverySettingsService.getZones(
                ownDriverDeliverySettings.id,
            );
            if (ownDriverDeliverySettings.zones) {
                ownDriverDeliverySettings.zones = await ownDriverDeliverySettingsQuery.mapZoneTiers(
                    ownDriverDeliverySettings.zones,
                );
            }
            const ownDeliveryWindows =
                (await deliveryWindowService.getShiftsByStoreId(
                    storeId,
                    SHIFT_TYPES.OWN_DELIVERY,
                )) || [];
            ownDriverDeliverySettings.windows = getGroupedShiftTimings(ownDeliveryWindows);
        }

        if (hasDeliveryTier) {
            const deliveryTierServicesCount =
                await ownDriverDeliverySettingsQuery.deliveryTierServicesCount();
            generalDeliverySettings.servicesSelected = Number(deliveryTierServicesCount.count);
        } else {
            const servicesCount = await deliverySettingsService.servicesCount();
            generalDeliverySettings.servicesSelected = servicesCount.length || 0;
        }

        const onDemandDeliverySettings =
            (await deliverySettingsService.centsDeliverySettings()) || {};
        if (onDemandDeliverySettings && onDemandDeliverySettings.id) {
            const onDemandDeliveryWindows =
                (await deliveryWindowService.getShiftsByStoreId(
                    storeId,
                    SHIFT_TYPES.CENTS_DELIVERY,
                )) || [];
            onDemandDeliverySettings.windows = getGroupedShiftTimings(onDemandDeliveryWindows);
        }

        res.status(200).json({
            canEnableDeliverySettings,
            generalDeliverySettings,
            onDemandDeliverySettings,
            ownDriverDeliverySettings,
        });
    } catch (error) {
        next(error);
    }
}

module.exports = generalDeliverySettings;
