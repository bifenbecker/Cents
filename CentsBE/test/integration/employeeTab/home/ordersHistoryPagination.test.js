require('../../../testHelper');

const ChaiHttpRequestHelper = require('../../../support/chaiHttpRequestHelper');
const { generateToken } = require('../../../support/apiTestHelper');
const factory = require('../../../factories');
const { FACTORIES_NAMES } = require('../../../constants/factoriesNames');

const { expect } = require('../../../support/chaiHelper');

function getToken(storeId) {
    return generateToken({ id: storeId });
}
async function createServiceOrder(storeId, storeCustomerId, status, serviceOrderFields, serviceOrderBagsCount = 1) {
    const serviceOrder = await factory.create(FACTORIES_NAMES.serviceOrder, {
        storeId: storeId,
        storeCustomerId: storeCustomerId,
        status: status,
        ...serviceOrderFields
    });
    await factory.createMany(FACTORIES_NAMES.serviceOrderBag, serviceOrderBagsCount, {
        serviceOrderId: serviceOrder.id,
    });

    await factory.create(FACTORIES_NAMES.serviceOrderMasterOrder, {
        orderableId: serviceOrder.id,
    });
    return serviceOrder;
}

async function createInventoryOrder(storeId, storeCustomerId, netOrderTotal) {
    const inventoryOrder = await factory.create(FACTORIES_NAMES.inventoryOrder, {
        storeId: storeId,
        storeCustomerId: storeCustomerId,
        netOrderTotal,
    });
    await factory.create(FACTORIES_NAMES.inventoryOrderMasterOrder, {
        orderableId: inventoryOrder.id,
    });
    const itemId = await factory.create(FACTORIES_NAMES.inventoryItem, {
        storeId: storeId,
    });
    await factory.create(FACTORIES_NAMES.inventoryOrderItem, {
        inventoryItemId: itemId.id,
        inventoryOrderId: inventoryOrder.id,
    });
    return inventoryOrder;
}

