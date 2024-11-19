require('../../../../testHelper');
const faker = require('faker');
const factory = require('../../../../factories');
const { expect } = require('../../../../support/chaiHelper');
const ChaiHttpRequestHelper = require('../../../../support/chaiHttpRequestHelper');
const {
    endpointPipelineMock,
    endpointPipelineErrorMock,
} = require('../../../../support/pipelineTestHelper');
const { FACTORIES_NAMES: FN } = require('../../../../constants/factoriesNames');

const endpointName = 'live-status/customer/phone/update';
const apiEndpoint = `/api/v1/${endpointName}`;

describe(`test ${apiEndpoint} API endpoint`, () => {
    describe('with mocked Pipeline stages', () => {
        describe('that running successful', () => {
            let stubbedPipelineRun;
            let response;

            beforeEach(async () => {
                const mockedResult = await endpointPipelineMock({
                    method: 'patch',
                    apiEndpoint,
                });
                stubbedPipelineRun = mockedResult.stubbedPipelineRun;
                response = mockedResult.response;
            });

            it('Pipeline run should be called', () => {
                expect(stubbedPipelineRun.called).to.be.true;
            });
        });

        describe('that running with error', () => {
            let response;
            beforeEach(async () => {
                response = await endpointPipelineErrorMock({
                    method: 'patch',
                    apiEndpoint,
                });
            });
            it('Pipeline should catch Error', async () => {
                response.should.have.status(500);
                expect(response.body).to.eql({
                    error: 'Pipeline error!',
                });
            });
        });

        describe('with full pipeline stages', async () => {
            describe('should return correct response', async () => {
                let response, store, centsCustomer, storeCustomer;

                beforeEach(async () => {
                    store = await factory.create(FN.store);

                    centsCustomer = await factory.create(FN.centsCustomer);

                    storeCustomer = await factory.create(FN.storeCustomer, {
                        storeId: store.id,
                        centsCustomerId: centsCustomer.id,
                    });

                    payload = {
                        phoneNumber: faker.phone.phoneNumberFormat().split('-').join(''),
                        centsCustomerId: storeCustomer.centsCustomerId,
                    };

                    response = await ChaiHttpRequestHelper.patch(apiEndpoint, {}, payload);
                });

                it('should return correct response status and body', () => {
                    const {
                        body: { phoneDetails },
                    } = response;

                    response.should.have.status(200);
                    response.body.should.have.property('success', true);
                    response.body.should.have.property('phoneDetails');
                    expect(phoneDetails).to.have.property('phoneNumber').to.equal(payload.phoneNumber);
                    expect(phoneDetails).to.have.property('centsCustomerId');
                });
            });
        });
    });
});
