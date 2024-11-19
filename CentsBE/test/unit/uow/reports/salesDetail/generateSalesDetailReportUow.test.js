require('../../../../testHelper');
const factory = require('../../../../factories');
const { expect } = require('../../../../support/chaiHelper');
const map = require('lodash/map');

const { FACTORIES_NAMES: FN } = require('../../../../constants/factoriesNames');

const { getFormattedStartAndEndDates } = require('../../../../../utils/reports/reportsUtils');
const generateSalesDetailReportDataUow = require('../../../../../uow/reports/salesDetail/generateSalesDetailReportDataUow');

const StoreSettings = require('../../../../../models/storeSettings');
const InventoryItem = require('../../../../../models/inventoryItem');
const Inventory = require('../../../../../models/inventory');
const ServiceOrderItem = require('../../../../../models/serviceOrderItem')
const ServiceOrder = require('../../../../../models/serviceOrders')
const InventoryOrder = require('../../../../../models/inventoryOrders')
const Order = require('../../../../../models/orders');
const InventoryCategory = require('../../../../../models/inventoryCategory');
const { statuses } = require('../../../../../constants/constants');

const createServiceOrder = async (payload, businessId, lineItemName, category, soldItemType) => {
    const serviceOrderWithItem = await factory.create(FN.serviceOrderWithItem, {
        ...payload
    });
    await factory.create(FN.serviceOrderMasterOrder, {
        orderableId: serviceOrderWithItem.id,
        storeId: serviceOrderWithItem.storeId,
        orderableType: 'ServiceOrder',
    });
    const serviceOrderItem = await ServiceOrderItem.query().findOne('orderId', serviceOrderWithItem.id);
    const serviceReferenceItem = await factory.create('serviceReferenceItem', {
        orderItemId: serviceOrderItem.id,
    });
    const modifier = await factory.create(FN.modifier, { businessId });
    await factory.create('serviceReferenceItemDetail', {
        serviceReferenceItemId: serviceReferenceItem.id,
        soldItemId: modifier.id,
        soldItemType: soldItemType || 'Modifier',
        lineItemName: lineItemName || 'test',
        lineItemTotalCost: 10,
        lineItemUnitCost: 1,
        category: category || 'PER_POUND',
        pricingType: category || 'PER_POUND',
    });
    return serviceOrderWithItem;
}

const createInventoryOrder = async (payload, paymentProcessor, paymentMemo) => {
    const inventoryOrder = await factory.create(FN.inventoryOrder, {
        ...payload,
    });
    const order = await factory.create(FN.order, {
        orderableId: inventoryOrder.id,
        orderableType: 'InventoryOrder',
        storeId: inventoryOrder.storeId,
    });
    await factory.create(FN.payment, {
        orderId: order.id,
        storeId: inventoryOrder.storeId,
        status: 'succeeded',
        transactionFee: 1,
        esdReceiptNumber: 'inventory-payment-1234',
        paymentProcessor,
        paymentMemo,
        createdAt: '2022-06-20T05:35:56.000Z',
    });
    const inventory = await factory.create(FN.inventory, { productName: 'washing powder' });
    const inventoryItem = await factory.create(FN.inventoryItem, {
        storeId: inventoryOrder.storeId,
        inventoryId: inventory.id,
    });
    await factory.create(FN.inventoryOrderItem, {
        inventoryItemId: inventoryItem.id,
        inventoryOrderId: inventoryOrder.id,
        lineItemTotalCost: 10,
    });
    return inventoryOrder;
}

const createOrderDelivery = async (payload, serviceOrderId) => {
    const masterOrder = await Order.query().findOne({
        orderableId: serviceOrderId,
        orderableType: 'ServiceOrder'
    });
    payload.orderId = masterOrder.id;
    const orderDelivery = await factory.create(FN.orderDelivery, {
        ...payload
    });
    return orderDelivery;
}

const timeZone = 'America/Los_Angeles';
const startDate = '2022-06-19T22:05:56.000Z';
const endDate = '2022-06-27T22:05:56.000Z'
const [finalStartDate, finalEndDate] = getFormattedStartAndEndDates(
    startDate,
    endDate,
    timeZone,
);

