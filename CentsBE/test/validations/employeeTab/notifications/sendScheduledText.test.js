const mockDate = require('mockdate');

require('../../../testHelper');
const ChaiHttpRequestHelper = require('../../../support/chaiHttpRequestHelper');
const { generateToken } = require('../../../support/apiTestHelper');
const factory = require('../../../factories');
const { expect } = require('../../../support/chaiHelper');
const StoreSettings = require('../../../../models/storeSettings');

const API_ENDPOINT = '/api/v1/employee-tab/notifications/scheduled';

async function checkForResponseError({ body, token, code, expectedError }) {
    const response = await ChaiHttpRequestHelper.post(API_ENDPOINT, {}, body).set(
        'authtoken',
        token,
    );

    expect(response).to.have.status(code);
    expect(response.body.error).to.equal(expectedError);
}

describe('test sendScheduledText validation', () => {
    let business, store, centsCustomer, storeCustomer, serviceOrder, token, sampleBody, now;

    beforeEach(async () => {
        business = await factory.create('laundromatBusiness');
        store = await factory.create('store', { businessId: business.id });
        centsCustomer = await factory.create('centsCustomer');
        storeCustomer = await factory.create('storeCustomer', {
            centsCustomerId: centsCustomer.id,
            storeId: store.id,
            businessId: business.id,
            phoneNumber: centsCustomer.phoneNumber,
            firstName: centsCustomer.firstName,
            lastName: centsCustomer.lastName,
            email: centsCustomer.email,
        });
        serviceOrder = await factory.create('serviceOrder', {
            storeId: store.id,
            storeCustomerId: storeCustomer.id,
        });
        token = generateToken({ id: store.id });
        now = new Date('4-5-2022').toISOString();
        mockDate.set(now);
        sampleBody = {
            phoneNumber: storeCustomer.phoneNumber,
            dateScheduled: new Date('4-6-2022').toISOString(),
            serviceOrderId: serviceOrder.id,
            storeId: store.id,
        };
    });

    afterEach(() => {
        mockDate.reset();
    });

    it('should have status 200 when success', async () => {
        const body = { ...sampleBody };
        const res = await ChaiHttpRequestHelper.post(API_ENDPOINT, {}, body).set(
            'authtoken',
            token,
        );
        expect(res).to.have.status(200);
    });

    it('should have status 422 error if store does not have SMS enabled', async () => {
        await StoreSettings.query().patch({ hasSmsEnabled: false }).findOne({ storeId: store.id });
        await checkForResponseError({
            body: sampleBody,
            code: 422,
            token,
            expectedError:
                'SMS is currently disabled for this store. Please reach out to Cents Support for additional help.',
        });
    });

    it('should fail when phoneNumber is missing', async () => {
        const body = { ...sampleBody };
        body.phoneNumber = undefined;

        await checkForResponseError({
            body,
            code: 422,
            token,
            expectedError: 'child "phoneNumber" fails because ["phoneNumber" is required]',
        });
    });

    it('should fail when phoneNumber is not a string', async () => {
        const body = { ...sampleBody };
        body.phoneNumber = 123;

        await checkForResponseError({
            body,
            code: 422,
            token,
            expectedError: 'child "phoneNumber" fails because ["phoneNumber" must be a string]',
        });
    });

    it('should fail when dateScheduled is missing', async () => {
        const body = { ...sampleBody };
        body.dateScheduled = undefined;

        await checkForResponseError({
            body,
            code: 422,
            token,
            expectedError: 'child "dateScheduled" fails because ["dateScheduled" is required]',
        });
    });

    it('should fail when dateScheduled is not a string', async () => {
        const body = { ...sampleBody };
        body.dateScheduled = 123;

        await checkForResponseError({
            body,
            code: 422,
            token,
            expectedError: 'child "dateScheduled" fails because ["dateScheduled" must be a string]',
        });
    });

    it('should fail when serviceOrderId is missing', async () => {
        const body = { ...sampleBody };
        body.serviceOrderId = undefined;

        await checkForResponseError({
            body,
            code: 422,
            token,
            expectedError: 'child "serviceOrderId" fails because ["serviceOrderId" is required]',
        });
    });

    it('should fail when serviceOrderId is not a number', async () => {
        const body = { ...sampleBody };
        body.serviceOrderId = 'hello';

        await checkForResponseError({
            body,
            code: 422,
            token,
            expectedError:
                'child "serviceOrderId" fails because ["serviceOrderId" must be a number]',
        });
    });

    it('should fail when storeId is missing', async () => {
        const body = { ...sampleBody };
        body.storeId = undefined;

        await checkForResponseError({
            body,
            code: 422,
            token,
            expectedError: 'child "storeId" fails because ["storeId" is required]',
        });
    });

    it('should fail when storeId is not a number', async () => {
        const body = { ...sampleBody };
        body.storeId = 'ethan';

        await checkForResponseError({
            body,
            code: 422,
            token,
            expectedError: 'child "storeId" fails because ["storeId" must be a number]',
        });
    });

    it('should fail when the dateScheduled is less than 60 minutes in advance of current time', async () => {
        const body = { ...sampleBody };
        body.dateScheduled = new Date('2022-04-05T00:30:00').toISOString();

        await checkForResponseError({
            body,
            code: 422,
            token,
            expectedError: 'The scheduled SMS date needs to be more than 60 minutes in advance.',
        });
    });

    it('should fail when the dateScheduled is more than 7 days in advance of current time', async () => {
        const body = { ...sampleBody };
        body.dateScheduled = new Date('4-21-2022').toISOString();

        await checkForResponseError({
            body,
            code: 422,
            token,
            expectedError: 'The scheduled SMS date cannot be more than 7 days in advance.',
        });
    });

    it('should fail when the dateScheduled is less than the current time', async () => {
        const body = { ...sampleBody };
        body.dateScheduled = new Date('4-1-2022').toISOString();

        await checkForResponseError({
            body,
            code: 422,
            token,
            expectedError: 'You cannot schedule an SMS to be sent in the past.',
        });
    });
});
