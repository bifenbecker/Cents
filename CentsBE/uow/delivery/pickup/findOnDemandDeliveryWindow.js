const centsDeliverySettings = require('../../../models/centsDeliverySettings');
const { getDeliveryWindowsWithEpochDate } = require('../../../services/shifts/queries/timings');
const {
    injectOnDemandWindowsToDeliveryDays,
} = require('../onlineOrder/injectOnDemandWindowsToDeliveryDays');

function getEpochTime(timing) {
    const result = Math.floor(timing.startEpochTime);
    return result;
}

async function getOnDemandPickUpWindow(payload) {
    try {
        const {
            onDemandDeliveryStore,
            googlePlacesId,
            timeZone,
            doorDashEstimate,
            deliveryDays,
            windowsAvailableTime,
        } = payload;
        if (!onDemandDeliveryStore.id || !doorDashEstimate?.fee) {
            return payload;
        }

        const { id: storeId } = onDemandDeliveryStore;
        let window = await getDeliveryWindowsWithEpochDate({
            storeId: onDemandDeliveryStore.id,
            type: 'CENTS_DELIVERY',
            timeZone,
            validate: true,
            deliveryType: 'ON_DEMAND',
        });
        window = window.filter(({ timings }) => timings.length > 0);
        if (!window) {
            return payload;
        }

        const newPayload = payload;
        const { fee: doorDashFee } = doorDashEstimate;
        const { subsidyInCents } = await centsDeliverySettings.query().findOne({ storeId });

        const calculatedPrice =
            doorDashFee > subsidyInCents ? Number(doorDashFee - subsidyInCents) : 0;
        injectOnDemandWindowsToDeliveryDays({
            timings: window,
            timeZone,
            calculatedPrice,
            deliveryDays,
            storeId,
            windowsAvailableTime,
        });

        newPayload.onDemandDeliveryWindow = window;
        newPayload.storeId = storeId;
        newPayload.dropoffId = googlePlacesId;
        newPayload.deliveryTimes = [getEpochTime(window)];
        return newPayload;
    } catch (error) {
        throw new Error(error.message);
    }
}

module.exports = exports = getOnDemandPickUpWindow;
