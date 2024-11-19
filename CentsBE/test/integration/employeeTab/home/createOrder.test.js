const sinon = require('sinon');
const moment = require('moment');

require('../../../testHelper');
const ChaiHttpRequestHepler = require('../../../support/chaiHttpRequestHelper');
const {
    generateToken,
    classicVersion,
    dryCleaningVersion,
} = require('../../../support/apiTestHelper');
const factory = require('../../../factories');
const { expect } = require('../../../support/chaiHelper');
const {
    createInventoryPayload,
    createServicePayload,
} = require('../../../support/serviceOrderTestHelper');
const {
    createUserWithBusinessAndCustomerOrders,
} = require('../../../support/factoryCreators/createUserWithBusinessAndCustomerOrders');
const ServicePricingStructure = require('../../../../models/servicePricingStructure');
const ServiceCategoryType = require('../../../../models/serviceCategoryType');
const BusinessSettings = require('../../../../models/businessSettings');
const { FACTORIES_NAMES } = require('../../../constants/factoriesNames');
const { paymentStatuses } = require('../../../../constants/constants');
const logger = require('../../../../lib/logger');

function getToken(storeId) {
    return generateToken({ id: storeId });
}

describe('test create serviceOrder api', () => {
    let store, payload, token, serviceOrder, businessSettings;
    const apiEndPoint = '/api/v1/employee-tab/home/orders';

    beforeEach(async () => {
        const { centsCustomer, ...entities } = await createUserWithBusinessAndCustomerOrders(
            undefined,
            {
                serviceOrder: {
                    createdAt: moment().subtract(5, 'minutes'),
                },
            },
        );
        store = entities.store;
        businessSettings = entities.businessSettings;
        token = getToken(store.id);
        serviceOrder = entities.serviceOrder;
        storeCustomer = entities.storeCustomer;
        payload = {
            customer: {
                id: centsCustomer.id,
                customerNotes: 'customer notes',
            },
            orderType: 'ServiceOrder',
            paymentTiming: 'POST-PAY',
            storeId: store.id,
        };
    });

    it('should throw an error if token is not sent', async () => {
        // act
        const res = await ChaiHttpRequestHepler.post(`${apiEndPoint}/`, {}, payload).set(
            'authtoken',
            '',
        );
        // assert
        res.should.have.status(401);
    });

    it('should return store not found error', async () => {
        const token = await getToken(0);
        const res = await ChaiHttpRequestHepler.post(`${apiEndPoint}/`, {}, payload).set(
            'authtoken',
            token,
        );
        res.should.have.status(403);
    });

    it('should throw an error saying totalWeight is required', async () => {
        const spy = sinon.spy(logger, "error");
        delete payload.totalWeight;
        const res = await ChaiHttpRequestHepler.post(`${apiEndPoint}/`, {}, payload).set(
            'authtoken',
            token,
        );
        res.should.have.status(422);
        expect(res.body).to.have.property('error').equal('totalWeight is required');
        expect(spy.called).to.be.true;
    });

    it('should throw an error saying isBagTrackingEnabled is required', async () => {
        const spy = sinon.spy(logger, "error");
        delete payload.isBagTrackingEnabled;
        const res = await ChaiHttpRequestHepler.post(`${apiEndPoint}/`, {}, payload).set(
            'authtoken',
            token,
        );
        res.should.have.status(422);
        expect(spy.called).to.be.true;
    });

    it('should throw an error saying customer is required', async () => {
        const spy = sinon.spy(logger, "error");
        delete payload.customer;
        const res = await ChaiHttpRequestHepler.post(`${apiEndPoint}/`, {}, payload).set(
            'authtoken',
            token,
        );
        res.should.have.status(422);
        expect(spy.called).to.be.true;
    });

    describe('with serviceItems only', () => {
        let servicePayload, servicePrice, serviceMaster, serviceModifier, modifier;
        beforeEach(async () => {
            servicePayload = await createServicePayload(store, 'PER_POUND');
            servicePrice = servicePayload.servicePrice;
            serviceMaster = servicePayload.serviceMaster;
            modifier = servicePayload.modifier;
            serviceModifier = servicePayload.serviceModifier;

            payload.totalWeight = 10;
            payload.chargeableWeight = 5;
            payload.isBagTrackingEnabled = false;
        });

        describe('with out modifiers', () => {
            beforeEach(async () => {
                payload.orderItems = [
                    {
                        priceId: servicePrice.id,
                        pricingType: 'PER_POUND',
                        category: 'PER_POUND',
                        lineItemType: 'SERVICE',
                        count: 1,
                        weight: 5,
                        turnAroundInHours: 24,
                    },
                ];
            });

            it('should throw an error saying invalid lineItemType', async () => {
                const spy = sinon.spy(logger, "error");
                payload.orderItems[0].lineItemType = 'abcd';
                const res = await ChaiHttpRequestHepler.post(`${apiEndPoint}/`, {}, payload).set(
                    'authtoken',
                    token,
                );
                res.should.have.status(422);
                expect(res.body)
                    .to.have.property('error')
                    .equal('Enter valid lineItemType from SERVICE,INVENTORY');
                expect(spy.called).to.be.true;
            });

            it('should throw an error if the service does not exist', async () => {
                payload.orderItems[0].priceId = 100;
                const res = await ChaiHttpRequestHepler.post(`${apiEndPoint}/`, {}, payload)
                    .set('authtoken', token)
                    .set('version', classicVersion);
                res.should.have.status(500);
                expect(res.body).to.have.property('error').equal('service not found.');
            });

            it('should throw an error if the weight is not sent for per_pound item does not exist', async () => {
                const spy = sinon.spy(logger, "error");
                delete payload.orderItems[0].weight;
                const res = await ChaiHttpRequestHepler.post(`${apiEndPoint}/`, {}, payload)
                    .set('authtoken', token)
                    .set('version', classicVersion);
                res.should.have.status(422);
                expect(spy.called).to.be.true;
            });

            it('should be able to create a service order with one service order item', async () => {
                const res = await ChaiHttpRequestHepler.post(`${apiEndPoint}/`, {}, payload)
                    .set('authtoken', token)
                    .set('version', classicVersion);

                res.should.have.status(200);

                const data = JSON.parse(res.text);

                expect(data).to.have.property('id');
                expect(data).to.have.property('orderCodeWithPrefix').equal('WF-1001');
                expect(data).to.have.property('orderItems').to.be.an('array').to.have.length(1);
                expect(data.orderItems[0])
                    .to.have.property('servicePriceId')
                    .to.equal(servicePrice.id);
            });
        });

        describe('with modifiers', () => {
            beforeEach(async () => {
                payload.orderItems = [
                    {
                        priceId: servicePrice.id,
                        category: 'PER_POUND',
                        pricingType: 'PER_POUND',
                        lineItemType: 'SERVICE',
                        count: 1,
                        weight: 5,
                        serviceModifierIds: [serviceModifier.id],
                        turnAroundInHours: 24,
                    },
                ];
            });

            it('should throw error if modifer is not found', async () => {
                payload.orderItems[0].serviceModifierIds = [100];

                const res = await ChaiHttpRequestHepler.post(`${apiEndPoint}/`, {}, payload)
                    .set('authtoken', token)
                    .set('version', classicVersion);

                res.should.have.status(500);
                expect(res.body).to.have.property('error').equal('Modifier not found');
            });

            it('should throw error if modifer is not featured', async () => {
                const notFeaturedServiceModifier = await factory.create(
                    FACTORIES_NAMES.serviceModifier,
                    {
                        serviceId: serviceMaster.id,
                        modifierId: modifier.id,
                        isFeatured: false,
                    },
                );
                payload.orderItems[0].serviceModifierIds = [notFeaturedServiceModifier.id];
                const res = await ChaiHttpRequestHepler.post(`${apiEndPoint}/`, {}, payload)
                    .set('authtoken', token)
                    .set('version', classicVersion);

                res.should.have.status(500);
                expect(res.body)
                    .to.have.property('error')
                    .equal(`${modifier.name} is not available.`);
            });

            it('should be able to create a service order with one service order item and modifier', async () => {
                const serviceModifier = await factory.create('serviceModifier', {
                    serviceId: serviceMaster.id,
                    modifierId: modifier.id,
                });
                payload.orderItems[0].serviceModifierIds = [serviceModifier.id];

                const res = await ChaiHttpRequestHepler.post(`${apiEndPoint}/`, {}, payload)
                    .set('authtoken', token)
                    .set('version', classicVersion);

                const data = JSON.parse(res.text);
                res.should.have.status(200);
                expect(data).to.have.property('id');
                expect(data).to.have.property('orderCodeWithPrefix').equal('WF-1001');
                expect(data).to.have.property('orderItems').to.be.an('array').to.have.length(1);
                expect(data.orderItems[0])
                    .to.have.property('servicePriceId')
                    .to.equal(servicePrice.id);
                expect(res.body.orderItems[0]).to.have.property('modifiers').to.have.lengthOf(1);
                expect(res.body.orderItems[0].modifiers[0])
                    .to.have.property('serviceModifierId')
                    .equal(serviceModifier.id);
            });
        });
    });

    describe('with inventory items only', () => {
        let inventoryItem, inventory, inventoryPayload;
        beforeEach(async () => {
            inventoryPayload = await createInventoryPayload(store);
            inventoryItem = inventoryPayload.inventoryItem;
            inventory = inventoryPayload.inventory;
            payload.totalWeight = 10;
            payload.isBagTrackingEnabled = false;

            payload.orderItems = [
                {
                    priceId: inventoryItem.id,
                    lineItemType: 'INVENTORY',
                    count: 1,
                    category: 'INVENTORY',
                    pricingType: 'FIXED_PRICE',
                    turnAroundInHours: 24,
                },
            ];
        });

        it('should throw an error if inventory item is not found', async () => {
            payload.orderItems[0].priceId = 100;
            const res = await ChaiHttpRequestHepler.post(`${apiEndPoint}/`, {}, payload)
                .set('authtoken', token)
                .set('version', classicVersion);
            res.should.have.status(500);
            expect(res.body).to.have.property('error').equal(`Inventory item not found.`);
        });

        it('should throw an error if the count is greater than the quanity of the inventory', async () => {
            payload.orderItems[0].count = 10;
            const res = await ChaiHttpRequestHepler.post(`${apiEndPoint}/`, {}, payload)
                .set('authtoken', token)
                .set('version', classicVersion);
            res.should.have.status(500);
            expect(res.body).to.have.property('error')
                .equal(`Available quantity for ${inventory.productName} is ${inventoryItem.quantity}.
             Please update the order quantity for ${inventory.productName}`);
        });

        it('should create a order with the inventory items', async () => {
            const res = await ChaiHttpRequestHepler.post(`${apiEndPoint}/`, {}, payload)
                .set('authtoken', token)
                .set('version', classicVersion);
            res.should.have.status(200);
            expect(res.body, 'must have the id of the new serviceOrder')
                .to.have.property('id')
                .equal(serviceOrder.id + 1);
            expect(res.body).to.have.property('status').equal('READY_FOR_PROCESSING');
            expect(res.body).to.have.property('orderItems').to.be.an('array').to.have.length(1);
        });
    });

    describe('with both service and inventory items', () => {
        let inventoryPayload, servicePayload;
        beforeEach(async () => {
            servicePayload = await createServicePayload(store);
            inventoryPayload = await createInventoryPayload(store);
            (payload.totalWeight = 10), (payload.chargeableWeight = 5);
            payload.isBagTrackingEnabled = false;

            payload.orderItems = [
                {
                    priceId: inventoryPayload.inventoryItem.id,
                    lineItemType: 'INVENTORY',
                    count: 1,
                    category: 'INVENTORY',
                    pricingType: 'FIXED_PRICE',
                    turnAroundInHours: 24,
                },
                {
                    priceId: servicePayload.servicePrice.id,
                    category: 'PER_POUND',
                    pricingType: 'PER_POUND',
                    lineItemType: 'SERVICE',
                    count: 1,
                    weight: 5,
                    turnAroundInHours: 24,
                    serviceModifierIds: [servicePayload.serviceModifier.id],
                },
            ];
        });

        it('should create a service order with the inventory and serivce items', async () => {
            const res = await ChaiHttpRequestHepler.post(`${apiEndPoint}/`, {}, payload)
                .set('authtoken', token)
                .set('version', classicVersion);
            res.should.have.status(200);
        });

        describe('with payment status', () => {
            it('should create a service order with the default payment status', async () => {    
                const res = await ChaiHttpRequestHepler.post(`${apiEndPoint}/`, {}, payload)
                    .set('authtoken', token)
                    .set('version', classicVersion);
    
                res.should.have.status(200);
                expect(res.body).to.have.property('paymentStatus').equal(paymentStatuses.BALANCE_DUE);
            });

            it('should create a service order with the invocing payment status', async () => {
                payload.paymentStatus = paymentStatuses.INVOICING;

                const res = await ChaiHttpRequestHepler.post(`${apiEndPoint}/`, {}, payload)
                    .set('authtoken', token)
                    .set('version', classicVersion);
    
                res.should.have.status(200);
                expect(res.body).to.have.property('paymentStatus').equal(paymentStatuses.INVOICING);
            });
        });
    });

    describe('should work with version 2.0.0', () => {
        let inventoryPayload, servicePayload, pricingStructure, categoryType;
        beforeEach(async () => {
            servicePayload = await createServicePayload(store, 'PER_POUND');
            pricingStructure = await ServicePricingStructure.query().findById(
                servicePayload.serviceMaster.servicePricingStructureId,
            );
            categoryType = await ServiceCategoryType.query().findById(
                servicePayload.serviceCategory.serviceCategoryTypeId,
            );
            inventoryPayload = await createInventoryPayload(store);
            (payload.totalWeight = 10), (payload.chargeableWeight = 5);
            payload.isBagTrackingEnabled = false;

            payload.orderItems = [
                {
                    priceId: inventoryPayload.inventoryItem.id,
                    lineItemType: 'INVENTORY',
                    count: 1,
                    category: 'INVENTORY',
                    pricingType: 'FIXED_PRICE',
                    serviceCategoryType: 'LAUNDRY',
                },
                {
                    priceId: servicePayload.servicePrice.id,
                    category: 'PER_POUND',
                    pricingType: 'PER_POUND',
                    lineItemType: 'SERVICE',
                    count: 1,
                    weight: 5,
                    turnAroundInHours: 24,
                    serviceModifierIds: [servicePayload.serviceModifier.id],
                    serviceCategoryType: 'DRY_CLEANING',
                },
            ];
            payload.turnAroundInHours = {
                value: 42,
                setManually: true,
            };
        });

        it('should fail to create a service order with incorrect data for serviceCategoryType in orderItems', async () => {
            const spy = sinon.spy(logger, "error");
            payload.orderItems.push({
                priceId: servicePayload.servicePrice.id,
                category: 'PER_POUND',
                pricingType: 'PER_POUND',
                lineItemType: 'SERVICE',
                count: 1,
                weight: 5,
                turnAroundInHours: 24,
                serviceModifierIds: [servicePayload.serviceModifier.id],
                serviceCategoryType: 'DRY_CLEANINGS',
            });
            const res = await ChaiHttpRequestHepler.post(`${apiEndPoint}/`, {}, payload)
                .set('authtoken', token)
                .set('version', dryCleaningVersion);
            res.should.have.status(422);
            expect(spy.called).to.be.true;
        });

        it('should create a service order with correct data for serviceCategoryType in orderItems', async () => {
            payload.orderItems[2] = {
                priceId: servicePayload.servicePrice.id,
                category: 'PER_POUND',
                pricingType: pricingStructure.type,
                lineItemType: 'SERVICE',
                count: 1,
                weight: 5,
                turnAroundInHours: 24,
                serviceModifierIds: [servicePayload.serviceModifier.id],
                serviceCategoryType: 'ALTERATIONS',
            };

            await BusinessSettings.query()
                .patch({
                    dryCleaningEnabled: true,
                })
                .findById(businessSettings.id);

            const res = await ChaiHttpRequestHepler.post(`${apiEndPoint}/`, {}, payload)
                .set('authtoken', token)
                .set('version', dryCleaningVersion);
            res.should.have.status(200);
            expect(res.body, 'must have the id of the new serviceOrder')
                .to.have.property('id')
                .equal(serviceOrder.id + 1);
            expect(res.body).to.have.property('status').equal('READY_FOR_PROCESSING');
            expect(res.body).to.have.property('orderItems').to.be.an('array').to.have.length(3);

            const found = res.body.orderItems.find(
                (element) => element.serviceCategoryType === categoryType.type,
            );
            expect(found)
                .to.be.an('object')
                .to.have.property('serviceCategoryType')
                .equal(categoryType.type);
        });

        it('should create a service order with correct data for serviceCategoryType in orderItems on 2.0.1', async () => {
            payload.orderItems[2] = {
                priceId: servicePayload.servicePrice.id,
                category: 'PER_POUND',
                pricingType: pricingStructure.type,
                lineItemType: 'SERVICE',
                count: 1,
                weight: 5,
                turnAroundInHours: 24,
                serviceModifierIds: [servicePayload.serviceModifier.id],
                serviceCategoryType: 'ALTERATIONS',
            };

            await BusinessSettings.query()
                .patch({
                    dryCleaningEnabled: true,
                })
                .findById(businessSettings.id);

            const res = await ChaiHttpRequestHepler.post(`${apiEndPoint}/`, {}, payload)
                .set('authtoken', token)
                .set('version', '2.0.1');
            res.should.have.status(200);
            expect(res.body, 'must have the id of the new serviceOrder')
                .to.have.property('id')
                .equal(serviceOrder.id + 1);
            expect(res.body).to.have.property('status').equal('READY_FOR_PROCESSING');
            expect(res.body).to.have.property('orderItems').to.be.an('array').to.have.length(3);

            const found = res.body.orderItems.find(
                (element) => element.serviceCategoryType === categoryType.type,
            );
            expect(found)
                .to.be.an('object')
                .to.have.property('serviceCategoryType')
                .equal(categoryType.type);
        });

        it('should fail to create a service order with incorrect data for serviceOrderBags', async () => {
            const spy = sinon.spy(logger, "error");
            payload.serviceOrderBags = [
                {
                    notes: [
                        {
                            name: 'Cold Wash',
                        },
                        {
                            id: 2,
                            name: 'Low Heat Dry',
                        },
                    ],
                    manualNote: 'test string for note',
                },
            ];
            const res = await ChaiHttpRequestHepler.post(`${apiEndPoint}/`, {}, payload)
                .set('authtoken', token)
                .set('version', dryCleaningVersion);
            res.should.have.status(422);
            expect(spy.called).to.true;
        });

        it('should create a service order with correct data for serviceOrderBags', async () => {
            payload.serviceOrderBags = [
                {
                    notes: [
                        {
                            id: 1,
                            name: 'Cold Wash',
                        },
                        {
                            id: 2,
                            name: 'Low Heat Dry',
                        },
                    ],
                    manualNote: 'THIS AWESOME ORDER BAGS1',
                },
                {
                    notes: [
                        {
                            id: 1,
                            name: 'Cold water',
                        },
                        {
                            id: 2,
                            name: 'High Dry',
                        },
                    ],
                },
            ];

            await BusinessSettings.query()
                .patch({
                    dryCleaningEnabled: true,
                })
                .findById(businessSettings.id);

            const res = await ChaiHttpRequestHepler.post(`${apiEndPoint}/`, {}, payload)
                .set('authtoken', token)
                .set('version', dryCleaningVersion);
            res.should.have.status(200);
            expect(res.body, 'must have the id of the new serviceOrder')
                .to.have.property('id')
                .equal(serviceOrder.id + 1);
            expect(res.body).to.have.property('status').equal('READY_FOR_PROCESSING');
            expect(res.body).to.have.property('orderItems').to.be.an('array').to.have.length(2);
            expect(res.body)
                .to.have.property('serviceOrderBags')
                .to.be.an('array')
                .to.have.length(2);

            const foundTrue = res.body.serviceOrderBags.find(
                (element) => element.manualNoteAdded === true,
            );
            const foundFalse = res.body.serviceOrderBags.find(
                (element) => element.manualNoteAdded === false,
            );
            expect(foundTrue)
                .to.have.property('notes')
                .equal('Cold Wash, Low Heat Dry, THIS AWESOME ORDER BAGS1');
            expect(foundTrue).to.be.an('object').to.have.property('manualNoteAdded').equal(true);
            expect(foundFalse).to.be.an('object').to.have.property('manualNoteAdded').equal(false);
        });

        it('should fail to create a service order with incorrect data for hangerBundles', async () => {
            const spy = sinon.spy(logger, "error");
            payload.hangerBundles = [
                {
                    notes: [
                        {
                            id: 1,
                        },
                        {
                            id: 2,
                            name: 'Low Heat Dry',
                        },
                    ],
                    manualNote: 'test string for note',
                },
            ];
            const res = await ChaiHttpRequestHepler.post(`${apiEndPoint}/`, {}, payload)
                .set('authtoken', token)
                .set('version', dryCleaningVersion);
            res.should.have.status(422);
            expect(spy.called).to.be.true;
        });

        it('should create a service order with correct data for hangerBundles', async () => {
            payload.hangerBundles = [
                {
                    notes: [
                        {
                            id: 1,
                            name: 'Cold Wash',
                        },
                        {
                            id: 2,
                            name: 'Low Heat Dry',
                        },
                    ],
                    manualNote: 'test string for note',
                },
                {
                    notes: [
                        {
                            id: 1,
                            name: 'Cold Wash',
                        },
                        {
                            id: 2,
                            name: 'Low Heat Dry',
                        },
                    ],
                },
            ];

            await BusinessSettings.query()
                .patch({
                    dryCleaningEnabled: true,
                })
                .findById(businessSettings.id);

            const res = await ChaiHttpRequestHepler.post(`${apiEndPoint}/`, {}, payload)
                .set('authtoken', token)
                .set('version', dryCleaningVersion);
            res.should.have.status(200);
            expect(res.body, 'must have the id of the new serviceOrder')
                .to.have.property('id')
                .equal(serviceOrder.id + 1);
            expect(res.body).to.have.property('status').equal('READY_FOR_PROCESSING');
            expect(res.body).to.have.property('orderItems').to.be.an('array').to.have.length(2);
            expect(res.body).to.have.property('hangerBundles').to.be.an('array').to.have.length(2);

            const foundTrue = res.body.hangerBundles.find(
                (element) => element.manualNoteAdded === true,
            );
            const foundFalse = res.body.hangerBundles.find(
                (element) => element.manualNoteAdded === false,
            );

            expect(foundTrue)
                .to.have.property('notes')
                .equal('Cold Wash, Low Heat Dry, test string for note');
            expect(foundTrue).to.be.an('object').to.have.property('manualNoteAdded').equal(true);
            expect(foundFalse).to.be.an('object').to.have.property('manualNoteAdded').equal(false);
        });

        it('should fail to create a service order with incorrect data for storageRacks', async () => {
            const spy = sinon.spy(logger, "error");
            payload.storageRacks = [
                {
                    rackInfoIsWrong: '67u6',
                },
                {
                    rackInfo: 'Ftggg',
                },
                {
                    rackInfo: '',
                },
                {
                    rackInfo: 'Ftgg',
                },
            ];
            const res = await ChaiHttpRequestHepler.post(`${apiEndPoint}/`, {}, payload)
                .set('authtoken', token)
                .set('version', dryCleaningVersion);
            res.should.have.status(422);
            expect(spy.called).to.be.true;
        });

        it('should create a service order with correct data for storageRacks', async () => {
            payload.storageRacks = [
                {
                    rackInfo: '67u6',
                },
                {
                    rackInfo: 'Ftggg',
                },
                {
                    rackInfo: '',
                },
                {
                    rackInfo: 'Ftgg',
                },
            ];

            await BusinessSettings.query()
                .patch({
                    dryCleaningEnabled: true,
                })
                .findById(businessSettings.id);

            const res = await ChaiHttpRequestHepler.post(`${apiEndPoint}/`, {}, payload)
                .set('authtoken', token)
                .set('version', dryCleaningVersion);
            res.should.have.status(200);
            expect(res.body, 'must have the id of the new serviceOrder')
                .to.have.property('id')
                .equal(serviceOrder.id + 1);
            expect(res.body).to.have.property('status').equal('READY_FOR_PROCESSING');
            expect(res.body).to.have.property('orderItems').to.be.an('array').to.have.length(2);
            expect(res.body)
                .to.have.property('storageRacks')
                .to.be.an('object')
                .to.have.property('rackInfo')
                .equal('67u6, Ftggg, Ftgg');
        });

        it('should fail to create a service order without turnAroundInHours in the payload', async () => {
            await BusinessSettings.query()
                .patch({
                    dryCleaningEnabled: true,
                })
                .findById(businessSettings.id);
            const spy = sinon.spy(logger, "error");
            delete payload.turnAroundInHours;
            const res = await ChaiHttpRequestHepler.post(`${apiEndPoint}/`, {}, payload)
                .set('authtoken', token)
                .set('version', dryCleaningVersion);
            res.should.have.status(422);
            expect(res.body)
                .to.have.property('error')
                .equal(
                    `child \"turnAroundInHours\" fails because [\"turnAroundInHours\" is required]`,
                );
            expect(spy.called).to.be.true;
        });

        it('should fail to create a service order without turnAroundInHoursSetManually in the payload', async () => {
            await BusinessSettings.query()
                .patch({
                    dryCleaningEnabled: true,
                })
                .findById(businessSettings.id);
            const spy = sinon.spy(logger, "error");
            payload.turnAroundInHours = {
                value: 41,
            };
            const res = await ChaiHttpRequestHepler.post(`${apiEndPoint}/`, {}, payload)
                .set('authtoken', token)
                .set('version', dryCleaningVersion);
            res.should.have.status(422);
            expect(res.body)
                .to.have.property('error')
                .equal(
                    `child "turnAroundInHours" fails because [child "setManually" fails because ["setManually" is required]]`,
                );
            expect(spy.called).to.be.true;
        });

        it('should fail to create a service order without turnAroundInHours value in the payload', async () => {
            await BusinessSettings.query()
                .patch({
                    dryCleaningEnabled: true,
                })
                .findById(businessSettings.id);
            const spy = sinon.spy(logger, "error");
            payload.turnAroundInHours = {
                setManually: false,
            };
            delete payload.turnAroundInHours.value;
            const res = await ChaiHttpRequestHepler.post(`${apiEndPoint}/`, {}, payload)
                .set('authtoken', token)
                .set('version', dryCleaningVersion);
            res.should.have.status(422);
            expect(res.body)
                .to.have.property('error')
                .equal(
                    `child "turnAroundInHours" fails because [child "value" fails because ["value" is required]]`,
                );
            expect(spy.called).to.be.true;
        });

        it('should fail to create a service order when turnAroundInHoursSetManually is not a boolean', async () => {
            await BusinessSettings.query()
                .patch({
                    dryCleaningEnabled: true,
                })
                .findById(businessSettings.id);
            const spy = sinon.spy(logger, "error");
            payload.turnAroundInHours = {
                value: 42,
                setManually: 10,
            };
            const res = await ChaiHttpRequestHepler.post(`${apiEndPoint}/`, {}, payload)
                .set('authtoken', token)
                .set('version', dryCleaningVersion);
            res.should.have.status(422);
            expect(res.body)
                .to.have.property('error')
                .equal(
                    `child \"turnAroundInHours\" fails because [child \"setManually\" fails because [\"setManually\" must be a boolean]]`,
                );
            expect(spy.called).to.be.true;
        });
    });

    describe('duplicate create order request', () => {
        let inventoryPayload, servicePayload;
        beforeEach(async () => {
            servicePayload = await createServicePayload(store);
            inventoryPayload = await createInventoryPayload(store);
            (payload.totalWeight = 10), (payload.chargeableWeight = 5);
            payload.isBagTrackingEnabled = false;

            payload.orderItems = [
                {
                    priceId: inventoryPayload.inventoryItem.id,
                    lineItemType: 'INVENTORY',
                    count: 1,
                    category: 'INVENTORY',
                    pricingType: 'FIXED_PRICE',
                    turnAroundInHours: 24,
                },
                {
                    priceId: servicePayload.servicePrice.id,
                    category: 'PER_POUND',
                    pricingType: 'PER_POUND',
                    lineItemType: 'SERVICE',
                    count: 1,
                    weight: 5,
                    turnAroundInHours: 24,
                    serviceModifierIds: [servicePayload.serviceModifier.id],
                },
            ];
        });

        it('include message in duplicate create order request', async () => {
            const initialRes = await ChaiHttpRequestHepler.post(`${apiEndPoint}/`, {}, payload)
                .set('authtoken', token)
                .set('version', classicVersion);
            initialRes.should.have.status(200);
            initialRes.body.should.not.have.property(
                'message',
                'Duplicate order recently placed for customer',
            );

            const duplicateRes = await ChaiHttpRequestHepler.post(`${apiEndPoint}/`, {}, payload)
                .set('authtoken', token)
                .set('version', classicVersion);
            duplicateRes.should.have.status(200);
            duplicateRes.body.should.have.property('success', true);
            duplicateRes.body.should.have.property(
                'message',
                'Duplicate order recently placed for customer',
            );

            const ms = moment(duplicateRes.placedAt).diff(moment(initialRes.placedAt));
            expect(ms).to.be.lessThanOrEqual(10000);
        });
    });
});
