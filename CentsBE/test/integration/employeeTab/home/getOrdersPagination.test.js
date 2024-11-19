require('../../../testHelper');
const ChaiHttpRequestHepler = require('../../../support/chaiHttpRequestHelper');
const ServiceOrder = require('../../../../models/serviceOrders');
const StoreCustomer = require('../../../../models/storeCustomer');
const factory = require('../../../factories');
const { generateToken } = require('../../../support/apiTestHelper');
const { expect } = require('../../../support/chaiHelper');
const { statuses } = require('../../../../constants/constants');
const { FACTORIES_NAMES: FN } = require('../../../constants/factoriesNames');
const {
    itShouldCorrectlyAssertTokenPresense,
    assertGetResponseError,
} = require('../../../support/httpRequestsHelper');
const {
    filterBySearch,
    validatePageNumber,
    validateStores,
    mapResponse,
    getOrdersQuery,
} = require('../../../../routes/employeeTab/home/getOrdersPagination');
const { raw } = require('objection');

const totalOrdersCount = 2;
const apiEndPoint = '/api/v1/employee-tab/home/orders-pagination';

describe('test getOrdersPagination', () => {
    let hubStore, token, serviceOrders;

    beforeEach(async () => {
        hubStore = await factory.create(FN.store, {
            isHub: true,
        });
        token = generateToken({
            id: hubStore.id,
        });
        serviceOrders = await factory.createMany(FN.serviceOrder, totalOrdersCount, {
            storeId: hubStore.id,
            hubId: hubStore.id,
            status: statuses.SUBMITTED,
            rack: 'RACK',
            notes: 'NOTES',
            completedAt: null,
        });
    });

    itShouldCorrectlyAssertTokenPresense(assertGetResponseError, () => apiEndPoint);

    it('should fail when page is not passed', async () => {
        const res = await ChaiHttpRequestHepler.get(apiEndPoint, {}).set('authtoken', token);
        res.should.have.status(422);
        expect(res.body)
            .to.have.property('error')
            .to.equal('child "page" fails because ["page" is required]');
    });

    it('should fail when storeIds are not valid', async () => {
        const res = await ChaiHttpRequestHepler.get(apiEndPoint, {
            page: 1,
            stores: ['a', 'b'],
        }).set('authtoken', token);
        res.should.have.status(422);
        expect(res.body).to.have.property('error').to.equal('Store Ids are Invalid');
    });

    it('should return first page of pagination orders', async () => {
        const res = await ChaiHttpRequestHepler.get(apiEndPoint, {
            page: 1,
            sortBy: 'name',
        }).set('authtoken', token);

        res.should.have.status(200);
        expect(res.body).to.have.property('success').to.be.true;
        expect(res.body).to.have.property('totalOrders').to.equal(totalOrdersCount);
        expect(res.body.orders.length).to.equal(totalOrdersCount);
        const firstOrder = res.body.orders[0];
        expect(firstOrder.rack).to.equal(serviceOrders[0].rack);
        expect(firstOrder.notes).to.equal(serviceOrders[0].notes);
        expect(firstOrder.completedAt).to.equal('');
    });

    it('should return empty array when there are no orders on passed page', async () => {
        const res = await ChaiHttpRequestHepler.get(apiEndPoint, {
            page: 2,
        }).set('authtoken', token);

        res.should.have.status(200);
        expect(res.body).to.have.property('success').to.be.true;
        expect(res.body).to.have.property('totalOrders').to.equal(0);
        expect(res.body).to.have.property('orders').to.be.empty;
    });

    describe('with many stores', () => {
        let stores, store1, store2, anotherServiceOrders, anotherServiceOrders2;
        beforeEach(async () => {
            store1 = await factory.create(FN.store, {
                name: 'test name',
            });
            store2 = await factory.create(FN.store, {
                businessId: store1.businessId,
            });
            stores = [store1, store2];
            anotherServiceOrders = await factory.createMany(FN.serviceOrder, totalOrdersCount, {
                storeId: stores[0].id,
                hubId: hubStore.id,
                status: statuses.SUBMITTED,
            });
            anotherServiceOrders2 = await factory.createMany(FN.serviceOrder, totalOrdersCount, {
                storeId: stores[1].id,
                hubId: hubStore.id,
                status: statuses.PROCESSING,
            });
        });

        it(`should return orders when stores don't includes hub`, async () => {
            const storeIds = stores.map((store) => store.id);
            const orderStatuses = [statuses.SUBMITTED, statuses.PROCESSING];
            const res = await ChaiHttpRequestHepler.get(apiEndPoint, {
                page: 1,
                stores: storeIds,
                statuses: orderStatuses,
                sortBy: 'status',
            }).set('authtoken', token);

            res.should.have.status(200);
            expect(res.body).to.have.property('success').to.be.true;
            expect(res.body)
                .to.have.property('totalOrders')
                .to.equal(totalOrdersCount * 2);
            expect(res.body.orders.length).to.equal(4);
            const firstOrder = res.body.orders[0];
            const lastOrder = res.body.orders[res.body.orders.length - 1];
            expect(firstOrder).to.have.property('hubId').to.equal(hubStore.id);
            expect(orderStatuses.includes(firstOrder.status)).to.be.true;
            expect(storeIds.includes(firstOrder.storeId)).to.be.true;
            expect(firstOrder.id > lastOrder.id).to.be.true;
        });

        it('should return orders when stores includes hub', async () => {
            const storeIds = [...stores.map((store) => store.id), hubStore.id];
            const orderStatuses = [statuses.SUBMITTED, statuses.PROCESSING];
            const res = await ChaiHttpRequestHepler.get(apiEndPoint, {
                page: 1,
                stores: storeIds,
                statuses: orderStatuses,
                orderBy: 'location',
            }).set('authtoken', token);

            res.should.have.status(200);
            expect(res.body).to.have.property('success').to.be.true;
            expect(res.body)
                .to.have.property('totalOrders')
                .to.equal(totalOrdersCount * 3);
            expect(res.body.orders.length).to.equal(6);
            const firstOrder = res.body.orders[0];
            expect(firstOrder).to.have.property('hubId').to.equal(hubStore.id);
            expect(orderStatuses.includes(firstOrder.status)).to.be.true;
            expect(storeIds.includes(firstOrder.storeId)).to.be.true;
        });

        it('should return orders when currentStore is not hub', async () => {
            token = generateToken({
                id: stores[0].id,
            });
            const storeIds = stores.map((store) => store.id);
            const orderStatuses = [statuses.SUBMITTED, statuses.PROCESSING];
            const res = await ChaiHttpRequestHepler.get(apiEndPoint, {
                page: 1,
                stores: storeIds,
                statuses: orderStatuses,
            }).set('authtoken', token);

            res.should.have.status(200);
            expect(res.body).to.have.property('success').to.be.true;
            expect(res.body).to.have.property('totalOrders').to.equal(totalOrdersCount);
            expect(res.body.orders.length).to.equal(2);
            const firstOrder = res.body.orders[0];
            expect(firstOrder).to.have.property('hubId').to.not.equal(firstOrder.storeId);
        });

        it('should fail when statuses are not provided', async () => {
            const storeIds = [...stores.map((store) => store.id), hubStore.id];
            const res = await ChaiHttpRequestHepler.get(apiEndPoint, {
                page: 1,
                stores: storeIds,
            }).set('authtoken', token);

            res.should.have.status(500);
            expect(res.body).to.have.property('error');
        });

        describe('test sorting', () => {
            let payloadSample, storeIds, orderStatuses;
            beforeEach(async () => {
                storeIds = [...stores.map((store) => store.id), hubStore.id];
                orderStatuses = [statuses.SUBMITTED, statuses.PROCESSING];
                payloadSample = {
                    page: 1,
                    stores: storeIds,
                    statuses: orderStatuses,
                    sortBy: 'storeName',
                };
            });

            it('should sort by storeName', async () => {
                const payload = { ...payloadSample, sortBy: 'storeName' };

                const res = await ChaiHttpRequestHepler.get(apiEndPoint, payload).set(
                    'authtoken',
                    token,
                );
                res.should.have.status(200);
                const firstOrder = res.body.orders[0];
                const lastOrder = res.body.orders[res.body.orders.length - 1];
                expect(firstOrder.storeName > lastOrder.storeName).to.be.true;

                const ascRes = await ChaiHttpRequestHepler.get(apiEndPoint, {
                    ...payload,
                    sortOrder: 'up',
                }).set('authtoken', token);

                ascRes.should.have.status(200);
                const firstAscOrder = ascRes.body.orders[0];
                const lastAscOrder = ascRes.body.orders[ascRes.body.orders.length - 1];
                expect(firstAscOrder.storeName < lastAscOrder.storeName).to.be.true;
            });

            it('should sort by id', async () => {
                const payload = { ...payloadSample, sortBy: 'id' };

                const res = await ChaiHttpRequestHepler.get(apiEndPoint, payload).set(
                    'authtoken',
                    token,
                );
                res.should.have.status(200);
                const firstOrder = res.body.orders[0];
                const lastOrder = res.body.orders[res.body.orders.length - 1];
                expect(firstOrder.id > lastOrder.id).to.be.true;

                const ascRes = await ChaiHttpRequestHepler.get(apiEndPoint, {
                    ...payload,
                    sortOrder: 'up',
                }).set('authtoken', token);

                ascRes.should.have.status(200);
                const firstAscOrder = ascRes.body.orders[0];
                const lastAscOrder = ascRes.body.orders[ascRes.body.orders.length - 1];
                expect(firstAscOrder.id < lastAscOrder.id).to.be.true;
            });

            it('should sort by bagCount', async () => {
                const payload = { ...payloadSample, sortBy: 'bagCount' };

                const res = await ChaiHttpRequestHepler.get(apiEndPoint, payload).set(
                    'authtoken',
                    token,
                );
                res.should.have.status(200);
                const firstOrder = res.body.orders[0];
                const lastOrder = res.body.orders[res.body.orders.length - 1];
                expect(Number(firstOrder.bagCount) <= Number(lastOrder.bagCount)).to.be.true;

                const ascRes = await ChaiHttpRequestHepler.get(apiEndPoint, {
                    ...payload,
                    sortOrder: 'down',
                }).set('authtoken', token);

                ascRes.should.have.status(200);
                const firstAscOrder = ascRes.body.orders[0];
                const lastAscOrder = ascRes.body.orders[ascRes.body.orders.length - 1];
                expect(Number(firstAscOrder.bagCount) >= Number(lastAscOrder.bagCount)).to.be.true;
            });
        });
    });
});

