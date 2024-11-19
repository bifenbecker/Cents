require('../../testHelper');
const moment = require('moment');
const sinon = require('sinon');
const { expect } = require('../../support/chaiHelper');
const ChaiHttpRequestHepler = require('../../support/chaiHttpRequestHelper');
const { createOrderAndCustomerTokensWithRelations } = require('../../support/createOrderAndCustomerTokensHelper');
const { generateLiveLinkCustomerToken } = require('../../support/apiTestHelper');
const factory = require('../../factories');
const { FACTORIES_NAMES: FN } = require('../../constants/factoriesNames');
const CentsCustomerAddress = require('../../../models/centsCustomerAddress');

const apiEndpoint = '/api/v1/live-status/customer/addresses/latest';

describe(`test ${apiEndpoint} API endpoint`, () => {
    describe('customer token is invalid', async () => {
        it('if token is empty should return status 401', async () => {
            const response = await ChaiHttpRequestHepler.get(apiEndpoint);

            expect(response.status).to.be.equal(401);
        });

        it('if token has invalid id of customer should return status 404', async () => {
            const response = await ChaiHttpRequestHepler.get(apiEndpoint).set({
                customerauthtoken: generateLiveLinkCustomerToken({
                    id: 0,
                }),
            });

            expect(response.status).to.be.equal(404);
        });
    })

    describe('if customer token is valid', async () => {
        it('should return success response', async () => {
            const centsCustomer = await factory.create(FN.centsCustomer);
            const token = generateLiveLinkCustomerToken({
                id: centsCustomer.id,
            })
            const oldCustomerAddres = await factory.create(FN.centsCustomerAddress, {
                centsCustomerId: centsCustomer.id,
            });
            const newCustomerAddress = await factory.create(FN.centsCustomerAddress, {
                centsCustomerId: centsCustomer.id,
            });
            const updatedNewCA = await CentsCustomerAddress.query()
                .findById(newCustomerAddress.id)
                .patch({
                    updatedAt: moment().add('days', 2),
                })
                .returning('*');
            const all = await CentsCustomerAddress.query().returning('*');
            const response = await ChaiHttpRequestHepler.get(apiEndpoint).set({
                customerauthtoken: token,
            });

            // check response
            const latestCustomerAddres = await CentsCustomerAddress.query()
                .where({
                    centsCustomerId: centsCustomer.id,
                })
                .orderBy('updatedAt', 'desc')
                .first();
            expect(response.body).to.have.property('success');
            expect(response.body).to.have.property('customerAddress');
            expect(response.body.success).to.be.true;
            expect(response.body.customerAddress.id)
                .to.be.equal(updatedNewCA.id)
                .to.be.equal(latestCustomerAddres.id);
            expect(response.body.customerAddress.id).to.not.be.equal(oldCustomerAddres.id);
        });

        it('should return success response, but customerAddres is empty', async () => {
            const { tokens } = await createOrderAndCustomerTokensWithRelations();
            const response = await ChaiHttpRequestHepler.get(apiEndpoint).set({
                customerauthtoken: tokens.customerToken,
            });
            expect(response.body).to.have.property('success');
            expect(response.body).to.not.have.property('customerAddress');
        });
    });

    it('should throw an error', async () => {
        const { tokens } = await createOrderAndCustomerTokensWithRelations();
        sinon.stub(CentsCustomerAddress, 'query').throws('Error');
        const response = await ChaiHttpRequestHepler.get(apiEndpoint).set({
            customerauthtoken: tokens.customerToken,
        });
        expect(response.body.error).to.be.equal('Something went wrong!');
    });
});