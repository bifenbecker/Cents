require('../../../testHelper');
const ChaiHttpRequestHelper = require('../../../support/chaiHttpRequestHelper');
const { generateToken } = require('../../../support/apiTestHelper');
const factory = require('../../../factories');
const { expect } = require('../../../support/chaiHelper');

function getApiEndPoint() {
    return `/api/v1/employee-tab/reports/revenue/payment-methods`;
}

describe('test getRevenueByPaymentMethod', () => {
    it('should throw an error if token is not sent', async () => {
        const res = await ChaiHttpRequestHelper.get(getApiEndPoint()).set('authtoken', '');
        const { error } = JSON.parse(res.text);
        res.should.have.status(401);
        expect(error).to.equal('Please sign in to proceed.');
    });

    it('should get revenue by payment method successfully', async () => {
        const laundromatBusiness = await factory.create('laundromatBusiness');
        const store = await factory.create('store', {
            name: 'testname',
            businessId: laundromatBusiness.id,
        });
        const token = generateToken({ id: store.id });
        const order = await factory.create('serviceOrderMasterOrder');
        const payments = await factory.create('payments', {
            orderId: order.id,
            storeId: store.id,
            appliedAmount: 500.00,
            paymentProcessor: 'cash',
            createdAt: '2022-05-10T12:59:32.582Z',
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
        expect(res.body.report[0].storeName).to.eq(store.name);
        expect(res.body.report[0].cashRevenue).contain(payments.appliedAmount);
        expect(res.body.report[0].creditCardRevenue).to.eq(null);
    });

    it('should throw an error if params not passed', async () => {
        const store = await factory.create('store');
        const token = generateToken({ id: store.id });
        const res = await ChaiHttpRequestHelper.get(getApiEndPoint(),{}).set('authtoken', token);
        res.should.have.status(500);
    });
});