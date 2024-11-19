const { pick } = require('lodash');
const moment = require('moment');
const { injectOwnWindowsToDeliveryDays } = require('../onlineOrder/injectOwnWindowsToDeliveryDays');
const GeneralDeliverySettingsService = require('../../../services/deliverySettings/generalDeliverySettings');
const { getDeliveryWindowsWithEpochDate } = require('../../../services/shifts/queries/timings');
const { DELIVERY_TIMING_TYPES, shiftType } = require('../../../constants/constants');

// stores, type, timeZone, transaction
async function getOwnPickUpWindow(payload) {
    try {
        const newPayload = payload;

        const { ownDeliveryStore, timeZone, zipCode, transaction, deliveryDays } = newPayload;

        if (!ownDeliveryStore.id) {
            return newPayload;
        }
        const deliverySettingsService = new GeneralDeliverySettingsService(ownDeliveryStore.id);
        const ownDriverDeliverySettings = await deliverySettingsService.ownDeliverySettings();

        ownDeliveryStore.ownDeliverySettings = pick(ownDriverDeliverySettings, [
            'deliveryWindowBufferInHours',
            'deliveryFeeInCents',
        ]);

        const startDate = moment().tz(timeZone).startOf('day').valueOf();
        await injectOwnWindowsToDeliveryDays({
            storeId: ownDeliveryStore.id,
            timeZone,
            zipCode,
            serviceType: DELIVERY_TIMING_TYPES.PICKUP,
            startDate,
            bufferTimeInHours: ownDeliveryStore.ownDeliverySettings?.deliveryWindowBufferInHours,
            deliveryFeeInCents: ownDeliveryStore.ownDeliverySettings?.deliveryFeeInCents,
            deliveryDays,
        });

        const { dayWiseWindows: windows, active } =
            await deliverySettingsService.getOwnDeliveryWindowsWithEpochDate({
                ownDriverDeliverySettings,
                timeZone,
                validate: true,
                transaction,
                zipCode,
            });
        if (ownDeliveryStore.offersCentsDelivery) {
            const onDemandDeliverySettings =
                (await deliverySettingsService.centsDeliverySettings()) || {};
            if (onDemandDeliverySettings.id) {
                onDemandDeliverySettings.dayWiseWindows = onDemandDeliverySettings.active
                    ? await getDeliveryWindowsWithEpochDate({
                          storeId: ownDeliveryStore.id,
                          type: shiftType.CENTS_DELIVERY,
                          deliveryType: 'ON_DEMAND',
                      })
                    : [];
            }
            ownDeliveryStore.onDemandDeliverySettings = onDemandDeliverySettings;
        }
        newPayload.ownDeliveryWindows = active ? windows : [];
        return newPayload;
    } catch (error) {
        throw new Error(error.message);
    }
}

module.exports = exports = getOwnPickUpWindow;
