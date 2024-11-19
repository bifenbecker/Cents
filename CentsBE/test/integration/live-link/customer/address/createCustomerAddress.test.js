require('../../../../testHelper');
const sinon = require('sinon');
const nock = require('nock');
const factory = require('../../../../factories');
const { expect } = require('../../../../support/chaiHelper');
const ChaiHttpRequestHelper = require('../../../../support/chaiHttpRequestHelper');
const Pipeline = require('../../../../../pipeline/pipeline');
const CentsCustomerAddress = require('../../../../../models/centsCustomerAddress');
const { FACTORIES_NAMES: FN } = require('../../../../constants/factoriesNames');
const { envVariables } = require('../../../../../constants/constants');

const endpointName = 'live-status/customer/address/create';
const apiEndpoint = `/api/v1/${endpointName}`;

describe(`test ${apiEndpoint} API endpoint`, () => {
    const stubPipeline = async (error, centsCustomer) => {
        const sandbox = sinon.createSandbox();
        sandbox.stub(Pipeline.prototype, 'run').throws(new Error(error));
        sandbox.stub(Pipeline.prototype, 'rollbackTransaction');

        payload = {
            centsCustomerId: centsCustomer.id,
            address: {
                address1: '11662 Mayfield Avenue',
                city: 'Los Angeles',
                firstLevelSubdivisionCode: 'CA',
                postalCode: '90049',
            },
        };

        const response = await ChaiHttpRequestHelper.post(apiEndpoint, {}, payload);

        sandbox.restore();

        return {
            response,
        };
    };

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
            });

            it('should return correct response status and body', async () => {
                const postalCode = '10014';
                const address1 = '755 washington street';

                nock(envVariables.GOOGLE_PLACES_FIND_URL)
                    .get('')
                    .query({
                        input: `${address1} ${postalCode}`,
                        inputtype: 'textquery',
                        fields: 'place_id',
                        key: process.env.GOOGLE_PLACES_API_KEY,
                    })
                    .reply(200, { candidates: [{ place_id: 'MOCKED_PLACE_ID' }] });

                payload = {
                    centsCustomerId: centsCustomer.id,
                    address: {
                        address1,
                        city: 'New york',
                        firstLevelSubdivisionCode: 'NY',
                        postalCode,
                    },
                };

                response = await ChaiHttpRequestHelper.post(apiEndpoint, {}, payload);

                const centsCustomerAddress = await CentsCustomerAddress.query()
                    .where({ centsCustomerId: centsCustomer.id })
                    .first();

                const {
                    body: { addressDetails },
                } = response;

                response.should.have.status(200);
                response.body.should.have.property('success', true);
                response.body.should.have.property('addressDetails');
                expect(addressDetails).to.have.property('centsCustomerId');
                expect(addressDetails).to.have.property('address');
                expect(addressDetails).to.have.property('googlePlacesId');
                expect(addressDetails).to.have.property('customerAddress');
                expect(addressDetails).to.have.property('centsCustomerAddressId');
                expect(centsCustomerAddress).to.not.empty;
                expect(centsCustomerAddress.address1).to.equal(payload.address.address1);
                expect(centsCustomerAddress.city).to.equal(payload.address.city);
                nock.cleanAll();
            });

            it('should catch error and return with 409 statusCode', async () => {
                const { response } = await stubPipeline('UniqueViolationError', centsCustomer);

                const { error } = JSON.parse(response.text);
                response.should.have.status(409);
                expect(error).to.equal('Duplicate address');
            });

            it('should catch error and return with 500 statusCode', async () => {
                const { response } = await stubPipeline('Unexpected error!', centsCustomer);

                const { error } = JSON.parse(response.text);
                response.should.have.status(500);
                expect(error).to.equal('Unexpected error!');
            });
        });
    });
});
