require('../../../testHelper');
const { expect } = require('../../../support/chaiHelper');
const factory = require('../../../factories');
const ChaiHttpRequestHelper = require('../../../support/chaiHttpRequestHelper');
const { generateToken } = require('../../../support/apiTestHelper');

function getApiEndPoint(centsCustomerId, businessId, storeId) {
    return `/api/v1/employee-tab/customers/${centsCustomerId}/preferences/business/${businessId}/store/${storeId}`;
}

describe('test getStorePreferences api', () => {
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
        const response = await ChaiHttpRequestHelper.get(
            getApiEndPoint(centsCustomer.id, laundromatBusiness.id, store.id),
        ).set('authtoken', '');
        const { error } = JSON.parse(response.text);
        response.should.have.status(401);
        expect(error).to.equal('Please sign in to proceed.');
    });

    it('should throw an error if token is not correct', async () => {
        const response = await ChaiHttpRequestHelper.get(
            getApiEndPoint(centsCustomer.id, laundromatBusiness.id, store.id),
        ).set('authtoken', '123678a');
        const { error } = JSON.parse(response.text);
        response.should.have.status(401);
        expect(error).to.equal('Invalid token.');
    });

    it('should throw an error if store from token was not found', async () => {
        const response = await ChaiHttpRequestHelper.get(
            getApiEndPoint(centsCustomer.id, laundromatBusiness.id, store.id),
        ).set(
            'authtoken',
            generateToken({
                id: -1,
            }),
        );
        const { error } = JSON.parse(response.text);
        response.should.have.status(403);
        expect(error).to.equal('Store not found');
    });

    it('should throw an error if invalid customer id was passed', async () => {
        const response = await ChaiHttpRequestHelper.get(
            getApiEndPoint('value', laundromatBusiness.id, store.id),
        ).set('authtoken', token);
        response.should.have.status(500);
    });

    it('should throw an error if invalid business id was passed', async () => {
        const response = await ChaiHttpRequestHelper.get(
            getApiEndPoint(centsCustomer.id, 'value', store.id),
        ).set('authtoken', token);
        response.should.have.status(500);
    });

    it('should throw an error if invalid store id was passed', async () => {
        const response = await ChaiHttpRequestHelper.get(
            getApiEndPoint(centsCustomer.id, laundromatBusiness.id, 'value'),
        ).set('authtoken', token);
        response.should.have.status(500);
    });

    it('should throw an error if customer was not found', async () => {
        const response = await ChaiHttpRequestHelper.get(
            getApiEndPoint(-1, laundromatBusiness.id, store.id),
        ).set('authtoken', token);
        response.should.have.status(404);
    });

    it('should throw an error if business was not found', async () => {
        const response = await ChaiHttpRequestHelper.get(
            getApiEndPoint(centsCustomer.id, -1, store.id),
        ).set('authtoken', token);
        response.should.have.status(404);
    });

    it('should throw an error if store was not found', async () => {
        const response = await ChaiHttpRequestHelper.get(
            getApiEndPoint(centsCustomer.id, laundromatBusiness.id, -1),
        ).set('authtoken', token);
        response.should.have.status(404);
    });

    it('should return store customer preferences', async () => {
        laundromatBusiness = await factory.create('laundromatBusiness');
        centsCustomer = await factory.create('centsCustomer');
        store = await factory.create('store');
        storeCustomer = await factory.create('storeCustomer', {
            storeId: store.id,
            businessId: laundromatBusiness.id,
            centsCustomerId: centsCustomer.id,
            notes: 'Dry clean, hot wash, please.',
            isHangDrySelected: true,
            hangDryInstructions: 'Do not bleach yellow jeans',
        });
        token = generateToken({ id: store.id });

        const response = await ChaiHttpRequestHelper.get(
            getApiEndPoint(centsCustomer.id, laundromatBusiness.id, store.id),
        ).set('authtoken', token);

        const { storePreferences } = JSON.parse(response.text);

        response.should.have.status(200);

        expect(response.body).to.have.property('success').to.be.true;
        expect(storePreferences.notes).to.eq(storeCustomer.notes);
        expect(storePreferences.isHangDrySelected).to.eq(storeCustomer.isHangDrySelected);
        expect(storePreferences.hangDryInstructions).to.eq(storeCustomer.hangDryInstructions);
    });

    it('should return store customer preferences with default values if not set', async () => {
        const response = await ChaiHttpRequestHelper.get(
            getApiEndPoint(centsCustomer.id, laundromatBusiness.id, store.id),
        ).set('authtoken', token);

        const { storePreferences } = JSON.parse(response.text);

        response.should.have.status(200);

        expect(response.body).to.have.property('success').to.be.true;
        expect(storePreferences.notes).to.eq('');
        expect(storePreferences.isHangDrySelected).to.eq(false);
        expect(storePreferences.hangDryInstructions).to.eq('');
    });
});