describe('test getOrdersPagination methods', () => {
    describe('test filterBySearch method', () => {
        const serviceOrderQuery = ServiceOrder.query()
            .select(
                '*',
                raw(
                    '"storeCustomers"."firstName" || \' \'|| "storeCustomers"."lastName" as "boFullName"',
                ),
                raw(
                    '"centsCustomers"."firstName" || \' \'|| "centsCustomers"."lastName" as "fullName"',
                ),
            )
            .leftJoin(
                `${StoreCustomer.tableName}`,
                `${ServiceOrder.tableName}.storeCustomerId`,
                `${StoreCustomer.tableName}.id`,
            )
            .leftJoin('centsCustomers', 'centsCustomers.id', 'storeCustomers.centsCustomerId');

        it('should filter orders by keyword', async () => {
            const centsCustomer = await factory.create(FN.centsCustomer);
            const storeCustomer = await factory.create(FN.storeCustomer, {
                centsCustomerId: centsCustomer.id,
            });
            await factory.create(FN.serviceOrder, {
                storeCustomerId: storeCustomer.id,
            });
            const filteredOrders = filterBySearch(`${centsCustomer.firstName}`, serviceOrderQuery);
            const orders = await filteredOrders;

            expect(orders.length).to.be.equal(1);
            expect(orders[0].fullName.includes(centsCustomer.firstName)).to.be.true;
        });
    });

    describe('test validatePageNumber method', () => {
        const expectValidationError = (validation, expectedMessage) => {
            expect(validation.error?.name).to.be.equal('ValidationError');
            expect(validation.error?.details.length).to.be.equal(1);
            expect(validation.error?.details[0].message).to.be.equal(expectedMessage);
        };

        const optionalInputProps = {
            withoutPagination: false,
            statuses: [statuses.SUBMITTED, statuses.PROCESSING],
            orderBy: 'location',
            stores: [1, 2],
            sortBy: 'status',
            sortOrder: 'up',
        };

        const requiredInputProps = {
            page: 1,
        };

        it('should accept minimal correct input', () => {
            const validation = validatePageNumber({ ...requiredInputProps });
            expect(validation.error).to.be.a('null');
        });

        it('should accept minimal correct input even if some fields are null', () => {
            const validation = validatePageNumber({
                ...requiredInputProps,
                statuses: null,
                stores: null,
                orderBy: null,
                sortBy: null,
            });
            expect(validation.error).to.be.a('null');
        });

        it('should accept minimal correct input even if some fields are empty string', () => {
            const validation = validatePageNumber({
                ...requiredInputProps,
                statuses: '',
                stores: '',
                orderBy: '',
                sortBy: '',
            });
            expect(validation.error).to.be.a('null');
        });

        it('should accept correct input', () => {
            const validation = validatePageNumber({
                ...requiredInputProps,
                ...optionalInputProps,
            });
            expect(validation.error).to.be.a('null');
        });

        it('should allow to skip `sortOrder` if `sortBy` is also skipped', () => {
            const validation = validatePageNumber({
                ...requiredInputProps,
                ...optionalInputProps,
                sortBy: undefined,
                sortOrder: undefined,
            });
            expect(validation.error).to.be.a('null');
        });

        it('should prevent skipping `page`', () => {
            expectValidationError(
                validatePageNumber({
                    ...optionalInputProps,
                }),
                '"page" is required',
            );
        });

        it('should allow to skip `page` if withoutPagination=true', () => {
            const validation1 = validatePageNumber({
                ...optionalInputProps,
                withoutPagination: true,
            });
            expect(validation1.error).to.be.a('null');

            const validation2 = validatePageNumber({
                ...optionalInputProps,
                withoutPagination: true,
                page: undefined,
            });
            expect(validation2.error).to.be.a('null');

            const validation3 = validatePageNumber({
                ...optionalInputProps,
                withoutPagination: true,
                page: '',
            });
            expect(validation3.error).to.be.a('null');

            const validation4 = validatePageNumber({
                ...optionalInputProps,
                withoutPagination: true,
                page: null,
            });
            expect(validation4.error).to.be.a('null');
        });

        it('should prevent incorrect `page` values', () => {
            expectValidationError(
                validatePageNumber({
                    ...optionalInputProps,
                    page: -1,
                }),
                '"page" must be larger than or equal to 1',
            );

            expectValidationError(
                validatePageNumber({
                    ...optionalInputProps,
                    page: '',
                }),
                '"page" must be a number',
            );

            expectValidationError(
                validatePageNumber({
                    ...optionalInputProps,
                    page: 'abc',
                }),
                '"page" must be a number',
            );
        });

        it('should prevent incorrect `orderBy` values', () => {
            expectValidationError(
                validatePageNumber({
                    ...requiredInputProps,
                    ...optionalInputProps,
                    orderBy: 'not-location',
                }),
                '"orderBy" must be one of [location, null, ]',
            );
        });

        describe('when sortBy is set', () => {
            [
                'id',
                'name',
                'placedAt',
                'paymentStatus',
                'bagCount',
                'storeName',
                'status',
                null,
            ].forEach((value) => {
                it(`should allow to skip 'sortOrder' even if 'sortBy' = ${value}`, () => {
                    const validation = validatePageNumber({
                        ...requiredInputProps,
                        ...optionalInputProps,
                        sortBy: value,
                        sortOrder: undefined,
                    });
                    expect(validation.error).to.be.a('null');
                });
            });

            it('should fail if `sortBy` is invalid', () => {
                const validation = validatePageNumber({
                    ...requiredInputProps,
                    ...optionalInputProps,
                    sortBy: '1nv@l1d-v@lue-h3r3',
                    sortOrder: undefined,
                });

                expectValidationError(
                    validation,
                    '"sortBy" must be one of [id, name, placedAt, paymentStatus, bagCount, storeName, status, null, ]',
                );
            });

            it('should require correct `sortOrder` value if correct `sortBy` is provided', () => {
                const validation1 = validatePageNumber({
                    ...requiredInputProps,
                    ...optionalInputProps,
                    sortBy: 'id',
                    sortOrder: 'up',
                });
                expect(validation1.error).to.be.a('null');

                const validation2 = validatePageNumber({
                    ...requiredInputProps,
                    ...optionalInputProps,
                    sortBy: 'name',
                    sortOrder: 'down',
                });
                expect(validation2.error).to.be.a('null');
            });

            it('should fail if incorrect `sortOrder` value is provided', () => {
                expectValidationError(
                    validatePageNumber({
                        ...requiredInputProps,
                        ...optionalInputProps,
                        sortBy: 'id',
                        sortOrder: '1UK0RR3KT_-_V@LU3',
                    }),
                    '"sortOrder" must be one of [up, down]',
                );
            });
        });
    });

    describe('test validateStores method', () => {
        it('should reject when storeId is not an array of numbers', async () => {
            const EXPECTED_ERROR_MESSAGE = 'STORE_IDS_ARE_NOT_VALID';

            await expect(validateStores()).to.be.rejectedWith(EXPECTED_ERROR_MESSAGE);

            await expect(validateStores({})).to.be.rejectedWith(EXPECTED_ERROR_MESSAGE);

            await expect(validateStores(1)).to.be.rejectedWith(EXPECTED_ERROR_MESSAGE);

            await expect(validateStores('')).to.be.rejectedWith(EXPECTED_ERROR_MESSAGE);

            await expect(validateStores(null)).to.be.rejectedWith(EXPECTED_ERROR_MESSAGE);

            await expect(validateStores([1, {}])).to.be.rejectedWith(EXPECTED_ERROR_MESSAGE);

            await expect(validateStores(['a'])).to.be.rejectedWith(EXPECTED_ERROR_MESSAGE);
        });

        it('should resolve when valid storeIds passed', async () => {
            await expect(validateStores([1, 2])).to.be.fulfilled;

            await expect(validateStores([])).to.be.fulfilled;
        });
    });

    describe('test mapResponse method', () => {
        it('should return correct response for empty orders array', () => {
            const emptyOrdersArray = [];

            expect(mapResponse(emptyOrdersArray)).to.be.deep.equal({
                totalOrders: 0,
                resp: [],
            });
        });

        it('should return correct response for orders array', () => {
            const orders = [
                {
                    // to test normal flow
                    total_count: 2,
                    orderType: 'RESIDENTIAL',
                    orderCode: 123,
                    boFullName: 'boFullName',
                    hubName: 'hubName',
                    rack: 'rack',
                    hubAddress: 'hubAddress',
                    notes: 'notes',
                    completedAt: 'completedAt',
                    serviceOrderWeights: [{ id: 1, orderItemId: 1 }],
                    bagCount: 2,
                    serviceOrderBags: [],
                },
                {
                    // to test default/alternative flows
                    total_count: 2,
                    orderCode: 123,
                    fullName: 'fullName',
                    // hubName: undefined,
                    // hubAddress: undefined,
                    // notes: undefined,
                    // completedAt: undefined,
                    // bagCount: undefined
                    // serviceOrderBags: undefined
                },
            ];

            const result = mapResponse(orders);
            expect(result).to.have.all.keys('totalOrders', 'resp');
            expect(result.totalOrders).to.be.equal(2);
            expect(result.resp[0], '1st order should be correctly mapped').to.be.deep.equal({
                orderType: 'RESIDENTIAL',
                orderCode: 123,
                orderCodeWithPrefix: 'RWF-123',
                fullName: 'boFullName',
                hubName: 'hubName',
                rack: 'rack',
                hubAddress: 'hubAddress',
                notes: 'notes',
                completedAt: 'completedAt',
                serviceOrderWeights: [{ id: 1, orderItemId: 1 }],
                bagCount: 2,
                serviceOrderBags: [],
                orderItemId: 1,
            });
            expect(result.resp[1], '2nd order should be correctly mapped').to.be.deep.equal({
                orderCode: 123,
                orderCodeWithPrefix: 'WF-123',
                fullName: 'fullName',
                hubName: '',
                rack: '',
                hubAddress: '',
                notes: '',
                completedAt: '',
                serviceOrderWeights: [],
                bagCount: 0,
                serviceOrderBags: [],
                orderItemId: '',
            });
        });
    });

    describe('test getOrdersQuery method', () => {
        const assertOrdersQuery = async (
            expectedOrders,
            { store, stores, expectedTotalOrders, ...params },
        ) => {
            const {
                orderId,
                filterByStatuses,
                page = 1,
                withoutPagination,
                keyword,
                sortBy,
                sortOrder,
                orderBy,
            } = params;
            const { resp, totalOrders } = await getOrdersQuery(
                store,
                stores,
                orderId,
                filterByStatuses,
                page,
                keyword,
                sortBy,
                sortOrder,
                orderBy,
                withoutPagination,
            );

            const failedExpectationMessage = `expect correct output when params ${JSON.stringify(
                params,
            )}`;
            expect(Number(totalOrders), failedExpectationMessage).to.be.eq(
                expectedTotalOrders || expectedOrders.length,
            );
            expect(resp.length, failedExpectationMessage).to.be.eq(expectedOrders.length);
            expect(
                resp.map((r) => r.id),
                failedExpectationMessage,
            ).to.have.ordered.members(expectedOrders);
        };

        const createServiceOrder = async ({
            storeCustomer,
            serviceOrderBagsCount,
            ...serviceOrderFields
        }) => {
            const serviceOrder = await factory.create(FN.serviceOrder, {
                storeId: storeCustomer.storeId,
                storeCustomerId: storeCustomer.id,
                status: statuses.SUBMITTED,
                ...serviceOrderFields,
            });

            if (serviceOrderBagsCount > 0) {
                await factory.createMany(FN.serviceOrderBag, serviceOrderBagsCount, {
                    serviceOrderId: serviceOrder.id,
                });
            }

            return serviceOrder;
        };

        describe('for store with isHub = false', () => {
            let store, serviceOrdersSubmitted, serviceOrdersReadyForIntake, totalOrderCount;

            beforeEach(async () => {
                store = await factory.create(FN.store, {
                    isHub: false,
                });

                serviceOrdersSubmitted = await factory.createMany(FN.serviceOrder, 5, {
                    storeId: store.id,
                    status: statuses.SUBMITTED,
                });

                serviceOrdersReadyForIntake = await factory.createMany(FN.serviceOrder, 3, {
                    storeId: store.id,
                    status: statuses.READY_FOR_INTAKE,
                });

                totalOrderCount =
                    serviceOrdersSubmitted.length + serviceOrdersReadyForIntake.length;
            });

            it('should success for minimal set of input data for regular store sorted by default (by id in desc order)', async () => {
                const page = 1;
                const stores = undefined;
                const orderId = undefined;
                const filterByStatuses = undefined;

                const { resp, totalOrders } = await getOrdersQuery(
                    store,
                    stores,
                    orderId,
                    filterByStatuses,
                    page,
                );

                expect(totalOrders).to.be.eq(totalOrderCount);
                expect(resp.length).to.be.eq(totalOrderCount);
                expect(resp.map((r) => r.id)).to.have.ordered.members(
                    [
                        ...serviceOrdersSubmitted.map((o) => o.id),
                        ...serviceOrdersReadyForIntake.map((o) => o.id),
                    ].reverse(),
                );
            });

            it('should successfully return single SUBMITTED order by orderId', async () => {
                const page = 1;
                const stores = undefined;
                const orderId = serviceOrdersSubmitted[0].id;
                const filterByStatuses = [statuses.SUBMITTED];

                const { resp, totalOrders } = await getOrdersQuery(
                    store,
                    stores,
                    orderId,
                    filterByStatuses,
                    page,
                );

                expect(totalOrders).to.be.eq(1);
                expect(resp.length).to.be.eq(1);
            });

            it('should successfully return only SUBMITTED orders', async () => {
                const page = 1;
                const stores = undefined;
                const orderId = undefined;
                const filterByStatuses = [statuses.SUBMITTED];

                const { resp, totalOrders } = await getOrdersQuery(
                    store,
                    stores,
                    orderId,
                    filterByStatuses,
                    page,
                );

                expect(totalOrders).to.be.eq(serviceOrdersSubmitted.length);
                expect(resp.length).to.be.eq(serviceOrdersSubmitted.length);
            });
        });

        describe('for passed sortBy/sortOrder/ordeBy', () => {
            let hubStore, store1, store2, store1Customer, store2Customer;
            beforeEach(async () => {
                hubStore = await factory.create(FN.store, {
                    isHub: true,
                    name: 'Store #0',
                });
                store1 = await factory.create(FN.store, {
                    hubId: hubStore.id,
                    name: 'Store #1',
                });
                store2 = await factory.create(FN.store, {
                    hubId: hubStore.id,
                    name: 'Store #2',
                });
                store1Customer = await factory.create(FN.storeCustomer, {
                    storeId: store1.id,
                    firstName: '111',
                    lastName: '111',
                });
                store2Customer = await factory.create(FN.storeCustomer, {
                    storeId: store2.id,
                    firstName: '222',
                    lastName: '222',
                });
            });

            it('should correctly sort by `rack` when store is hub and storeIDs does not contain hubStore.id', async () => {
                const store1Params = {
                    storeCustomer: store1Customer,
                    hubId: hubStore.id,
                };
                const serviceOrder1 = await createServiceOrder({
                    ...store1Params,
                    rack: 'RACK #2',
                });
                const serviceOrder2 = await createServiceOrder({
                    ...store1Params,
                    rack: 'RACK #3',
                });
                const serviceOrder3 = await createServiceOrder({
                    ...store1Params,
                    rack: 'RACK #1',
                });

                const fixedParams = {
                    store: hubStore,
                    stores: [store1.id, store2.id],
                    sortBy: 'rack',
                };
                const expectedOrders = [serviceOrder3.id, serviceOrder1.id, serviceOrder2.id];
                await assertOrdersQuery(expectedOrders, { ...fixedParams, sortOrder: undefined }); // up by default
                await assertOrdersQuery(expectedOrders, { ...fixedParams, sortOrder: 'up' }); // up by default
                expectedOrders.reverse();
                await assertOrdersQuery(expectedOrders, { ...fixedParams, sortOrder: 'down' });
            });

            it('should correctly sort by `id`', async () => {
                const storeCustomer = store1Customer;
                const serviceOrder1 = await createServiceOrder({ storeCustomer });
                const serviceOrder2 = await createServiceOrder({ storeCustomer });
                const serviceOrder3 = await createServiceOrder({ storeCustomer });

                const fixedParams = {
                    store: store1,
                    sortBy: 'id',
                };
                const expectedOrders = [serviceOrder1.id, serviceOrder2.id, serviceOrder3.id];

                await assertOrdersQuery(expectedOrders, { ...fixedParams, sortOrder: 'up' });
                expectedOrders.reverse();
                await assertOrdersQuery(expectedOrders, { ...fixedParams, sortOrder: undefined }); // down by default
                await assertOrdersQuery(expectedOrders, { ...fixedParams, sortOrder: 'down' }); // down by default
            });

            it('should correctly sort by `placedAt`', async () => {
                const storeCustomer = store1Customer;
                const serviceOrder1 = await createServiceOrder({
                    storeCustomer,
                    placedAt: new Date('9-6-2022').toISOString(),
                });
                const serviceOrder2 = await createServiceOrder({
                    storeCustomer,
                    placedAt: new Date('11-6-2022').toISOString(),
                });
                const serviceOrder3 = await createServiceOrder({
                    storeCustomer,
                    placedAt: new Date('7-6-2022').toISOString(),
                });

                const fixedParams = {
                    store: store1,
                    sortBy: 'placedAt',
                };
                const expectedOrders = [serviceOrder3.id, serviceOrder1.id, serviceOrder2.id];
                await assertOrdersQuery(expectedOrders, { ...fixedParams, sortOrder: 'up' });
                expectedOrders.reverse();
                await assertOrdersQuery(expectedOrders, { ...fixedParams, sortOrder: undefined }); // down by default
                await assertOrdersQuery(expectedOrders, { ...fixedParams, sortOrder: 'down' }); // down by default
            });

            it('should correctly sort by `bagCount`', async () => {
                const storeCustomer = store1Customer;
                const serviceOrder1 = await createServiceOrder({
                    storeCustomer,
                    serviceOrderBagsCount: 3,
                });
                const serviceOrder2 = await createServiceOrder({
                    storeCustomer,
                    serviceOrderBagsCount: 4,
                });
                const serviceOrder3 = await createServiceOrder({
                    storeCustomer,
                    serviceOrderBagsCount: 5,
                });

                const fixedParams = {
                    store: store1,
                    sortBy: 'bagCount',
                };
                const expectedOrders = [serviceOrder3.id, serviceOrder2.id, serviceOrder1.id];
                await assertOrdersQuery(expectedOrders, { ...fixedParams, sortOrder: 'down' }); // down by default
                expectedOrders.reverse();
                await assertOrdersQuery(expectedOrders, { ...fixedParams, sortOrder: 'up' });
                await assertOrdersQuery(expectedOrders, { ...fixedParams, sortOrder: undefined });
            });

            it('should correctly sort orders by `storeName` when `orderBy` = "location" ignoring `sortOrder`', async () => {
                const hubId = hubStore.id;
                const serviceOrder1 = await createServiceOrder({
                    hubId,
                    storeCustomer: store2Customer,
                });
                const serviceOrder2 = await createServiceOrder({
                    hubId,
                    storeCustomer: store1Customer,
                });

                const fixedParams = {
                    store: hubStore,
                    stores: [store1.id, store2.id],
                    orderBy: 'location',
                };
                const expectedOrders = [serviceOrder2.id, serviceOrder1.id];
                await assertOrdersQuery(expectedOrders, { ...fixedParams, sortOrder: 'up' });
                await assertOrdersQuery(expectedOrders, { ...fixedParams, sortOrder: 'down' });
                await assertOrdersQuery(expectedOrders, { ...fixedParams });
            });

            it('should correctly sort orders by `storeName` asc firstly, then by `status` when sortBy = "status"', async () => {
                const hubId = hubStore.id;
                const storeCustomer = store1Customer;

                const serviceOrder6 = await createServiceOrder({
                    hubId,
                    storeCustomer,
                    status: statuses.PROCESSING,
                }); // order#6
                const serviceOrder1 = await createServiceOrder({
                    hubId,
                    storeCustomer,
                    status: statuses.READY_FOR_PROCESSING,
                }); // order#1
                const serviceOrder11 = await createServiceOrder({
                    hubId,
                    storeCustomer,
                    status: statuses.READY_FOR_PICKUP,
                }); // order#11
                const serviceOrder15store1 = await createServiceOrder({
                    hubId,
                    storeCustomer,
                    status: statuses.SUBMITTED,
                }); // order#15
                const serviceOrder15store2 = await createServiceOrder({
                    hubId,
                    storeCustomer: store2Customer,
                    status: statuses.SUBMITTED,
                }); // order#15

                const fixedParams = {
                    store: hubStore,
                    stores: [store1.id, store2.id],
                    sortBy: 'status',
                };
                const expectedOrdersUp = [
                    serviceOrder1.id,
                    serviceOrder6.id,
                    serviceOrder11.id,
                    serviceOrder15store1.id,
                    serviceOrder15store2.id,
                ];
                await assertOrdersQuery(expectedOrdersUp, { ...fixedParams, sortOrder: 'up' });
                await assertOrdersQuery(expectedOrdersUp, { ...fixedParams, sortOrder: undefined });

                const expectedOrdersDown = [
                    serviceOrder15store1.id,
                    serviceOrder15store2.id,
                    serviceOrder11.id,
                    serviceOrder6.id,
                    serviceOrder1.id,
                ];
                await assertOrdersQuery(expectedOrdersDown, { ...fixedParams, sortOrder: 'down' });
            });

            it('should correctly sort orders by `storeName`', async () => {
                const hubId = hubStore.id;
                const serviceOrder1 = await createServiceOrder({
                    hubId,
                    storeCustomer: store2Customer,
                });
                const serviceOrder2 = await createServiceOrder({
                    hubId,
                    storeCustomer: store1Customer,
                });

                const fixedParams = {
                    store: hubStore,
                    stores: [store1.id, store2.id],
                    sortBy: 'storeName',
                };
                const expectedOrdersUp = [serviceOrder2.id, serviceOrder1.id];
                await assertOrdersQuery(expectedOrdersUp, { ...fixedParams, sortOrder: 'up' });
                expectedOrdersUp.reverse();
                await assertOrdersQuery(expectedOrdersUp, { ...fixedParams, sortOrder: undefined });
                await assertOrdersQuery(expectedOrdersUp, { ...fixedParams, sortOrder: 'down' });
            });
        });

        describe('test pagination', () => {
            let store, serviceOrdersSubmitted;

            beforeEach(async () => {
                store = await factory.create(FN.store, {
                    isHub: false,
                });

                serviceOrdersSubmitted = await factory.createMany(FN.serviceOrder, 10, {
                    storeId: store.id,
                    status: statuses.SUBMITTED,
                });
            });

            it('should return [] when page = 2 and there are NO orders', async () => {
                await assertOrdersQuery([], {
                    store,
                    page: 2,
                });
            });

            it('should return single order when page = 2 and there are 11 orders or all orders if pagination disabled', async () => {
                const storeCustomer = await factory.create(FN.storeCustomer, { storeId: store.id });
                const serviceOrder = await createServiceOrder({ storeCustomer });
                const expectedOrdersDesc = [
                    ...serviceOrdersSubmitted.map((o) => o.id),
                    serviceOrder.id,
                ].reverse();

                const lastOrderIdx = expectedOrdersDesc.length - 1;
                await assertOrdersQuery([expectedOrdersDesc[lastOrderIdx]], {
                    store,
                    page: 2,
                    expectedTotalOrders: expectedOrdersDesc.length,
                });

                // page = 2 when orders 11 and withoutPagination === 'true' should return orders of 11 length
                await assertOrdersQuery(expectedOrdersDesc, {
                    store,
                    page: 2,
                    withoutPagination: 'true',
                });
            });
        });
    });
});
