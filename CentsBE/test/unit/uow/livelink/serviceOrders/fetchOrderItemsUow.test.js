require('../../../../testHelper');
const factory = require('../../../../factories');
const { expect } = require('../../../../support/chaiHelper');
const fetchOrderItems = require('../../../../../uow/liveLink/serviceOrders/fetchOrderItems');
const { FACTORIES_NAMES: FN } = require('../../../../constants/factoriesNames');
const { statuses, ORDER_DELIVERY_TYPES } = require('../../../../../constants/constants');

describe('test fetchOrderItems UOW test', () => {
    let store,
        inventory,
        inventoryItem,
        serviceOrder,
        serviceOrderItem,
        order,
        orderDelivery,
        serviceCategory,
        serviceMaster,
        servicePrice,
        modifier,
        serviceModifier,
        serviceReferenceItem,
        payload;

    beforeEach(async () => {
        store = await factory.create(FN.store);

        inventory = await factory.create(FN.inventory);

        inventoryItem = await factory.create(FN.inventoryItem, {
            storeId: store.id,
            inventoryId: inventory.id,
        });

        serviceOrder = await factory.create(FN.serviceOrder, {
            orderTotal: 0,
            netOrderTotal: 0,
            orderCode: '13',
            storeId: store.id,
            hubId: store.id,
            status: statuses.COMPLETED,
        });

        serviceOrderItem = await factory.create(FN.serviceOrderItem, {
            orderId: serviceOrder.id,
            status: 'random',
        });

        order = await factory.create(FN.order, {
            orderableType: 'ServiceOrder',
            orderableId: serviceOrder.id,
        });

        orderDelivery = await factory.create(FN.orderDelivery, {
            totalDeliveryCost: 20,
            orderId: order.id,
            type: ORDER_DELIVERY_TYPES.PICKUP,
            storeId: store.id,
        });

        serviceCategory = await factory.create(FN.serviceCategory, {
            category: 'PER_POUND',
        });

        serviceMaster = await factory.create(FN.serviceMaster, {
            serviceCategoryId: serviceCategory.id,
        });

        servicePrice = await factory.create(FN.servicePrice, {
            storeId: store.id,
            serviceId: serviceMaster.id,
        });

        modifier = await factory.create(FN.modifier);

        serviceModifier = await factory.create(FN.serviceModifier, {
            serviceId: serviceMaster.id,
            modifierId: modifier.id,
        });

        serviceReferenceItem = await factory.create(FN.serviceReferenceItem, {
            orderItemId: serviceOrderItem.id,
            servicePriceId: servicePrice.id,
            serviceId: serviceMaster.id,
            inventoryItemId: inventoryItem.id,
            quantity: 1,
            serviceModifierId: serviceModifier.id,
        });
    });

    it('should fetch orderItems', async () => {
        await factory.create(FN.serviceReferenceItemDetail, {
            serviceReferenceItemId: serviceReferenceItem.id,
            soldItemId: inventoryItem.id,
            soldItemType: 'ServicesMaster',
            lineItemName: 'test',
            lineItemTotalCost: 10,
            lineItemUnitCost: 1,
            category: serviceCategory.category,
            customerName: orderDelivery.customerName,
            customerPhoneNumber: orderDelivery.customerPhoneNumber,
        });

        await factory.create(FN.serviceReferenceItemDetail, {
            serviceReferenceItemId: serviceReferenceItem.id,
            soldItemId: inventoryItem.id,
            soldItemType: 'Modifier',
            lineItemName: 'test',
            lineItemTotalCost: 10,
            lineItemUnitCost: 1,
            category: 'FIXED_PRICE',
            customerName: orderDelivery.customerName,
            customerPhoneNumber: orderDelivery.customerPhoneNumber,
        });

        payload = {
            serviceOrder
        };

        const result = await fetchOrderItems(payload);

        expect(result).to.have.property('serviceOrderId').equal(serviceOrder.id);
        expect(result.serviceOrderItems[0]).to.have.property('orderItemId').equal(serviceOrderItem.id);
        expect(result.serviceOrderItems[0]).to.have.property('lineItemType');
        expect(result.serviceOrderItems[0]).to.have.property('totalPrice');
        expect(result).to.have.property('orderItemsTotal').equal(serviceOrder.orderTotal);
    });

    it('should not modify totalPrice', async () => {
        serviceCategory = await factory.create(FN.serviceCategory, {
            category: 'FIXED_PRICE',
        });

        await factory.create(FN.serviceReferenceItemDetail, {
            serviceReferenceItemId: serviceReferenceItem.id,
            soldItemId: inventoryItem.id,
            soldItemType: 'InventoryItem',
            lineItemName: 'test',
            lineItemTotalCost: 10,
            lineItemUnitCost: 1,
            category: serviceCategory.category,
            customerName: orderDelivery.customerName,
            customerPhoneNumber: orderDelivery.customerPhoneNumber,
        });

        payload = {
            serviceOrder
        };

        const result = await fetchOrderItems(payload);

        expect(result).to.have.property('serviceOrderId').equal(serviceOrder.id);
        expect(result.serviceOrderItems[0]).to.have.property('orderItemId').equal(serviceOrderItem.id);
        expect(result.serviceOrderItems[0]).to.have.property('lineItemType');
        expect(result.serviceOrderItems[0]).to.have.property('totalPrice');
        expect(result).to.have.property('orderItemsTotal').equal(serviceOrder.orderTotal);
    });

    it('should fail to fetch for not passing the payload', async () => {
        payload = {}
        expect(fetchOrderItems(payload)).rejectedWith(Error);
    });
});