require('../../../../testHelper');
const nock = require('nock');
const factory = require('../../../../factories');
const { expect } = require('../../../../support/chaiHelper');
const ChaiHttpRequestHelper = require('../../../../support/chaiHttpRequestHelper');
const CentsCustomerAddress = require('../../../../../models/centsCustomerAddress');

const { FACTORIES_NAMES: FN } = require('../../../../constants/factoriesNames');
const { envVariables } = require('../../../../../constants/constants');

const endpointName = 'live-status/customer/address/update';
const apiEndpoint = `/api/v1/${endpointName}`;

describe(`test ${apiEndpoint} API endpoint`, () => {
    const createFactories = async () => {
        const store = await factory.create(FN.store);

        const centsCustomer = await factory.create(FN.centsCustomer);

        const storeCustomer = await factory.create(FN.storeCustomer, {
            storeId: store.id,
            centsCustomerId: centsCustomer.id,
        });

        const centsCustomerAddress = await factory.create(FN.centsCustomerAddress, {
            centsCustomerId: centsCustomer.id,
        });

        return {
            store,
            centsCustomer,
            storeCustomer,
            centsCustomerAddress,
        };
    };

    describe('with full pipeline stages', async () => {
        describe('should return correct response', async () => {
            let response;

            it('should return correct response status and body', async () => {
                const address1 = '755 washington street';
                const postalCode = '10014';

                nock(envVariables.GOOGLE_PLACES_FIND_URL)
                    .get('')
                    .query({
                        input: `${address1} ${postalCode}`,
                        inputtype: 'textquery',
                        fields: 'place_id',
                        key: process.env.GOOGLE_PLACES_API_KEY,
                    })
                    .reply(200, { candidates: [{ place_id: 'MOCKED_PLACE_ID' }] });

                const { centsCustomer, centsCustomerAddress } = await createFactories();

                payload = {
                    centsCustomerId: centsCustomer.id,
                    address: {
                        address1,
                        city: 'New york',
                        firstLevelSubdivisionCode: 'NY',
                        postalCode,
                    },
                    customerAddressId: centsCustomerAddress.id,
                };

                response = await ChaiHttpRequestHelper.patch(apiEndpoint, {}, payload);

                const updatedCentsCustomerAddress = await CentsCustomerAddress.query()
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
                expect(addressDetails).to.have.property('customerAddressId');
                expect(addressDetails).to.have.property('googlePlacesId');
                expect(addressDetails).to.have.property('customerAddress');
                expect(updatedCentsCustomerAddress).to.not.empty;
                expect(updatedCentsCustomerAddress.address1).to.equal(payload.address.address1);
                expect(updatedCentsCustomerAddress.city).to.equal(payload.address.city);
            });

            it('should catch error', async () => {
                const { centsCustomer, centsCustomerAddress } = await createFactories();

                payload = {
                    centsCustomerId: centsCustomer.id,
                    address: {
                        address1: '2',
                        city: 'New york',
                        firstLevelSubdivisionCode: 'NY',
                        postalCode: '10014',
                    },
                    customerAddressId: centsCustomerAddress.id,
                };

                response = await ChaiHttpRequestHelper.patch(apiEndpoint, {}, payload);

                const updatedCentsCustomerAddress = await CentsCustomerAddress.query()
                    .where({ centsCustomerId: centsCustomer.id })
                    .first();

                response.should.have.status(500);
                response.body.should.not.have.property('success', true);
                response.body.should.not.have.property('addressDetails');
                expect(updatedCentsCustomerAddress).to.not.empty;
                expect(updatedCentsCustomerAddress.address1).to.not.equal(payload.address.address1);
                expect(updatedCentsCustomerAddress.city).to.not.equal(payload.address.city);
            });
        });
    });
});
