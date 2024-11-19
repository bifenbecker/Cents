exports.up = async function (knex) {
    await Promise.all([
        knex.schema.table('payments', function (table) {
            table.dropIndex(['orderId', 'storeCustomerId', 'storeId']);
        }),
        knex.schema.table('orderDeliveries', function (table) {
            table.dropIndex([
                'orderId',
                'timingsId',
                'storeId',
                'storeCustomerId',
                'centsCustomerAddressId',
            ]);
        }),
        knex.schema.table('orderActivityLog', function (table) {
            table.dropIndex(['orderId', 'teamMemberId']);
        }),
        knex.schema.table('serviceOrders', function (table) {
            table.dropIndex(['storeId', 'hubId']);
        }),
        knex.schema.table('itemWeights', function (table) {
            table.dropIndex(['teamMemberId', 'orderItemId']);
        }),
        knex.schema.table('storeCustomers', function (table) {
            table.dropIndex(['centsCustomerId', 'storeId', 'businessId']);
        }),
        knex.schema.table('teamMembers', function (table) {
            table.dropIndex(['userId', 'businessId']);
        }),
        knex.schema.table('orderNotificationLogs', function (table) {
            table.dropIndex(['orderId', 'languageId']);
        }),
        knex.schema.table('inventoryOrders', function (table) {
            table.dropIndex(['employeeId', 'storeId', 'storeCustomerId']);
        }),
        knex.schema.table('inventoryOrderLineItems', function (table) {
            table.dropIndex(['inventoryOrderId', 'inventoryItemId', 'taxRateId']);
        }),
        knex.schema.table('inventoryItems', function (table) {
            table.dropIndex(['inventoryId', 'storeId']);
        }),
        knex.schema.table('orderAdjustmentLog', function (table) {
            table.dropIndex(['serviceOrderId', 'teamMemberId']);
        }),
        knex.schema.table('routeDeliveryActivityLogs', function (table) {
            table.dropIndex(['routeDeliveryId', 'driverId']);
        }),
        knex.schema.table('serviceModifiers', function (table) {
            table.dropIndex(['modifierId', 'serviceId']);
        }),
        knex.schema.table('serviceOrderRouteDeliveries', function (table) {
            table.dropIndex(['serviceOrderId', 'routeDeliveryId']);
        }),
        knex.schema.table('servicePrices', function (table) {
            table.dropIndex(['storeId', 'serviceId']);
        }),
        knex.schema.table('storePromotionPrograms', function (table) {
            table.dropIndex(['storeId', 'businessId', 'businessPromotionProgramId']);
        }),
        knex.schema.table('taskTimings', function (table) {
            table.dropIndex(['taskId', 'timingsId']);
        }),
        knex.schema.table('teamMembersCheckIn', function (table) {
            table.dropIndex(['teamMemberId', 'storeId', 'shiftId']);
        }),
        knex.schema.table('teamMemberStores', function (table) {
            table.dropIndex(['teamMemberId', 'storeId']);
        }),
        knex.schema.table('userRoles', function (table) {
            table.dropIndex(['userId', 'roleId']);
        }),
    ]);
    await Promise.all([
        knex.schema.table('payments', function (table) {
            table.index(['orderId']);
        }),
        knex.schema.table('payments', function (table) {
            table.index(['storeCustomerId']);
        }),
        knex.schema.table('payments', function (table) {
            table.index(['storeId']);
        }),
        knex.schema.table('orderDeliveries', function (table) {
            table.index(['orderId']);
        }),
        knex.schema.table('orderDeliveries', function (table) {
            table.index(['timingsId']);
        }),
        knex.schema.table('orderDeliveries', function (table) {
            table.index(['storeId']);
        }),
        knex.schema.table('orderDeliveries', function (table) {
            table.index(['storeCustomerId']);
        }),
        knex.schema.table('orderDeliveries', function (table) {
            table.index(['centsCustomerAddressId']);
        }),
        knex.schema.table('orderActivityLog', function (table) {
            table.index(['orderId']);
        }),
        knex.schema.table('orderActivityLog', function (table) {
            table.index(['teamMemberId']);
        }),
        knex.schema.table('serviceOrders', function (table) {
            table.index(['storeId']);
        }),
        knex.schema.table('serviceOrders', function (table) {
            table.index(['hubId']);
        }),
        knex.schema.table('itemWeights', function (table) {
            table.index(['teamMemberId']);
        }),
        knex.schema.table('itemWeights', function (table) {
            table.index(['orderItemId']);
        }),
        knex.schema.table('storeCustomers', function (table) {
            table.index(['centsCustomerId']);
        }),
        knex.schema.table('storeCustomers', function (table) {
            table.index(['storeId']);
        }),
        knex.schema.table('storeCustomers', function (table) {
            table.index(['businessId']);
        }),
        knex.schema.table('teamMembers', function (table) {
            table.index(['userId']);
        }),
        knex.schema.table('teamMembers', function (table) {
            table.index(['businessId']);
        }),
        knex.schema.table('orderNotificationLogs', function (table) {
            table.index(['orderId']);
        }),
        knex.schema.table('orderNotificationLogs', function (table) {
            table.index(['languageId']);
        }),
        knex.schema.table('inventoryOrders', function (table) {
            table.index(['employeeId']);
        }),
        knex.schema.table('inventoryOrders', function (table) {
            table.index(['storeId']);
        }),
        knex.schema.table('inventoryOrders', function (table) {
            table.index(['storeCustomerId']);
        }),
        knex.schema.table('inventoryOrderLineItems', function (table) {
            table.index(['inventoryItemId']);
        }),
        knex.schema.table('inventoryOrderLineItems', function (table) {
            table.index(['inventoryOrderId']);
        }),
        knex.schema.table('inventoryOrderLineItems', function (table) {
            table.index(['taxRateId']);
        }),
        knex.schema.table('inventoryItems', function (table) {
            table.index(['storeId']);
        }),
        knex.schema.table('inventoryItems', function (table) {
            table.index(['inventoryId']);
        }),
        knex.schema.table('orderAdjustmentLog', function (table) {
            table.index(['teamMemberId']);
        }),
        knex.schema.table('orderAdjustmentLog', function (table) {
            table.index(['serviceOrderId']);
        }),
        knex.schema.table('routeDeliveryActivityLogs', function (table) {
            table.index(['routeDeliveryId']);
        }),
        knex.schema.table('routeDeliveryActivityLogs', function (table) {
            table.index(['driverId']);
        }),
        knex.schema.table('serviceModifiers', function (table) {
            table.index(['modifierId']);
        }),
        knex.schema.table('serviceModifiers', function (table) {
            table.index(['serviceId']);
        }),
        knex.schema.table('serviceOrderRouteDeliveries', function (table) {
            table.index(['serviceOrderId']);
        }),
        knex.schema.table('serviceOrderRouteDeliveries', function (table) {
            table.index(['routeDeliveryId']);
        }),
        knex.schema.table('servicePrices', function (table) {
            table.index(['storeId']);
        }),
        knex.schema.table('servicePrices', function (table) {
            table.index(['serviceId']);
        }),
        knex.schema.table('storePromotionPrograms', function (table) {
            table.index(['storeId']);
        }),
        knex.schema.table('storePromotionPrograms', function (table) {
            table.index(['businessId']);
        }),
        knex.schema.table('storePromotionPrograms', function (table) {
            table.index(['businessPromotionProgramId']);
        }),
        knex.schema.table('taskTimings', function (table) {
            table.index(['taskId']);
        }),
        knex.schema.table('taskTimings', function (table) {
            table.index(['timingsId']);
        }),
        knex.schema.table('teamMembersCheckIn', function (table) {
            table.index(['shiftId']);
        }),
        knex.schema.table('teamMembersCheckIn', function (table) {
            table.index(['storeId']);
        }),
        knex.schema.table('teamMembersCheckIn', function (table) {
            table.index(['teamMemberId']);
        }),
        knex.schema.table('teamMemberStores', function (table) {
            table.index(['storeId']);
        }),
        knex.schema.table('teamMemberStores', function (table) {
            table.index(['teamMemberId']);
        }),
        knex.schema.table('userRoles', function (table) {
            table.index(['roleId']);
        }),
        knex.schema.table('userRoles', function (table) {
            table.index(['userId']);
        }),
    ]);
};

