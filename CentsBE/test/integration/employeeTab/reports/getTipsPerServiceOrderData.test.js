require('../../../testHelper');
const ChaiHttpRequestHelper = require('../../../support/chaiHttpRequestHelper');
const { generateToken } = require('../../../support/apiTestHelper');
const factory = require('../../../factories');
const { expect } = require('../../../support/chaiHelper');

function getApiEndPoint() {
    return `/api/v1/employee-tab/reports/service-orders/tips`;
}

describe('test getTipsPerServiceOrderData', () => {
    let store,
        token,
        storeCustomer;

    beforeEach(async () => {
        store = await factory.create('store');
        token = generateToken({ id: store.id });
        storeCustomer = await factory.create('storeCustomer');
    });

    it('should throw an error if token is not sent', async () => {
        const res = await ChaiHttpRequestHelper.get(getApiEndPoint()).set('authtoken', '');
        const { error } = JSON.parse(res.text);
        res.should.have.status(401);
        expect(error).to.equal('Please sign in to proceed.');
    });

    it('should get tips per service order data successfully', async () => {
        const serviceOrder = await factory.create('serviceOrder', {
            orderCode: 13,
            netOrderTotal: 10.00,
            tipAmount: 15.00,
            storeCustomerId: storeCustomer.id,
            storeId: store.id,
            status: 'COMPLETED',
            placedAt: '2022-05-10T12:59:32.582Z',
        });
        const orderActivityLog = await factory.create('orderActivityLog', {
            employeeName: 'Alexander',
            orderId: serviceOrder.id,
            status: 'READY_FOR_PROCESSING',
            updatedAt: '2022-05-10T12:59:32.582Z',
        });
        const order = await factory.create('order', {
            orderableType: 'ServiceOrder',
            orderableId: serviceOrder.id,
        });
        const payments = await factory.create('payments', {
            storeId: store.id,
            orderId: order.id,
            status: 'succeeded',
        });

        const res = await ChaiHttpRequestHelper.get(getApiEndPoint(),{
            startDate: '2022-05-09T12:59:32.582Z',
            endDate: '2022-05-11T12:59:32.582Z',
            timeZone: 'America/New_York',
        }).set('authtoken', token);

        res.should.have.status(200);
        expect(res.body).to.have.property('columns');
        expect(res.body).to.have.property('report');
        expect(res.body.report.length).not.to.eq(0);
        expect(res.body.report[0].customerName).to.eq(`${storeCustomer.firstName} ${storeCustomer.lastName}`);
    });

    it('should get tips per service order data successfully if orderType is residential', async () => {
        const serviceOrder = await factory.create('serviceOrder', {
            orderCode: 13,
            netOrderTotal: 10.00,
            tipAmount: 15.00,
            storeCustomerId: storeCustomer.id,
            storeId: store.id,
            status: 'COMPLETED',
            orderType: 'RESIDENTIAL',
            placedAt: '2022-05-10T12:59:32.582Z',
        });
        const orderActivityLog = await factory.create('orderActivityLog', {
            employeeName: 'Alexander',
            orderId: serviceOrder.id,
            status: 'READY_FOR_PROCESSING',
            updatedAt: '2022-05-10T12:59:32.582Z',
        });
        const order = await factory.create('order', {
            orderableType: 'ServiceOrder',
            orderableId: serviceOrder.id,
        });
        const payments = await factory.create('payments', {
            storeId: store.id,
            orderId: order.id,
            status: 'succeeded',
        });

        const res = await ChaiHttpRequestHelper.get(getApiEndPoint(),{
            startDate: '2022-05-09T12:59:32.582Z',
            endDate: '2022-05-11T12:59:32.582Z',
            timeZone: 'America/New_York',
        }).set('authtoken', token);

        res.should.have.status(200);
        expect(res.body).to.have.property('columns');
        expect(res.body).to.have.property('report');
        expect(res.body.report.length).not.to.eq(0);
        expect(res.body.report[0].customerName).to.eq(`${storeCustomer.firstName} ${storeCustomer.lastName}`);
    });

    it('should get tips per service order data successfully if orderType is ONLINE', async () => {
        const serviceOrder = await factory.create('serviceOrder', {
            orderCode: 13,
            netOrderTotal: 10.00,
            tipAmount: 15.00,
            storeCustomerId: storeCustomer.id,
            storeId: store.id,
            status: 'COMPLETED',
            orderType: 'ONLINE',
            placedAt: '2022-05-10T12:59:32.582Z',
        });
        const orderActivityLog = await factory.create('orderActivityLog', {
            employeeName: 'Alexander',
            orderId: serviceOrder.id,
            status: 'READY_FOR_PROCESSING',
            updatedAt: '2022-05-10T12:59:32.582Z',
        });
        const order = await factory.create('order', {
            orderableType: 'ServiceOrder',
            orderableId: serviceOrder.id,
        });
        const payments = await factory.create('payments', {
            storeId: store.id,
            orderId: order.id,
            status: 'succeeded',
        });

        const res = await ChaiHttpRequestHelper.get(getApiEndPoint(),{
            startDate: '2022-05-09T12:59:32.582Z',
            endDate: '2022-05-11T12:59:32.582Z',
            timeZone: 'America/New_York',
        }).set('authtoken', token);

        res.should.have.status(200);
        expect(res.body).to.have.property('columns');
        expect(res.body).to.have.property('report');
        expect(res.body.report.length).not.to.eq(0);
        expect(res.body.report[0].customerName).to.eq(`${storeCustomer.firstName} ${storeCustomer.lastName}`);
    });

    it('should throw an error if params not passed', async () => {
        const res = await ChaiHttpRequestHelper.get(getApiEndPoint(),{}).set('authtoken', token);
        res.should.have.status(500);
    });
});