require('../../../../testHelper');
const getOrdersCountPipeline = require('../../../../../pipeline/employeeApp/orders/getOrdersCountPipeline');
const { expect } = require('../../../../support/chaiHelper');
const factory = require('../../../../factories');
const { FACTORIES_NAMES } = require('../../../../constants/factoriesNames');
const { statuses, inventoryOrderStatuses } = require('../../../../../constants/constants');
const InventoryOrder = require('../../../../../models/inventoryOrders');

async function createServiceOrders(storeId, count = 1, status = statuses.SUBMITTED) {
    await factory.createMany(FACTORIES_NAMES.serviceOrder, count, {
        storeId,
        status,
    });
}

async function createInventoryOrders(storeId, count = 1, status = inventoryOrderStatuses.CREATED) {
    const orders = await factory.createMany(FACTORIES_NAMES.inventoryOrder, count, {
        storeId,
    });
    const ordersIds = orders.map((order) => order.id);

    // model sets status automatically on insert
    // so we need to patch status manually only after creation
    await InventoryOrder.query().findByIds(ordersIds).patch({ status });
}

describe('test getOrdersCountPipeline', () => {
    let store;

    beforeEach(async () => {
        store = await factory.create(FACTORIES_NAMES.store);
    });

    it("should return 0 count if orders weren't created", async () => {
        const payload = {
            storeId: store.id,
        };

        const result = await getOrdersCountPipeline(payload);

        expect(result).to.equal(payload);
        expect(result.totalActiveOrdersCount).to.be.a('number').and.to.equal(0);
    });

    it('should add only active orders count to payload', async () => {
        const serviceOrdersCount = 2,
            inventoryOrdersCount = 3;

        await createServiceOrders(store.id, 2, statuses.COMPLETED);
        await createServiceOrders(store.id, 3, statuses.CANCELLED);
        await createServiceOrders(store.id, serviceOrdersCount);

        await createInventoryOrders(store.id, 1, inventoryOrderStatuses.CANCELLED);
        await createInventoryOrders(store.id, 2, inventoryOrderStatuses.COMPLETED);
        await createInventoryOrders(store.id, inventoryOrdersCount);

        const payload = {
            storeId: store.id,
        };

        const result = await getOrdersCountPipeline(payload);

        expect(result).to.equal(payload);
        expect(result.totalActiveOrdersCount)
            .to.be.a('number')
            .and.to.equal(serviceOrdersCount + inventoryOrdersCount);
    });

    it('should be rejected if invalid store id was passed', async () => {
        const payload = {
            storeId: 'id-123',
        };

        await expect(getOrdersCountPipeline(payload)).to.be.rejected;
    });
});
