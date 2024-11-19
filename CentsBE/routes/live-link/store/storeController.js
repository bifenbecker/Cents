const { onDemandIntervalInMins, shiftType } = require('../../../constants/constants');

const { getDeliveryWindowsWithEpochDate } = require('../../../services/shifts/queries/timings');

const GeneralDeliverySettingsService = require('../../../services/deliverySettings/generalDeliverySettings');
const getOwnDeliverySettingsPipeline = require('../../../pipeline/liveLink/getOwnDeliverySettingsPipeline');
const getStandardDeliveryWindowsPipeline = require('../../../pipeline/liveLink/getStandardDeliveryWindowsPipeline');
const validateServiceTypeAvailabilityPipeline = require('../../../pipeline/liveLink/validateServiceTypeAvailabilityPipeline');

const Store = require('../../../models/store');

async function getAvailableDeliverySettings(req, res, next) {
    try {
        const { storeId } = req.params;
        const deliverySettingsService = new GeneralDeliverySettingsService(storeId);
        const onDemandDeliverySettings =
            (await deliverySettingsService.centsDeliverySettings(['id', 'active'])) || {};
        const ownDriverDeliverySettings =
            (await deliverySettingsService.ownDeliverySettings([
                'id',
                'active',
                'deliveryWindowBufferInHours',
            ])) || {};
        const generalDeliverySettings = await deliverySettingsService.storeSettings([
            'deliveryEnabled',
            'turnAroundInHours',
        ]);

        res.status(200).json({
            success: true,
            generalDeliverySettings,
            ownDriverDeliverySettings,
            onDemandDeliverySettings,
        });
    } catch (error) {
        next(error);
    }
}

async function getGeneralDeliverySettings(req, res, next) {
    try {
        const { storeId } = req.params;
        const deliverySettingsService = new GeneralDeliverySettingsService(storeId);
        const generalDeliverySettings = await deliverySettingsService.storeSettings([
            'storeId',
            'deliveryEnabled',
            'turnAroundInHours',
            'recurringDiscountInPercent',
            'customLiveLinkHeader',
            'customLiveLinkMessage',
        ]);

        res.status(200).json({
            success: true,
            generalDeliverySettings,
        });
    } catch (error) {
        next(error);
    }
}

async function getOnDemandDeliverySettings(req, res, next) {
    try {
        const { storeId } = req.params;
        const deliverySettingsService = new GeneralDeliverySettingsService(storeId);
        const onDemandDeliverySettings =
            (await deliverySettingsService.centsDeliverySettings()) || {};
        if (onDemandDeliverySettings.id) {
            onDemandDeliverySettings.dayWiseWindows = onDemandDeliverySettings.active
                ? await getDeliveryWindowsWithEpochDate({
                      storeId,
                      type: shiftType.CENTS_DELIVERY,
                      deliveryType: 'ON_DEMAND',
                  })
                : [];
        }

        res.status(200).json({
            success: true,
            onDemandDeliverySettings,
            onDemandIntervalInMins,
        });
    } catch (error) {
        next(error);
    }
}

async function getOwnDriverDeliverySettings(req, res, next) {
    try {
        const { storeId } = req.params;
        const { zipCode } = req.query;
        const ownDriverDeliverySettings = await getOwnDeliverySettingsPipeline({
            storeId,
            zipCode,
        });

        res.status(200).json({
            success: true,
            ownDriverDeliverySettings,
        });
    } catch (error) {
        next(error);
    }
}

async function getStandardDeliveryWindows(req, res, next) {
    try {
        const { storeId } = req.params;
        const { startDate, serviceType, zipCode } = req.query;

        const storeDetails = await Store.query()
            .withGraphJoined('settings as storeSettings')
            .findById(storeId);
        const payload = {
            startDate: Number(startDate) || new Date().valueOf(),
            serviceType,
            zipCode,
            storeId,
            timeZone: storeDetails.storeSettings.timeZone,
        };
        const dayWiseWindows = await getStandardDeliveryWindowsPipeline(payload);

        res.status(200).json({
            success: true,
            dayWiseWindows,
        });
    } catch (error) {
        next(error);
    }
}

/**
 * Determine whether the given store offers dry cleaning and/or laundry services
 *
 * @param {Object} req
 * @param {Object} res
 * @param {void} next
 */
async function validateServiceTypeAvailability(req, res, next) {
    try {
        const { storeId } = req.params;
        const output = await validateServiceTypeAvailabilityPipeline({ storeId });

        return res.json({
            success: true,
            hasDryCleaning: output?.hasDryCleaning && output?.offerDryCleaningForDelivery,
            hasLaundry: output?.hasLaundry,
        });
    } catch (error) {
        return next(error);
    }
}

module.exports = exports = {
    getAvailableDeliverySettings,
    getGeneralDeliverySettings,
    getOnDemandDeliverySettings,
    getOwnDriverDeliverySettings,
    getStandardDeliveryWindows,
    validateServiceTypeAvailability,
};
