require('../../../testHelper');
const ChaiHttpRequestHelper = require('../../../support/chaiHttpRequestHelper');
const { generateLiveLinkCustomerToken } = require('../../../support/apiTestHelper');
const { expect } = require('../../../support/chaiHelper');
const factory = require('../../../factories');
const { FACTORIES_NAMES } = require('../../../constants/factoriesNames');

describe('test livelink getMachineDetailsByBarcode API', () => {
    const apiEndpoint = '/api/v1/live-status/machine';
    const apiEndpointSuffix = '/details-by-barcode';
    describe('when auth token validation fails', () => {
        it('should respond with a 401 code when token is empty', async () => {
            const res = await ChaiHttpRequestHelper.get(`${apiEndpoint}/100${apiEndpointSuffix}`, {}, {});
            res.should.have.status(401);
        });

        it('should respond with a 404 when customerauthtoken is invalid', async () => {
            const token = generateLiveLinkCustomerToken({ id: 100 });
            const res = await ChaiHttpRequestHelper.get(`${apiEndpoint}/100${apiEndpointSuffix}`, {}, {}).set(
                'customerauthtoken',
                token,
            );
            res.should.have.status(404);
        });
    });

    describe('when auth token is valid', () => {
        let token;
        let business;
        let store;
        let centsCustomer;
        let storeCustomer;
        let machineWasherOffline;
        let machineWasherOnline;

        beforeEach(async () => {
            business = await factory.create(FACTORIES_NAMES.laundromatBusiness);
            store = await factory.create(FACTORIES_NAMES.store, {
                businessId: business.id,
            });
            centsCustomer = await factory.create(FACTORIES_NAMES.centsCustomer);
            storeCustomer = await factory.create(FACTORIES_NAMES.storeCustomer, {
                centsCustomerId: centsCustomer.id,
                businessId: business.id,
                storeId: store.id,
            });
            machineWasherOffline = await factory.create(FACTORIES_NAMES.machineWasher, {
                storeId: store.id,
            });
            machineWasherOnline = await factory.create(FACTORIES_NAMES.machineWasherWithPairedOnlineDevice, {
                storeId: store.id,
            });

            token = generateLiveLinkCustomerToken({ id: centsCustomer.id });
        });

        describe('when params are invalid', () => {
            it('should respond with a 422 code when a param is not valid', async () => {
                const res = await ChaiHttpRequestHelper.get(`${apiEndpoint}/7${apiEndpointSuffix}`, {}, {}).set('customerauthtoken', token);

                res.should.have.status(422);
            });
        })

        describe('when params are valid but machine is not found', () => {
            it('should respond with a 404 when a machine is not found', async () => {
                const res = await ChaiHttpRequestHelper.get(`${apiEndpoint}/abracadabra${apiEndpointSuffix}`, {}, {}).set('customerauthtoken', token);

                res.should.have.status(404);
            });
        })

        describe('when machine exists', () => {
            it('should respond with a 200 with formatted response body', async () => {
                const res = await ChaiHttpRequestHelper.get(`${apiEndpoint}/${machineWasherOffline.serialNumber}${apiEndpointSuffix}`, {}, {}).set('customerauthtoken', token);

                res.should.have.status(200);
                expect(res.body).to.have.property('store').not.to.be.empty;
                expect(res.body).to.have.property('business').not.to.be.empty;
                expect(res.body).to.have.property('model').not.to.be.empty;
                expect(res.body).to.have.property('name').not.to.be.undefined;
                expect(res.body).to.have.property('serialNumber').not.to.be.undefined;
                expect(res.body).to.have.property('pricePerTurnInCents').not.to.be.undefined;
                expect(res.body).to.have.property('turnTimeInMinutes').not.to.be.undefined;
                expect(res.body).to.have.property('device').not.to.be.undefined;
                expect(res.body).to.have.property('activeTurn').not.to.be.undefined;
                expect(res.body).to.have.property('isAvailable').not.to.be.undefined;
            });

            it('should respond with empty device', async () => {
                const res = await ChaiHttpRequestHelper.get(`${apiEndpoint}/${machineWasherOffline.serialNumber}${apiEndpointSuffix}`, {}, {}).set('customerauthtoken', token);

                res.should.have.status(200);
                expect(res.body).to.have.property('device').to.be.empty;
                expect(res.body).to.have.property('isAvailable').equal(false);
            });

            it('should respond with available status', async () => {
                const res = await ChaiHttpRequestHelper.get(`${apiEndpoint}/${machineWasherOnline.serialNumber}${apiEndpointSuffix}`, {}, {}).set('customerauthtoken', token);

                res.should.have.status(200);
                expect(res.body).to.have.property('device').not.to.be.empty;
                expect(res.body).to.have.property('isAvailable').equal(true);
            });
        })
    })
});
