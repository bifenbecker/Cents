const { SHIFT_TYPES } = require('../../../lib/constants');
const CustomQuery = require('../../../services/customQuery');

const getQueryForFetchingCountsWhenGeneralTimingsChange = ({ storeId, timingIds, type }) => {
    const queryParams = {
        storeId,
        shiftTypes: `'${type}'`,
        timingIds: timingIds.join(', '),
    };
    return new CustomQuery(
        'locations/active-deliveries-and-subscriptions-count-for-delivery-provider.sql',
        queryParams,
    );
};

async function buildAndExecuteCustomQueryToFetchCountsUOW(payload) {
    const { updatedTimingIds, type, storeId, timing } = payload;

    if (!updatedTimingIds.length) {
        return payload;
    }

    let customQuery;

    if (type === SHIFT_TYPES.OWN_DELIVERY) {
        customQuery = getQueryForFetchingCountsWhenGeneralTimingsChange({
            type: SHIFT_TYPES.OWN_DELIVERY,
            storeId,
            timingIds: updatedTimingIds,
        });
    } else if (type === SHIFT_TYPES.CENTS_DELIVERY) {
        if (timing.isActive) {
            const queryParams = {
                storeId,
                timingIds: updatedTimingIds.join(', '),
                newStartTime: timing.startTime,
                newEndTime: timing.endTime,
            };
            customQuery = new CustomQuery(
                'locations/active-deliveries-and-subscriptions-for-on-demand-timings.sql',
                queryParams,
            );
        } else {
            customQuery = getQueryForFetchingCountsWhenGeneralTimingsChange({
                type: SHIFT_TYPES.CENTS_DELIVERY,
                storeId,
                timingIds: updatedTimingIds,
            });
        }
    }

    return {
        ...payload,
        timingsWithDeliveriesAndSubscriptionsCount: await customQuery.execute(),
    };
}

module.exports = buildAndExecuteCustomQueryToFetchCountsUOW;
