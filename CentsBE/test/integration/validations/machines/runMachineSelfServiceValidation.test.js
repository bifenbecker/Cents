require('../../../testHelper');
const ChaiHttpRequestHelper = require('../../../support/chaiHttpRequestHelper');
const { generateLiveLinkCustomerToken } = require('../../../support/apiTestHelper');
const { expect } = require('../../../support/chaiHelper');
const runMachineSelfServiceValidation = require('../../../../validations/machines/turns/runMachineSelfServiceValidation');
const factory = require('../../../factories');
const { FACTORIES_NAMES } = require('../../../constants/factoriesNames');

const getApiEndpoint = (machineId) => `/api/v1/live-status/machine/${machineId}/run`;

describe('test runMachineSelfServiceValidation endpoint validator', () => {
    let token;
    let business;
    let store;
    let centsCustomer;
    let storeCustomer;
    let machine;

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
        machine = await factory.create('machine', {
            storeId: store.id,
        });

        token = generateLiveLinkCustomerToken({ id: centsCustomer.id });
    })

    describe('when parameters are invalid', () => {
        describe('when priceAmountInCents body param is invalid', () => {
            it('should return 422 if param quantity is decimal', async () => {
                const apiEndpoint = getApiEndpoint(1);
                const mockBody = {
                    quantity: 1.3783,
                    promoCode: 'dhjadak',
                };
                const res = await ChaiHttpRequestHelper.post(apiEndpoint, {}, mockBody).set('customerauthtoken', token);

                res.should.have.status(422);
            });

            it('should return 422 if param quantity is less than 0', async () => {
                const apiEndpoint = getApiEndpoint(1);
                const mockBody = {
                    quantity: -2,
                    promoCode: 'dhjadak',
                };
                const res = await ChaiHttpRequestHelper.post(apiEndpoint, {}, mockBody).set('customerauthtoken', token);

                res.should.have.status(422);
            });

            it('should return 422 if param quantity is not number', async () => {
                const apiEndpoint = getApiEndpoint(1);
                const mockBody = {
                    quantity: 'msdmfls',
                    promoCode: 'dhjadak',
                };
                const res = await ChaiHttpRequestHelper.post(apiEndpoint, {}, mockBody).set('customerauthtoken', token);

                res.should.have.status(422);
            });
        })

        describe('when promoCode body param is invalid', () => {
            it('should return 422 if param promoCode is number', async () => {
                const apiEndpoint = getApiEndpoint(1);
                const mockBody = {
                    quantity: 1,
                    promoCode: 57638,
                };
                const res = await ChaiHttpRequestHelper.post(apiEndpoint, {}, mockBody).set('customerauthtoken', token);

                res.should.have.status(422);
            });
        });

        describe('when machineId param is invalid', () => {
            it('should return 422 if param machineId is decimal', async () => {
                const apiEndpoint = getApiEndpoint(7.85);
                const mockBody = {
                    quantity: 1,
                    promoCode: 'sdnsflsa',
                };
                const res = await ChaiHttpRequestHelper.post(apiEndpoint, {}, mockBody).set('customerauthtoken', token);

                res.should.have.status(422);
            });

            it('should return 422 if param machineId is string', async () => {
                const apiEndpoint = getApiEndpoint('abracadabra');
                const mockBody = {
                    quantity: 1,
                    promoCode: 'sdnsflsa',
                };
                const res = await ChaiHttpRequestHelper.post(apiEndpoint, {}, mockBody).set('customerauthtoken', token);

                res.should.have.status(422);
            });
        });

        describe('when req and res are invalid', () => {
            it('runMachineSelfServiceValidation should catch error if req and res are undefined', async () => {
                runMachineSelfServiceValidation(null, null, () => {}).then(error => {
                    expect(error).to.be.undefined;
                });
            });
        })
    })

    describe('when parameters are valid', () => {
        it('should return 404 if a machine is not found', async () => {
            const apiEndpoint = getApiEndpoint(6354783);
            const mockBody = {
                quantity: 1,
                promoCode: 'sdnsflsa',
            };
            const res = await ChaiHttpRequestHelper.post(apiEndpoint, {}, mockBody).set('customerauthtoken', token);

            res.should.have.status(404);
        });

        it('should return 400 if when StoreCustomer credit amount is not enough', async () => {
            const apiEndpoint = getApiEndpoint(machine.id);
            const mockBody = {
                quantity: 1,
                promoCode: 'sdnsflsa',
            };
            await factory.create(FACTORIES_NAMES.creditHistory, {
                amount: 10,
                customerId: centsCustomer.id,
                businessId: business.id,
            });
            await factory.create(FACTORIES_NAMES.machinePricing, {
                machineId: machine.id,
                price: 10000,
            });

            const res = await ChaiHttpRequestHelper.post(apiEndpoint, {}, mockBody).set('customerauthtoken', token);

            res.should.have.status(400);
        });
    });
});
