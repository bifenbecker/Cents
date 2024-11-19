require('../../../../testHelper');
const { expect } = require('../../../../support/chaiHelper');
const {
    endpointPipelineMock,
    endpointPipelineErrorMock,
} = require('../../../../support/pipelineTestHelper');
const ChaiHttpRequestHelper = require('../../../../support/chaiHttpRequestHelper');
const factory = require('../../../../factories');
const { FACTORIES_NAMES: FN } = require('../../../../constants/factoriesNames');

const endpointName = 'live-status/customer/address/instructions/update';
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
    });

    describe('with full pipeline stages', async () => {
        describe('should return correct response', async () => {
            let store,
                centsCustomer,
                address,
                payload,
                response;

            beforeEach(async () => {
                store = await factory.create(FN.store);

                centsCustomer = await factory.create(FN.centsCustomer);

                await factory.create(FN.storeCustomer, {
                    storeId: store.id,
                    centsCustomerId: centsCustomer.id,
                });

                address = await factory.create(FN.centsCustomerAddress, {
                    centsCustomerId: centsCustomer.id,
                });

                payload = {
                    leaveAtDoor: true,
                    instructions: 'call upon arrival',
                    customerAddressId: address.id,
                };

                response = await ChaiHttpRequestHelper.patch(apiEndpoint, {}, payload);
            });

            it('should return correct response status and body', async () => {
                const {
                    body: { addressDetails },
                } = response;

                response.should.have.status(200);
                response.body.should.have.property('success', true);
                response.body.should.have.property('addressDetails');
                expect(addressDetails).to.have.property('leaveAtDoor');
                expect(addressDetails).to.have.property('customerAddressId');
                expect(addressDetails).to.have.property('customerAddress');
            });
        });
    });
});