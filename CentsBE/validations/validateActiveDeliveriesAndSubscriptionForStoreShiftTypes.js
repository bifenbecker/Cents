const CustomQuery = require('../services/customQuery');

const getActiveDeliveriesAndSubscriptionForStoreShiftTypes = async (payload) => {
    try {
        const { storeId, shiftTypes } = payload;
        let newPayload = payload;
        const queryParams = {
            storeId,
            shiftTypes: shiftTypes.map((type) => `'${type}'`).join(', '),
        };
        const customQuery = new CustomQuery(
            'locations/active-deliveries-and-subscriptions-count-for-delivery-provider.sql',
            queryParams,
        );
        const [{ activeOrderDeliveriesCount, activeRecurringSubscriptionCount }] =
            await customQuery.execute();
        newPayload = {
            ...newPayload,
            activeOrderDeliveriesCount: Number(activeOrderDeliveriesCount),
            activeRecurringSubscriptionCount: Number(activeRecurringSubscriptionCount),
        };
        return newPayload;
    } catch (error) {
        throw Error(error.message);
    }
};

const validateActiveDeliveriesAndSubscriptionForStoreShiftTypes = async (payload) => {
    const { storeId, shiftTypes } = payload;
    const { activeOrderDeliveriesCount, activeRecurringSubscriptionCount } =
        await getActiveDeliveriesAndSubscriptionForStoreShiftTypes({ storeId, shiftTypes });

    return activeOrderDeliveriesCount > 0 || activeRecurringSubscriptionCount > 0
        ? {
              success: false,
              error: 'This setting cannot be toggled off because there are either active order deliveries or active recurring subscriptions associated with it.',
              type: 'ACTIVE_DELIVERIES_OR_SUBSCRIPTIONS',
              activeOrderDeliveriesCount,
              activeRecurringSubscriptionCount,
          }
        : { success: true };
};

module.exports = exports = validateActiveDeliveriesAndSubscriptionForStoreShiftTypes;