exports.down = async function (knex) {
    await Promise.all([
        knex.schema.table('payments', function (table) {
            table.index(['orderId', 'storeCustomerId', 'storeId']);
        }),
        knex.schema.table('orderDeliveries', function (table) {
            table.index([
                'orderId',
                'timingsId',
                'storeId',
                'storeCustomerId',
                'centsCustomerAddressId',
            ]);
        }),
        knex.schema.table('orderActivityLog', function (table) {
            table.index(['orderId', 'teamMemberId']);
        }),
        knex.schema.table('serviceOrders', function (table) {
            table.index(['storeId', 'hubId']);
        }),
        knex.schema.table('itemWeights', function (table) {
            table.index(['teamMemberId', 'orderItemId']);
        }),
        knex.schema.table('storeCustomers', function (table) {
            table.index(['centsCustomerId', 'storeId', 'businessId']);
        }),
        knex.schema.table('teamMembers', function (table) {
            table.index(['userId', 'businessId']);
        }),
        knex.schema.table('orderNotificationLogs', function (table) {
            table.index(['orderId', 'languageId']);
        }),
        knex.schema.table('inventoryOrders', function (table) {
            table.index(['employeeId', 'storeId', 'storeCustomerId']);
        }),
        knex.schema.table('inventoryOrderLineItems', function (table) {
            table.index(['inventoryOrderId', 'inventoryItemId', 'taxRateId']);
        }),
        knex.schema.table('inventoryItems', function (table) {
            table.index(['inventoryId', 'storeId']);
        }),
        knex.schema.table('orderAdjustmentLog', function (table) {
            table.index(['serviceOrderId', 'teamMemberId']);
        }),
        knex.schema.table('routeDeliveryActivityLogs', function (table) {
            table.index(['routeDeliveryId', 'driverId']);
        }),
        knex.schema.table('serviceModifiers', function (table) {
            table.index(['modifierId', 'serviceId']);
        }),
        knex.schema.table('serviceOrderRouteDeliveries', function (table) {
            table.index(['serviceOrderId', 'routeDeliveryId']);
        }),
        knex.schema.table('servicePrices', function (table) {
            table.index(['storeId', 'serviceId']);
        }),
        knex.schema.table('storePromotionPrograms', function (table) {
            table.index(['storeId', 'businessId', 'businessPromotionProgramId']);
        }),
        knex.schema.table('taskTimings', function (table) {
            table.index(['taskId', 'timingsId']);
        }),
        knex.schema.table('teamMembersCheckIn', function (table) {
            table.index(['teamMemberId', 'storeId', 'shiftId']);
        }),
        knex.schema.table('teamMemberStores', function (table) {
            table.index(['teamMemberId', 'storeId']);
        }),
        knex.schema.table('userRoles', function (table) {
            table.index(['userId', 'roleId']);
        }),
    ]);
    await Promise.all([
        knex.schema.table('payments', function (table) {
            table.dropIndex(['orderId']);
        }),
        knex.schema.table('payments', function (table) {
            table.dropIndex(['storeCustomerId']);
        }),
        knex.schema.table('payments', function (table) {
            table.dropIndex(['storeId']);
        }),
        knex.schema.table('orderDeliveries', function (table) {
            table.dropIndex(['orderId']);
        }),
        knex.schema.table('orderDeliveries', function (table) {
            table.dropIndex(['timingsId']);
        }),
        knex.schema.table('orderDeliveries', function (table) {
            table.dropIndex(['storeId']);
        }),
        knex.schema.table('orderDeliveries', function (table) {
            table.dropIndex(['storeCustomerId']);
        }),
        knex.schema.table('orderDeliveries', function (table) {
            table.dropIndex(['centsCustomerAddressId']);
        }),
        knex.schema.table('orderActivityLog', function (table) {
            table.dropIndex(['orderId']);
        }),
        knex.schema.table('orderActivityLog', function (table) {
            table.dropIndex(['teamMemberId']);
        }),
        knex.schema.table('serviceOrders', function (table) {
            table.dropIndex(['storeId']);
        }),
        knex.schema.table('serviceOrders', function (table) {
            table.dropIndex(['hubId']);
        }),
        knex.schema.table('itemWeights', function (table) {
            table.dropIndex(['teamMemberId']);
        }),
        knex.schema.table('itemWeights', function (table) {
            table.dropIndex(['orderItemId']);
        }),
        knex.schema.table('storeCustomers', function (table) {
            table.dropIndex(['centsCustomerId']);
        }),
        knex.schema.table('storeCustomers', function (table) {
            table.dropIndex(['storeId']);
        }),
        knex.schema.table('storeCustomers', function (table) {
            table.dropIndex(['businessId']);
        }),
        knex.schema.table('teamMembers', function (table) {
            table.dropIndex(['userId']);
        }),
        knex.schema.table('teamMembers', function (table) {
            table.dropIndex(['businessId']);
        }),
        knex.schema.table('orderNotificationLogs', function (table) {
            table.dropIndex(['orderId']);
        }),
        knex.schema.table('orderNotificationLogs', function (table) {
            table.dropIndex(['languageId']);
        }),
        knex.schema.table('inventoryOrders', function (table) {
            table.dropIndex(['employeeId']);
        }),
        knex.schema.table('inventoryOrders', function (table) {
            table.dropIndex(['storeId']);
        }),
        knex.schema.table('inventoryOrders', function (table) {
            table.dropIndex(['storeCustomerId']);
        }),
        knex.schema.table('inventoryOrderLineItems', function (table) {
            table.dropIndex(['inventoryItemId']);
        }),
        knex.schema.table('inventoryOrderLineItems', function (table) {
            table.dropIndex(['inventoryOrderId']);
        }),
        knex.schema.table('inventoryOrderLineItems', function (table) {
            table.dropIndex(['taxRateId']);
        }),
        knex.schema.table('inventoryItems', function (table) {
            table.dropIndex(['storeId']);
        }),
        knex.schema.table('inventoryItems', function (table) {
            table.dropIndex(['inventoryId']);
        }),
        knex.schema.table('orderAdjustmentLog', function (table) {
            table.dropIndex(['teamMemberId']);
        }),
        knex.schema.table('orderAdjustmentLog', function (table) {
            table.dropIndex(['serviceOrderId']);
        }),
        knex.schema.table('routeDeliveryActivityLogs', function (table) {
            table.dropIndex(['routeDeliveryId']);
        }),
        knex.schema.table('routeDeliveryActivityLogs', function (table) {
            table.dropIndex(['driverId']);
        }),
        knex.schema.table('serviceModifiers', function (table) {
            table.dropIndex(['modifierId']);
        }),
        knex.schema.table('serviceModifiers', function (table) {
            table.dropIndex(['serviceId']);
        }),
        knex.schema.table('serviceOrderRouteDeliveries', function (table) {
            table.dropIndex(['serviceOrderId']);
        }),
        knex.schema.table('serviceOrderRouteDeliveries', function (table) {
            table.dropIndex(['routeDeliveryId']);
        }),
        knex.schema.table('servicePrices', function (table) {
            table.dropIndex(['storeId']);
        }),
        knex.schema.table('servicePrices', function (table) {
            table.dropIndex(['serviceId']);
        }),
        knex.schema.table('storePromotionPrograms', function (table) {
            table.dropIndex(['storeId']);
        }),
        knex.schema.table('storePromotionPrograms', function (table) {
            table.dropIndex(['businessId']);
        }),
        knex.schema.table('storePromotionPrograms', function (table) {
            table.dropIndex(['businessPromotionProgramId']);
        }),
        knex.schema.table('taskTimings', function (table) {
            table.dropIndex(['taskId']);
        }),
        knex.schema.table('taskTimings', function (table) {
            table.dropIndex(['timingsId']);
        }),
        knex.schema.table('teamMembersCheckIn', function (table) {
            table.dropIndex(['shiftId']);
        }),
        knex.schema.table('teamMembersCheckIn', function (table) {
            table.dropIndex(['storeId']);
        }),
        knex.schema.table('teamMembersCheckIn', function (table) {
            table.dropIndex(['teamMemberId']);
        }),
        knex.schema.table('teamMemberStores', function (table) {
            table.dropIndex(['storeId']);
        }),
        knex.schema.table('teamMemberStores', function (table) {
            table.dropIndex(['teamMemberId']);
        }),
        knex.schema.table('userRoles', function (table) {
            table.dropIndex(['roleId']);
        }),
        knex.schema.table('userRoles', function (table) {
            table.dropIndex(['userId']);
        }),
    ]);
};
