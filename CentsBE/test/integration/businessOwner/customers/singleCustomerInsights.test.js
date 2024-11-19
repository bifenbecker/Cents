require('../../../testHelper');
const { generateToken } = require('../../../support/apiTestHelper');
const factory = require('../../../factories');
const { expect } = require('../../../support/chaiHelper');
const { FACTORIES_NAMES: FN } = require('../../../constants/factoriesNames');
const {
    assertGetResponseSuccess,
    assertGetResponseError,
} = require('../../../support/httpRequestsHelper');

function getAPIEndpoint(customerId) {
    return `/api/v1/business-owner/customers/insights/${customerId}`
}

describe('test Customer insights', () => {
    let centsCustomer;
    beforeEach(async () => {
        centsCustomer = await factory.create(FN.centsCustomer);
    });
    describe('without auth token', () => {
        it('should throw an error if token is not sent', async () => {
            await assertGetResponseError({
                url: getAPIEndpoint(centsCustomer.id),
                token: '',
                code: 401,
                expectedError: 'Please sign in to proceed.',
            });
        });

        it('should throw an error if token is not correct', async () => {
            await assertGetResponseError({
                url: getAPIEndpoint(centsCustomer.id),
                token: 'abcdefg',
                code: 401,
                expectedError: 'Invalid token.',
            });
        });

        it('should throw an error if user does not exist', async () => {
            await assertGetResponseError({
                url: getAPIEndpoint(centsCustomer.id),
                token: generateToken({
                    id: -1,
                }),
                code: 403,
                expectedError: 'User not found',
            });
        });
    });

    describe('with auth token', () => {
        let user, token, laundromatBusiness, store, storeCustomer;
        beforeEach(async () => {
            await factory.create('role', { userType: "Business Owner" });
            user = await factory.create(FN.userWithBusinessOwnerRole);
            token = generateToken({
                id: user.id
            });
            laundromatBusiness = await factory.create(FN.laundromatBusiness, { userId: user.id });
            store = await factory.create('store', { businessId: laundromatBusiness.id });
            storeCustomer = await factory.create(FN.storeCustomer, {
                storeId: store.id,
                businessId: laundromatBusiness.id,
                centsCustomerId: centsCustomer.id
            });
        });

        describe('without service and inventory orders', () => {
            it('Should have no customer insights', async () => {
                const { body } = await assertGetResponseSuccess({ token, url: getAPIEndpoint(centsCustomer.id), });
                expect(body).to.have.property('success').to.eq(true);
                expect(body.insights).to.be.empty;
            });
        });

        describe('With service and inventory order', () => {
            let recentOrder, store2;
            beforeEach(async () => {
                await factory.create(FN.serviceOrder, {
                    storeCustomerId: storeCustomer.id,
                    netOrderTotal: 10,
                    storeId: store.id,
                    status: 'SUBMITTED',
                    orderCode: '1001',
                    createdAt: new Date().toISOString(),
                });
                await factory.create(FN.serviceOrder, {
                    storeCustomerId: storeCustomer.id,
                    netOrderTotal: 20,
                    storeId: store.id,
                    status: 'SUBMITTED',
                    orderCode: '1002',
                    createdAt: new Date().toISOString(),
                });
                store2 = await factory.create(FN.store, { businessId: laundromatBusiness.id });
                const storeCustomer2 = await factory.create(FN.storeCustomer, {
                    storeId: store2.id,
                    businessId: laundromatBusiness.id,
                    centsCustomerId: centsCustomer.id
                });
                await factory.create(FN.serviceOrder, {
                    storeCustomerId: storeCustomer2.id,
                    netOrderTotal: 30,
                    storeId: store2.id,
                    status: 'SUBMITTED',
                    orderCode: '1003',
                    createdAt: new Date().toISOString(),
                });
                await factory.create(FN.serviceOrder, {
                    storeCustomerId: storeCustomer.id,
                    netOrderTotal: 300,
                    storeId: store.id,
                    status: 'CANCELLED',
                    orderCode: '1004',
                    createdAt: new Date().toISOString(),
                });
                recentOrder = await factory.create(FN.inventoryOrder, {
                    storeCustomerId: storeCustomer.id,
                    netOrderTotal: 40,
                    storeId: store.id,
                    status: 'CREATED',
                    orderCode: '1005',
                    createdAt: new Date().toISOString(),
                });
            });

            describe('when customer is part of multiple businesses', () => {
                beforeEach(async () => {
                    const storeCustomer3 = await factory.create(FN.storeCustomer, {
                        centsCustomerId: centsCustomer.id
                    });
                    await factory.create(FN.serviceOrder, {
                        storeCustomerId: storeCustomer3.id,
                        netOrderTotal: 3000,
                        storeId: storeCustomer3.storeId,
                        status: 'SUBMITTED',
                        orderCode: '1003',
                        createdAt: new Date().toISOString(),
                    });
                })
                it('should filter orders for a given business', async () => {
                    const { body } = await assertGetResponseSuccess({ token, url: getAPIEndpoint(centsCustomer.id), });
                    expect(body).to.have.property('success').to.eq(true);
                    expect(body).to.have.property('insights').to.not.be.empty;
                })
            });
            describe('test total order count', () => {
                it('should have total order count from all stores', async () => {
                    const { body } = await assertGetResponseSuccess({ token, url: getAPIEndpoint(centsCustomer.id), });
                    expect(body).to.have.property('success').to.eq(true);
                    expect(body).to.have.property('insights').to.not.be.empty;
                    expect(body.insights).to.have.property('totalOrders').to.equal('5');
                });
            });

            describe('test last order ID', () => {
                it('should return last order ID', async () => {
                    const { body } = await assertGetResponseSuccess({ token, url: getAPIEndpoint(centsCustomer.id), });
                    expect(body).to.have.property('success').to.eq(true);
                    expect(body).to.have.property('insights').to.not.be.empty;
                    expect(body.insights).to.have.property('lastOrderId').to.equal(recentOrder.id);
                })
            });

            describe('test last order code', () => {
                it('should have last order code from last order', async () => {
                    const { body } = await assertGetResponseSuccess({ token, url: getAPIEndpoint(centsCustomer.id), });
                    expect(body).to.have.property('success').to.eq(true);
                    expect(body).to.have.property('insights').to.not.be.empty;
                    expect(body.insights).to.have.property('lastOrderCode').to.equal(1005);
                });
            });

            describe('test last order status', () => {
                it('should have status from last order', async () => {
                    const { body } = await assertGetResponseSuccess({ token, url: getAPIEndpoint(centsCustomer.id), });
                    expect(body).to.have.property('success').to.eq(true);
                    expect(body).to.have.property('insights').to.not.be.empty;
                    expect(body.insights).to.have.property('lastOrderStatus').to.equal('CREATED');
                });
            });

            describe('test total spend', () => {
                it('should exclude canceled orders', async () => {
                    const { body } = await assertGetResponseSuccess({ token, url: getAPIEndpoint(centsCustomer.id), });
                    expect(body).to.have.property('success').to.eq(true);
                    expect(body).to.have.property('insights').to.not.be.empty;
                    expect(body.insights).to.have.property('totalspend').to.equal(100);
                });
            });

            describe('test last order date', () => {
                it('should return latest order created date', async () => {
                    const { body } = await assertGetResponseSuccess({ token, url: getAPIEndpoint(centsCustomer.id), });
                    expect(body).to.have.property('success').to.eq(true);
                    expect(body).to.have.property('insights').to.not.be.empty;
                    expect(body.insights).to.have.property('lastOrderDate').to.equal(recentOrder.createdAt);
                });
            });

            describe('test total stores ', () => {
                it('should return stores info', async () => {
                    const { body } = await assertGetResponseSuccess({ token, url: getAPIEndpoint(centsCustomer.id), });
                    const expected = [{
                        id: store.id,
                        name: store.name,
                        visits: 4,
                        address: store.address,
                    },
                    {
                        id: store2.id,
                        name: store2.name,
                        visits: 1,
                        address: store2.address,
                    }];
                    expect(body).to.have.property('success').to.eq(true);
                    expect(body).to.have.property('insights').to.not.be.empty;
                    expect(body.insights).to.have.property('stores').to.deep.equal(expected);
                });
            });
        });
    });
});
