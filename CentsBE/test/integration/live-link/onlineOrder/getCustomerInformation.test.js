require('../../../testHelper');
const sinon = require('sinon');
const chaiHttpRequestHelper = require('../../../support/chaiHttpRequestHelper');
const { assertGetResponseError } = require('../../../support/httpRequestsHelper');
const { generateLiveLinkCustomerToken } = require('../../../support/apiTestHelper');
const factory = require('../../../factories');
const { expect } = require('../../../support/chaiHelper');
const Pipeline = require('../../../../pipeline/pipeline');
const { FACTORIES_NAMES } = require('../../../constants/factoriesNames');

const getApiEndpoint = (storeId = '') => `/api/v1/live-status/customer/${storeId}/info`;

describe('test getCustomerInformation endpoint', () => {
    let business;
    let store;
    let centsCustomer;
    let centsCustomerAddress;
    let creditHistory;
    let storeCustomer;
    let token;
    let authTokenName;

    beforeEach(async () => {
        business = await factory.create(FACTORIES_NAMES.laundromatBusiness);
        store = await factory.create(FACTORIES_NAMES.store, {
            businessId: business.id,
        });
        centsCustomer = await factory.create(FACTORIES_NAMES.centsCustomer);
        centsCustomerAddress = await factory.create(FACTORIES_NAMES.centsCustomerAddress, {
            centsCustomerId: centsCustomer.id,
        });
        creditHistory = await factory.create(FACTORIES_NAMES.creditHistory, {
            amount: 10,
            customerId: centsCustomer.id,
            businessId: business.id,
        });
        storeCustomer = await factory.create(FACTORIES_NAMES.storeCustomer, {
            centsCustomerId: centsCustomer.id,
            businessId: business.id,
            storeId: store.id,
        });
        token = generateLiveLinkCustomerToken({ id: centsCustomer.id });
        authTokenName = 'customerauthtoken';
    });

    describe('when auth token validation fails', () => {
        it('should respond with a 401 code when token is empty', async () => {
            await assertGetResponseError({
                url: getApiEndpoint(store.id),
                token: '',
                code: 401,
                expectedError: 'Please provide customerToken to proceed.',
            });
        });

        it('should return 404 when customer is not found', async () => {
            const apiEndpoint = getApiEndpoint(store.id);
            const invalidToken = generateLiveLinkCustomerToken({ id: centsCustomer.id + 536 });

            const res = await chaiHttpRequestHelper
                .get(apiEndpoint, {}, {})
                .set(authTokenName, invalidToken);

            res.should.have.status(404);
        });
    });

    describe('when auth token is valid', () => {
        it('should return 200 with customer info', async () => {
            const pipelineSpy = sinon.spy(Pipeline.prototype, 'run');
            const apiEndpoint = getApiEndpoint(store.id);

            const res = await chaiHttpRequestHelper
                .get(apiEndpoint, {}, {})
                .set(authTokenName, token);

            res.should.have.status(200);
            expect(res.body).to.have.property('success').to.be.true;
            expect(res.body).to.have.property('customer').to.be.an('object').not.to.be.empty;

            expect(res.body.customer).to.have.property('firstName').to.be.an('string');
            expect(res.body.customer).to.have.property('lastName').to.be.an('string');
            expect(res.body.customer).to.have.property('phoneNumber').to.be.an('string');
            expect(res.body.customer).to.have.property('id').to.be.an('number');
            expect(res.body.customer).to.have.property('storeCustomers').to.be.an('array');
            expect(res.body.customer).to.have.property('paymentMethods').to.be.an('array');
            expect(res.body.customer).to.have.property('addresses').to.be.an('array');
            expect(res.body.customer).to.have.property('availableCredits').to.be.an('number');
            expect(pipelineSpy.called, 'should call Pipeline run').to.be.true;
        });

        it('should return 404 when store does not exist', async () => {
            const apiEndpoint = getApiEndpoint(453742);

            const res = await chaiHttpRequestHelper.get(apiEndpoint, {}, {}).set(
                authTokenName,
                token,
            );

            res.should.have.status(404);
        });
    });

    describe('should response error', async () => {
        it('with unprovided Error', async () => {
            sinon.stub(Pipeline.prototype, 'run').throws();
            sinon.stub(Pipeline.prototype, 'rollbackTransaction');
            const apiEndpoint = getApiEndpoint(store.id);

            // call
            const res = await chaiHttpRequestHelper
                .get(apiEndpoint, {}, {})
                .set(authTokenName, token);

            // assert
            expect(res.statusCode).equals(500);
            expect(res.body).to.have.property('error');
        });
    });
});
