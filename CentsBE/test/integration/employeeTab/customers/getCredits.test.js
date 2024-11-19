require('../../../testHelper');
const ChaiHttpRequestHepler = require('../../../support/chaiHttpRequestHelper');
const { generateToken } = require('../../../support/apiTestHelper');
const factory = require('../../../factories');
const { expect, assert } = require('../../../support/chaiHelper');

const getEndpoint = (id) => `/api/v1/employee-tab/customers/${id}/credits`;

describe('test get credits', () => {
    let token, centsCustomer, store;
    const creditAmount = 16.15;

    beforeEach(async () => {
        const business = await factory.create('laundromatBusiness');
        store = await factory.create('store', {
            businessId: business.id,
        });
        centsCustomer = await factory.create('centsCustomer');
        token = await generateToken({ id: store.id });
    });

    it('should fail when store does not exist', async () => {
        const token = await generateToken({ id: 0 });
        const res = await ChaiHttpRequestHepler.get(getEndpoint(centsCustomer.id)).set(
            'authtoken',
            token,
        );
        res.should.have.status(403);
        expect(res.body.error).to.equal('Store not found');
    });

    it('should return zero credits if credit history does not exist', async () => {
        const res = await ChaiHttpRequestHepler.get(getEndpoint(centsCustomer.id)).set(
            'authtoken',
            token,
        );
        res.should.have.status(200);
        assert.equal(res.body.creditAmount, 0);
    });

    it('should return credit history', async () => {
        await factory.create('creditHistory', {
            businessId: store.businessId,
            customerId: centsCustomer.id,
            amount: creditAmount,
        });

        const res = await ChaiHttpRequestHepler.get(getEndpoint(centsCustomer.id)).set(
            'authtoken',
            token,
        );
        res.should.have.status(200);
        assert.equal(res.body.creditAmount, creditAmount);
    });
});
