require('../../../testHelper');
const ChaiHttpRequestHepler = require('../../../support/chaiHttpRequestHelper');
const { generateToken } = require('../../../support/apiTestHelper');
const factory = require('../../../factories');
const { assert } = require('../../../support/chaiHelper');

async function getToken(storeId, teamMemberId) {
    return generateToken({ id: storeId, teamMemberId: teamMember.id });
}

describe('test validate guest account', () => {
    const apiEndPoint = '/api/v1/employee-tab/customers/guest';
    let store;

    beforeEach(async () => {
        store = await factory.create('store');
        business = await factory.create('laundromatBusiness');
        teamMember = await factory.create('teamMember', { businessId: business.id });
    });

    it('should fail if token is empty', async () => {
        const body = {};
        const token = await getToken(null);

        const res = await ChaiHttpRequestHepler.post(apiEndPoint, {}, body).set('authtoken', token);

        res.should.have.status(403);
        assert.equal(res.error.text, '{"error":"Store not found"}');
    });

    it('should create new guest customer if the cents customer does not exist', async () => {
        const body = {};
        const token = await getToken(store.id, teamMember.id);

        const res = await ChaiHttpRequestHepler.post(apiEndPoint, {}, body).set('authtoken', token);

        res.should.have.status(200);
        assert.equal(res.body.customer.fullName, 'Guest Account');
    });

    it('should return error if store customer does not exist', async () => {
        const body = {};
        const token = await getToken(store.id, teamMember.id);

        await factory.create('centsCustomer', {
            email: `guest_account_${store.id}@trycents.com`,
            firstName: `Test`,
            lastName: `Guest`,
        });

        const res = await ChaiHttpRequestHepler.post(apiEndPoint, {}, body).set('authtoken', token);

        res.should.have.status(500);
        assert.equal(res.body.error, `Cannot read property 'firstName' of undefined`);
    });

    it('should return guest customer if the customer exists', async () => {
        const body = {};
        const token = await getToken(store.id, teamMember.id);
        const firstName = `Test`;
        const lastName = `Guest`;

        const centsCustomer = await factory.create('centsCustomer', {
            email: `guest_account_${store.id}@trycents.com`,
            firstName: firstName,
            lastName: lastName,
        });

        await factory.create('storeCustomer', {
            centsCustomerId: centsCustomer.id,
            storeId: store.id,
            firstName: firstName,
            lastName: lastName,
        });

        const res = await ChaiHttpRequestHepler.post(apiEndPoint, {}, body).set('authtoken', token);

        res.should.have.status(200);
        assert.equal(res.body.customer.fullName, firstName + ' ' + lastName);
    });
});
