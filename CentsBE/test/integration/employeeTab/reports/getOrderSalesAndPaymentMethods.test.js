require('../../../testHelper');
const ChaiHttpRequestHelper = require('../../../support/chaiHttpRequestHelper');
const { generateToken } = require('../../../support/apiTestHelper');
const factory = require('../../../factories');
const { expect } = require('../../../support/chaiHelper');

function getApiEndPoint() {
    return `/api/v1/employee-tab/reports/payments/sales`;
}

describe('test getOrderSalesAndPaymentMethods', () => {
    it('should throw an error if token is not sent', async () => {
        const res = await ChaiHttpRequestHelper.get(getApiEndPoint()).set('authtoken', '');
        const { error } = JSON.parse(res.text);
        res.should.have.status(401);
        expect(error).to.equal('Please sign in to proceed.');
    });

    it('should get order sales and payment methods successfully if orderableType is ServiceOrder', async () => {
        const store = await factory.create('store');
        const token = generateToken({ id: store.id });
        const user = await factory.create('user');
        const teamMember = await factory.create('teamMember', {
            userId: user.id,
        });
        const serviceOrder = await factory.create('serviceOrder', {
            employeeCode: teamMember.id,
            orderCode: '13',
            orderType: 'SERVICE',
        });
        const order = await factory.create('order', {
            orderableType: 'ServiceOrder',
            orderableId: serviceOrder.id,
            storeId: store.id,
        });
        const payments = await factory.create('payments', {
            storeId: store.id,
            orderId: order.id,
            appliedAmount: 500.0,
            paymentProcessor: 'cash',
            status: 'succeeded',
            createdAt: '2022-05-10T12:59:32.582Z',
        });

        const res = await ChaiHttpRequestHelper.get(getApiEndPoint(), {
            startDate: '2022-05-09T12:59:32.582Z',
            endDate: '2022-05-11T12:59:32.582Z',
            timeZone: 'America/New_York',
        }).set('authtoken', token);

        res.should.have.status(200);
        expect(res.body).to.have.property('columns');
        expect(res.body).to.have.property('report');
        expect(res.body.report.length).not.to.eq(0);
        expect(res.body.report[0].employee).to.eq(`${user.firstname} ${user.lastname}`);
    });

    it('should get order sales and payment methods successfully if orderableType is InventoryOrder', async () => {
        const store = await factory.create('store');
        const token = generateToken({ id: store.id });
        const user = await factory.create('user');
        const teamMember = await factory.create('teamMember', {
            userId: user.id,
        });
        const inventoryOrder = await factory.create('inventoryOrder', {
            employeeId: teamMember.id,
            orderCode: '13',
        });
        const order = await factory.create('order', {
            orderableId: inventoryOrder.id,
            orderableType: 'InventoryOrder',
            storeId: store.id,
        });
        const payments = await factory.create('payments', {
            storeId: store.id,
            orderId: order.id,
            appliedAmount: 300.0,
            paymentProcessor: 'stripe',
            status: 'succeeded',
            createdAt: '2022-05-10T12:59:32.582Z',
        });

        const res = await ChaiHttpRequestHelper.get(getApiEndPoint(), {
            startDate: '2022-05-09T12:59:32.582Z',
            endDate: '2022-05-11T12:59:32.582Z',
            timeZone: 'America/New_York',
        }).set('authtoken', token);

        res.should.have.status(200);
        expect(res.body).to.have.property('columns');
        expect(res.body).to.have.property('report');
        expect(res.body.report.length).not.to.eq(0);
        expect(res.body.report[0].employee).to.eq(`${user.firstname} ${user.lastname}`);
    });

    it('should get order sales and payment methods successfully if paymentProcessor is cashCard', async () => {
        const store = await factory.create('store');
        const token = generateToken({ id: store.id });
        const user = await factory.create('user');
        const teamMember = await factory.create('teamMember', {
            userId: user.id,
        });
        const inventoryOrder = await factory.create('inventoryOrder', {
            employeeId: teamMember.id,
            orderCode: '13',
        });
        const order = await factory.create('order', {
            orderableId: inventoryOrder.id,
            orderableType: 'InventoryOrder',
        });
        const payments = await factory.create('payments', {
            storeId: store.id,
            orderId: order.id,
            appliedAmount: 300.0,
            paymentProcessor: 'cashCard',
            status: 'succeeded',
            createdAt: '2022-05-10T12:59:32.582Z',
        });

        const res = await ChaiHttpRequestHelper.get(getApiEndPoint(), {
            startDate: '2022-05-09T12:59:32.582Z',
            endDate: '2022-05-11T12:59:32.582Z',
            timeZone: 'America/New_York',
        }).set('authtoken', token);

        res.should.have.status(200);
        expect(res.body).to.have.property('columns');
        expect(res.body).to.have.property('report');
        expect(res.body.report.length).not.to.eq(0);
        expect(res.body.report[0].employee).to.eq('--');
    });

    it('should throw an error if params not passed', async () => {
        const store = await factory.create('store');
        const token = generateToken({ id: store.id });
        const res = await ChaiHttpRequestHelper.get(getApiEndPoint(), {}).set('authtoken', token);
        res.should.have.status(500);
    });
});
