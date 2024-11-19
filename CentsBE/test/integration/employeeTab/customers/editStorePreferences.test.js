require('../../../testHelper');
const { expect } = require('../../../support/chaiHelper');
const factory = require('../../../factories');
const ChaiHttpRequestHelper = require('../../../support/chaiHttpRequestHelper');
const { generateToken } = require('../../../support/apiTestHelper');
const StoreCustomer = require('../../../../models/storeCustomer');

function getApiEndPoint(centsCustomerId, businessId, storeId) {
    return `/api/v1/employee-tab/customers/${centsCustomerId}/preferences/business/${businessId}/store/${storeId}`;
}

describe('test editStorePreferences api', () => {
    let laundromatBusiness, centsCustomer, store, storeCustomer, token, payload;

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
        payload = {
            notes: 'Just wash it',
            isHangDrySelected: true,
            hangDryInstructions: 'Bleach everything',
        };
    });

    it('should throw an error if token is not sent', async () => {
        const response = await ChaiHttpRequestHelper.patch(
            getApiEndPoint(centsCustomer.id, laundromatBusiness.id, store.id),
            null,
            payload,
        ).set('authtoken', '');
        const { error } = JSON.parse(response.text);
        response.should.have.status(401);
        expect(error).to.equal('Please sign in to proceed.');
    });

    it('should throw an error if token is not correct', async () => {
        const response = await ChaiHttpRequestHelper.patch(
            getApiEndPoint(centsCustomer.id, laundromatBusiness.id, store.id),
            null,
            payload,
        ).set('authtoken', '123678a');
        const { error } = JSON.parse(response.text);
        response.should.have.status(401);
        expect(error).to.equal('Invalid token.');
    });

    it('should throw an error if store from token was not found', async () => {
        const response = await ChaiHttpRequestHelper.patch(
            getApiEndPoint(centsCustomer.id, laundromatBusiness.id, store.id),
            null,
            payload,
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
        const response = await ChaiHttpRequestHelper.patch(
            getApiEndPoint('test123', laundromatBusiness.id, store.id),
            null,
            payload,
        ).set('authtoken', token);
        response.should.have.status(500);
    });

    it('should throw an error if invalid business id was passed', async () => {
        const response = await ChaiHttpRequestHelper.patch(
            getApiEndPoint(centsCustomer.id, 'test123', store.id),
            null,
            payload,
        ).set('authtoken', token);
        response.should.have.status(500);
    });

    it('should throw an error if invalid store id was passed', async () => {
        const response = await ChaiHttpRequestHelper.patch(
            getApiEndPoint(centsCustomer.id, laundromatBusiness.id, 'test123'),
            null,
            payload,
        ).set('authtoken', token);
        response.should.have.status(500);
    });

    it('should throw an error if customer was not found', async () => {
        const response = await ChaiHttpRequestHelper.patch(
            getApiEndPoint(-1, laundromatBusiness.id, store.id),
            null,
            payload,
        ).set('authtoken', token);

        response.should.have.status(404);
    });

    it('should throw an error if business was not found', async () => {
        const response = await ChaiHttpRequestHelper.patch(
            getApiEndPoint(centsCustomer.id, -1, store.id),
            null,
            payload,
        ).set('authtoken', token);

        response.should.have.status(404);
    });

    it('should throw an error if store was not found', async () => {
        const response = await ChaiHttpRequestHelper.patch(
            getApiEndPoint(centsCustomer.id, laundromatBusiness.id, -1),
            null,
            payload,
        ).set('authtoken', token);

        response.should.have.status(404);
    });

    it('should create preferences for store customer', async () => {
        const response = await ChaiHttpRequestHelper.patch(
            getApiEndPoint(centsCustomer.id, laundromatBusiness.id, store.id),
            null,
            payload,
        ).set('authtoken', token);

        response.should.have.status(201);
        expect(response.body).to.have.property('success').to.be.true;

        const expectedStoreCustomer = await StoreCustomer.query().findById(storeCustomer.id);
        expect(expectedStoreCustomer.notes).to.equal(payload.notes);
        expect(expectedStoreCustomer.isHangDrySelected).to.equal(payload.isHangDrySelected);
        expect(expectedStoreCustomer.hangDryInstructions).to.equal(payload.hangDryInstructions);
    });

    it('should update existing store customer preferences', async () => {
        laundromatBusiness = await factory.create('laundromatBusiness');
        centsCustomer = await factory.create('centsCustomer');
        store = await factory.create('store');
        storeCustomer = await factory.create('storeCustomer', {
            storeId: store.id,
            businessId: laundromatBusiness.id,
            centsCustomerId: centsCustomer.id,
            notes: 'soap powder',
            isHangDrySelected: true,
            hangDryInstructions: 'bleach',
        });
        token = generateToken({ id: store.id });
        payload = {
            notes: 'towels',
            isHangDrySelected: false,
            hangDryInstructions: 'fabric softner',
        };

        const response = await ChaiHttpRequestHelper.patch(
            getApiEndPoint(centsCustomer.id, laundromatBusiness.id, store.id),
            null,
            payload,
        ).set('authtoken', token);

        response.should.have.status(201);
        expect(response.body).to.have.property('success').to.be.true;

        const expectedStoreCustomer = await StoreCustomer.query().findById(storeCustomer.id);
        expect(expectedStoreCustomer.notes).to.equal(payload.notes);
        expect(expectedStoreCustomer.isHangDrySelected).to.equal(payload.isHangDrySelected);
        expect(expectedStoreCustomer.hangDryInstructions).to.equal(payload.hangDryInstructions);
    });

    it('should throw an error if non existent field was sent with payload', async () => {
        payload = {
            ...payload,
            nonExistentField: 'test',
        };
        const response = await ChaiHttpRequestHelper.patch(
            getApiEndPoint(centsCustomer.id, laundromatBusiness.id, store.id),
            null,
            payload,
        ).set('authtoken', token);

        response.should.have.status(500);
    });

    it('should throw an error if field with incorrect type was sent with payload', async () => {
        payload = {
            ...payload,
            isHangDrySelected: 'Some string value',
        };
        const response = await ChaiHttpRequestHelper.patch(
            getApiEndPoint(centsCustomer.id, laundromatBusiness.id, store.id),
            null,
            payload,
        ).set('authtoken', token);

        response.should.have.status(500);
    });
});
