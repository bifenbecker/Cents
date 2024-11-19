exports.up = async function (knex) {
    await Promise.all([
        knex.schema.table('payments', function (table) {
            table.index(['orderId', 'storeCustomerId', 'storeId']);
        }),
        knex.schema.table('orderPromoDetails', function (table) {
            table.index(['orderId']);
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
        knex.schema.table('serviceOrderItems', function (table) {
            table.index(['orderId']);
        }),
        knex.schema.table('serviceOrderBags', function (table) {
            table.index(['serviceOrderId']);
        }),
        knex.schema.table('orderActivityLog', function (table) {
            table.index(['orderId', 'teamMemberId']);
        }),
        knex.schema.table('serviceOrderWeights', function (table) {
            table.index(['serviceOrderId']);
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
        knex.schema.table('orders', function (table) {
            table.index(['storeId']);
        }),
        knex.schema.table('teamMembers', function (table) {
            table.index(['userId', 'businessId']);
        }),
        knex.schema.table('orderNotificationLogs', function (table) {
            table.index(['orderId', 'languageId']);
        }),
        knex.schema.table('serviceReferenceItems', function (table) {
            table.index(['orderItemId']);
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
        knex.schema.table('serviceReferenceItemDetails', function (table) {
            table.index(['serviceReferenceItemId']);
        }),
        knex.schema.table('centsCustomerAddresses', function (table) {
            table.index(['centsCustomerId']);
        }),
        knex.schema.table('esdReaders', function (table) {
            table.index(['storeId']);
        }),
        knex.schema.table('inventory', function (table) {
            table.index(['categoryId']);
        }),
        knex.schema.table('inventoryCategories', function (table) {
            table.index(['businessId']);
        }),
        knex.schema.table('laundromatBusiness', function (table) {
            table.index(['userId']);
        }),
        knex.schema.table('orderAdjustmentLog', function (table) {
            table.index(['serviceOrderId', 'teamMemberId']);
        }),
        knex.schema.table('ownDeliverySettings', function (table) {
            table.index(['storeId']);
        }),
        knex.schema.table('routeDeliveries', function (table) {
            table.index(['routeId']);
        }),
        knex.schema.table('routeDeliveryActivityLogs', function (table) {
            table.index(['routeDeliveryId', 'driverId']);
        }),
        knex.schema.table('serviceCategories', function (table) {
            table.index(['businessId']);
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
        knex.schema.table('servicesMaster', function (table) {
            table.index(['serviceCategoryId']);
        }),
        knex.schema.table('shifts', function (table) {
            table.index(['storeId']);
        }),
        knex.schema.table('storePromotionPrograms', function (table) {
            table.index(['storeId', 'businessId', 'businessPromotionProgramId']);
        }),
        knex.schema.table('stores', function (table) {
            table.index(['businessId']);
        }),
        knex.schema.table('storeThemes', function (table) {
            table.index(['storeId']);
        }),
        knex.schema.table('tasks', function (table) {
            table.index(['businessId']);
        }),
        knex.schema.table('taskTimings', function (table) {
            table.index(['taskId', 'timingsId']);
        }),
        knex.schema.table('taxRates', function (table) {
            table.index(['businessId']);
        }),
        knex.schema.table('teamMembersCheckIn', function (table) {
            table.index(['teamMemberId', 'storeId', 'shiftId']);
        }),
        knex.schema.table('teamMemberStores', function (table) {
            table.index(['teamMemberId', 'storeId']);
        }),
        knex.schema.table('timings', function (table) {
            table.index(['shiftId']);
        }),
        knex.schema.table('tipSettings', function (table) {
            table.index(['businessId']);
        }),
        knex.schema.table('userRoles', function (table) {
            table.index(['userId', 'roleId']);
        }),
        knex.schema.table('users', function (table) {
            table.index(['languageId']);
        }),
    ]);
};

exports.down = async function (knex) {
    await Promise.all([
        knex.schema.table('payments', function (table) {
            table.dropIndex(['orderId', 'storeCustomerId', 'storeId']);
        }),
        knex.schema.table('orderPromoDetails', function (table) {
            table.dropIndex(['orderId']);
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
        knex.schema.table('serviceOrderItems', function (table) {
            table.dropIndex(['orderId']);
        }),
        knex.schema.table('serviceOrderBags', function (table) {
            table.dropIndex(['serviceOrderId']);
        }),
        knex.schema.table('orderActivityLog', function (table) {
            table.dropIndex(['orderId', 'teamMemberId']);
        }),
        knex.schema.table('serviceOrderWeights', function (table) {
            table.dropIndex(['serviceOrderId']);
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
        knex.schema.table('orders', function (table) {
            table.dropIndex(['storeId']);
        }),
        knex.schema.table('teamMembers', function (table) {
            table.dropIndex(['userId', 'businessId']);
        }),
        knex.schema.table('orderNotificationLogs', function (table) {
            table.dropIndex(['orderId', 'languageId']);
        }),
        knex.schema.table('serviceReferenceItems', function (table) {
            table.dropIndex(['orderItemId']);
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
        knex.schema.table('serviceReferenceItemDetails', function (table) {
            table.dropIndex(['serviceReferenceItemId']);
        }),
        knex.schema.table('centsCustomerAddresses', function (table) {
            table.dropIndex(['centsCustomerId']);
        }),
        knex.schema.table('esdReaders', function (table) {
            table.dropIndex(['storeId']);
        }),
        knex.schema.table('inventory', function (table) {
            table.dropIndex(['categoryId']);
        }),
        knex.schema.table('inventoryCategories', function (table) {
            table.dropIndex(['businessId']);
        }),
        knex.schema.table('laundromatBusiness', function (table) {
            table.dropIndex(['userId']);
        }),
        knex.schema.table('orderAdjustmentLog', function (table) {
            table.dropIndex(['serviceOrderId', 'teamMemberId']);
        }),
        knex.schema.table('ownDeliverySettings', function (table) {
            table.dropIndex(['storeId']);
        }),
        knex.schema.table('routeDeliveries', function (table) {
            table.dropIndex(['routeId']);
        }),
        knex.schema.table('routeDeliveryActivityLogs', function (table) {
            table.dropIndex(['routeDeliveryId', 'driverId']);
        }),
        knex.schema.table('serviceCategories', function (table) {
            table.dropIndex(['businessId']);
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
        knex.schema.table('servicesMaster', function (table) {
            table.dropIndex(['serviceCategoryId']);
        }),
        knex.schema.table('shifts', function (table) {
            table.dropIndex(['storeId']);
        }),
        knex.schema.table('storePromotionPrograms', function (table) {
            table.dropIndex(['storeId', 'businessId', 'businessPromotionProgramId']);
        }),
        knex.schema.table('stores', function (table) {
            table.dropIndex(['businessId']);
        }),
        knex.schema.table('storeThemes', function (table) {
            table.dropIndex(['storeId']);
        }),
        knex.schema.table('tasks', function (table) {
            table.dropIndex(['businessId']);
        }),
        knex.schema.table('taskTimings', function (table) {
            table.dropIndex(['taskId', 'timingsId']);
        }),
        knex.schema.table('taxRates', function (table) {
            table.dropIndex(['businessId']);
        }),
        knex.schema.table('teamMembersCheckIn', function (table) {
            table.dropIndex(['teamMemberId', 'storeId', 'shiftId']);
        }),
        knex.schema.table('teamMemberStores', function (table) {
            table.dropIndex(['teamMemberId', 'storeId']);
        }),
        knex.schema.table('timings', function (table) {
            table.dropIndex(['shiftId']);
        }),
        knex.schema.table('tipSettings', function (table) {
            table.dropIndex(['businessId']);
        }),
        knex.schema.table('userRoles', function (table) {
            table.dropIndex(['userId', 'roleId']);
        }),
        knex.schema.table('users', function (table) {
            table.dropIndex(['languageId']);
        }),
    ]);
};
