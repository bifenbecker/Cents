require('../../testHelper');
const { expect } = require('../../support/chaiHelper');
const {
    endpointPipelineMock,
    endpointPipelineErrorMock,
} = require('../../support/pipelineTestHelper');
const { createCentsCustomerAndRelatedEntities } = require('../../support/createCustomerHelper');
const { generateLiveLinkCustomerToken } = require('../../support/apiTestHelper');

const endpointName = 'live-status/subscriptions';
const apiEndpoint = `/api/v1/${endpointName}`;

describe(`test ${apiEndpoint} API`, () => {
    describe('with mocked Pipeline stages', () => {
        describe('that running successful', () => {
            let stubbedPipelineRun;

            beforeEach(async () => {
                const { centsCustomer } = await createCentsCustomerAndRelatedEntities();

                const customerToken = generateLiveLinkCustomerToken({
                    id: centsCustomer.id,
                });

                const mockedResult = await endpointPipelineMock({
                    method: 'get',
                    apiEndpoint,
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
                const { centsCustomer } = await createCentsCustomerAndRelatedEntities();

                const customerToken = generateLiveLinkCustomerToken({
                    id: centsCustomer.id,
                });

                response = await endpointPipelineErrorMock({
                    method: 'get',
                    apiEndpoint,
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
