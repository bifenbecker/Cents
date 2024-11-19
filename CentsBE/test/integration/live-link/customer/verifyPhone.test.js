require('../../../testHelper');
const factory = require('../../../factories');
const { expect } = require('../../../support/chaiHelper');
const ChaiHttpRequestHelper = require('../../../support/chaiHttpRequestHelper');

const { FACTORIES_NAMES: FN } = require('../../../constants/factoriesNames');

const endpointName = 'live-status/customer/verify';
const apiEndpoint = `/api/v1/${endpointName}`;

describe(`test ${apiEndpoint} API endpoint`, () => {
    describe('with full pipeline stages', async () => {
        describe('should return correct response', async () => {
            let response;

            it('should return correct response status and body', async () => {
                const centsCustomer = await factory.create(FN.centsCustomer);

                response = await ChaiHttpRequestHelper.get(apiEndpoint, { phoneNumber: centsCustomer.phoneNumber });
                response.should.have.status(200);

                expect(response.body).to.have.property('isVerified').equal(true);
                expect(response.body).to.have.property('firstName').to.be.equal(centsCustomer.firstName);
                expect(response.body).to.have.property('lastName').to.be.equal(centsCustomer.lastName);
            });

            it('should not return firstName and lastName', async () => {
                response = await ChaiHttpRequestHelper.get(apiEndpoint, { phoneNumber: 'abc' });

                response.should.have.status(200);

                expect(response.body).to.have.property('isVerified').equal(false);
                expect(response.body).to.have.property('firstName').equal(null);
                expect(response.body).to.have.property('lastName').equal(null);
            });

            it('should catch error', async () => {
                response = await ChaiHttpRequestHelper.get(apiEndpoint, {});

                response.should.have.status(500);

                expect(response.body).to.not.have.property('isVerified').equal(false);
                expect(response.body).to.not.have.property('firstName').equal(null);
                expect(response.body).to.not.have.property('lastName').equal(null);
            });
        });
    });
});