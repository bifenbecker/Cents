require('../../testHelper');
const ChaiHttpRequestHelper = require('../../support/chaiHttpRequestHelper');
const { generateLiveLinkCustomerToken } = require('../../support/apiTestHelper');
const { expect } = require('../../support/chaiHelper');
const getBusinessThemeByMachineBarcodeValidation = require('../../../validations/liveLink/machine/getBusinessThemeByMachineBarcodeValidation');
const factory = require('../../factories');
const { FACTORIES_NAMES } = require('../../constants/factoriesNames');

describe('test getBusinessThemeByMachineBarcodeValidation endpoint validator', () => {
    const apiEndpoint = '/api/v1/live-status/machine';
    const apiEndpointSuffix = '/business-theme-by-barcode';
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
        machine = await factory.create(FACTORIES_NAMES.machine, {
            storeId: store.id,
        });

        token = generateLiveLinkCustomerToken({ id: centsCustomer.id });
    })

    describe('when parameters are valid', () => {
        it('should return status 200 when on success', async () => {
            const res = await ChaiHttpRequestHelper.get(`${apiEndpoint}/${machine.serialNumber}${apiEndpointSuffix}`, {}, {}).set('customerauthtoken', token);

            res.should.have.status(200);
        });
    });

    describe('when parameters are invalid', () => {
        it('should return 422 if param length too short', async () => {
            const res = await ChaiHttpRequestHelper.get(`${apiEndpoint}/k6${apiEndpointSuffix}`, {}, {}).set('customerauthtoken', token);

            res.should.have.status(422);
        });

        it('should return 404 if machine does not exist', async () => {
            const res = await ChaiHttpRequestHelper.get(`${apiEndpoint}/abracadabra${apiEndpointSuffix}`, {}, {}).set('customerauthtoken', token);

            res.should.have.status(404);
        });

        it('getBusinessThemeByMachineBarcodeValidation should catch error if req and res is undefined', async () => {
            getBusinessThemeByMachineBarcodeValidation(null, null, () => {}).then(error => {
                expect(error).to.be.undefined;
            });
        });
    })
});
