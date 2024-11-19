require('../../../../testHelper');
const {
    assertPostResponseError,
    assertPostResponseSuccess,
} = require('../../../../support/httpRequestsHelper');
const { generateToken } = require('../../../../support/apiTestHelper');
const factory = require('../../../../factories');
const Settings = require('../../../../../models/businessSettings');
const { FACTORIES_NAMES } = require('../../../../constants/factoriesNames');
const ChaiHttpRequestHelper = require('../../../../support/chaiHttpRequestHelper');

const getApiEndpoint = () => {
    return `/api/v1/employee-tab/home/orders/inventory`;
};

describe('createOrder test', function () {
    let token, store, centsCustomer, laundromatBusiness, storeCustomer;
    beforeEach(async () => {
        centsCustomer = await factory.create(FACTORIES_NAMES.centsCustomer);
        storeCustomer = await factory.create(FACTORIES_NAMES.storeCustomer, {
            centsCustomerId: centsCustomer.id,
        });
        laundromatBusiness = await factory.create(FACTORIES_NAMES.laundromatBusiness);
        store = await factory.create(FACTORIES_NAMES.store, { businessId: laundromatBusiness.id });
        token = await generateToken({
            id: store.id,
        });
    });

    it('should throw 409 if products with duplicated ids in body', async () => {
        const body = {
            customer: {
                id: centsCustomer.id,
            },
            orderItems: [
                {
                    priceId: 1,
                    count: 2,
                    lineItemType: 'type',
                },
                {
                    priceId: 1,
                    count: 5,
                    lineItemType: 'type2',
                },
            ],
        };
        await assertPostResponseError({
            url: getApiEndpoint(),
            body,
            token,
            code: 409,
            expectedError: 'Duplicate products found in the order.',
        });
    });

    describe('tests for 422 codes', function () {
        it('should throw 422 if no customer id provided', async () => {
            const body = {
                customer: {
                    stripeCustomerId: 'test id',
                    centsCustomerId: 123,
                },
                orderItems: [
                    {
                        priceId: 1,
                        count: 2,
                        lineItemType: 'type',
                    },
                    {
                        priceId: 2,
                        count: 5,
                        lineItemType: 'type2',
                    },
                ],
            };
            await assertPostResponseError({
                url: getApiEndpoint(),
                body,
                token,
                code: 422,
                expectedError:
                    'child "customer" fails because [child "id" fails because ["id" is required]]',
            });
        });

        it('should throw 422 if no orderItems provided', async () => {
            const body = {
                customer: {
                    id: centsCustomer.id,
                    stripeCustomerId: 'test id',
                    centsCustomerId: 123,
                },
                orderItems: [],
            };
            await assertPostResponseError({
                url: getApiEndpoint(),
                body,
                token,
                code: 422,
                expectedError:
                    'child "orderItems" fails because ["orderItems" must contain at least 1 items]',
            });
        });

        it('should throw 422 if priceId in orderItems not provided', async () => {
            const body = {
                customer: {
                    id: centsCustomer.id,
                    stripeCustomerId: 'test id',
                    centsCustomerId: 123,
                },
                orderItems: [
                    {
                        count: 2,
                        lineItemType: 'type',
                    },
                    {
                        count: 5,
                        lineItemType: 'type2',
                    },
                ],
            };
            await assertPostResponseError({
                url: getApiEndpoint(),
                body,
                token,
                code: 422,
                expectedError:
                    'child "orderItems" fails because ["orderItems" at position 0 fails because [child "priceId" fails because ["priceId" is required]]]',
            });
        });

        it('should throw 422 if lineItemType in orderItems not provided', async () => {
            const body = {
                customer: {
                    id: centsCustomer.id,
                    stripeCustomerId: 'test id',
                    centsCustomerId: 123,
                },
                orderItems: [
                    {
                        priceId: 1,
                        count: 2,
                    },
                    {
                        priceId: 2,
                        count: 5,
                    },
                ],
            };
            await assertPostResponseError({
                url: getApiEndpoint(),
                body,
                token,
                code: 422,
                expectedError:
                    'child "orderItems" fails because ["orderItems" at position 0 fails because [child "lineItemType" fails because ["lineItemType" is required]]]',
            });
        });

        it('should throw 422 if employee code required but not provided', async () => {
            await Settings.query()
                .findOne({
                    businessId: store.businessId,
                })
                .patch({ requiresEmployeeCode: true });
            const body = {
                customer: {
                    id: centsCustomer.id,
                },
                orderItems: [
                    {
                        priceId: 1,
                        count: 2,
                        lineItemType: 'type',
                    },
                    {
                        priceId: 2,
                        count: 5,
                        lineItemType: 'type2',
                    },
                ],
            };
            await assertPostResponseError({
                url: getApiEndpoint(),
                body,
                token,
                code: 422,
                expectedError: 'child "employeeCode" fails because ["employeeCode" is required]',
            });
        });

        it('should throw 422 if storeCustomerId is provided but is not a number', async () => {
            const body = {
                customer: {
                    id: centsCustomer.id,
                    storeCustomerId: 'hi',
                },
                orderItems: [
                    {
                        priceId: 1,
                        count: 2,
                        lineItemType: 'type',
                    },
                    {
                        priceId: 2,
                        count: 5,
                        lineItemType: 'type2',
                    },
                ],
            };
            await assertPostResponseError({
                url: getApiEndpoint(),
                body,
                token,
                code: 422,
                expectedError:
                    'child "customer" fails because [child "storeCustomerId" fails because ["storeCustomerId" must be a number]]',
            });
        });
    });

    it('should throw 500 when wrong employeeCode is required but has provided wrong one', async () => {
        await Settings.query()
            .findOne({
                businessId: store.businessId,
            })
            .patch({ requiresEmployeeCode: true });
        const body = {
            employeeCode: -12345,
            customer: {
                id: centsCustomer.id,
            },
            orderItems: [
                {
                    priceId: 1,
                    count: 2,
                    lineItemType: 'type',
                },
                {
                    priceId: 2,
                    count: 5,
                    lineItemType: 'type2',
                },
            ],
        };
        await assertPostResponseError({
            url: getApiEndpoint(),
            body,
            token,
            code: 500,
            expectedError: 'Invalid employee code',
        });
    });

    it('should respond successfully in case when employeeCode is required', async () => {
        const user = await factory.create(FACTORIES_NAMES.user);

        const teamMember = await factory.create(FACTORIES_NAMES.teamMember, {
            businessId: laundromatBusiness.id,
            userId: user.id,
        });
        await factory.create(FACTORIES_NAMES.teamMemberStore, {
            teamMemberId: teamMember.id,
            storeId: store.id,
        });
        await Settings.query()
            .findOne({
                businessId: store.businessId,
            })
            .patch({ requiresEmployeeCode: true });
        const body = {
            employeeCode: teamMember.employeeCode,
            customer: {
                id: centsCustomer.id,
            },
            orderItems: [
                {
                    priceId: 1,
                    count: 2,
                    lineItemType: 'type',
                },
                {
                    priceId: 2,
                    count: 5,
                    lineItemType: 'type2',
                },
            ],
        };
        await assertPostResponseSuccess({
            url: getApiEndpoint(),
            body,
            token,
        });
    });

    it('should respond successfully', async () => {
        const body = {
            customer: {
                id: centsCustomer.id,
            },
            orderItems: [
                {
                    priceId: 1,
                    count: 2,
                    lineItemType: 'type',
                },
                {
                    priceId: 2,
                    count: 5,
                    lineItemType: 'type2',
                },
            ],
        };
        await assertPostResponseSuccess({
            url: getApiEndpoint(),
            body,
            token,
        });
    });

    it('should respond successfully when storeCustomerId is null', async () => {
        const body = {
            customer: {
                id: centsCustomer.id,
                storeCustomerId: null,
            },
            orderItems: [
                {
                    priceId: 1,
                    count: 2,
                    lineItemType: 'type',
                },
                {
                    priceId: 2,
                    count: 5,
                    lineItemType: 'type2',
                },
            ],
        };
        await assertPostResponseSuccess({
            url: getApiEndpoint(),
            body,
            token,
        });
    });

    it('should return if duplicate inventory order', async () => {
        // arrange
        const business = await factory.create(FACTORIES_NAMES.laundromatBusiness);
        await factory.create(FACTORIES_NAMES.role, { userType: 'Business Owner' });

        const user = await factory.create(FACTORIES_NAMES.userWithBusinessOwnerRole);
        const teamMember = await factory.create(FACTORIES_NAMES.teamMember, {
            businessId: business.id,
            userId: user.id,
        });

        store = await factory.create(FACTORIES_NAMES.store, { businessId: business.id });
        token = generateToken({
            id: store.id,
        });

        await Settings.query()
            .findOne({
                businessId: store.businessId,
            })
            .del();
        await factory.create(FACTORIES_NAMES.businessSetting, {
            requiresEmployeeCode: true,
            businessId: business.id,
        });

        await factory.create(FACTORIES_NAMES.inventoryOrder, {
            storeId: store.id,
            storeCustomerId: storeCustomer.id,
        });

        const body = {
            employeeCode: teamMember.employeeCode,
            customer: {
                id: centsCustomer.id,
                centsCustomerId: centsCustomer.id,
            },
            orderItems: [
                {
                    priceId: 1,
                    count: 2,
                    lineItemType: 'type',
                },
            ],
        };

        // act
        const res = await ChaiHttpRequestHelper.post(getApiEndpoint(), {}, body).set(
            'authtoken',
            token,
        );

        // assert
        res.should.have.status(200);
        res.body.should.have.property('message', 'Duplicate order recently placed for customer');
    });
});