describe('test order history api', () => {
    const ENDPOINT_URL = '/api/v1/employee-tab/home/history';

    describe('when auth token validation fails', () => {
        it('should respond with a 401 code when token is not present', async () => {
            const res = await ChaiHttpRequestHelper.get(ENDPOINT_URL).set('authtoken', '');
            res.should.have.status(401);
        });

        it('should respond with a 403 when token is invalid', async () => {
            const token = await generateToken({ id: 100 });
            const res = await ChaiHttpRequestHelper.get(ENDPOINT_URL).set('authtoken', token);
            res.should.have.status(403);
        });
    });
    describe('with auth token', () => {
        let store, token, params;
        beforeEach(async () => {
            store = await factory.create(FACTORIES_NAMES.store, {
                name: 'Store 1' 
            });
            token = getToken(store.id);
            params = {
                page: 1,
                sortBy: 'id',
                sortOrder: 'down',
            };
        });

        it('should respond with 200', async () => {
            const res = await ChaiHttpRequestHelper.get(ENDPOINT_URL, params).set(
                'authtoken',
                token,
            );
            res.should.have.status(200);
        });

        describe('when no api version for only completed and cancelled orders', () => {
            let store2, store2Customer;
            beforeEach(async () => {
                store2 = await factory.create(FACTORIES_NAMES.store, {
                    name: 'Store 2' 
                });
                store2Customer = await factory.create(FACTORIES_NAMES.storeCustomer, { storeId: store2.id });
            });

            it('should filter orders based on the store ids', async () => {
                const storeCustomer = await factory.create(FACTORIES_NAMES.storeCustomer, { storeId: store.id });
                const storeCompletedServiceOrder = await createServiceOrder(
                    store.id,
                    storeCustomer.id,
                    'COMPLETED'
                );
                const store2CancelledServiceOrder = await createServiceOrder(
                    store2.id,
                    store2Customer.id,
                    'CANCELLED'
                );
                const testParams = {
                    ...params,
                    sortBy: 'status',
                    sortOrder: 'up',
                    stores: [store.id, store2.id]
                }
                const res = await ChaiHttpRequestHelper.get(ENDPOINT_URL, testParams)
                    .set('authtoken', token);
    
                expect(res).to.have.status(200);
                expect(res.body.orders.map((o) => o.id)).to.have.ordered.members([
                    store2CancelledServiceOrder.id,
                    storeCompletedServiceOrder.id,
                ]);
            });

            it('should filter orders based on the store ids that does not includes currentStore.id', async () => {
                const store2CompletedServiceOrder = await createServiceOrder(
                    store2.id,
                    store2Customer.id,
                    'COMPLETED'
                );
                const store2CancelledServiceOrder = await createServiceOrder(
                    store2.id,
                    store2Customer.id,
                    'CANCELLED'
                );
                const testParams = {
                    ...params,
                    sortBy: 'status',
                    sortOrder: 'up',
                    stores: [store2.id]
                }
                const res = await ChaiHttpRequestHelper.get(ENDPOINT_URL, testParams)
                    .set('authtoken', token);
    
                res.should.have.status(200);
                expect(res.body.orders.map((o) => o.id)).to.have.ordered.members([
                    store2CancelledServiceOrder.id,
                    store2CompletedServiceOrder.id,
                ]);
            });

            describe('with `stores` w/o currentStore', () => {
                describe('with `keyword` params', () => {
                    const expectServiceOrderFilteredByKeyword = async (serviceOrder, keyword, keyName) => {
                        const testParams = {
                            page: 1,
                            stores: [store2.id],
                            keyword
                        }
                        const res = await ChaiHttpRequestHelper.get(ENDPOINT_URL, testParams)
                            .set('authtoken', token);
                        const failedExpectationMessage = `expected single service order filtered by ${keyName} keyword`;
                        expect(res, failedExpectationMessage).to.have.status(200);
                        expect(
                            res.body.orders.map((o) => o.id),
                            failedExpectationMessage
                        ).to.have.members([serviceOrder.id]);
                    };
    
                    it('should correctly filter by fullName', async () => {
                        const customerWithName = await factory.create(FACTORIES_NAMES.storeCustomer, { 
                            storeId: store2.id,
                            firstName: 'John',
                            lastName: 'Doe',
                        });
                        const serviceOrderByCustomerWithName = await createServiceOrder(
                            store2.id,
                            customerWithName.id,
                            'COMPLETED'
                        );
    
                        await expectServiceOrderFilteredByKeyword(
                            serviceOrderByCustomerWithName, 
                            customerWithName.firstName, 
                            'firstName'
                        );
    
                        await expectServiceOrderFilteredByKeyword(
                            serviceOrderByCustomerWithName, 
                            customerWithName.lastName, 
                            'lastName'
                        );
                    });
    
                    it('should correctly filter by keyword = email', async () => {
                        const customerWithEmail = await factory.create(FACTORIES_NAMES.storeCustomer, { 
                            storeId: store2.id,
                            email: 'some@email.com'
                        });
                        const serviceOrderByCustomerWithEmail = await createServiceOrder(
                            store2.id,
                            customerWithEmail.id,
                            'CANCELLED'
                        );
                        await expectServiceOrderFilteredByKeyword(
                            serviceOrderByCustomerWithEmail, 
                            customerWithEmail.email, 
                            'email'
                        );
                    });
    
                    it('should correctly filter by keyword = phoneNumber', async () => {
                        const customerWithPhoneNumber = await factory.create(FACTORIES_NAMES.storeCustomer, { 
                            storeId: store2.id,
                            phoneNumber: '100500',
                        });
                        const serviceOrderByCustomerWithPhoneNumber = await createServiceOrder(
                            store2.id,
                            customerWithPhoneNumber.id,
                            'CANCELLED'
                        );
                        await expectServiceOrderFilteredByKeyword(
                            serviceOrderByCustomerWithPhoneNumber, 
                            customerWithPhoneNumber.phoneNumber, 
                            'phoneNumber'
                        );
                    });
    
                    it('should correctly filter by keyword = orderCode', async () => {
                        const serviceOrderWithOrderCode = await createServiceOrder(
                            store2.id,
                            store2Customer.id,
                            'CANCELLED',
                            {
                                orderCode: 'OrderCode'
                            }
                        );
                        await expectServiceOrderFilteredByKeyword(
                            serviceOrderWithOrderCode, 
                            serviceOrderWithOrderCode.orderCode, 
                            'orderCode'
                        );
                    });
                });
            })


            describe('with sortBy/sortOrder/orderBy params', () => {
                let serviceOrderIds, testStoreIds;
                beforeEach(async () => {
                    const storeCustomer = await factory.create(FACTORIES_NAMES.storeCustomer, { 
                        firstName: '1',
                        lastName: '1',
                        storeId: store.id 
                    });
                    const store2Customer = await factory.create(FACTORIES_NAMES.storeCustomer, { 
                        firstName: '2',
                        lastName: '2',
                        storeId: store2.id 
                    });
    
                    const firstServiceOrder = await createServiceOrder(
                        store.id,
                        storeCustomer.id,
                        'COMPLETED',
                        {
                            placedAt: new Date('1971-04-01T00:30:00.000Z').toISOString(),
                            orderCode: '1',
                        }
                    );
                    const secondServiceOrder = await createServiceOrder(
                        store2.id,
                        store2Customer.id,
                        'CANCELLED',
                        {
                            placedAt: new Date('2022-04-01T00:30:00.000Z').toISOString(),
                            orderCode: '2',
                        },
                        5
                    );

                    serviceOrderIds = [
                        firstServiceOrder.id,
                        secondServiceOrder.id,
                    ];
                    testStoreIds = [store.id, store2.id];
                });

                const expectServiceOrdersSorted = async ({
                    sortBy, 
                    sortOrder, 
                    orderBy, 
                    reverseExpectedOrder = false,
                    errorCode = null
                }) => {
                    const expectedResult = reverseExpectedOrder
                        ? [...serviceOrderIds].reverse()
                        : serviceOrderIds;
                    const testParams = {
                        page: 1,
                        stores: testStoreIds,
                        sortBy,
                        sortOrder,
                        orderBy
                    }
                    const res = await ChaiHttpRequestHelper.get(ENDPOINT_URL, testParams)
                        .set('authtoken', token);
                    const failedExpectationMessage = errorCode
                        ? `expect error when sorted with params ${JSON.stringify({sortBy, sortOrder, orderBy})}`
                        : `expect to be correctly sorted with params ${JSON.stringify({sortBy, sortOrder, orderBy})}`;
                    expect(res, failedExpectationMessage).to.have.status(errorCode || 200);
                    if(!errorCode) {
                        expect(
                            res.body.orders.map((o) => o.id),
                            failedExpectationMessage
                        ).to.have.ordered.members(expectedResult);
                    }
                };

                it('should match `placedAt` sorting expectations', async () => {
                    await expectServiceOrdersSorted({
                        sortBy: 'placedAt',
                        sortOrder: 'up'
                    });
                    await expectServiceOrdersSorted({
                        sortBy: 'placedAt',
                        sortOrder: 'down',
                        reverseExpectedOrder: true
                    });
                    // expect correct sorting firstly by `store.name` then by `placedAt` when `orderBy = 'location'`
                    await expectServiceOrdersSorted({
                        sortBy: 'placedAt',
                        sortOrder: 'up',
                        orderBy: 'location',
                    });
                    await expectServiceOrdersSorted({
                        sortBy: 'placedAt',
                        sortOrder: 'down',
                        orderBy: 'location',
                    });
                });

                it('should match `bagCount` sorting expectations', async () => {
                    await expectServiceOrdersSorted({
                        sortBy: 'bagCount',
                        sortOrder: 'up',
                    });
                    await expectServiceOrdersSorted({
                        sortBy: 'bagCount',
                        sortOrder: 'down',
                        reverseExpectedOrder: true
                    });
                    // expect correct sorting firstly by `store.name` then by `bagCount` when `orderBy = 'location'`
                    await expectServiceOrdersSorted({
                        sortBy: 'bagCount',
                        sortOrder: 'up',
                        orderBy: 'location',
                    });
                    await expectServiceOrdersSorted({
                        sortBy: 'bagCount',
                        sortOrder: 'down',
                        orderBy: 'location',
                    });
                });

                it('should match `id` sorting expectations', async () => {
                    await expectServiceOrdersSorted({
                        sortBy: 'id',
                        sortOrder: 'up',
                    });
                    await expectServiceOrdersSorted({
                        sortBy: 'id',
                        sortOrder: 'down',
                        reverseExpectedOrder: true
                    });
                    // expect correct sorting firstly by `store.name` then by `id` when `orderBy = 'location'`
                    await expectServiceOrdersSorted({
                        sortBy: 'id',
                        sortOrder: 'up',
                        orderBy: 'location',
                    });
                    await expectServiceOrdersSorted({
                        sortBy: 'id',
                        sortOrder: 'down',
                        orderBy: 'location',
                    });
                });

                it('should match `name` sorting expectations', async () => {
                    await expectServiceOrdersSorted({
                        sortBy: 'name',
                        sortOrder: 'up',
                    });
                    await expectServiceOrdersSorted({
                        sortBy: 'name',
                        sortOrder: 'down',
                        reverseExpectedOrder: true
                    });
                    // expect correct sorting firstly by `store.name` then by `name` when `orderBy = 'location'`
                    await expectServiceOrdersSorted({
                        sortBy: 'name',
                        sortOrder: 'up',
                        orderBy: 'location',
                    });
                    await expectServiceOrdersSorted({
                        sortBy: 'name',
                        sortOrder: 'down',
                        orderBy: 'location',
                    });
                });

                it('should match `paymentStatus` sorting expectations (as one of supported sortFields)', async () => {
                    await expectServiceOrdersSorted({
                        sortBy: 'paymentStatus',
                        sortOrder: 'up',
                    });
                    await expectServiceOrdersSorted({
                        sortBy: 'paymentStatus',
                        sortOrder: 'down',
                    });
                    // expect correct sorting firstly by `store.name` then by some other field when `orderBy = 'location'`
                    await expectServiceOrdersSorted({
                        sortBy: 'paymentStatus',
                        sortOrder: 'up',
                        orderBy: 'location',
                    });
                    await expectServiceOrdersSorted({
                        sortBy: 'paymentStatus',
                        sortOrder: 'down',
                        orderBy: 'location',
                    });
                });

                it('should sort by default using `orderCode DESC` if sortOrder is NOT specified', async () => {
                    await expectServiceOrdersSorted({
                        sortBy: '',
                        sortOrder: '',
                        reverseExpectedOrder: true
                    });
                });

                it('should return error if `sortBy` field is not valid field for sorting', async () => {
                    await expectServiceOrdersSorted({
                        sortBy: '',
                        sortOrder: 'down',
                        errorCode: 500
                    });
                });
            });
        });

        describe('when api version is greater than 1.4.63', () => {
            let completedServiceOrder,
                activeServiceOrder,
                completedInventoryOrder;

            beforeEach(async () => {
                storeCustomer = await factory.create(FACTORIES_NAMES.storeCustomer, { storeId: store.id });
                completedServiceOrder = await createServiceOrder(
                    store.id,
                    storeCustomer.id,
                    'COMPLETED',
                );
                activeServiceOrder = await createServiceOrder(
                    store.id,
                    storeCustomer.id,
                    'SUBMITTED'
                );
                completedInventoryOrder = await createInventoryOrder(store.id, storeCustomer.id, 0);

                await createInventoryOrder(store.id, storeCustomer.id, 10);
            });
            it('should respond with 200', async () => {
                const res = await ChaiHttpRequestHelper.get(ENDPOINT_URL, params)
                    .set('authtoken', token)
                    .set('Version', '1.4.66')
                res.should.have.status(200);
                expect(res.body.orders.length).to.equal(2);
                expect(res.body.orders[0].serviceOrderBags).to.not.be.undefined;
                expect(res.body.orders[1].serviceOrderBags).to.not.be.undefined;
            });
            describe('when statuses param is missing', () => {
                it('should fetch cancelled and completed orders', async () => {
                    const res = await ChaiHttpRequestHelper.get(ENDPOINT_URL, params)
                        .set('authtoken', token)
                        .set('Version', '1.4.66');
                    res.should.have.status(200);
                    expect(res.body.orders.map((o) => o.id)).to.have.ordered.members([
                        completedServiceOrder.id,
                        completedInventoryOrder.id,
                    ]);
                    expect(res.body.orders.length).to.equal(2);
                    expect(res.body.orders[0].serviceOrderBags).to.not.be.undefined;
                    expect(res.body.orders[1].serviceOrderBags).to.not.be.undefined;
                });
            });

            describe('with statuses param', () => {
                beforeEach(async () => {
                    params.statuses = ['SUBMITTED', 'READY_FOR_PICKUP'];
                });
                it('should fetch only service orders matches with status', async () => {
                    const res = await ChaiHttpRequestHelper.get(ENDPOINT_URL, params)
                        .set('authtoken', token)
                        .set('Version', '1.4.66');
                    res.should.have.status(200);
                    expect(res.body.orders.map((o) => o.id)).to.have.ordered.members([
                        activeServiceOrder.id,
                    ]);
                    expect(res.body.orders.length).to.equal(1);
                    expect(res.body.orders[0].serviceOrderBags).to.not.be.undefined;
                });
            });

            describe('with keyword', () => {
                let serviceOrder;
                beforeEach(async () => {
                    storeCustomer = await factory.create(FACTORIES_NAMES.storeCustomer, {
                        storeId: store.id,
                        firstName: 'randomNameASD',
                        lastName: 'Toe',
                    });
                    serviceOrder = await createServiceOrder(
                        store.id,
                        storeCustomer.id,
                        'COMPLETED',
                    );
                    params.keyword = 'randomNameASD';
                });

                it('should filter based on the keyword', async () => {
                    const res = await ChaiHttpRequestHelper.get(ENDPOINT_URL, params)
                        .set('authtoken', token)
                        .set('Version', '1.4.66');
                    res.should.have.status(200);
                    expect(res.body.orders.length).to.equal(1);
                    expect(res.body.orders[0].serviceOrderBags).to.not.be.undefined;
                    expect(res.body.orders.map((o) => o.id)).to.have.ordered.members([
                        serviceOrder.id,
                    ]);
                });
            });

            describe('with stores', () => {
                let store2, store2ServiceOrder;
                beforeEach(async () => {
                    store2 = await factory.create(FACTORIES_NAMES.store);
                    const store2Customer = await factory.create(FACTORIES_NAMES.storeCustomer, { storeId: store2.id });

                    store2ServiceOrder = await createServiceOrder(
                        store2.id,
                        store2Customer.id,
                        'READY_FOR_PICKUP'
                    );
                });

                it('should filter based on the store ids', async () => {
                    const testParams = {
                        ...params,
                        sortBy: 'status',
                        sortOrder: 'up',
                        statuses: ['SUBMITTED', 'READY_FOR_PICKUP'],
                        stores: [store.id, store2.id]
                    }
                    const res = await ChaiHttpRequestHelper.get(ENDPOINT_URL, testParams)
                        .set('authtoken', token)
                        .set('Version', '1.4.66');
                    res.should.have.status(200);
                    expect(res.body.orders.map((o) => o.id)).to.have.ordered.members([
                        store2ServiceOrder.id,
                        activeServiceOrder.id,
                    ]);
                });

                it('should throw 500 if incorrect store ids', async () => {
                    const testParams = {
                        ...params,
                        statuses: ['SUBMITTED', 'READY_FOR_PICKUP'],
                        stores: [store, store2]
                    }
                    const res = await ChaiHttpRequestHelper.get(ENDPOINT_URL, testParams)
                        .set('authtoken', token)
                        .set('Version', '1.4.66');
                    res.should.have.status(500);
                });
            });
        });
    });
});
