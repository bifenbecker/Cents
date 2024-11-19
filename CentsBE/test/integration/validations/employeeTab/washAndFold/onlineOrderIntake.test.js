require('../../../../testHelper');
const { generateToken } = require('../../../../support/apiTestHelper')
const factory = require('../../../../factories')
const { FACTORIES_NAMES: FN } = require('../../../../constants/factoriesNames');
const BusinessSettings = require('../../../../../models/businessSettings');
const ChaiHttpRequestHelper = require('../../../../support/chaiHttpRequestHelper');
const { expect } = require('../../../../support/chaiHelper');

const { 
    itShouldCorrectlyAssertTokenPresense,
    assertPatchResponseSuccess,
    assertPatchResponseError,
 } = require('../../../../support/httpRequestsHelper');

describe('test onlineOrderIntakeValidation', () => {
    let store, token, serviceOrder, order, serviceOrderBags, hangerBundles;
    const apiEndPoint = (id) => {
        return `/api/v1/employee-tab/home/orders/onlineOrderIntake/${id}`
    };

    beforeEach(async () => {
        store = await factory.create(FN.store)
        token = generateToken({
            id: store.id,
        });
        const centsCustomer = await factory.create(FN.centsCustomer);
        const storeCustomer = await factory.create(FN.storeCustomer, {
            storeId: store.id,
            businessId: store.businessId,
            centsCustomerId: centsCustomer.id,
        });
        serviceOrder = await factory.create(FN.serviceOrder, {
            storeId: store.id,
            storeCustomerId: storeCustomer.id,
            orderTotal: 100,
            netOrderTotal: 100,
        });
        order = await factory.create(FN.order, {
            orderableType: 'ServiceOrder',
            orderableId: serviceOrder.id,
        });
    });

    itShouldCorrectlyAssertTokenPresense(
        assertPatchResponseError,
        () => apiEndPoint(serviceOrder.id),
    );

    it(`should fail if totalWeight is not passed`, async () => {
        await assertPatchResponseError({
            url: apiEndPoint(serviceOrder.id),
            body: {},
            token,
            code: 422,
            expectedError: 'totalWeight is required'
        });
    });

    it(`should fail if storeId is not passed`, async () => {
        await assertPatchResponseError({
            url: apiEndPoint(serviceOrder.id),
            body: {
                totalWeight: 10,
            },
            token,
            code: 422,
            expectedError: 'child "storeId" fails because ["storeId" is required]'
        });
    });

    it(`should fail if orderType is not passed`, async () => {
        await assertPatchResponseError({
            url: apiEndPoint(serviceOrder.id),
            body: {
                totalWeight: 10,
                storeId: store.id,
            },
            token,
            code: 422,
            expectedError: 'child "orderType" fails because ["orderType" is required]'
        });
    });

    it(`should fail if orderId is not passed`, async () => {
        await assertPatchResponseError({
            url: apiEndPoint(serviceOrder.id),
            body: {
                totalWeight: 10,
                storeId: store.id,
                orderType: order.orderableType,
            },
            token,
            code: 500,
            expectedError: `Cannot read property 'centsCustomerId' of undefined`
        });
    });

    it(`should fail if serviceOrder not found`, async () => {
        await assertPatchResponseError({
            url: apiEndPoint(0),
            body: {
                totalWeight: 10,
                storeId: store.id,
                orderType: order.orderableType,
                orderId: order.id,
                orderItems: [],
                chargeableWeight: 5,
            },
            token,
            code: 404,
            expectedError: `Order not found.`
        });
    });

    it(`should fail if serviceOrder.id isn't valid `, async () => {
        await assertPatchResponseError({
            url: apiEndPoint('id'),
            body: {
                totalWeight: 10,
                storeId: store.id,
                orderType: order.orderableType,
                orderId: order.id,
                orderItems: [],
                chargeableWeight: 5,
            },
            token,
            code: 500,
        });
    });

    it(`should successfully validate`, async () => {
        await assertPatchResponseSuccess({
            url: apiEndPoint(serviceOrder.id),
            body: {
                totalWeight: 10,
                storeId: store.id,
                orderType: order.orderableType,
                orderId: order.id,
                orderItems: [],
                chargeableWeight: 5,
            },
            token,
        });
    });

    describe('requiresEmployeeCode', () => {
        let token;
        beforeEach(async () => {
            await BusinessSettings.query().patch({
                requiresEmployeeCode: true,
            }).where({
                businessId: store.businessId,
            });
    
            token = generateToken({
                id: store.id,
            });
        });

        it(`should fail if employeeCode not passed`, async () => {
            await assertPatchResponseError({
                url: apiEndPoint(serviceOrder.id),
                body: {
                    totalWeight: 10,
                    storeId: store.id,
                    orderType: order.orderableType,
                    orderId: order.id,
                    orderItems: [],
                    chargeableWeight: 5,
                },
                token,
                code: 422,
                expectedError: `child "employeeCode" fails because ["employeeCode" is required]`,
            });
        });

        it(`should successfully validate when employeeCode passed`, async () => {
            const userWithBusinessOwnerRole = await factory.create(FN.userWithBusinessOwnerRole);
            const teamMember = await factory.create(FN.teamMember, {
                businessId: store.businessId,
                userId: userWithBusinessOwnerRole.id,
            });

            await assertPatchResponseSuccess({
                url: apiEndPoint(serviceOrder.id),
                body: {
                    totalWeight: 10,
                    storeId: store.id,
                    orderType: order.orderableType,
                    orderId: order.id,
                    orderItems: [],
                    chargeableWeight: 5,
                    employeeCode: teamMember.employeeCode,
                },
                token,
            });
        });
    });

    describe('version is 2.0+', () => {
        let dryCleaningVersion;
        beforeEach(async () => {
            await BusinessSettings.query().patch({
                requiresEmployeeCode: false,
                dryCleaningEnabled: true,
            }).where({
                businessId: store.businessId,
            });
            dryCleaningVersion = '2.0.12';
            serviceOrderBags = await factory.create(FN.serviceOrderBag, {
                serviceOrderId: serviceOrder.id,
            });
            hangerBundles = await factory.create(FN.hangerBundles, {
                serviceOrderId: serviceOrder.id,
            });
        });
        it(`should successfully validate when id is passed`, async () => {
            const body = {
                id: serviceOrder.id,
                totalWeight: 10,
                storeId: store.id,
                orderType: order.orderableType,
                orderId: order.id,
                orderItems: [],
                chargeableWeight: 5,
            }
            const res = await ChaiHttpRequestHelper.patch(apiEndPoint(serviceOrder.id), {}, body)
            .set('authtoken', token)
            .set('version', dryCleaningVersion);
            res.should.have.status(200);
        });

        it(`should fail to validate when serviceOrderBags is not an array in 2.0+`, async () => {
            const body = {
                id: serviceOrder.id,
                totalWeight: 10,
                storeId: store.id,
                orderType: order.orderableType,
                orderId: order.id,
                orderItems: [],
                chargeableWeight: 5,
                serviceOrderBags: 'I am not an array.',
            }
            const res = await ChaiHttpRequestHelper.patch(apiEndPoint(serviceOrder.id), {}, body)
            .set('authtoken', token)
            .set('version', dryCleaningVersion);
            res.should.have.status(422);
            expect(res.body)
            .to.have.property('error')
            .to.equal(
                'child "serviceOrderBags" fails because ["serviceOrderBags" must be an array]',
            );
        });

        it(`should fail to validate when serviceOrderBags contains missing id property in notes array`, async () => {
            const body = {
                id: serviceOrder.id,
                totalWeight: 10,
                storeId: store.id,
                orderType: order.orderableType,
                orderId: order.id,
                orderItems: [],
                chargeableWeight: 5,
                serviceOrderBags: [
                    {
                        notes: [
                            {
                                name: 'bag 1',
                            }
                        ]
                    }
                ],
            }
            const res = await ChaiHttpRequestHelper.patch(apiEndPoint(serviceOrder.id), {}, body)
            .set('authtoken', token)
            .set('version', dryCleaningVersion);
            res.should.have.status(422);
            expect(res.body)
            .to.have.property('error')
            .to.equal(
                'child "serviceOrderBags" fails because ["serviceOrderBags" at position 0 fails because [child "notes" fails because ["notes" at position 0 fails because [child "id" fails because ["id" is required]]]]]',
            );
        });

        it(`should fail to validate when serviceOrderBags contains missing name property in notes array`, async () => {
            const body = {
                id: serviceOrder.id,
                totalWeight: 10,
                storeId: store.id,
                orderType: order.orderableType,
                orderId: order.id,
                orderItems: [],
                chargeableWeight: 5,
                serviceOrderBags: [
                    {
                        notes: [
                            {
                                id: 1,
                            }
                        ]
                    }
                ],
            }
            const res = await ChaiHttpRequestHelper.patch(apiEndPoint(serviceOrder.id), {}, body)
            .set('authtoken', token)
            .set('version', dryCleaningVersion);
            res.should.have.status(422);
            expect(res.body)
            .to.have.property('error')
            .to.equal(
                'child "serviceOrderBags" fails because ["serviceOrderBags" at position 0 fails because [child "notes" fails because ["notes" at position 0 fails because [child "name" fails because ["name" is required]]]]]',
            );
        });

        it(`should fail to validate when serviceOrderBags contains incorrect name type in notes array`, async () => {
            const body = {
                id: serviceOrder.id,
                totalWeight: 10,
                storeId: store.id,
                orderType: order.orderableType,
                orderId: order.id,
                orderItems: [],
                chargeableWeight: 5,
                serviceOrderBags: [
                    {
                        notes: [
                            {
                                id: 1,
                                name: 12
                            }
                        ]
                    }
                ],
            }
            const res = await ChaiHttpRequestHelper.patch(apiEndPoint(serviceOrder.id), {}, body)
            .set('authtoken', token)
            .set('version', dryCleaningVersion);
            res.should.have.status(422);
            expect(res.body)
            .to.have.property('error')
            .to.equal(
                'child "serviceOrderBags" fails because ["serviceOrderBags" at position 0 fails because [child "notes" fails because ["notes" at position 0 fails because [child "name" fails because ["name" must be a string]]]]]',
            );
        });

        it(`should fail to validate when serviceOrderBags contains incorrect id type in notes array`, async () => {
            const body = {
                id: serviceOrder.id,
                totalWeight: 10,
                storeId: store.id,
                orderType: order.orderableType,
                orderId: order.id,
                orderItems: [],
                chargeableWeight: 5,
                serviceOrderBags: [
                    {
                        notes: [
                            {
                                id: 'ABC',
                                name: 'bag 1'
                            }
                        ]
                    }
                ],
            }
            const res = await ChaiHttpRequestHelper.patch(apiEndPoint(serviceOrder.id), {}, body)
            .set('authtoken', token)
            .set('version', dryCleaningVersion);
            res.should.have.status(422);
            expect(res.body)
            .to.have.property('error')
            .to.equal(
                'child "serviceOrderBags" fails because ["serviceOrderBags" at position 0 fails because [child "notes" fails because ["notes" at position 0 fails because [child "id" fails because ["id" must be a number]]]]]',
            );
        });

        it(`should successfully validate when serviceOrderBags is passed`, async () => {
            const body = {
                id: serviceOrder.id,
                totalWeight: 10,
                storeId: store.id,
                orderType: order.orderableType,
                orderId: order.id,
                orderItems: [],
                chargeableWeight: 5,
                serviceOrderBags: [
                    {
                        notes: [
                            {
                                id: 1,
                                name: 'hot wash'
                            }
                        ]
                    }
                ],
            }
            const res = await ChaiHttpRequestHelper.patch(apiEndPoint(serviceOrder.id), {}, body)
            .set('authtoken', token)
            .set('version', dryCleaningVersion);
            res.should.have.status(200);
        });

        it(`should validate and update serviceOrderBags entries if bag.id is passed and all other data is valid`, async () => {
            const body = {
                id: serviceOrder.id,
                totalWeight: 10,
                storeId: store.id,
                orderType: order.orderableType,
                orderId: order.id,
                orderItems: [],
                chargeableWeight: 5,
                serviceOrderBags: [
                    {
                        id: serviceOrderBags.id,
                        notes: [
                            {
                                id: 1,
                                name: 'hot wash'
                            }
                        ]
                    }
                ],
            }
            const res = await ChaiHttpRequestHelper.patch(apiEndPoint(serviceOrder.id), {}, body)
            .set('authtoken', token)
            .set('version', dryCleaningVersion);
            res.should.have.status(200);
        });

        it(`should fail to validate when storageRacks is not an array in 2.0+`, async () => {
            const body = {
                id: serviceOrder.id,
                totalWeight: 10,
                storeId: store.id,
                orderType: order.orderableType,
                orderId: order.id,
                orderItems: [],
                chargeableWeight: 5,
                storageRacks: "I am just a storage rack string",
            };
            const res = await ChaiHttpRequestHelper.patch(apiEndPoint(serviceOrder.id), {}, body)
            .set('authtoken', token)
            .set('version', dryCleaningVersion);
            res.should.have.status(422);
            expect(res.body)
            .to.have.property('error')
            .to.equal('child "storageRacks" fails because ["storageRacks" must be an array]');
        });

        it(`should fail to validate when storageRacks contains invalid data in 2.0+`, async () => {
            const body = {
                id: serviceOrder.id,
                totalWeight: 10,
                storeId: store.id,
                orderType: order.orderableType,
                orderId: order.id,
                orderItems: [],
                chargeableWeight: 5,
                storageRacks: [
                    {
                        rackInfo: 12
                    }
                ],
            };
            const res = await ChaiHttpRequestHelper.patch(apiEndPoint(serviceOrder.id), {}, body)
            .set('authtoken', token)
            .set('version', dryCleaningVersion);
            res.should.have.status(422);
            expect(res.body)
            .to.have.property('error')
            .to.equal('child "storageRacks" fails because ["storageRacks" at position 0 fails because [child "rackInfo" fails because ["rackInfo" must be a string]]]');
        });

        it(`should successfully validate when storageRacks is passed`, async () => {
            const body = {
                id: serviceOrder.id,
                totalWeight: 10,
                storeId: store.id,
                orderType: order.orderableType,
                orderId: order.id,
                orderItems: [],
                chargeableWeight: 5,
                storageRacks: [
                    {
                        rackInfo: 'ABC'
                    }
                ],
            };
            const res = await ChaiHttpRequestHelper.patch(apiEndPoint(serviceOrder.id), {}, body)
            .set('authtoken', token)
            .set('version', dryCleaningVersion);
            res.should.have.status(200);
        });

        it(`should fail to validate when hangerBundles is not an array in 2.0+`, async () => {
            const body = {
                id: serviceOrder.id,
                totalWeight: 10,
                storeId: store.id,
                orderType: order.orderableType,
                orderId: order.id,
                orderItems: [],
                chargeableWeight: 5,
                hangerBundles: 'I am a hangerBundle',
            };
            const res = await ChaiHttpRequestHelper.patch(apiEndPoint(serviceOrder.id), {}, body)
            .set('authtoken', token)
            .set('version', dryCleaningVersion);
            res.should.have.status(422);
            expect(res.body)
                .to.have.property('error')
                .to.equal('child "hangerBundles" fails because ["hangerBundles" must be an array]');
        });

        it(`should fail to validate when hangerBundles contains no id in notes in 2.0+`, async () => {
            const body = {
                id: serviceOrder.id,
                totalWeight: 10,
                storeId: store.id,
                orderType: order.orderableType,
                orderId: order.id,
                orderItems: [],
                chargeableWeight: 5,
                hangerBundles: [
                    {
                        notes: [
                            {
                                name: 'dry cleaning bundle 1',
                            }
                        ]
                    }
                ],
            };
            const res = await ChaiHttpRequestHelper.patch(apiEndPoint(serviceOrder.id), {}, body)
            .set('authtoken', token)
            .set('version', dryCleaningVersion);
            res.should.have.status(422);
            expect(res.body)
                .to.have.property('error')
                .to.equal('child "hangerBundles" fails because ["hangerBundles" at position 0 fails because [child "notes" fails because ["notes" at position 0 fails because [child "id" fails because ["id" is required]]]]]');
        });


        it(`should fail to validate when hangerBundles contains no name in notes in 2.0+`, async () => {
            const body = {
                id: serviceOrder.id,
                totalWeight: 10,
                storeId: store.id,
                orderType: order.orderableType,
                orderId: order.id,
                orderItems: [],
                chargeableWeight: 5,
                hangerBundles: [
                    {
                        notes: [
                            {
                                id: 1,
                            }
                        ]
                    }
                ],
            };
            const res = await ChaiHttpRequestHelper.patch(apiEndPoint(serviceOrder.id), {}, body)
            .set('authtoken', token)
            .set('version', dryCleaningVersion);
            res.should.have.status(422);
            expect(res.body)
                .to.have.property('error')
                .to.equal('child "hangerBundles" fails because ["hangerBundles" at position 0 fails because [child "notes" fails because ["notes" at position 0 fails because [child "name" fails because ["name" is required]]]]]');
        });

        it(`should fail to validate when hangerBundles contains invalid id type in notes in 2.0+`, async () => {
            const body = {
                id: serviceOrder.id,
                totalWeight: 10,
                storeId: store.id,
                orderType: order.orderableType,
                orderId: order.id,
                orderItems: [],
                chargeableWeight: 5,
                hangerBundles: [
                    {
                        notes: [
                            {
                                id: 'bundle1',
                                name: 'hanger bundle 1'
                            }
                        ]
                    }
                ],
            };
            const res = await ChaiHttpRequestHelper.patch(apiEndPoint(serviceOrder.id), {}, body)
            .set('authtoken', token)
            .set('version', dryCleaningVersion);
            res.should.have.status(422);
            expect(res.body)
                .to.have.property('error')
                .to.equal('child "hangerBundles" fails because ["hangerBundles" at position 0 fails because [child "notes" fails because ["notes" at position 0 fails because [child "id" fails because ["id" must be a number]]]]]');
        });

        it(`should fail to validate when hangerBundles contains invalid name type in notes in 2.0+`, async () => {
            const body = {
                id: serviceOrder.id,
                totalWeight: 10,
                storeId: store.id,
                orderType: order.orderableType,
                orderId: order.id,
                orderItems: [],
                chargeableWeight: 5,
                hangerBundles: [
                    {
                        notes: [
                            {
                                id: 1,
                                name: 123
                            }
                        ]
                    }
                ],
            };
            const res = await ChaiHttpRequestHelper.patch(apiEndPoint(serviceOrder.id), {}, body)
            .set('authtoken', token)
            .set('version', dryCleaningVersion);
            res.should.have.status(422);
            expect(res.body)
                .to.have.property('error')
                .to.equal('child "hangerBundles" fails because ["hangerBundles" at position 0 fails because [child "notes" fails because ["notes" at position 0 fails because [child "name" fails because ["name" must be a string]]]]]');
        });

        it(`should successfully validate when hangerBundles is passed`, async () => {
            const body = {
                id: serviceOrder.id,
                totalWeight: 10,
                storeId: store.id,
                orderType: order.orderableType,
                orderId: order.id,
                orderItems: [],
                chargeableWeight: 5,
                hangerBundles: [
                    {
                        notes: [
                            {
                                id: 2,
                                name: 'dry cleaning bundle 2',
                            }
                        ]
                    }
                ],
            };
            const res = await ChaiHttpRequestHelper.patch(apiEndPoint(serviceOrder.id), {}, body)
            .set('authtoken', token)
            .set('version', dryCleaningVersion);
            res.should.have.status(200);
        });

        it(`should validate when hangerBundles is passed with correct data and update entries if hangerBundle contains id`, async () => {
            const body = {
                id: serviceOrder.id,
                totalWeight: 10,
                storeId: store.id,
                orderType: order.orderableType,
                orderId: order.id,
                orderItems: [],
                chargeableWeight: 5,
                hangerBundles: [
                    {
                        id: hangerBundles.id,
                        notes: [
                            {
                                id: 2,
                                name: 'dry cleaning bundle 2',
                            }
                        ]
                    }
                ],
            };
            const res = await ChaiHttpRequestHelper.patch(apiEndPoint(serviceOrder.id), {}, body)
            .set('authtoken', token)
            .set('version', dryCleaningVersion);
            res.should.have.status(200);
        });
    });
});
