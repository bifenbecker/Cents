require('../../../testHelper');
const ChaiHttpRequestHelper = require('../../../support/chaiHttpRequestHelper');
const { generateToken } = require('../../../support/apiTestHelper');
const factory = require('../../../factories');
const { expect } = require('../../../support/chaiHelper');

function getApiEndPoint() {
    return `/api/v1/employee-tab/reports/orders/total/average`;
}

describe('test getAverageCombinedOrderTotals', () => {
    it('should throw an error if token is not sent', async () => {
        const res = await ChaiHttpRequestHelper.get(getApiEndPoint()).set('authtoken', '');
        const { error } = JSON.parse(res.text);
        res.should.have.status(401);
        expect(error).to.equal('Please sign in to proceed.');
    });

    it('should get average combined order totals successfully if status is active', async () => {
        const store = await factory.create('store');
        const token = generateToken({ id: store.id });
        const serviceOrder = await factory.create('serviceOrder', {
            netOrderTotal: 100.00,
            storeId: store.id,
            status: 'SUBMITTED',
            placedAt: '2022-05-10T12:59:32.582Z',
        });
        const inventoryOrder = await factory.create('inventoryOrder', {
            netOrderTotal: 100.00,
            createdAt: '2022-05-10T12:59:32.582Z',
        });
        const order = await factory.create('order', {
            storeId: store.id,
            orderableType: 'ServiceOrder',
            orderableId: serviceOrder.id,
        });
        const newOrder = await factory.create('order', {
            storeId: store.id,
            orderableType: 'InventoryOrder',
            orderableId: inventoryOrder.id,
        });

        const res = await ChaiHttpRequestHelper.get(getApiEndPoint(),{
            startDate: '2022-05-09T12:59:32.582Z',
            endDate: '2022-05-11T12:59:32.582Z',
            timeZone: 'America/New_York',
            status: 'ACTIVE',
        }).set('authtoken', token);

        res.should.have.status(200);
        expect(res.body).to.have.property('columns');
        expect(res.body).to.have.property('report');
        expect(res.body.report.length).not.to.eq(0);
        expect(res.body.report[0].storeName).to.eq(store.name);
        expect(res.body.report[0].inventoryOrderTotals).contain(inventoryOrder.netOrderTotal);
        expect(res.body.report[0].serviceOrderTotals).contain(serviceOrder.netOrderTotal);
    });

    it('should get average combined order totals successfully if status is completed and active', async () => {
        const store = await factory.create('store');
        const token = generateToken({ id: store.id });
        const serviceOrder = await factory.create('serviceOrder', {
            netOrderTotal: 100.00,
            storeId: store.id,
            status: 'COMPLETED',
            placedAt: '2022-05-10T12:59:32.582Z',
        });
        const inventoryOrder = await factory.create('inventoryOrder', {
            netOrderTotal: 125.00,
            createdAt: '2022-05-10T12:59:32.582Z',
        });
        const order = await factory.create('order', {
            storeId: store.id,
            orderableType: 'ServiceOrder',
            orderableId: serviceOrder.id,
        });
        const newOrder = await factory.create('order', {
            storeId: store.id,
            orderableType: 'InventoryOrder',
            orderableId: inventoryOrder.id,
        });

        const res = await ChaiHttpRequestHelper.get(getApiEndPoint(),{
            startDate: '2022-05-09T12:59:32.582Z',
            endDate: '2022-05-11T12:59:32.582Z',
            timeZone: 'America/New_York',
            status: 'COMPLETED_AND_ACTIVE',
        }).set('authtoken', token);

        res.should.have.status(200);
        expect(res.body).to.have.property('columns');
        expect(res.body).to.have.property('report');
        expect(res.body.report.length).not.to.eq(0);
        expect(res.body.report[0].storeName).to.eq(store.name);
        expect(res.body.report[0].inventoryOrderTotals).contain(inventoryOrder.netOrderTotal);
        expect(res.body.report[0].serviceOrderTotals).contain(serviceOrder.netOrderTotal);
    });

    it('should get average combined order totals successfully if status is completed', async () => {
        const store = await factory.create('store');
        const token = generateToken({ id: store.id });
        const serviceOrder = await factory.create('serviceOrder', {
            netOrderTotal: 100.00,
            storeId: store.id,
            status: 'COMPLETED',
            placedAt: '2022-05-10T12:59:32.582Z',
        });
        const inventoryOrder = await factory.create('inventoryOrder', {
            netOrderTotal: 100.00,
            createdAt: '2022-05-10T12:59:32.582Z',
        });
        const order = await factory.create('order', {
            storeId: store.id,
            orderableType: 'ServiceOrder',
            orderableId: serviceOrder.id,
        });
        const newOrder = await factory.create('order', {
            storeId: store.id,
            orderableType: 'InventoryOrder',
            orderableId: inventoryOrder.id,
        });

        const res = await ChaiHttpRequestHelper.get(getApiEndPoint(),{
            startDate: '2022-05-09T12:59:32.582Z',
            endDate: '2022-05-11T12:59:32.582Z',
            timeZone: 'America/New_York',
            status: 'COMPLETED',
        }).set('authtoken', token);

        res.should.have.status(200);
        expect(res.body).to.have.property('columns');
        expect(res.body).to.have.property('report');
        expect(res.body.report.length).not.to.eq(0);
        expect(res.body.report[0].storeName).to.eq(store.name);
        expect(res.body.report[0].inventoryOrderTotals).contain(inventoryOrder.netOrderTotal);
        expect(res.body.report[0].serviceOrderTotals).contain(serviceOrder.netOrderTotal);
    });

    it('should throw an error if params not passed', async () => {
        const store = await factory.create('store');
        const token = generateToken({ id: store.id });
        const res = await ChaiHttpRequestHelper.get(getApiEndPoint(),{}).set('authtoken', token);
        res.should.have.status(500);
    });
});