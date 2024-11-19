require('../../../testHelper');
const { expect } = require('../../../support/chaiHelper');
const factory = require('../../../factories');
const { FACTORIES_NAMES } = require('../../../constants/factoriesNames');
const { statuses, inventoryOrderStatuses } = require('../../../../constants/constants');
const InventoryOrder = require('../../../../models/inventoryOrders');
const { generateToken } = require('../../../support/apiTestHelper');
const {
    assertGetResponseError,
    assertGetResponseSuccess,
    itShouldCorrectlyAssertTokenPresense,
} = require('../../../support/httpRequestsHelper');

const apiEndPoint = '/api/v1/employee-tab/orders/order-count';

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

describe('test orderController api', () => {
    let store, token;

    beforeEach(async () => {
        store = await factory.create(FACTORIES_NAMES.store);
        token = generateToken({ id: store.id });
    });

    itShouldCorrectlyAssertTokenPresense(assertGetResponseError, () => apiEndPoint);

    it("should return 0 count if orders weren't created", async () => {
        const result = await assertGetResponseSuccess({
            url: apiEndPoint,
            token,
        });

        expect(result.body).to.be.an('object');
        expect(result.body.success).to.be.true;
        expect(result.body.activeOrderCount).to.be.a('number').and.to.equal(0);
    });

    it('should return only active orders', async () => {
        const serviceOrdersCount = 2,
            inventoryOrdersCount = 3;

        await createServiceOrders(store.id, 2, statuses.COMPLETED);
        await createServiceOrders(store.id, 3, statuses.CANCELLED);
        await createServiceOrders(store.id, serviceOrdersCount);

        await createInventoryOrders(store.id, 1, inventoryOrderStatuses.CANCELLED);
        await createInventoryOrders(store.id, 2, inventoryOrderStatuses.COMPLETED);
        await createInventoryOrders(store.id, inventoryOrdersCount);

        const result = await assertGetResponseSuccess({
            url: apiEndPoint,
            token,
        });

        expect(result.body).to.be.an('object');
        expect(result.body.success).to.be.true;
        expect(result.body.activeOrderCount)
            .to.be.a('number')
            .and.to.equal(serviceOrdersCount + inventoryOrdersCount);
    });
});
