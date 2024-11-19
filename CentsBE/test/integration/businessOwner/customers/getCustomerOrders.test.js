require('../../../testHelper');
const { expect } = require('../../../support/chaiHelper');
const ChaiHttpRequestHelper = require('../../../support/chaiHttpRequestHelper');
const {
    createOrderAndCustomerTokensWithRelations,
} = require('../../../support/createOrderAndCustomerTokensHelper');
const { generateLiveLinkCustomerToken } = require('../../../support/apiTestHelper');
const factory = require('../../../factories');
const { FACTORIES_NAMES: FN } = require('../../../constants/factoriesNames');

const endpointName = '/customers/orders';
const apiEndpoint = '/api/v1/business-owner';

describe(`test ${apiEndpoint} API endpoint`, () => {
    it('should return correct response status and body', async () => {
        const business = await factory.create(FN.laundromatBusiness);
        const role = await factory.create(FN.role, {
            userType: 'Business Owner',
        });
        const userRole = await factory.create(FN.userRole, {
            userId: business.userId,
            roleId: role.id,
        });

        const centsCustomer = await factory.create(FN.centsCustomer);
        const storeCustomer = await factory.create(FN.storeCustomer, {
            businessId: business.id,
            centsCustomerId: centsCustomer.id,
        });
        const serviceOrder = await factory.create(FN.serviceOrder, {
            userId: business.userId,
            storeId: storeCustomer.storeId,
            storeCustomerId: storeCustomer.id,
        });
        const inventoryOrder = await factory.create(FN.inventoryOrder, {
            customerId: business.userId,
            storeId: storeCustomer.storeId,
            storeCustomerId: storeCustomer.id,
        });
        const authtoken = generateLiveLinkCustomerToken({
            id: business.userId,
        });
        const response = await ChaiHttpRequestHelper.get(apiEndpoint + endpointName, {
            id: centsCustomer.id,
        }).set({ authtoken });

        response.should.have.status(200);
        response.body.should.have.property('success', true);
        response.body.should.have.property('orders').to.be.an('array');
        expect(response.body.orders.length).to.be.equal(2);
        const singleOrder = response.body.orders[0];
        expect(singleOrder)
            .to.have.property('paymentStatus')
            .to.be.an('string')
            .to.be.equal(serviceOrder.paymentStatus);
        expect(singleOrder)
            .to.have.property('status')
            .to.be.an('string')
            .to.be.equal(serviceOrder.status);
        expect(singleOrder)
            .to.have.property('totalAmount')
            .to.be.equal(serviceOrder.orderTotal !== undefined ? serviceOrder.orderTotal : null);
        expect(singleOrder)
            .to.have.property('orderCode')
            .to.be.equal(serviceOrder.orderCode ? serviceOrder.orderCode.toString() : null);
    });

    it('should return 422 status if no ID in params', async () => {
        const business = await factory.create(FN.laundromatBusiness);
        const role = await factory.create(FN.role, {
            userType: 'Business Owner',
        });
        const userRole = await factory.create(FN.userRole, {
            userId: business.userId,
            roleId: role.id,
        });
        const authtoken = generateLiveLinkCustomerToken({
            id: business.userId,
        });
        const response = await ChaiHttpRequestHelper.get(apiEndpoint + endpointName).set({
            authtoken,
        });

        response.should.have.status(422);
    });

    it('should return 403 status if no user role', async () => {
        const invalidToken = generateLiveLinkCustomerToken({
            id: 2,
        });
        const response = await ChaiHttpRequestHelper.get(apiEndpoint + endpointName, {
            id: 1,
        }).set({ authtoken: invalidToken });

        response.should.have.status(403);
    });

    it('should return 404 response status if no store customer', async () => {
        const business = await factory.create(FN.laundromatBusiness);
        const role = await factory.create(FN.role, {
            userType: 'Business Owner',
        });
        const userRole = await factory.create(FN.userRole, {
            userId: business.userId,
            roleId: role.id,
        });

        const centsCustomer = await factory.create(FN.centsCustomer);
        const authtoken = generateLiveLinkCustomerToken({
            id: business.userId,
        });
        const response = await ChaiHttpRequestHelper.get(apiEndpoint + endpointName, {
            id: centsCustomer.id,
        }).set({ authtoken });

        response.should.have.status(404);
    });
});
