require('../../../../testHelper');
const { expect, assert } = require('../../../../support/chaiHelper');
const factory = require('../../../../factories');
const intakeOnlineOrderPipeline = require('../../../../../pipeline/employeeApp/serviceOrder/intakeOnlineOrderPipeline');
const { FACTORIES_NAMES: FN } = require('../../../../constants/factoriesNames');
const { origins } = require('../../../../../constants/constants');
const { getServiceOrderAndCustomerDetails } = require('../../../../../utils/addOrderCustomerAndEmployee');
const { getStoreSettings } = require('../../../../support/storeSettingsHelper');
const { classicVersion, dryCleaningVersion } = require('../../../../support/apiTestHelper');
const BusinessSettings = require('../../../../../models/businessSettings');
const ServiceOrderBags = require('../../../../../models/serviceOrderBags');
const HangerBundles = require('../../../../../models/hangerBundles');
const StorageRacks = require('../../../../../models/storageRacks');

describe('test intakeOnlineOrderPipeline', () => {
    let business, store, serviceOrder, order;

    beforeEach(async () => {
        business = await factory.create(FN.laundromatBusiness);
        store = await factory.create(FN.store, {
            businessId: business.id,
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

    it('should return expected result', async () => {
        const details = await getServiceOrderAndCustomerDetails(order.id);
        const payload = {
            totalWeight: 10,
            storeId: store.id,
            orderType: 'ONLINE',
            orderId: order.id,
            orderItems: [],
            chargeableWeight: 5,
            serviceOrder,
            serviceOrderId: serviceOrder.id,
            currentOrderDetails: {
                ...details,
            },
            customer: {
                id: details.centsCustomerId,
                fullName: details.customerName,
                phoneNumber: details.customerPhoneNumber,
            },
            store: {
                ...store,
                settings: getStoreSettings({
                    businessId: store.businessId
                }),
            },
            status: 'READY_FOR_PROCESSING',
            adjusted: false,
            businessId: store.businessId,
            origin: origins.EMPLOYEE_APP,
            version: classicVersion,
        };
        const result = await intakeOnlineOrderPipeline(payload);

        expect(result.weightLogs.length).to.equal(1);
        expect(result.weightLogs[0]).to.have.property('totalWeight').to.equal(payload.totalWeight);
        expect(result.weightLogs[0]).to.have.property('chargeableWeight').to.equal(payload.chargeableWeight);
        expect(result).to.have.property('id').to.equal(serviceOrder.id);
        expect(result).to.have.property('orderId').to.equal(order.id);
    });

    it('should return expected result with 2.0+ version', async () => {
        const businessSettings = await BusinessSettings.query()
            .patch({
                dryCleaningEnabled: true,
            })
            .findOne({ businessId: business.id })
            .returning('*');
        const details = await getServiceOrderAndCustomerDetails(order.id);
        const serviceOrderBag = await factory.create(FN.serviceOrderBag, {
            serviceOrderId: serviceOrder.id,
        });
        const hangerBundle = await factory.create(FN.hangerBundles, {
            serviceOrderId: serviceOrder.id,
        })
        const payload = {
            id: serviceOrder.id,
            totalWeight: 10,
            storeId: store.id,
            orderType: 'ONLINE',
            orderId: order.id,
            orderItems: [],
            chargeableWeight: 5,
            serviceOrder,
            serviceOrderId: serviceOrder.id,
            currentOrderDetails: {
                ...details,
            },
            customer: {
                id: details.centsCustomerId,
                fullName: details.customerName,
                phoneNumber: details.customerPhoneNumber,
            },
            store: {
                ...store,
                settings: getStoreSettings({
                    businessId: store.businessId
                }),
            },
            status: 'READY_FOR_PROCESSING',
            adjusted: false,
            businessId: store.businessId,
            origin: origins.EMPLOYEE_APP,
            version: dryCleaningVersion,
            cents20LdFlag: businessSettings?.dryCleaningEnabled,
            serviceOrderBags: [
                {
                    description: 'update existing order bag 1',
                    id: serviceOrderBag.id,
                    notes: [
                        {
                            id: 1,
                            name: 'Big time cold wash'
                        },
                        {
                            id: 2,
                            name: 'Pierre food stains'
                        }
                    ],
                    manualNote: 'My manual note',
                },
                {
                    description: 'add new order bag 2',
                    notes: [
                        {
                            id: 1,
                            name: 'Add linen spritz'
                        },
                        {
                            id: 2,
                            name: 'Radioactive handle with care'
                        }
                    ],
                    manualNote: 'My manual note',
                },
            ],
            storageRacks: [
                {
                    rackInfo: 'ABC'
                },
                {
                    rackInfo: 'DEF'
                }
            ],
            hangerBundles: [
                {
                    id: hangerBundle.id,
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
                    manualNote: 'UPDATE OLD BUNDLE',
                },
                {
                    notes: [
                        {
                            id: 1,
                            name: 'Cold water',
                        },
                    ],
                    manualNote: 'NEW BUNDLE NOTE',
                }
            ],
        };
        const result = await intakeOnlineOrderPipeline(payload);
        expect(result.weightLogs.length).to.equal(1);
        expect(result.weightLogs[0]).to.have.property('totalWeight').to.equal(payload.totalWeight);
        expect(result.weightLogs[0]).to.have.property('chargeableWeight').to.equal(payload.chargeableWeight);
        expect(result).to.have.property('id').to.equal(serviceOrder.id);
        expect(result).to.have.property('orderId').to.equal(order.id);
        expect(result.serviceOrderBags).to.not.be.undefined;
        expect(result.serviceOrderBags).to.be.an('array');
        result.serviceOrderBags.forEach(async (bag) => {
            expect(bag).to.have.property('id');
            const serviceOrderBags = await ServiceOrderBags.query().findById(bag.id);
            assert(bag.id, serviceOrderBags.id);
            assert(bag.serviceOrderId, serviceOrderBags.serviceOrderId);
            assert(bag.description, serviceOrderBags.description);
            assert(bag.notes, serviceOrderBags.notes);
        });
        expect(result.hangerBundles).to.not.be.undefined;
        expect(result.hangerBundles).to.be.an('array');
        expect(result.hangerBundlesCount).to.not.be.undefined;
        result.hangerBundles.forEach(async (bundle) => {
            expect(bundle).to.have.property('id');
            const hangerBundle = await HangerBundles.query().findById(bundle.id);
            assert(bundle.id, hangerBundle.id);
            assert(bundle.serviceOrderId, hangerBundle.serviceOrderId);
            assert(bundle.notes, hangerBundle.notes);
        });
        expect(result.storageRacks).to.not.be.undefined;
        expect(result.storageRacks).to.be.an('object');
        expect(result.storageRacks).to.have.property('id');
        const storageRackResult = await StorageRacks.query().findById(result.storageRacks.id);
        assert(storageRackResult.rackInfo, result.storageRacks.rackInfo);
        assert(storageRackResult.serviceOrderId, result.storageRacks.serviceOrderId);
        assert(storageRackResult.id, result.storageRacks.id);
        expect(result.turnAroundInHours).to.not.be.undefined;
        expect(result.turnAroundInHours).to.be.an('object');
    });

    it('should be rejected with an error if passed payload with incorrect data', async () => {
        await expect(intakeOnlineOrderPipeline()).to.be.rejected;
        await expect(intakeOnlineOrderPipeline(null)).to.be.rejected;
        await expect(intakeOnlineOrderPipeline({})).to.be.rejected;
    });
});