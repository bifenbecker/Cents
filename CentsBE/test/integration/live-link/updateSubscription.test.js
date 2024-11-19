require('../../testHelper');
const { expect } = require('../../support/chaiHelper');
const {
    endpointPipelineMock,
    endpointPipelineErrorMock,
} = require('../../support/pipelineTestHelper');
const { createCentsCustomerAndRelatedEntities } = require('../../support/createCustomerHelper');
const { generateLiveLinkCustomerToken } = require('../../support/apiTestHelper');
const StoreSettings = require('../../../models/storeSettings');
const factory = require('../../factories');
const { FACTORIES_NAMES: FN } = require('../../constants/factoriesNames');

const endpointName = 'live-status/subscriptions/:id';
const apiEndpoint = `/api/v1/${endpointName}`;

describe(`test ${apiEndpoint} API`, () => {
    describe('with mocked Pipeline stages', () => {
        describe('that running successful', () => {
            let stubbedPipelineRun;

            beforeEach(async () => {
                const { centsCustomer, store } = await createCentsCustomerAndRelatedEntities();

                await StoreSettings.query().where({ storeId: store.id }).patch({
                    timeZone: 'America/Los_Angeles',
                });

                const recurringSubscription = await factory.create(FN.recurringSubscription, {
                    centsCustomerId: centsCustomer.id,
                    storeId: store.id,
                });

                const customerToken = generateLiveLinkCustomerToken({
                    id: centsCustomer.id,
                });

                const testApiEndpoint = apiEndpoint.replace(':id', recurringSubscription.id);

                const mockedResult = await endpointPipelineMock({
                    method: 'patch',
                    apiEndpoint: testApiEndpoint,
                    params: {
                        id: recurringSubscription.id,
                    },
                    headers: { customerauthtoken: customerToken },
                });
                stubbedPipelineRun = mockedResult.stubbedPipelineRun;
            });

            it('Pipeline run should be called', () => {
                expect(stubbedPipelineRun.called).to.be.true;
            });
        });

        describe('that running with error', () => {
            let response;

            beforeEach(async () => {
                const { centsCustomer, store } = await createCentsCustomerAndRelatedEntities();

                await StoreSettings.query().where({ storeId: store.id }).patch({
                    timeZone: 'America/Los_Angeles',
                });

                const recurringSubscription = await factory.create(FN.recurringSubscription, {
                    centsCustomerId: centsCustomer.id,
                    storeId: store.id,
                });

                const customerToken = generateLiveLinkCustomerToken({
                    id: centsCustomer.id,
                });

                const testApiEndpoint = apiEndpoint.replace(':id', recurringSubscription.id);

                response = await endpointPipelineErrorMock({
                    method: 'patch',
                    apiEndpoint: testApiEndpoint,
                    params: {
                        id: recurringSubscription.id,
                    },
                    headers: { customerauthtoken: customerToken },
                });
            });
            it('Pipeline should catch Error', async () => {
                response.should.have.status(500);
                expect(response.body).to.eql({
                    error: 'Pipeline error!',
                });
            });
        });
    });
});
