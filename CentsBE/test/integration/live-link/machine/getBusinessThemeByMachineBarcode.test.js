require('../../../testHelper');
const ChaiHttpRequestHelper = require('../../../support/chaiHttpRequestHelper');
const { generateLiveLinkCustomerToken } = require('../../../support/apiTestHelper');
const { expect } = require('../../../support/chaiHelper');
const factory = require('../../../factories');
const { FACTORIES_NAMES } = require('../../../constants/factoriesNames');

describe('test livelink getBusinessThemeByMachineBarcode API', () => {
    const apiEndpoint = '/api/v1/live-status/machine';
    const apiEndpointSuffix = '/business-theme-by-barcode';

    let token;
    let centsCustomer;
    let storeCustomer;
    let business;
    let store;
    let machine;

    beforeEach(async () => {
        business = await factory.create(FACTORIES_NAMES.laundromatBusiness);
        centsCustomer = await factory.create(FACTORIES_NAMES.centsCustomer);
        store = await factory.create(FACTORIES_NAMES.store, {
            businessId: business.id,
        });
        storeCustomer = await factory.create(FACTORIES_NAMES.storeCustomer, {
            centsCustomerId: centsCustomer.id,
            businessId: business.id,
            storeId: store.id,
        });
        token = generateLiveLinkCustomerToken({ id: centsCustomer.id });
        machine = await factory.create(FACTORIES_NAMES.machine, {
            storeId: store.id,
        });
    });

    describe('when auth token does not passed', () => {
        it('should NOT respond with a 401 code when token is empty, we allow getting the theme w/o token', async () => {
            const res = await ChaiHttpRequestHelper.get(`${apiEndpoint}/${machine.serialNumber}${apiEndpointSuffix}`, {}, {});
            res.should.not.have.status(401);
            res.should.have.status(200);

            expect(res.body).to.have.property('theme').not.to.be.empty;
            const { theme } = res.body;
            expect(theme).to.have.property('id').not.to.be.undefined;
            expect(theme).to.have.property('businessId').not.to.be.undefined;
            expect(theme).to.have.property('primaryColor').not.to.be.undefined;
            expect(theme).to.have.property('secondaryColor').not.to.be.undefined;
            expect(theme).to.have.property('borderRadius').not.to.be.undefined;
            expect(theme).to.have.property('logoUrl').not.to.be.undefined;
            expect(theme).to.have.property('normalFont').not.to.be.undefined;
            expect(theme).to.have.property('boldFont').not.to.be.undefined;
            expect(theme).to.have.property('active').not.to.be.undefined;
        });
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
    });

    describe('when machine exists', () => {
        it('should respond with a 200 with formatted response body', async () => {
            await factory.create(FACTORIES_NAMES.businessTheme, {
                businessId: business.id,
            })
            const res = await ChaiHttpRequestHelper.get(`${apiEndpoint}/${machine.serialNumber}${apiEndpointSuffix}`, {}, {}).set('customerauthtoken', token);

            res.should.have.status(200);
            expect(res.body).to.have.property('theme').not.to.be.empty;

            const { theme } = res.body;
            expect(theme).to.have.property('id').not.to.be.undefined;
            expect(theme).to.have.property('businessId').not.to.be.undefined;
            expect(theme).to.have.property('primaryColor').not.to.be.undefined;
            expect(theme).to.have.property('secondaryColor').not.to.be.undefined;
            expect(theme).to.have.property('borderRadius').not.to.be.undefined;
            expect(theme).to.have.property('logoUrl').not.to.be.undefined;
            expect(theme).to.have.property('normalFont').not.to.be.undefined;
            expect(theme).to.have.property('boldFont').not.to.be.undefined;
            expect(theme).to.have.property('active').not.to.be.undefined;
        });
    });
});
