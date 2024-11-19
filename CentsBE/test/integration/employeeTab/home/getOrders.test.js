require('../../../testHelper');
const ChaiHttpRequestHepler = require('../../../support/chaiHttpRequestHelper')
const { generateToken } = require('../../../support/apiTestHelper')
const factory = require('../../../factories')
const { expect } = require('../../../support/chaiHelper');
const { FACTORIES_NAMES: FN } = require('../../../constants/factoriesNames');
const { statuses } = require('../../../../constants/constants');
const { 
    itShouldCorrectlyAssertTokenPresense,
    assertGetResponseError,
 } = require('../../../support/httpRequestsHelper');

describe('test getOrders', () => {
    let store, token;
    const apiEndPoint = '/api/v1/employee-tab/home/orders';

    beforeEach(async () => {
        store = await factory.create(FN.store)
        token = generateToken({
            id: store.id,
        });
    });

    itShouldCorrectlyAssertTokenPresense(
        assertGetResponseError,
        () => apiEndPoint,
    );

    it(`should return empty array when orders don't exist`, async () => {
        const res =  await ChaiHttpRequestHepler.get(apiEndPoint, {})
        .set('authtoken', token);
        res.should.have.status(200);
        expect(res.body).to.have.property('success').to.equal(true);
        expect(res.body).to.have.property('activeOrders').to.be.empty;
    });

    
    describe('when orders exist', () => {
        let serviceOrder, order;

        beforeEach(async () => {
            store = await factory.create(FN.store, {
                isHub: true,
            })
            token = generateToken({
                id: store.id,
            });
            serviceOrder = await factory.create(FN.serviceOrder, {
                storeId: store.id,
                hubId: store.id,
                status: statuses.SUBMITTED,
            });
            order = await factory.create(FN.order, {
                orderableType: 'ServiceOrder',
                orderableId: serviceOrder.id,
            });
        });

        it('should return SUBMITTED and PROCESSING orders', async () => {
            const processingServiceOrder = await factory.create(FN.serviceOrder, {
                storeId: store.id,
                hubId: store.id,
                status: statuses.PROCESSING,
            });
            // create orderMaster for processing serviceOrder
            await factory.create(FN.order, {
                orderableType: 'ServiceOrder',
                orderableId: processingServiceOrder.id,
            });
            const res =  await ChaiHttpRequestHepler.get(apiEndPoint, {
                status: `${statuses.SUBMITTED},${statuses.PROCESSING}`,
            })
            .set('authtoken', token);

            res.should.have.status(200);
            expect(res.body).to.have.property('success').to.equal(true);
            expect(res.body).to.have.property('activeOrders').to.not.be.empty;
            expect(res.body.activeOrders.length).to.equal(2);
        });

        it('should return orders when store is hub', async () => {
            const res =  await ChaiHttpRequestHepler.get(apiEndPoint, {
                orderBy: 'location',
            })
            .set('authtoken', token);

            res.should.have.status(200);
            expect(res.body).to.have.property('success').to.equal(true);
            expect(res.body).to.have.property('activeOrders').to.not.be.empty;
            expect(res.body.activeOrders[0].id).to.equal(serviceOrder.id);
            expect(res.body.activeOrders[0].orderId).to.equal(order.id);
        });
    });
    
    describe('test getAllOrders', () => {
        let serviceOrder, order;
        const apiEndPointHistory = '/api/v1/employee-tab/home/orders-history';

        beforeEach(async () => {
            serviceOrder = await factory.create(FN.serviceOrder, {
                storeId: store.id,
                status: statuses.CANCELLED,
            });
            order = await factory.create(FN.order, {
                orderableType: 'ServiceOrder',
                orderableId: serviceOrder.id,
            });
        });

        it('should return canceled and completed orders', async () => {
            const res =  await ChaiHttpRequestHepler.get(apiEndPointHistory)
            .set('authtoken', token);
            res.should.have.status(200);

            expect(res.body).to.have.property('success').to.equal(true);
            expect(res.body).to.have.property('orders').to.not.be.empty;
            expect(res.body.orders[0].id).to.equal(serviceOrder.id);
            expect(res.body.orders[0].orderId).to.equal(order.id);
        });
    });
})

