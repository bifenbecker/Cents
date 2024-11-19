require('../../../../testHelper');
const { expect } = require('../../../../support/chaiHelper');
const {
    endpointPipelineMock,
    endpointPipelineErrorMock,
} = require('../../../../support/pipelineTestHelper');

const ChaiHttpRequestHelper = require('../../../../support/chaiHttpRequestHelper');
const { createCentsCustomerAndRelatedEntities } = require('../../../../support/createCustomerHelper');

const { generateLiveLinkCustomerToken } = require('../../../../support/apiTestHelper');
const factory = require('../../../../factories');
const { FACTORIES_NAMES: FN } = require('../../../../constants/factoriesNames');

const apiEndpoint = '/api/v1/live-status/customer/address';

describe(`test ${apiEndpoint} API endpoint`, () => {
    describe('with mocked Pipeline stages', () => {
        describe('that running successful', () => {
            let stubbedPipelineRun;

            beforeEach(async () => {
                const { centsCustomer } = await createCentsCustomerAndRelatedEntities();
                const centsCustomerAddress = await factory.create(FN.centsCustomerAddress);

                const customerToken = generateLiveLinkCustomerToken({
                    id: centsCustomer.id,
                });

                const googlePlacesId = 'ChIJB0GAwupZwokRf4HuUgTifog';

                const mockedResult = await endpointPipelineMock({
                    method: 'put',
                    apiEndpoint: `${apiEndpoint}/${googlePlacesId}`,
                    headers: { customerauthtoken: customerToken },
                    params: {
                        googlePlacesId,
                    },
                    body: {
                        address1: centsCustomerAddress.address1,
                        city: centsCustomerAddress.city,
                        firstLevelSubdivisionCode: centsCustomerAddress.firstLevelSubdivisionCode,
                        postalCode: centsCustomerAddress.postalCode,
                        countryCode: centsCustomerAddress.countryCode,
                    },
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
                const centsCustomerAddress = await factory.create(FN.centsCustomerAddress);

                const customerToken = generateLiveLinkCustomerToken({
                    id: centsCustomer.id,
                });

                const googlePlacesId = 'ChIJB0GAwupZwokRf4HuUgTifog';

                response = await endpointPipelineErrorMock({
                    method: 'put',
                    apiEndpoint: `${apiEndpoint}/${googlePlacesId}`,
                    headers: { customerauthtoken: customerToken },
                    params: {
                        googlePlacesId,
                    },
                    body: {
                        address1: centsCustomerAddress.address1,
                        city: centsCustomerAddress.city,
                        firstLevelSubdivisionCode: centsCustomerAddress.firstLevelSubdivisionCode,
                        postalCode: centsCustomerAddress.postalCode,
                        countryCode: centsCustomerAddress.countryCode,
                    },
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
            let response;

            beforeEach(async () => {
                const { centsCustomer } = await createCentsCustomerAndRelatedEntities();
                const centsCustomerAddress = await factory.create(FN.centsCustomerAddress);

                const customerToken = generateLiveLinkCustomerToken({
                    id: centsCustomer.id
                });

                const googlePlacesId = 'ChIJB0GAwupZwokRf4HuUgTifog';

                response = await ChaiHttpRequestHelper.put(`${apiEndpoint}/${googlePlacesId}`,
                    { googlePlacesId },
                    {
                        address1: centsCustomerAddress.address1,
                        city: centsCustomerAddress.city,
                        firstLevelSubdivisionCode: centsCustomerAddress.firstLevelSubdivisionCode,
                        postalCode: centsCustomerAddress.postalCode,
                        countryCode: centsCustomerAddress.countryCode,
                    })
                    .set('customerauthtoken', customerToken)
            });

            it('should return correct response status and body', async () => {
                const {
                    body: { centsCustomerAddress },
                } = response;

                response.should.have.status(200);
                response.body.should.have.property('success', true);
                response.body.should.have.property('centsCustomerAddress');
                expect(centsCustomerAddress).to.have.property('address1');
                expect(centsCustomerAddress).to.have.property('city');
                expect(centsCustomerAddress).to.have.property('firstLevelSubdivisionCode');
                expect(centsCustomerAddress).to.have.property('postalCode');
                expect(centsCustomerAddress).to.have.property('countryCode');
                expect(centsCustomerAddress).to.have.property('googlePlacesId');
                expect(centsCustomerAddress).to.have.property('centsCustomerId');
                expect(centsCustomerAddress).to.have.property('id');
                expect(centsCustomerAddress).to.have.property('address2');
                expect(centsCustomerAddress).to.have.property('createdAt');
                expect(centsCustomerAddress).to.have.property('updatedAt');
                expect(centsCustomerAddress).to.have.property('instructions');
                expect(centsCustomerAddress).to.have.property('leaveAtDoor');
                expect(centsCustomerAddress).to.have.property('lat');
                expect(centsCustomerAddress).to.have.property('lng');
            });
        });
    });
});