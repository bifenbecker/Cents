const factory = require('../factories');
const { FACTORIES_NAMES: FN } = require('../constants/factoriesNames');
const { statuses, inventoryOrderStatuses } = require('../../constants/constants');
const sinon = require('sinon');
const InventoryOrder = require('../../models/inventoryOrders');

async function createCompletedInventoryOrderWithItemsAndPayments(storeId, orderItemsData, payment) {
    const orderItems = [];

    const inventoryOrder = await factory.create(FN.inventoryOrder, {
        storeId: storeId,
        createdAt: new Date(),
        status: statuses.COMPLETED,
        netOrderTotal: 0,
    });
    const masterOrder = await factory.create(FN.inventoryOrderMasterOrder, {
        storeId: storeId,
        orderableId: inventoryOrder.id,
    });

    for (const orderItemDataRaw of orderItemsData) {
        const { lineItemTotalCost, categoryId } = orderItemDataRaw;

        const inventory = await factory.create(FN.inventory, {
            categoryId,
        });
        const inventoryItem = await factory.create(FN.inventoryItem, {
            storeId,
            inventoryId: inventory.id,
        });
        const orderItem = await factory.create(FN.inventoryOrderItem, {
            inventoryOrderId: inventoryOrder.id,
            lineItemTotalCost,
            inventoryItemId: inventoryItem.id,
        });

        orderItems.push(orderItem);
    }

    await factory.create(FN.payment, {
        storeId: storeId,
        orderId: masterOrder.id,
        status: 'succeeded',
        ...payment,
    });

    return orderItems;
}

async function createCompletedInventoryOrder({
    storeId,
    netOrderTotal,
    updatedAt,
    tipAmount,
    withEmployee,
}) {
    let inventoryOrder, employeeUser;

    const orderData = {
        storeId: storeId,
        createdAt: new Date(),
        tipAmount,
    };

    if (withEmployee) {
        employeeUser = await factory.create(FN.user, {
            firstname: `FirstName${storeId}`,
            lastname: `LastName${storeId}`,
        });
        employeeUser.fullName = `${employeeUser.firstname} ${employeeUser.lastname}`;

        const teamMember = await factory.create(FN.teamMember, {
            userId: employeeUser.id,
        });
        await factory.create(FN.teamMemberStore, {
            teamMemberId: teamMember.id,
            storeId,
        });
        orderData.employeeId = teamMember.id;
    }

    inventoryOrder = await factory.create(FN.inventoryOrder, orderData);

    // fake timers, so updatedAt will be changed accordingly
    sinon.useFakeTimers(updatedAt.valueOf());

    inventoryOrder = await InventoryOrder.query()
        .findById(inventoryOrder.id)
        .patch({
            status: inventoryOrderStatuses.COMPLETED,
            netOrderTotal,
        })
        .returning('*');

    sinon.restore();

    return { inventoryOrder, employeeUser };
}

module.exports = {
    createCompletedInventoryOrderWithItemsAndPayments,
    createCompletedInventoryOrder,
};
