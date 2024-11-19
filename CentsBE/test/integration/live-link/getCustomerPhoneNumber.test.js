require('../../testHelper');
const sinon = require('sinon');
const factory = require('../../factories');
const ChaiHttpRequestHelper = require('../../support/chaiHttpRequestHelper');
const {
    createUserWithBusinessAndCustomerOrders,
} = require('../../support/factoryCreators/createUserWithBusinessAndCustomerOrders');
const { expect } = require('../../support/chaiHelper');
const { generateLiveLinkOrderToken } = require('../../support/apiTestHelper');
const StoreCustomer = require('../../../models/storeCustomer');
const { FACTORIES_NAMES: FN } = require('../../constants/factoriesNames');

const endpointName = 'live-status/verify-order';
const apiEndpoint = `/api/v1/${endpointName}`;

const makeRequest = async (serviceOrder) => {
    const token = generateLiveLinkOrderToken(serviceOrder);

    const response = await ChaiHttpRequestHelper.get(apiEndpoint, {
        token,
    });

    return response;
};

const errorRequest = async ({ stubbedError, expectedStatus, expectedError }) => {
    const serviceOrder = await factory.create(FN.serviceOrder);
    const serviceOrderObject = { ...serviceOrder };

    sinon.stub(StoreCustomer, 'query').throws(new Error(stubbedError));

    const response = await makeRequest(serviceOrderObject);

    response.should.have.status(expectedStatus);
    expect(response.body).to.have.property('error').to.be.equal(expectedError);
};

describe(`test ${apiEndpoint} API endpoint`, () => {
    it('should return correct response with status 200', async () => {
        const { serviceOrder, store, storeCustomer } =
            await createUserWithBusinessAndCustomerOrders(
                { createPartnerSubsidiary: false },
                {
                    storeCustomer: {
                        phoneNumber: '1234567891',
                    },
                },
            );

        const response = await makeRequest(serviceOrder);

        response.should.have.status(200);
        expect(response.body).to.have.property('success').to.be.true;
        expect(response.body)
            .to.have.property('phoneNumber')
            .to.be.equal(storeCustomer.phoneNumber);
        expect(response.body).to.have.property('storeId').to.be.equal(serviceOrder.storeId);
        expect(response.body).to.have.property('businessId').to.be.equal(store.businessId);
    });

    it('should throw ORDER_NOT_FOUND error when there is no customer', async () => {
        await errorRequest({
            stubbedError: 'ORDER_NOT_FOUND',
            expectedStatus: 404,
            expectedError: 'Order not found.',
        });
    });

    it('should catch error and call next(error) when there is unprovided error', async () => {
        await errorRequest({
            stubbedError: 'Unprovided Error',
            expectedStatus: 500,
            expectedError: 'Unprovided Error',
        });
    });
});
