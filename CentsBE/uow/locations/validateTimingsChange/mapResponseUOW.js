async function mapResponseUOW(payload) {
    const { timingsWithDeliveriesAndSubscriptionsCount } = payload;

    return {
        ...payload,
        timingsWithDeliveriesAndSubscriptionsCount: timingsWithDeliveriesAndSubscriptionsCount
            .map(({ id, activeOrderDeliveriesCount, activeRecurringSubscriptionCount }) => ({
                id,
                activeOrderDeliveriesCount: Number(activeOrderDeliveriesCount),
                activeRecurringSubscriptionCount: Number(activeRecurringSubscriptionCount),
            }))
            .filter(
                ({ activeOrderDeliveriesCount, activeRecurringSubscriptionCount }) =>
                    activeOrderDeliveriesCount > 0 || activeRecurringSubscriptionCount > 0,
            ),
    };
}

module.exports = mapResponseUOW;