describe('test sales detail report', () => {
    let options, user, laundromatBusiness, teamMember, storeCustomer, store;
    beforeEach(async () => {
        user = await factory.create(FN.user);
        laundromatBusiness = await factory.create(FN.laundromatBusiness, { userId: user.id });
        teamMember = await factory.create(FN.teamMember, {
            userId: user.id,
            businessId: laundromatBusiness.id,
        });
        store = await factory.create(FN.store, {
            businessId: laundromatBusiness.id,
        });
        await StoreSettings.query()
            .patch({
                timeZone,
            })
            .whereIn('storeId', [store.id]);
        options = {
            businessId: laundromatBusiness.id,
            startDate: finalStartDate,
            endDate: finalEndDate,
            timeZone,
            storeIds: [store.id],
            allStoresCheck: false,
        };
        storeCustomer = await factory.create(FN.storeCustomer, {
            firstName: 'John',
            lastName: 'Doe',
            storeId: options.storeIds[0],
            businessId: options.businessId,
        });
    });

    describe('with active and completed filter', () => {
        beforeEach(async () => {
            options.statusCompletedAndActive = true;
        });

        describe('with service orders', () => {
            let activeServiceOrder, completedServiceOrder;
            beforeEach(async () => {
                activeServiceOrder = await createServiceOrder({
                    storeId: options.storeIds[0],
                    status: 'READY_FOR_PROCESSING',
                    orderCode: '1001',
                    orderType: 'ONLINE',
                    storeCustomerId: storeCustomer.id,
                    netOrderTotal: 5,
                    employeeCode: teamMember.id,
                    placedAt: '2022-06-20T05:30:56.000Z',
                }, options.businessId);

                completedServiceOrder = await createServiceOrder({
                    storeId: options.storeIds[0],
                    status: 'COMPLETED',
                    orderType: 'SERVICE',
                    orderCode: '1002',
                    storeCustomerId: storeCustomer.id,
                    netOrderTotal: 0,
                    paymentStatus: 'PAID',
                    placedAt: '2022-06-20T03:00:56.000Z'
                }, options.businessId, 'ariel');
            });

            describe('All stores check', () => {
                let store2;
                beforeEach(async () => {
                    store2 = await factory.create(FN.store, {
                        businessId: laundromatBusiness.id
                    });
                    await createServiceOrder({
                        storeId: store2.id,
                        status: 'SUBMITTED',
                        orderCode: '1000',
                        orderType: 'ONLINE',
                        netOrderTotal: 5,
                        storeCustomerId: storeCustomer.id,
                        placedAt: '2022-06-20T03:00:56.000Z'
                    }, options.businessId);
                    await StoreSettings.query()
                        .patch({
                            timeZone
                        })
                        .findById(store2.id)
                });
                describe('when all stores check is false', () => {
                    it('should have orders from selected stores', async () => {
                        const generatedSalesDetailReportData = await generateSalesDetailReportDataUow({ options });
                        const orderIds = map(generatedSalesDetailReportData.reportData, 'id')
                        expect(orderIds).to.have.members(['1001', '1002']);
                    });
                });
                describe('when all stores check is true', () => {
                    it('should have orders from all stores form the business', async () => {
                        options.allStoresCheck = true;
                        options.allStoreIds = options.storeIds;
                        options.allStoreIds.push(store2.id);
                        const generatedSalesDetailReportData = await generateSalesDetailReportDataUow({ options });
                        const orderIds = map(generatedSalesDetailReportData.reportData, 'id')
                        expect(orderIds).to.have.members(['1000', '1001', '1002']);
                    });
                })
            });

            describe('Order Id', () => {
                it('should consider both active and completed order code as order Id', async () => {
                    await createServiceOrder({
                        storeId: options.storeIds[0],
                        status: 'CANCELLED',
                        orderCode: '1005',
                        orderType: 'ONLINE',
                        placedAt: '2022-06-22T03:00:56.000Z'
                    }, options.businessId);
                    const generatedSalesDetailReportData = await generateSalesDetailReportDataUow({ options });
                    const orderIds = map(generatedSalesDetailReportData.reportData, 'id')
                    expect(orderIds).to.have.members(['1001', '1002']);
                });
            });

            describe('Order Status', () => {
                it('should return order statuses', async () => {
                    await createServiceOrder({
                        storeId: options.storeIds[0],
                        status: 'CANCELLED',
                        orderType: 'ONLINE',
                        orderCode: '1003',
                        storeCustomerId: storeCustomer.id,
                        netOrderTotal: 2,
                        placedAt: '2022-06-22T04:00:56.000Z'
                    }, options.businessId);
                    const generatedSalesDetailReportData = await generateSalesDetailReportDataUow({ options });
                    const orderStatuses = map(generatedSalesDetailReportData.reportData, 'orderStatus')
                    expect(orderStatuses).to.have.members(['ready for processing', 'completed']);
                });
            });

            describe('Order Location', () => {
                describe("with standalone store", () => {
                    it('Should have store address', async () => {
                        const generatedSalesDetailReportData = await generateSalesDetailReportDataUow({ options });
                        const address = [...new Set(map(generatedSalesDetailReportData.reportData, 'address'))];
                        expect(address).to.have.members([store.address]);
                    });
                });
                describe('with hub', () => {
                    it('should have hub address', async () => {
                        const storeAsHub = await factory.create(FN.store, {
                            businessId: laundromatBusiness.id,
                            isHub: true,
                        });
                        await StoreSettings.query()
                            .patch({
                                timeZone
                            })
                            .findById(storeAsHub.id)
                        await createServiceOrder({
                            storeId: storeAsHub.id,
                            status: 'SUBMITTED',
                            orderCode: '1004',
                            orderType: 'ONLINE',
                            storeCustomerId: storeCustomer.id,
                            placedAt: '2022-06-22T03:00:56.000Z'
                        }, options.businessId);
                        options.allStoresCheck = true;
                        options.allStoreIds = options.storeIds;
                        options.allStoreIds.push(storeAsHub.id);
                        const generatedSalesDetailReportData = await generateSalesDetailReportDataUow({ options });
                        const address = [...new Set(map(generatedSalesDetailReportData.reportData, 'address'))];
                        expect(address).to.have.members([store.address, storeAsHub.address]);
                    });
                });
            });

            describe('Order Intake Date', () => {
                beforeEach((async () => {
                    await factory.create('orderActivityLog', {
                        orderId: activeServiceOrder.id,
                        status: 'READY_FOR_PROCESSING',
                        updatedAt: '2022-06-24T08:30:56.000Z',
                    });
                }))
                it('should have order intake date', async () => {
                    const generatedSalesDetailReportData = await generateSalesDetailReportDataUow({ options });
                    const orderIntakeDates = map(generatedSalesDetailReportData.reportData, 'orderIntakeDate');
                    expect(orderIntakeDates).to.have.members(['06-24-2022', '06-19-2022']);
                });
                it('should consider placedAt when online order intake is was not completed', async () => {
                    await createServiceOrder({
                        storeId: store.id,
                        status: 'SUBMITTED',
                        orderCode: '1004',
                        orderType: 'ONLINE',
                        storeCustomerId: storeCustomer.id,
                        placedAt: '2022-06-22T04:00:56.000Z'
                    }, options.businessId);
                    const generatedSalesDetailReportData = await generateSalesDetailReportDataUow({ options });
                    const orderIntakeDates = map(generatedSalesDetailReportData.reportData, 'orderIntakeDate');
                    expect(orderIntakeDates).to.have.members(['06-24-2022', '06-19-2022', '06-21-2022']);
                });
            });

            describe('Order Intake Time', () => {
                beforeEach((async () => {
                    //complete intake for online order
                    await factory.create('orderActivityLog', {
                        orderId: activeServiceOrder.id,
                        status: 'READY_FOR_PROCESSING',
                        updatedAt: '2022-06-24T08:30:56.000Z',
                    });
                }))
                it('should have order intake time', async () => {
                    const generatedSalesDetailReportData = await generateSalesDetailReportDataUow({ options });
                    const orderIntakeTimes = map(generatedSalesDetailReportData.reportData, 'orderIntakeTime');
                    expect(orderIntakeTimes).to.have.members(['01:30 AM', '08:00 PM']);
                });
                it('should consider placedAt when online order intake is was not completed', async () => {
                    await createServiceOrder({
                        storeId: store.id,
                        status: 'SUBMITTED',
                        orderCode: '1004',
                        orderType: 'ONLINE',
                        storeCustomerId: storeCustomer.id,
                        placedAt: '2022-06-22T04:00:56.000Z'
                    }, options.businessId);
                    const generatedSalesDetailReportData = await generateSalesDetailReportDataUow({ options });
                    const orderIntakeDates = map(generatedSalesDetailReportData.reportData, 'orderIntakeTime');
                    expect(orderIntakeDates).to.have.members(['01:30 AM', '08:00 PM', '09:00 PM']);
                });
            });

            describe('Intake Employee', () => {
                it('should return intake employee', async () => {
                    //complete intake for activeServiceOrder
                    await factory.create('orderActivityLog', {
                        orderId: activeServiceOrder.id,
                        status: 'READY_FOR_PROCESSING',
                        teamMemberId: teamMember.id,
                        updatedAt: '2022-06-24T08:30:56.000Z',
                    });
                    const onlineOrder = await createServiceOrder({
                        storeId: store.id,
                        status: 'READY_FOR_PROCESSING',
                        orderCode: '1004',
                        orderType: 'ONLINE',
                        storeCustomerId: storeCustomer.id,
                        placedAt: '2022-06-26T04:00:56.000Z'
                    }, options.businessId);
                    // complete intake without employee code
                    await factory.create('orderActivityLog', {
                        orderId: onlineOrder.id,
                        status: 'READY_FOR_PROCESSING',
                        updatedAt: '2022-06-26T08:30:56.000Z',
                    });
                    const generatedSalesDetailReportData = await generateSalesDetailReportDataUow({ options });
                    const IntakeEmployees = map(generatedSalesDetailReportData.reportData, 'IntakeEmployee');
                    expect(IntakeEmployees).to.have.members([`${user.firstname} ${user.lastname}`, 'Submitted online, intake not complete', 'NA']);
                });
            });

            describe('Customer Name', () => {
                it('returns names from store customer', async () => {
                    const storeCustomer2 = await factory.create(FN.storeCustomer, {
                        storeId: options.storeIds[0],
                        businessId: options.businessId,
                        firstName: 'Daniel',
                        lastName: 'Rose'
                    });
                    await createServiceOrder({
                        storeId: activeServiceOrder.storeId,
                        status: 'SUBMITTED',
                        orderCode: '1006',
                        orderType: 'ONLINE',
                        storeCustomerId: storeCustomer2.id,
                        placedAt: '2022-06-24T04:00:56.000Z'
                    }, options.businessId);
                    const generatedSalesDetailReportData = await generateSalesDetailReportDataUow({ options });
                    const customerNames = map(generatedSalesDetailReportData.reportData, 'customerName');
                    expect(customerNames).to.have.members(['John Doe', 'John Doe', 'Daniel Rose']);
                });
            });

            describe('Customer Phone Number', () => {
                it('returns customer phone number', async () => {
                    const storeCustomer2 = await factory.create(FN.storeCustomer, {
                        storeId: options.storeIds[0],
                        businessId: options.businessId,
                        phoneNumber: '1212121212'
                    });
                    await createServiceOrder({
                        storeId: activeServiceOrder.storeId,
                        status: 'SUBMITTED',
                        orderCode: '1005',
                        orderType: 'ONLINE',
                        storeCustomerId: storeCustomer2.id,
                        placedAt: '2022-06-24T04:00:56.000Z'
                    }, options.businessId);
                    const generatedSalesDetailReportData = await generateSalesDetailReportDataUow({ options });
                    const customerPhonenumbers = map(generatedSalesDetailReportData.reportData, 'customerPhoneNumber');
                    expect(customerPhonenumbers).to.have.members([storeCustomer.phoneNumber, storeCustomer.phoneNumber, storeCustomer2.phoneNumber]);
                });
            });

            describe('Order Type', () => {
                it('returns order type from orders', async () => {
                    const generatedSalesDetailReportData = await generateSalesDetailReportDataUow({ options });
                    const orderTypes = map(generatedSalesDetailReportData.reportData, 'orderType');
                    expect(orderTypes).to.have.members(['SERVICE', 'ONLINE']);
                });
            });

            describe('Intake Pounds', () => {
                it('returns intake pounds', async () => {
                    // step 1 - intake
                    await factory.create(FN.serviceOrderWeight, {
                        step: 1,
                        chargeableWeight: 1,
                        serviceOrderId: activeServiceOrder.id,
                    });
                    await factory.create(FN.serviceOrderWeight, {
                        step: 2,
                        chargeableWeight: 10,
                        serviceOrderId: activeServiceOrder.id,
                    });
                    await factory.create(FN.serviceOrderWeight, {
                        step: 1,
                        chargeableWeight: 2,
                        serviceOrderId: completedServiceOrder.id,
                    });
                    const generatedSalesDetailReportData = await generateSalesDetailReportDataUow({ options });
                    const inTakePounds = map(generatedSalesDetailReportData.reportData, 'inTakePounds');
                    expect(inTakePounds).to.have.members([1, 2]);
                });
            });

            describe('Per Pound Services', () => {
                it('Should have per pound service', async () => {
                    const generatedSalesDetailReportData = await generateSalesDetailReportDataUow({ options });
                    const perPoundServices = map(generatedSalesDetailReportData.reportData, 'perPoundServices');
                    expect(perPoundServices).to.have.members(['test', 'ariel']);
                });
            });

            describe('Per Pound Value', () => {
                it('returns per pound values', async () => {
                    const generatedSalesDetailReportData = await generateSalesDetailReportDataUow({ options });
                    const perPoundValues = map(generatedSalesDetailReportData.reportData, 'perPoundValue');
                    expect(perPoundValues).to.have.members(['$10.00', '$10.00']);
                });
            });

            describe('Fixed Price Services', () => {
                it('returns fixed price services', async () => {
                    await createServiceOrder({
                        storeId: options.storeIds[0],
                        status: 'COMPLETED',
                        orderType: 'SERVICE',
                        orderCode: '1004',
                        storeCustomerId: storeCustomer.id,
                        netOrderTotal: 0,
                        paymentStatus: 'PAID',
                        placedAt: '2022-06-24T04:00:56.000Z'
                    }, options.businessId, 'fixedprice', 'FIXED_PRICE');
                    const generatedSalesDetailReportData = await generateSalesDetailReportDataUow({ options });
                    const fixedPriceServices = map(generatedSalesDetailReportData.reportData, 'fixedPriceServices');
                    expect(fixedPriceServices).to.have.members([null, null, 'fixedprice']);
                });
            });

            describe('Fixed Price Value', () => {
                it('returns fixed price value', async () => {
                    await createServiceOrder({
                        storeId: options.storeIds[0],
                        status: 'COMPLETED',
                        orderType: 'SERVICE',
                        orderCode: '1004',
                        storeCustomerId: storeCustomer.id,
                        netOrderTotal: 0,
                        paymentStatus: 'PAID',
                        placedAt: '2022-06-24T04:00:56.000Z'
                    }, options.businessId, 'fixedprice', 'FIXED_PRICE');
                    const generatedSalesDetailReportData = await generateSalesDetailReportDataUow({ options });
                    const fixedPriceValues = map(generatedSalesDetailReportData.reportData, 'fixedPriceValue');
                    expect(fixedPriceValues).to.have.members(['$0.00', '$0.00', '$10.00']);
                });
                it('verify fixedPriceValue when there is an inventory item', async () => {
                    await createServiceOrder({
                        storeId: options.storeIds[0],
                        status: 'COMPLETED',
                        orderType: 'SERVICE',
                        orderCode: '1004',
                        storeCustomerId: storeCustomer.id,
                        netOrderTotal: 0,
                        paymentStatus: 'PAID',
                        placedAt: '2022-06-24T04:00:56.000Z'
                    }, options.businessId, 'fixedprice', 'FIXED_PRICE','InventoryItem');
                    await createServiceOrder({
                        storeId: options.storeIds[0],
                        status: 'COMPLETED',
                        orderType: 'SERVICE',
                        orderCode: '1004',
                        storeCustomerId: storeCustomer.id,
                        netOrderTotal: 0,
                        paymentStatus: 'PAID',
                        placedAt: '2022-06-24T04:00:56.000Z'
                    }, options.businessId, 'fixedprice', 'FIXED_PRICE');
                    const generatedSalesDetailReportData = await generateSalesDetailReportDataUow({ options });
                    const fixedPriceValues = map(generatedSalesDetailReportData.reportData, 'fixedPriceValue');
                    expect(fixedPriceValues).to.have.members(['$0.00', '$0.00', '$0.00','$10.00']);
                });
            });

            describe('Products', () => {
                it('returns products', async () => {
                    await createServiceOrder({
                        storeId: options.storeIds[0],
                        status: 'COMPLETED',
                        orderType: 'SERVICE',
                        orderCode: '1006',
                        storeCustomerId: storeCustomer.id,
                        netOrderTotal: 0,
                        paymentStatus: 'PAID',
                        placedAt: '2022-06-24T04:00:56.000Z'
                    }, options.businessId, 'Washing Powder', 'FIXED_PRICE', 'InventoryItem');
                    const generatedSalesDetailReportData = await generateSalesDetailReportDataUow({ options });
                    const products = map(generatedSalesDetailReportData.reportData, 'products');
                    expect(products).to.have.members([null, null, 'Washing Powder']);
                });
            });

            describe('Products Value', () => {
                it('returns products value', async () => {
                    await createServiceOrder({
                        storeId: options.storeIds[0],
                        status: 'COMPLETED',
                        orderType: 'SERVICE',
                        orderCode: '1006',
                        storeCustomerId: storeCustomer.id,
                        netOrderTotal: 0,
                        paymentStatus: 'PAID',
                        placedAt: '2022-06-24T04:00:56.000Z'
                    }, options.businessId, 'Washing Powder', 'FIXED_PRICE', 'InventoryItem');
                    const generatedSalesDetailReportData = await generateSalesDetailReportDataUow({ options });
                    const productsValue = map(generatedSalesDetailReportData.reportData, 'productsValue');
                    expect(productsValue).to.have.members(['$0.00', '$0.00', '$10.00']);
                });
            });

            describe('Modifiers', () => {
                it('returns modifier names', async () => {
                    const generatedSalesDetailReportData = await generateSalesDetailReportDataUow({ options });
                    const modifiers = map(generatedSalesDetailReportData.reportData, 'modifiers');
                    expect(modifiers).to.have.members(['test', 'ariel']);
                });
            });

            describe('totalModifierValue', () => {
                it('returns total modifier values for each order', async () => {
                    const generatedSalesDetailReportData = await generateSalesDetailReportDataUow({ options });
                    const totalModifierValues = map(generatedSalesDetailReportData.reportData, 'totalModifierValue');
                    expect(totalModifierValues).to.have.members(['$10.00', '$10.00']);
                });
            });

            describe('laundry Bag Total Value', () => {
                it('returns category 1 products value', async () => {
                    const serviceOrderItem2 = await factory.create(FN.serviceOrderItem, {
                        orderId: activeServiceOrder.id,
                    });
                    const serviceReferenceItem2 = await factory.create(FN.serviceReferenceItem, {
                        orderItemId: serviceOrderItem2.id,
                    });
                    const serviceReferenceItemDetail2 = await factory.create(FN.serviceReferenceItemDetailForInventoryItem, {
                        serviceReferenceItemId: serviceReferenceItem2.id,
                        lineItemName: 'Service Test',
                        lineItemTotalCost: 70,
                        lineItemUnitCost: 15,
                    });
                    const inventoryItem = await InventoryItem.query().findById(serviceReferenceItemDetail2.soldItemId)
                    const inventoryCategory = await InventoryCategory.query().findOne({ id: 1 });
                    if (!inventoryCategory) {
                        await factory.create(FN.inventoryCategory, { id: 1 })
                    }
                    await Inventory.query().patch({ categoryId: 1 }).where({ id: inventoryItem.inventoryId })
                    const generatedSalesDetailReportData = await generateSalesDetailReportDataUow({ options });
                    const productsValue = map(generatedSalesDetailReportData.reportData, 'laundryBagTotalValue');
                    expect(productsValue).to.have.members(['$70.00', null]);
                });
            });

            describe('Pickup Fee', () => {
                it('returns pickup fee', async () => {
                    await createOrderDelivery({
                        storeId: activeServiceOrder.storeId,
                        type: 'PICKUP',
                        totalDeliveryCost: 2,
                    }, activeServiceOrder.id);
                    const generatedSalesDetailReportData = await generateSalesDetailReportDataUow({ options });
                    const pickupFee = map(generatedSalesDetailReportData.reportData, 'pickupFee');
                    expect(pickupFee).to.have.members(['$2.00', '$0.00']);
                });
            });

            describe('Delivery Fee', () => {
                it('returns delivery fee', async () => {
                    const delivery = await createOrderDelivery({
                        storeId: activeServiceOrder.storeId,
                        totalDeliveryCost: 2,
                    }, activeServiceOrder.id);
                    const generatedSalesDetailReportData = await generateSalesDetailReportDataUow({ options });
                    const deliveryFee = map(generatedSalesDetailReportData.reportData, 'deliveryFee');
                    expect(deliveryFee).to.have.members(['$2.00', '$0.00']);
                });
            });

            describe('On Demand Pickup Tip', () => {
                it('returns on-demand pickup tip', async () => {
                    await createOrderDelivery({
                        storeId: activeServiceOrder.storeId,
                        deliveryProvider: 'DOORDASH',
                        type: 'PICKUP',
                        totalDeliveryCost: 2,
                        courierTip: 1,
                        subsidyInCents: 100
                    }, activeServiceOrder.id);
                    const generatedSalesDetailReportData = await generateSalesDetailReportDataUow({ options });
                    const onDemandPickupTip = map(generatedSalesDetailReportData.reportData, 'onDemandPickupTip');
                    expect(onDemandPickupTip).to.have.members(['$1.00', '$0.00']);
                });
                it('returns 0 for own driver pickup', async () => {
                    await createOrderDelivery({
                        storeId: activeServiceOrder.storeId,
                        deliveryProvider: 'OWN_DRIVER',
                        type: 'PICKUP',
                        totalDeliveryCost: 2,
                    }, activeServiceOrder.id);
                    const generatedSalesDetailReportData = await generateSalesDetailReportDataUow({ options });
                    const onDemandPickupTip = map(generatedSalesDetailReportData.reportData, 'onDemandPickupTip');
                    expect(onDemandPickupTip).to.have.members(['$0.00', '$0.00']);
                });
            });

            describe('On Demand Delivery Tip', () => {
                it('returns on-demand delivery tip', async () => {
                    await createOrderDelivery({
                        status: 'SCHEDULED',
                        storeId: completedServiceOrder.storeId,
                        deliveryProvider: 'DOORDASH',
                        type: 'RETURN',
                        totalDeliveryCost: 2,
                        courierTip: 1,
                        subsidyInCents: 100
                    }, completedServiceOrder.id);
                    const generatedSalesDetailReportData = await generateSalesDetailReportDataUow({ options });
                    const onDemandPickupTip = map(generatedSalesDetailReportData.reportData, 'onDemandDeliveryTip');
                    expect(onDemandPickupTip).to.have.members(['$0.00', '$1.00']);
                });
                it('returns 0 for own driver delivery', async () => {
                    await createOrderDelivery({
                        storeId: activeServiceOrder.storeId,
                        deliveryProvider: 'OWN_DRIVER',
                        type: 'RETURN',
                        totalDeliveryCost: 2,
                    }, activeServiceOrder.id);
                    const generatedSalesDetailReportData = await generateSalesDetailReportDataUow({ options });
                    const onDemandPickupTip = map(generatedSalesDetailReportData.reportData, 'onDemandDeliveryTip');
                    expect(onDemandPickupTip).to.have.members(['$0.00', '$0.00']);
                });
            });

            describe('Pickup Subsidy', () => {
                it('returns pickup subsidy', async () => {
                    await createOrderDelivery({
                        status: 'SCHEDULED',
                        storeId: activeServiceOrder.storeId,
                        deliveryProvider: 'DOORDASH',
                        type: 'PICKUP',
                        totalDeliveryCost: 2,
                        courierTip: 1,
                        subsidyInCents: 100
                    }, activeServiceOrder.id);
                    const generatedSalesDetailReportData = await generateSalesDetailReportDataUow({ options }); const onDemandPickupTip = map(generatedSalesDetailReportData.reportData, 'onDemandPickupTip');
                    const pickupSubsidy = map(generatedSalesDetailReportData.reportData, 'pickupSubsidy');
                    expect(pickupSubsidy).to.have.members(['$1.00', null]);
                });

                it('returns null when pickup is canceled', async () => {
                    await createOrderDelivery({
                        status: 'CANCELED',
                        storeId: activeServiceOrder.storeId,
                        deliveryProvider: 'DOORDASH',
                        type: 'PICKUP',
                        totalDeliveryCost: 2,
                        courierTip: 1,
                        subsidyInCents: 100
                    }, activeServiceOrder.id);
                    const generatedSalesDetailReportData = await generateSalesDetailReportDataUow({ options }); const onDemandPickupTip = map(generatedSalesDetailReportData.reportData, 'onDemandPickupTip');
                    const pickupSubsidy = map(generatedSalesDetailReportData.reportData, 'pickupSubsidy');
                    expect(pickupSubsidy).to.have.members([null, null]);
                });
            });

            describe('Delivery Subsidy', () => {
                it('returns delivery subsidy ', async () => {
                    await createOrderDelivery({
                        status: 'SCHEDULED',
                        storeId: completedServiceOrder.storeId,
                        deliveryProvider: 'DOORDASH',
                        type: 'RETURN',
                        totalDeliveryCost: 2,
                        courierTip: 1,
                        subsidyInCents: 100
                    }, completedServiceOrder.id);
                    const generatedSalesDetailReportData = await generateSalesDetailReportDataUow({ options });
                    const deliverySubsidy = map(generatedSalesDetailReportData.reportData, 'deliverySubsidy');
                    expect(deliverySubsidy).to.have.members(['$1.00', null]);
                });
                it('returns null when delivery is canceled', async () => {
                    await createOrderDelivery({
                        status: 'CANCELED',
                        storeId: activeServiceOrder.storeId,
                        deliveryProvider: 'DOORDASH',
                        type: 'RETURN',
                        totalDeliveryCost: 2,
                        courierTip: 1,
                        subsidyInCents: 100
                    }, activeServiceOrder.id);
                    const generatedSalesDetailReportData = await generateSalesDetailReportDataUow({ options }); const onDemandPickupTip = map(generatedSalesDetailReportData.reportData, 'onDemandPickupTip');
                    const pickupSubsidy = map(generatedSalesDetailReportData.reportData, 'deliverySubsidy');
                    expect(pickupSubsidy).to.have.members([null, null]);
                });
            });

            describe('Pickup status', () => {
                it('returns pickup status', async () => {
                    await createOrderDelivery({
                        status: 'COMPLETED',
                        storeId: activeServiceOrder.storeId,
                        type: 'PICKUP',
                    }, activeServiceOrder.id);
                    const generatedSalesDetailReportData = await generateSalesDetailReportDataUow({ options }); const onDemandPickupTip = map(generatedSalesDetailReportData.reportData, 'onDemandPickupTip');
                    const pickupStatuses = map(generatedSalesDetailReportData.reportData, 'pickupStatus');
                    expect(pickupStatuses).to.have.members(['COMPLETED', null]);
                });

                it('returns null when pickup is canceled', async () => {
                    await createOrderDelivery({
                        status: 'CANCELED',
                        storeId: activeServiceOrder.storeId,
                        deliveryProvider: 'DOORDASH',
                        type: 'PICKUP',
                        totalDeliveryCost: 2,
                        courierTip: 1,
                        subsidyInCents: 100
                    }, activeServiceOrder.id);
                    const generatedSalesDetailReportData = await generateSalesDetailReportDataUow({ options }); const onDemandPickupTip = map(generatedSalesDetailReportData.reportData, 'onDemandPickupTip');
                    const pickupStatuses = map(generatedSalesDetailReportData.reportData, 'pickupStatus');
                    expect(pickupStatuses).to.have.members([null, null]);
                });
            });

            describe('Delivery status', () => {
                it('returns delivery status', async () => {
                    await createOrderDelivery({
                        status: 'COMPLETED',
                        storeId: activeServiceOrder.storeId,
                    }, activeServiceOrder.id);
                    const generatedSalesDetailReportData = await generateSalesDetailReportDataUow({ options }); const onDemandPickupTip = map(generatedSalesDetailReportData.reportData, 'onDemandPickupTip');
                    const deliveryStatuses = map(generatedSalesDetailReportData.reportData, 'deliveryStatus');
                    expect(deliveryStatuses).to.have.members(['COMPLETED', null]);
                });

                it('returns null when delivery is canceled', async () => {
                    await createOrderDelivery({
                        status: 'CANCELED',
                        storeId: activeServiceOrder.storeId,
                    }, activeServiceOrder.id);
                    const generatedSalesDetailReportData = await generateSalesDetailReportDataUow({ options }); const onDemandPickupTip = map(generatedSalesDetailReportData.reportData, 'onDemandPickupTip');
                    const deliveryStatuses = map(generatedSalesDetailReportData.reportData, 'deliveryStatus');
                    expect(deliveryStatuses).to.have.members([null, null]);
                });
            });

            describe('Sub Total Order Value', () => {
                it('returns sum of product, per pound and fixed price values', async () => {
                    const serviceOrderItem2 = await factory.create(FN.serviceOrderItem, {
                        orderId: activeServiceOrder.id,
                    });
                    const serviceReferenceItem2 = await factory.create(FN.serviceReferenceItem, {
                        orderItemId: serviceOrderItem2.id,
                    });
                    await factory.create(FN.serviceReferenceItemDetailForInventoryItem, {
                        serviceReferenceItemId: serviceReferenceItem2.id,
                        lineItemName: 'Service Test',
                        lineItemTotalCost: 70,
                        lineItemUnitCost: 15,
                    });
                    const serviceOrderItem3 = await factory.create(FN.serviceOrderItem, {
                        orderId: activeServiceOrder.id,
                    });
                    const serviceReferenceItem3 = await factory.create(FN.serviceReferenceItem, {
                        orderItemId: serviceOrderItem2.id,
                    });
                    await factory.create(FN.serviceReferenceItemDetailForServicePrice, {
                        serviceReferenceItemId: serviceReferenceItem3.id,
                        lineItemName: 'Service Test',
                        lineItemTotalCost: 70,
                        lineItemUnitCost: 15,
                        category: 'FIXED_PRICE',
                        pricingType: 'FIXED_PRICE',
                    });
                    const generatedSalesDetailReportData = await generateSalesDetailReportDataUow({ options });
                    const subTotalOrderValues = map(generatedSalesDetailReportData.reportData, 'subTotalOrderValue');
                    expect(subTotalOrderValues).to.have.members(['$150.00', '$10.00']);
                });
            });

            describe('Promo Code', () => {
                it('returns promo code', async () => {
                    const order = await Order.query().findOne({
                        orderableId: activeServiceOrder.id,
                    });
                    await factory.create(FN.orderPromoDetail, { orderId: order.id, promoDetails: { name: "active-PROMO80%" } });
                    const generatedSalesDetailReportData = await generateSalesDetailReportDataUow({ options });
                    const promoCode = map(generatedSalesDetailReportData.reportData, 'promoCode');
                    expect(promoCode).to.have.members(['active-PROMO80%', null]);
                });
            });

            describe('Promo Discount', () => {
                it('returns promo discount', async () => {
                    await ServiceOrder.query().findOne({
                        id: activeServiceOrder.id,
                    }).patch({ promotionAmount: 2 });
                    const generatedSalesDetailReportData = await generateSalesDetailReportDataUow({ options });
                    const promoDiscount = map(generatedSalesDetailReportData.reportData, 'promoDiscount');
                    expect(promoDiscount).to.have.members(['$2.00', '$0.00']);
                });
            });

            describe('Tax amount', () => {
                it('returns tax amount', async () => {
                    await ServiceOrder.query().findOne({
                        id: activeServiceOrder.id,
                    }).patch({ taxAmountInCents: 555 });
                    const generatedSalesDetailReportData = await generateSalesDetailReportDataUow({ options });
                    const taxAmount = map(generatedSalesDetailReportData.reportData, 'taxAmount');
                    expect(taxAmount).to.have.members(['$5.55', '$0.00']);
                });
            });

            describe('Credit Applied', () => {
                it('returns credit amount', async () => {
                    await ServiceOrder.query().findOne({
                        id: activeServiceOrder.id,
                    }).patch({ creditAmount: 1 });
                    const generatedSalesDetailReportData = await generateSalesDetailReportDataUow({ options });
                    const creditApplied = map(generatedSalesDetailReportData.reportData, 'creditApplied');
                    expect(creditApplied).to.have.members(['$1.00', '$0.00']);
                });
            });

            describe('Tip Amount', () => {
                it('returns tip amount', async () => {
                    await ServiceOrder.query().findOne({
                        id: activeServiceOrder.id,
                    }).patch({ tipAmount: 2 });
                    const generatedSalesDetailReportData = await generateSalesDetailReportDataUow({ options });
                    const tipAmount = map(generatedSalesDetailReportData.reportData, 'tipAmount');
                    expect(tipAmount).to.have.members(['$2.00', '$0.00']);
                });
            });

            describe('Convenience Fee', () => {
                it('returns convenience fee', async () => {
                    await ServiceOrder.query().findOne({
                        id: activeServiceOrder.id,
                    }).patch({ convenienceFee: 1.5 });
                    const generatedSalesDetailReportData = await generateSalesDetailReportDataUow({ options });
                    const convenienceFee = map(generatedSalesDetailReportData.reportData, 'convenienceFee');
                    expect(convenienceFee).to.have.members(['$1.50', '$0.00']);
                });
            });

            describe('Order Value Total', () => {
                it('returns net order total', async () => {
                    const generatedSalesDetailReportData = await generateSalesDetailReportDataUow({ options });
                    const netOrderTotal = map(generatedSalesDetailReportData.reportData, 'netOrderTotal');
                    expect(netOrderTotal).to.have.members(['$5.00', '$0.00']);
                });
            });

            describe('Transaction Fee', () => {
                beforeEach(async () => {
                    const order = await Order.query().findOne({
                        orderableId: completedServiceOrder.id,
                        orderableType: 'ServiceOrder'
                    });
                    await factory.create(FN.payment, {
                        orderId: order.id,
                        storeId: options.storeIds[0],
                        status: "succeeded",
                        transactionFee: 2,
                        esdReceiptNumber: 'payment-1234',
                        paymentProcessor: 'stripe',
                    });

                    await factory.create(FN.payment, {
                        orderId: order.id,
                        storeId: options.storeIds[0],
                        status: "requires_confirmation",
                        transactionFee: 2,
                        esdReceiptNumber: 'payment-1234',
                        paymentProcessor: 'stripe',
                    });
                })
                it('returns from payments', async () => {
                    const generatedSalesDetailReportData = await generateSalesDetailReportDataUow({ options });
                    const transactionFee = map(generatedSalesDetailReportData.reportData, 'transactionFee');
                    expect(transactionFee).to.have.members([null, '$2.00']);
                });

                describe('when order has multiple success payments', () => {
                    beforeEach(async () => {
                        const order = await Order.query().findOne({
                            orderableId: completedServiceOrder.id,
                            orderableType: 'ServiceOrder'
                        });
                        await factory.create(FN.payment, {
                            orderId: order.id,
                            storeId: options.storeIds[0],
                            status: "succeeded",
                            transactionFee: 3,
                            esdReceiptNumber: 'payment-1234',
                            paymentProcessor: 'stripe',
                        });
                    })
                    it('returns from all successful payments', async () => {
                        const generatedSalesDetailReportData = await generateSalesDetailReportDataUow({ options });
                        const transactionFee = map(generatedSalesDetailReportData.reportData, 'transactionFee');
                        expect(transactionFee).to.have.members([null, '$5.00']);
                    });
                })
            });

            describe('Order Payment Date', () => {
                it('return order payment date', async () => {
                    const order = await Order.query().findOne({
                        orderableId: completedServiceOrder.id,
                        orderableType: 'ServiceOrder'
                    });
                    payment = await factory.create(FN.payment, {
                        orderId: order.id,
                        storeId: options.storeIds[0],
                        status: "succeeded",
                        transactionFee: 10,
                        esdReceiptNumber: 'payment-1234',
                        paymentProcessor: 'stripe',
                        createdAt: '2022-06-20T03:00:56.000Z'
                    });
                    const generatedSalesDetailReportData = await generateSalesDetailReportDataUow({ options });
                    const orderPaymentDate = map(generatedSalesDetailReportData.reportData, 'orderPaymentDate');
                    expect(orderPaymentDate).to.have.members([null, '06-19-2022']);
                });
            });

            describe('Payment Status', () => {
                it('returns payment status', async () => {
                    const generatedSalesDetailReportData = await generateSalesDetailReportDataUow({ options });
                    const paymentStatuses = [...new Set(map(generatedSalesDetailReportData.reportData, 'paymentStatus'))]
                    expect(paymentStatuses).to.have.members(['balance due', 'paid']);
                });
            });

            describe('Order Status', () => {
                it('returns order status', async () => {
                    const generatedSalesDetailReportData = await generateSalesDetailReportDataUow({ options });
                    const orderStatuses = [...new Set(map(generatedSalesDetailReportData.reportData, 'orderStatus'))]
                    expect(orderStatuses).to.have.members(['ready for processing', 'completed']);
                });
            });

            describe('recurringDiscountInCents', () => {
                it('returns recurring discount', async () => {
                    await ServiceOrder.query().findOne({
                        id: activeServiceOrder.id,
                    }).patch({ recurringDiscountInCents: 500 });
                    const generatedSalesDetailReportData = await generateSalesDetailReportDataUow({ options });
                    const orderStatuses = [...new Set(map(generatedSalesDetailReportData.reportData, 'recurringDiscountInCents'))]
                    expect(orderStatuses).to.have.members([500, 0]);
                });
            });

            describe('Order Payment Time', () => {
                it('returns order payment time', async () => {
                    const order = await Order.query().findOne({
                        orderableId: completedServiceOrder.id,
                        orderableType: 'ServiceOrder'
                    });
                    payment = await factory.create(FN.payment, {
                        orderId: order.id,
                        storeId: options.storeIds[0],
                        status: "succeeded",
                        esdReceiptNumber: 'payment-1234',
                        paymentProcessor: 'stripe',
                        createdAt: '2022-06-20T03:00:56.000Z'
                    });
                    const generatedSalesDetailReportData = await generateSalesDetailReportDataUow({ options });
                    const orderPaymentTime = map(generatedSalesDetailReportData.reportData, 'orderPaymentTime');
                    expect(orderPaymentTime).to.have.members([null, '08:00 PM']);
                });
            });

            describe('with Cash Card Receipt', () => {
                it('should have payment status', async () => {
                    const order = await Order.query().findOne({
                        orderableId: completedServiceOrder.id,
                        orderableType: 'ServiceOrder'
                    });
                    payment = await factory.create(FN.payment, {
                        orderId: order.id,
                        storeId: options.storeIds[0],
                        status: "succeeded",
                        esdReceiptNumber: '18398',
                        paymentProcessor: 'cashCard',
                    });
                    const generatedSalesDetailReportData = await generateSalesDetailReportDataUow({ options });
                    const cashCardReceipt = map(generatedSalesDetailReportData.reportData, 'cashCardReceipt');
                    expect(cashCardReceipt).to.have.members([null, '18398']);
                });
            });

            describe('Payment Type', () => {
                it('returns payment types', async () => {
                    const serviceOrder = await createServiceOrder({
                        storeId: options.storeIds[0],
                        status: 'COMPLETED',
                        orderType: 'ONLINE',
                        orderCode: '1010',
                        storeCustomerId: storeCustomer.id,
                        netOrderTotal: 0,
                        paymentStatus: 'PAID',
                        placedAt: '2022-06-21T03:00:56.000Z'
                    }, options.businessId);
                    const orders = await Order.query()
                        .whereIn('orderableId', [activeServiceOrder.id, completedServiceOrder.id, serviceOrder.id])
                        .andWhere('orderableType', 'ServiceOrder');
                    await factory.create(FN.payment, {
                        orderId: orders[0].id,
                        storeId: options.storeIds[0],
                        status: "succeeded",
                        paymentProcessor: 'stripe',
                    });
                    await factory.create(FN.payment, {
                        orderId: orders[1].id,
                        storeId: options.storeIds[0],
                        status: "succeeded",
                        paymentProcessor: 'cash',
                    });
                    await factory.create(FN.payment, {
                        orderId: orders[2].id,
                        storeId: options.storeIds[0],
                        status: "succeeded",
                        paymentProcessor: 'cashCard',
                    });
                    const generatedSalesDetailReportData = await generateSalesDetailReportDataUow({ options });
                    const paymentType = map(generatedSalesDetailReportData.reportData, 'paymentType');
                    expect(paymentType).to.have.members(['Debit/Credit', 'Cash Card', 'Cash']);
                });
            });

            describe('Payment Memo', () => {
                it('returns payment memo', async () => {
                    const orderCode = '1010';
                    const serviceOrder = await createServiceOrder({
                        storeId: options.storeIds[0],
                        status: 'COMPLETED',
                        orderType: 'ONLINE',
                        orderCode: orderCode,
                        storeCustomerId: storeCustomer.id,
                        netOrderTotal: 0,
                        paymentStatus: 'PAID',
                        placedAt: '2022-06-21T03:00:56.000Z'
                    }, options.businessId);

                    const orders = await Order.query()
                        .where({orderableId: serviceOrder.id, orderableType: 'ServiceOrder'});

                    await factory.create(FN.payment, {
                        orderId: orders[0].id,
                        storeId: options.storeIds[0],
                        status: "succeeded",
                        paymentProcessor: 'other',
                        paymentMemo: 'Payment via PayPal on 7/31/22. Confirmed receipt',
                    });
                    const generatedSalesDetailReportData = await generateSalesDetailReportDataUow({ options });

                    const reportOrder = generatedSalesDetailReportData.reportData.find(r => r.id === orderCode);
                    expect(reportOrder).to.have.property('paymentType').to.equal('Other');
                    expect(reportOrder).to.have.property('paymentMemo').to.equal('Payment via PayPal on 7/31/22. Confirmed receipt');
                });
            });
        });

        describe('with inventory orders', () => {
            let inventoryOrder;
            beforeEach(async () => {
                inventoryOrder = await createInventoryOrder({
                    storeId: options.storeIds[0],
                    orderCode: '1004',
                    storeCustomerId: storeCustomer.id,
                    employeeId: teamMember.id,
                    netOrderTotal: 0,
                    createdAt: '2022-06-20T05:30:56.000Z',
                }, 'stripe');
            });

            describe('Order Id', () => {
                it('returns order code as Order Id', async () => {
                    const generatedSalesDetailReportData = await generateSalesDetailReportDataUow({ options });
                    const orderId = map(generatedSalesDetailReportData.reportData, 'id');
                    expect(orderId).to.have.members(['1004']);
                });
            });

            describe('Order Status', () => {
                it('returns status as completed', async () => {
                    const generatedSalesDetailReportData = await generateSalesDetailReportDataUow({ options });
                    const orderStatus = map(generatedSalesDetailReportData.reportData, 'orderStatus');
                    expect(orderStatus).to.have.members(['completed']);
                });
            });

            describe('Order Location', () => {
                it('return store address', async () => {
                    const generatedSalesDetailReportData = await generateSalesDetailReportDataUow({ options });
                    const address = map(generatedSalesDetailReportData.reportData, 'address');
                    expect(address).to.have.members([store.address]);
                });
            });

            describe('Order Intake Date', () => {
                it('returns order created date', async () => {
                    const generatedSalesDetailReportData = await generateSalesDetailReportDataUow({ options });
                    const intakeDate = map(generatedSalesDetailReportData.reportData, 'orderIntakeDate');
                    expect(intakeDate).to.have.members(['06-19-2022']);
                });
            });

            describe('Order Intake Time', () => {
                it('return order created time', async () => {
                    const generatedSalesDetailReportData = await generateSalesDetailReportDataUow({ options });
                    const orderIntakeTime = map(generatedSalesDetailReportData.reportData, 'orderIntakeTime');
                    expect(orderIntakeTime).to.have.members(['10:30 PM']);
                });
            });

            describe('Intake Employee', () => {
                it('return created employee name', async () => {
                    inventoryOrderWithoutEmployeeId = await createInventoryOrder({
                        storeId: options.storeIds[0],
                        orderCode: '1010',
                        storeCustomerId: storeCustomer.id,
                        netOrderTotal: 0,
                        createdAt: '2022-06-24T04:00:56.000Z'
                    }, 'stripe');
                    const generatedSalesDetailReportData = await generateSalesDetailReportDataUow({ options });
                    const IntakeEmployee = map(generatedSalesDetailReportData.reportData, 'IntakeEmployee');
                    expect(IntakeEmployee).to.have.members([`${user.firstname} ${user.lastname}`, 'NA']);
                });
            });

            describe('Customer Name', () => {
                it('return store customer name', async () => {
                    const storeCustomer2 = await factory.create(FN.storeCustomer, {
                        storeId: options.storeIds[0],
                        businessId: options.businessId,
                    });
                    await createInventoryOrder({
                        storeId: options.storeIds[0],
                        orderCode: '1004',
                        storeCustomerId: storeCustomer2.id,
                        employeeId: teamMember.id,
                        netOrderTotal: 0,
                        createdAt: '2022-06-24T04:00:56.000Z'
                    }, 'stripe');
                    const generatedSalesDetailReportData = await generateSalesDetailReportDataUow({ options });
                    const customerName = map(generatedSalesDetailReportData.reportData, 'customerName');
                    expect(customerName).to.have.members([`${storeCustomer.firstName} ${storeCustomer.lastName}`, `${storeCustomer2.firstName} ${storeCustomer2.lastName}`]);
                });
            });

            describe('Customer Phone Number', () => {
                it('return store customer phone number', async () => {
                    const storeCustomer2 = await factory.create(FN.storeCustomer, {
                        storeId: options.storeIds[0],
                        businessId: options.businessId,
                    });
                    await createInventoryOrder({
                        storeId: options.storeIds[0],
                        orderCode: '1004',
                        storeCustomerId: storeCustomer2.id,
                        employeeId: teamMember.id,
                        netOrderTotal: 0,
                        createdAt: '2022-06-24T04:00:56.000Z'
                    }, 'stripe');
                    const generatedSalesDetailReportData = await generateSalesDetailReportDataUow({ options });
                    const customerPhoneNumber = map(generatedSalesDetailReportData.reportData, 'customerPhoneNumber');
                    expect(customerPhoneNumber).to.have.members([storeCustomer.phoneNumber, storeCustomer2.phoneNumber]);
                });
            });

            describe('Order Type', () => {
                it('return as Inventory', async () => {
                    const generatedSalesDetailReportData = await generateSalesDetailReportDataUow({ options });
                    const orderType = map(generatedSalesDetailReportData.reportData, 'orderType');
                    expect(orderType).to.have.members(['INVENTORY']);
                });
            });

            describe('Products', () => {
                it('return product names', async () => {
                    const inventory = await factory.create(FN.inventory, { productName: 'Detergent' });
                    const inventoryItem = await factory.create(FN.inventoryItem, {
                        storeId: inventoryOrder.storeId,
                        inventoryId: inventory.id,
                    });
                    await factory.create(FN.inventoryOrderItem, {
                        inventoryItemId: inventoryItem.id,
                        inventoryOrderId: inventoryOrder.id,
                        lineItemTotalCost: 20,
                    });
                    const generatedSalesDetailReportData = await generateSalesDetailReportDataUow({ options });
                    const products = map(generatedSalesDetailReportData.reportData, 'products');
                    expect(products).to.have.members(['Detergent, washing powder']);
                });
            });

            describe('Products Value', () => {
                it('return products value', async () => {
                    const inventory = await factory.create(FN.inventory, { productName: 'Detergent' });
                    const inventoryItem = await factory.create(FN.inventoryItem, {
                        storeId: inventoryOrder.storeId,
                        inventoryId: inventory.id,
                    });
                    await factory.create(FN.inventoryOrderItem, {
                        inventoryItemId: inventoryItem.id,
                        inventoryOrderId: inventoryOrder.id,
                        lineItemTotalCost: 20,
                    });
                    const generatedSalesDetailReportData = await generateSalesDetailReportDataUow({ options });
                    const productsValue = map(generatedSalesDetailReportData.reportData, 'productsValue');
                    expect(productsValue).to.have.members(['$30.00']);
                });
            });

            describe('Promo Code', () => {
                it('return promo code', async () => {
                    const order = await Order.query().findOne({
                        orderableId: inventoryOrder.id,
                        orderableType: 'InventoryOrder',
                    });
                    await factory.create(FN.orderPromoDetail, { orderId: order.id, promoDetails: { name: "INVENTORY-PROMO80%" } });
                    const generatedSalesDetailReportData = await generateSalesDetailReportDataUow({ options });
                    const promoCode = map(generatedSalesDetailReportData.reportData, 'promoCode');
                    expect(promoCode).to.have.members(['INVENTORY-PROMO80%']);
                });
            });

            describe('Products Discount', () => {
                it('return promo discount', async () => {
                    await InventoryOrder.query().findOne({
                        id: inventoryOrder.id,
                    }).patch({ promotionAmount: 1 });
                    const generatedSalesDetailReportData = await generateSalesDetailReportDataUow({ options });
                    const promoDiscount = map(generatedSalesDetailReportData.reportData, 'promoDiscount');
                    expect(promoDiscount).to.have.members(['$1.00']);
                });
            });

            describe('Tip Amount', () => {
                it('return tip amount', async () => {
                    await InventoryOrder.query().findOne({
                        id: inventoryOrder.id,
                    }).patch({ tipAmount: 1 });
                    const generatedSalesDetailReportData = await generateSalesDetailReportDataUow({ options });
                    const tipAmount = map(generatedSalesDetailReportData.reportData, 'tipAmount');
                    expect(tipAmount).to.have.members(['$1.00']);
                });
            });

            describe('Convenience Fee', () => {
                it('return convenience fee', async () => {
                    await InventoryOrder.query().findOne({
                        id: inventoryOrder.id,
                    }).patch({ convenienceFee: 1 });
                    const generatedSalesDetailReportData = await generateSalesDetailReportDataUow({ options });
                    const convenienceFee = map(generatedSalesDetailReportData.reportData, 'convenienceFee');
                    expect(convenienceFee).to.have.members(['$1.00']);
                });
            });

            describe('creditApplied', () => {
                it('return credit amount', async () => {
                    await InventoryOrder.query().findOne({
                        id: inventoryOrder.id,
                    }).patch({ creditAmount: 1 });
                    const generatedSalesDetailReportData = await generateSalesDetailReportDataUow({ options });
                    const creditApplied = map(generatedSalesDetailReportData.reportData, 'creditApplied');
                    expect(creditApplied).to.have.members(['$1.00']);
                });
            });

            describe('Order Value Total', () => {
                it('returns net order total', async () => {
                    await InventoryOrder.query().findOne({
                        id: inventoryOrder.id,
                    }).patch({ netOrderTotal: 5.5 });
                    const generatedSalesDetailReportData = await generateSalesDetailReportDataUow({ options });
                    const netOrderTotal = map(generatedSalesDetailReportData.reportData, 'netOrderTotal');
                    expect(netOrderTotal).to.have.members(['$5.50']);
                });
            });

            describe('Payment Status', () => {
                it('should be paid', async () => {
                    const generatedSalesDetailReportData = await generateSalesDetailReportDataUow({ options });
                    const paymentStatus = map(generatedSalesDetailReportData.reportData, 'paymentStatus');
                    expect(paymentStatus).to.have.members(['paid']);
                });
            });

            describe('Order Payment Date', () => {
                it('should have payment status', async () => {
                    const generatedSalesDetailReportData = await generateSalesDetailReportDataUow({ options });
                    const orderPaymentDate = map(generatedSalesDetailReportData.reportData, 'orderPaymentDate');
                    expect(orderPaymentDate).to.have.members(['06-19-2022']);
                });
            });

            describe('Order Payment Time', () => {
                it('should have payment status', async () => {
                    const generatedSalesDetailReportData = await generateSalesDetailReportDataUow({ options });
                    const orderPaymentTime = map(generatedSalesDetailReportData.reportData, 'orderPaymentTime');
                    expect(orderPaymentTime).to.have.members(['10:35 PM']);
                });
            });

            describe('Cash Card Receipt', () => {
                it('return ca', async () => {
                    const generatedSalesDetailReportData = await generateSalesDetailReportDataUow({ options });
                    const cashCardReceipt = map(generatedSalesDetailReportData.reportData, 'cashCardReceipt');
                    expect(cashCardReceipt).to.have.members(['inventory-payment-1234']);
                });
            });

            describe('Payment Type', () => {
                it('Should have assigned payment types', async () => {
                    await createInventoryOrder({
                        storeId: options.storeIds[0],
                        orderCode: '1005',
                        storeCustomerId: storeCustomer.id,
                        employeeId: teamMember.id,
                        netOrderTotal: 0,
                        createdAt: '2022-06-24T04:00:56.000Z'
                    }, 'cashCard');
                    await createInventoryOrder({
                        storeId: options.storeIds[0],
                        orderCode: '1005',
                        storeCustomerId: storeCustomer.id,
                        employeeId: teamMember.id,
                        netOrderTotal: 0,
                        createdAt: '2022-06-24T04:00:56.000Z'
                    }, 'cash');
                    const generatedSalesDetailReportData = await generateSalesDetailReportDataUow({ options });
                    const paymentType = map(generatedSalesDetailReportData.reportData, 'paymentType');
                    expect(paymentType).to.have.members(['Debit/Credit', 'Cash Card', 'Cash']);
                });
            });

            describe('Payment Memo', () => {
                it('should have assigned payment memo', async () => {
                    const cashCodeInventoryOrderCode = '1007';
                    const otherInventoryOrderCode = '1008';
                    const paymentMemo = 'Payment via PayPal on 7/31/22. Confirmed receipt';

                    await createInventoryOrder({
                        storeId: options.storeIds[0],
                        orderCode: cashCodeInventoryOrderCode,
                        storeCustomerId: storeCustomer.id,
                        employeeId: teamMember.id,
                        netOrderTotal: 0,
                        createdAt: '2022-06-24T04:00:56.000Z'
                    }, 'cashCard');

                    await createInventoryOrder({
                        storeId: options.storeIds[0],
                        orderCode: otherInventoryOrderCode,
                        storeCustomerId: storeCustomer.id,
                        employeeId: teamMember.id,
                        netOrderTotal: 0,
                        createdAt: '2022-06-24T04:00:56.000Z'
                    }, 'other', paymentMemo);
                    const generatedSalesDetailReportData = await generateSalesDetailReportDataUow({ options });

                    const reportOrders = generatedSalesDetailReportData.reportData.filter(r => [cashCodeInventoryOrderCode, otherInventoryOrderCode].includes(r.id));

                    expect(map(reportOrders, 'paymentType')).to.have.members(['Cash Card','Other']);
                    expect(map(reportOrders, 'paymentMemo')).to.include(paymentMemo);
                });
            });
        });

        describe('With both service and inventory orders', () => {
            let serviceOrder, inventoryOrder;
            beforeEach(async () => {
                serviceOrder = await createServiceOrder({
                    storeId: options.storeIds[0],
                    status: 'SUBMITTED',
                    orderCode: '1005',
                    orderType: 'ONLINE',
                    storeCustomerId: storeCustomer.id,
                    placedAt: '2022-06-24T04:00:56.000Z'
                }, options.businessId);
                inventoryOrder = await createInventoryOrder({
                    storeId: options.storeIds[0],
                    orderCode: '1006',
                    storeCustomerId: storeCustomer.id,
                    employeeId: teamMember.id,
                    netOrderTotal: 0,
                    createdAt: '2022-06-24T04:00:56.000Z'
                }, 'stripe');
            });

            describe('with both service and inventory orders', () => {
                it('return both orders', async () => {
                    const generatedSalesDetailReportData = await generateSalesDetailReportDataUow({ options });
                    const orderIds = map(generatedSalesDetailReportData.reportData, 'id');
                    expect(orderIds).to.have.members(['1005', '1006']);
                });
            });
        });
    });

    describe('with completed filter', () => {
        beforeEach(async () => {
            options.statusCompleted = true;
            await createServiceOrder({
                storeId: options.storeIds[0],
                status: 'SUBMITTED',
                orderCode: '1005',
                orderType: 'ONLINE',
                storeCustomerId: storeCustomer.id,
                placedAt: '2022-06-24T04:00:56.000Z'
            }, options.businessId);
            await createServiceOrder({
                storeId: options.storeIds[0],
                status: 'COMPLETED',
                orderType: 'SERVICE',
                orderCode: '1007',
                storeCustomerId: storeCustomer.id,
                placedAt: '2022-06-24T04:00:56.000Z'
            }, options.businessId);
            await createInventoryOrder({
                storeId: options.storeIds[0],
                orderCode: '1008',
                storeCustomerId: storeCustomer.id,
                employeeId: teamMember.id,
                netOrderTotal: 0,
                createdAt: '2022-06-24T04:00:56.000Z'
            }, 'stripe');
        });
        describe('with completed service orders', () => {
            it('return completed orders', async () => {
                const generatedSalesDetailReportData = await generateSalesDetailReportDataUow({ options });
                const orderIds = map(generatedSalesDetailReportData.reportData, 'id');
                expect(orderIds).to.have.members(['1007', '1008']);
            });
        });
    });

    describe('including cancelled status', () => {
        beforeEach(async () => {
            const mockOrder = {
                storeId: options.storeIds[0],
                orderType: 'SERVICE',
                storeCustomerId: storeCustomer.id,
                placedAt: '2022-06-24T04:00:56.000Z'
            };

            await createServiceOrder({
                ...mockOrder,
                status: statuses.CANCELLED,
                orderCode: '1009',
            }, options.businessId);

            await createServiceOrder({
                ...mockOrder,
                status: statuses.CANCELLED,
                orderCode: '1010',
            }, options.businessId);

            await createServiceOrder({
                ...mockOrder,
                status: statuses.COMPLETED,
                orderCode: '1011',
            }, options.businessId);

            await createServiceOrder({
                ...mockOrder,
                status: statuses.PROCESSING,
                orderCode: '1012',
            }, options.businessId);

            await createServiceOrder({
                ...mockOrder,
                status: statuses.COMPLETED,
                orderCode: '1013',
            }, options.businessId);
        });

        it('should return cancelled orders', async () => {
            options.statusCancelled = true;
            const generatedSalesDetailReportData = await generateSalesDetailReportDataUow({ options });
            const orderIds = map(generatedSalesDetailReportData.reportData, 'id');

            expect(orderIds.length).to.eq(2);
            expect(orderIds).to.have.members(['1009', '1010']);
        });

        it('should return completed and cancelled orders', async () => {
            options.statusCompletedAndCancelled = true;
            const generatedSalesDetailReportData = await generateSalesDetailReportDataUow({ options });
            const orderIds = map(generatedSalesDetailReportData.reportData, 'id');

            expect(orderIds.length).to.eq(4);
            expect(orderIds).to.have.members(['1009', '1010', '1011', '1013']);
        });

        it('should return active and cancelled orders', async () => {
            options.statusActiveAndCancelled = true;
            const generatedSalesDetailReportData = await generateSalesDetailReportDataUow({ options });
            const orderIds = map(generatedSalesDetailReportData.reportData, 'id');

            expect(orderIds.length).to.eq(3);
            expect(orderIds).to.have.members(['1009', '1010', '1012']);
        });
    });

    describe('with any status', () => {
        it('should return all orders', async () => {
            const mockOrder = {
                storeId: options.storeIds[0],
                orderType: 'SERVICE',
                storeCustomerId: storeCustomer.id,
                placedAt: '2022-06-24T04:00:56.000Z'
            };

            await createServiceOrder({
                ...mockOrder,
                status: statuses.CANCELLED,
                orderCode: '1014',
            }, options.businessId);

            await createServiceOrder({
                ...mockOrder,
                status: statuses.DROPPED_OFF_AT_HUB,
                orderCode: '1015',
            }, options.businessId);

            await createServiceOrder({
                ...mockOrder,
                status: statuses.COMPLETED,
                orderCode: '1016',
            }, options.businessId);

            await createServiceOrder({
                ...mockOrder,
                status: statuses.PROCESSING,
                orderCode: '1017',
            }, options.businessId);

            const generatedSalesDetailReportData = await generateSalesDetailReportDataUow({ options });

            expect(generatedSalesDetailReportData.reportData.length).to.eq(4);
        });
    });
});
