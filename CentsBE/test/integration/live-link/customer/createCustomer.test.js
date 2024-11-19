require('../../../testHelper');
const sinon = require('sinon');
const { transaction } = require('objection');
const { expect } = require('../../../support/chaiHelper');
const ChaiHttpRequestHelper = require('../../../support/chaiHttpRequestHelper');
const stripe = require('../../../../stripe/stripeWithSecret');

const endpointName = 'live-status/customer/';
const apiEndpoint = `/api/v1/${endpointName}`;

describe(`test ${apiEndpoint} API endpoint`, () => {
    describe('with full pipeline stages', async () => {
        describe('should return correct response', async () => {
            let body, response;

            it('should return correct response status and body', async () => {
                sinon
                    .stub(stripe.customers, 'create')
                    .returns({ id: 'cus_MOCKED_CENTS_CUSTOMER_STRIPE' });
                body = {
                    fullName: 'Dan Brown',
                    phoneNumber: '9791065742',
                };

                response = await ChaiHttpRequestHelper.post(apiEndpoint, {}, body);
                const {
                    body: { customer },
                } = response;

                response.should.have.status(200);

                response.body.should.have.property('success', true);
                response.body.should.have.property('customer');
                response.body.should.have.property('customerAuthToken');
                response.body.should.have.property('latestOrderToken');
                expect(customer).to.have.property('firstName').not.equal(null);
                expect(customer).to.have.property('lastName').not.equal(null);
                expect(customer).to.have.property('phoneNumber').not.equal(null);
            });

            it('should catch error', async () => {
                const errorMessage = 'Unprovided error!';
                sinon.stub(transaction, 'start').throws(new Error(errorMessage));

                response = await ChaiHttpRequestHelper.post(apiEndpoint, {}, body);

                response.should.have.status(500);

                expect(response.body).to.not.have.property('isVerified');
                expect(response.body).to.not.have.property('firstName');
                expect(response.body).to.not.have.property('lastName');
            });
        });
    });
});
