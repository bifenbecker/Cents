require('../../../testHelper');
const ChaiHttpRequestHelper = require('../../../support/chaiHttpRequestHelper');
const { generateToken } = require('../../../support/apiTestHelper');
const factory = require('../../../factories');
const { expect } = require('../../../support/chaiHelper');

function getApiEndPoint(centsCustomerId) {
    return `/api/v1/employee-tab/customers/${centsCustomerId}/notes`;
}

describe('test updateNotes', () => {
    let laundromatBusiness, centsCustomer, store, storeCustomer, token;
    beforeEach(async () => {
        laundromatBusiness = await factory.create('laundromatBusiness');
        centsCustomer = await factory.create('centsCustomer');
        store = await factory.create('store');
        storeCustomer = await factory.create('storeCustomer', {
            storeId: store.id,
            businessId: laundromatBusiness.id,
            centsCustomerId: centsCustomer.id,
        });
        token = generateToken({ id: store.id });
    });

    it('should throw an error if token is not sent', async () => {
        const response = await ChaiHttpRequestHelper.get(getApiEndPoint(centsCustomer.id)).set(
            'authtoken',
            '',
        );
        const { error } = JSON.parse(response.text);
        response.should.have.status(401);
        expect(error).to.equal('Please sign in to proceed.');
    });

    it('should throw an error if token is not correct', async () => {
        const response = await ChaiHttpRequestHelper.patch(getApiEndPoint(centsCustomer.id)).set(
            'authtoken',
            'invalid_token',
        );
        const { error } = JSON.parse(response.text);
        response.should.have.status(401);
        expect(error).to.equal('Invalid token.');
    });

    it('should throw an error if invalid customer id was passed', async () => {
        const response = await ChaiHttpRequestHelper.patch(getApiEndPoint('invalid_id')).set(
            'authtoken',
            token,
        );
        response.should.have.status(422);
    });

    it('should throw an error if customer was not found', async () => {
        const response = await ChaiHttpRequestHelper.patch(getApiEndPoint(-1)).set(
            'authtoken',
            token,
        );
        response.should.have.status(422);
    });

    it('should throw 422 status code if notes is undefined', async () => {
        const body = {
            notes: undefined,
        };
        const response = await ChaiHttpRequestHelper.patch(
            getApiEndPoint(centsCustomer.id),
            {},
            body,
        ).set('authtoken', token);
        response.should.have.status(422);
    });

    it('should throw 422 status code if notes does not provided', async () => {
        const body = {};
        const response = await ChaiHttpRequestHelper.patch(
            getApiEndPoint(centsCustomer.id),
            {},
            body,
        ).set('authtoken', token);
        response.should.have.status(422);
    });

    it('should patch notes successfully if notes is null', async () => {
        const body = {
            notes: null,
        };
        const response = await ChaiHttpRequestHelper.patch(
            getApiEndPoint(centsCustomer.id),
            {},
            body,
        ).set('authtoken', token);
        expect(response.body.success).to.equal(true);
    });

    it('should patch notes successfully', async () => {
        const body = {
            notes: 'test note',
        };
        const response = await ChaiHttpRequestHelper.patch(
            getApiEndPoint(centsCustomer.id),
            {},
            body,
        ).set('authtoken', token);
        expect(response.body.success).to.equal(true);
    });
});
