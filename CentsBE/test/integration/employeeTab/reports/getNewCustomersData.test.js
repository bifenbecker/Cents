require('../../../testHelper');
const ChaiHttpRequestHelper = require('../../../support/chaiHttpRequestHelper');
const { generateToken } = require('../../../support/apiTestHelper');
const factory = require('../../../factories');
const { expect } = require('../../../support/chaiHelper');

function getApiEndPoint() {
    return `/api/v1/employee-tab/reports/customers/new/list`;
}

describe('test getRevenueByPaymentMethod', () => {
    let store, token;

    beforeEach(async () => {
        store = await factory.create('store');
        token = generateToken({ id: store.id });
    });

    it('should throw an error if token is not sent', async () => {
        const res = await ChaiHttpRequestHelper.get(getApiEndPoint()).set('authtoken', '');
        const { error } = JSON.parse(res.text);
        res.should.have.status(401);
        expect(error).to.equal('Please sign in to proceed.');
    });

    it('should get new customers data successfully', async () => {
        const centsCustomer = await factory.create('centsCustomer', {
            createdAt: '2022-05-10T12:59:32.582Z',
        });
        const storeCustomer = await factory.create('storeCustomer', {
            centsCustomerId: centsCustomer.id,
            storeId: store.id,
        });
        const serviceOrder = await factory.create('serviceOrder', {
            storeCustomerId: storeCustomer.id,
            storeId: store.id,
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
        expect(res.body.report[0].fullName).to.eq(`${centsCustomer.firstName} ${centsCustomer.lastName}`);
    });

    it('should throw an error if params not passed', async () => {
        const res = await ChaiHttpRequestHelper.get(getApiEndPoint(),{}).set('authtoken', token);
        res.should.have.status(500);
    });
});