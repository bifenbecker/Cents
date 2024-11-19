function formatOwnDeliveryStore(store, ownDeliveryWindows) {
    const response = {
        onDemandDeliverySettings: {
            ...store.onDemandDeliverySettings,
            doorDashEnabled: store.doorDashEnabled,
        },
        ownDeliverySettings: store.ownDeliverySettings,
    };
    if (ownDeliveryWindows && ownDeliveryWindows.length) {
        response.storeId = store.id;
        response.state = store.state;
        response.storeName = store.name;
        response.deliveryFeeInCents = store.deliveryFeeInCents;
        response.turnAroundInHours = store.turnAroundInHours;
        response.recurringDiscountInPercent = store.recurringDiscountInPercent;
        response.autoScheduleReturnEnabled = store.autoScheduleReturnEnabled;
    }
    return response;
}

function formatOnDemandDeliverySettings(store, onDemandDeliveryWindows, doorDashEstimate) {
    const response = {};
    if (onDemandDeliveryWindows && onDemandDeliveryWindows.length && doorDashEstimate) {
        response.storeId = store.id;
        response.state = store.state;
        response.storeName = store.name;
        response.dayWiseWindows = onDemandDeliveryWindows;
        response.subsidyInCents = store.subsidyInCents;
        response.returnOnlySubsidyInCents = store.returnOnlySubsidyInCents;
        response.turnAroundInHours = store.turnAroundInHours;
        // response.distanceInMiles = (Number(store.distance) || 0).toFixed(3);
        response.recurringDiscountInPercent = store.recurringDiscountInPercent;
        response.doorDashEnabled = store.doorDashEnabled;
        return response;
    }
    return response;
}

function formatResponse(payload) {
    try {
        const {
            ownDeliveryStore,
            onDemandDeliveryStore,
            onDemandDeliveryWindow,
            ownDeliveryWindows,
            doorDashEstimate,
            deliveryDays,
        } = payload;
        return {
            ownDeliveryStore: formatOwnDeliveryStore(ownDeliveryStore, ownDeliveryWindows),
            onDemandDeliveryStore: formatOnDemandDeliverySettings(
                onDemandDeliveryStore,
                onDemandDeliveryWindow,
                doorDashEstimate,
            ),
            deliveryDays,
            turnArounds: {
                ownDeliveryStore: {
                    laundryTurnAroundInHours: ownDeliveryStore.laundryTurnAroundInHours,
                    dryCleaningTurnAroundInHours: ownDeliveryStore.dryCleaningTurnAroundInHours,
                },
                onDemandDeliveryStore: {
                    laundryTurnAroundInHours: onDemandDeliveryStore.laundryTurnAroundInHours,
                    dryCleaningTurnAroundInHours:
                        onDemandDeliveryStore.dryCleaningTurnAroundInHours,
                },
            },
        };
    } catch (error) {
        throw new Error(error.message);
    }
}

module.exports = {
    formatResponse,
};
