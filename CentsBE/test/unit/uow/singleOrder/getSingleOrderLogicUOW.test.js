require('../../../testHelper');
const { expect } = require('../../../support/chaiHelper');
const factory = require('../../../factories');
const getSingleOrderLogic = require('../../../../uow/singleOrder/getSingleOrderLogicUOW');
const { FACTORIES_NAMES: FN } = require('../../../constants/factoriesNames');
const { getStoreSettings } = require('../../../support/storeSettingsHelper');
const { createServiceOrderWithLineItemAndModifier } = require('../../../support/serviceOrderTestHelper');

describe('test getSingleOrderLogic', () => {
    let business, store, serviceOrder, order, inventoryItem;

    beforeEach(async () => {
        business = await factory.create(FN.laundromatBusiness);
        store = await factory.create(FN.store, {
            businessId: business.id,
        });
        store.settings = await getStoreSettings({
            businessId: store.businessId,
        });
        serviceOrder = await factory.create(FN.serviceOrder, {
            storeId: store.id,
        });
        order = await factory.create(FN.order, {
            orderableType: 'ServiceOrder',
            orderableId: serviceOrder.id,
        });
        inventoryItem = await factory.create(FN.inventoryItem, {
            storeId: store.id,
        });
    });

    it('should throw an error if store.businessId is undefined', async () => {
        store.businessId = undefined;
        await expect(getSingleOrderLogic(serviceOrder.id, store)).to.be.rejected;
    });

    it('should return only empty turns when order is not exist', async () => {
        const orderDetails = await getSingleOrderLogic(100, store);
        expect(orderDetails.turns).to.be.empty;
    });

    it('should return order details', async () => {
        const serviceOrderWeights = await factory.create(FN.serviceOrderWeight, {
            serviceOrderId: serviceOrder.id,
        });
        const serviceOrderItem = await factory.create(FN.serviceOrderItem, {
            orderId: serviceOrder.id,
        });
        const serviceReferenceItem = await factory.create(FN.serviceReferenceItem, {
            orderItemId: serviceOrderItem.id,
        });
        const serviceReferenceItemDetail = await factory.create(FN.serviceReferenceItemDetail, {
            serviceReferenceItemId: serviceReferenceItem.id,
            soldItemId: inventoryItem.id,
            soldItemType: 'InventoryItem',
            lineItemName: 'Service Test',
            lineItemTotalCost: 10,
            lineItemUnitCost: 15,
        });

        const orderDetails = await getSingleOrderLogic(serviceOrder.id, store);
        expect(orderDetails.id).to.equal(serviceOrder.id);
        expect(orderDetails.storeId).to.equal(store.id);
        expect(orderDetails.weightLogs).to.not.be.empty;
        expect(orderDetails.weightLogs[0].id).to.equal(serviceOrderWeights.id);
        expect(orderDetails.orderItems).to.not.be.empty;
        expect(orderDetails.orderItems[0].id).to.equal(serviceOrderItem.id);
        expect(orderDetails.orderItems[0].lineItemName).to.equal(
            serviceReferenceItemDetail.lineItemName,
        );
        expect(orderDetails.orderItems[0].soldItemType).to.equal(
            serviceReferenceItemDetail.soldItemType,
        );
    });

    it('should return order details when with modifierLineItems', async () => {
        const factoryOrderDetails = await createServiceOrderWithLineItemAndModifier(business.id, store.id);
        const {
            servicePrice: factoryServicePrice,
            serviceOrder: factoryServiceOrder,
            serviceOrderItem: factoryServiceOrderItem,
            serviceReferenceItemDetail,
            serviceReferenceItemDetailModifier,
            modifier,
        } = factoryOrderDetails;

        const orderDetails = await getSingleOrderLogic(factoryServiceOrder.id, store);
        expect(orderDetails.id).to.equal(factoryServiceOrder.id);
        expect(orderDetails.storeId).to.equal(store.id);
        expect(orderDetails.orderItems).to.not.be.empty;
        expect(orderDetails.orderItems[0].id).to.equal(factoryServiceOrderItem.id);
        expect(orderDetails.orderItems[0].servicePriceId).to.equal(factoryServicePrice.id);
        expect(orderDetails.orderItems[0].modifierLineItems).to.not.be.empty;
        expect(orderDetails.orderItems[0].modifierLineItems[0].id).to.equal(serviceReferenceItemDetailModifier.id);
        expect(orderDetails.orderItems[0].modifierLineItems[0].modifierId).to.equal(modifier.id);
        expect(orderDetails.orderItems[0].modifierLineItems[0].modifierName).to.equal(modifier.name);
        expect(orderDetails.orderItems[0].modifierLineItems[0].quantity).to.equal(serviceReferenceItemDetailModifier.quantity);
        expect(orderDetails.orderItems[0].modifierLineItems[0].unitCost).to.equal(modifier.price);
        expect(orderDetails.orderItems[0].modifierLineItems[0].totalCost).to.equal(Number(serviceReferenceItemDetail.lineItemQuantity * modifier.price));
        expect(orderDetails.orderItems[0].modifierLineItems[0].modifierPricingType).to.equal(serviceReferenceItemDetailModifier.modifierPricingType);
    });

    it('should return order details when store id is undefined', async () => {
        const storeCopy = { ...store };
        storeCopy.id = undefined;

        const serviceOrderItem = await factory.create(FN.serviceOrderItem, {
            orderId: serviceOrder.id,
        });
        const serviceReferenceItem = await factory.create(FN.serviceReferenceItem, {
            orderItemId: serviceOrderItem.id,
        });
        const serviceReferenceItemDetail = await factory.create(FN.serviceReferenceItemDetail, {
            serviceReferenceItemId: serviceReferenceItem.id,
            soldItemId: inventoryItem.id,
            soldItemType: 'InventoryItem',
            lineItemName: 'Service Test',
            lineItemTotalCost: 10,
            lineItemUnitCost: 15,
            category: 'PER_POUND',
        });
        const orderDetails = await getSingleOrderLogic(serviceOrder.id, storeCopy);

        expect(orderDetails.id).to.equal(serviceOrder.id);
        expect(orderDetails.store.id).to.equal(store.id);
        expect(orderDetails.orderableId).to.equal(order.orderableId);
        expect(orderDetails.orderItems).to.not.be.empty;
        expect(orderDetails.orderItems[0].category).to.equal(serviceReferenceItemDetail.category);
        expect(orderDetails.orderItems[0].id).to.equal(serviceOrderItem.id);
        expect(orderDetails.orderItems[0].soldItemType).to.equal(
            serviceReferenceItemDetail.soldItemType,
        );
    });
});
