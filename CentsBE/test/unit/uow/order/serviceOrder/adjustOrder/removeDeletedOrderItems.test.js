require('../../../../../testHelper');
const factory = require('../../../../../factories');
const { expect } = require('../../../../../support/chaiHelper');
const { FACTORIES_NAMES: FN } = require('../../../../../constants/factoriesNames');
const removeDeletedOrderItems = require('../../../../../../uow/order/serviceOrder/adjustOrder/removeDeletedOrderItems');
const { createServiceOrderWithLineItemAndModifier } = require('../../../../../support/serviceOrderTestHelper');

const createPerPoundOrderItemWithModifier = async (storeId, serviceOrderId, deletedAt = null) => {
    const inventoryItem = await factory.create(FN.inventoryItem, {
        storeId: storeId,
    });
    const serviceMaster = await factory.create(FN.serviceMaster);
    const serviceModifier = await factory.create(FN.serviceModifier, {
        serviceId: serviceMaster.id,
    });
    const serviceOrderItem = await factory.create(FN.serviceOrderItem, {
        orderId: serviceOrderId,
        deletedAt,
    });  
    const serviceReferenceItem = await factory.create(FN.serviceReferenceItem, {
        orderItemId: serviceOrderItem.id,
        serviceId: serviceMaster.id,
        serviceModifierId: serviceModifier.id,
    });
    await factory.create(FN.serviceReferenceItemDetail, {
        serviceReferenceItemId: serviceReferenceItem.id,
        soldItemId: inventoryItem.id,
        soldItemType: 'Modifier',
        lineItemName: 'Service Test',
        lineItemTotalCost: 10,
        lineItemUnitCost: 15,
        pricingType: 'PER_POUND',
    });
    serviceOrderItem.category = 'PER_POUND';
    serviceOrderItem.serviceModifierIds =  [serviceModifier.id];
    return serviceOrderItem;
}

describe('test removeDeletedOrderItems UOW', () => {
    let business, store, order, serviceOrder;
    beforeEach(async () => {
        business = await factory.create(FN.laundromatBusiness);
        store = await factory.create(FN.store, {
            businessId: business.id,
        });
        serviceOrder = await factory.create(FN.serviceOrder, {
            storeId: store.id,
        });
        order = await factory.create(FN.serviceOrderMasterOrder, {
            orderableId: serviceOrder.id,
        });
    });

    it('should return payload when orderItems is empty', async () => {
        const result = await removeDeletedOrderItems({
            transaction: null, 
            serviceOrderId: serviceOrder.id,
            orderItems: [],
        });
        expect(result).to.have.property('serviceOrderId').to.equal(serviceOrder.id);
        expect(result).to.have.property('orderItems').to.be.empty;
    });

    describe('with orderItems', () => {
        let orderItems;
        beforeEach(async () => {
            orderItems = [await factory.create(FN.serviceOrderItemsWithReferenceItem, {
                orderId: serviceOrder.id,
            })];
        });

        it('should return all orderItems if they are not deleted', async () => {
            const result = await removeDeletedOrderItems({
                transaction: null, 
                serviceOrderId: serviceOrder.id,
                orderItems: orderItems,
            });

            expect(result).to.have.property('serviceOrderId').to.equal(serviceOrder.id);
            expect(result.orderItems.length).to.equal(orderItems.length);
        });

        it('should delete one orderItem', async () => {
            orderItems[0].isDeleted = true;
            const result = await removeDeletedOrderItems({
                transaction: null, 
                serviceOrderId: serviceOrder.id,
                orderItems: orderItems,
            });

            expect(result).to.have.property('serviceOrderId').to.equal(serviceOrder.id);
            expect(result.orderItems.length).to.equal(orderItems.length - 1);
            expect(result.totalItemsToDelete.length).to.equal(1);
            expect(result.totalItemsToDelete[0].id).to.equal(orderItems[0].id);
        });

        it('should delete one PER_POUND orderItem', async () => {
            const serviceOrderItem = await createPerPoundOrderItemWithModifier(store.id, serviceOrder.id);
            serviceOrderItem.isDeleted = true;
            const result = await removeDeletedOrderItems({
                transaction: null, 
                serviceOrderId: serviceOrder.id,
                orderItems: [...orderItems, serviceOrderItem],
            });

            expect(result).to.have.property('serviceOrderId').to.equal(serviceOrder.id);
            expect(result.orderItems.length).to.equal(orderItems.length);
            expect(result.totalItemsToDelete.length).to.equal(2);
            expect(result.totalItemsToDelete[0].id).to.equal(result.totalItemsToDelete[1].id).to.equal(serviceOrderItem.id);
            expect(result.totalItemsToDelete[0].deletedAt).to.not.be.null;
        });

        it('should delete PER_POUND item only from orderItems when it already deleted', async () => {
            const deletedAt = new Date().toISOString();
            const serviceOrderItem = await createPerPoundOrderItemWithModifier(store.id, serviceOrder.id, deletedAt);
            serviceOrderItem.isDeleted = true;
            const result = await removeDeletedOrderItems({
                transaction: null, 
                serviceOrderId: serviceOrder.id,
                orderItems: [...orderItems, serviceOrderItem],
            });

            expect(result).to.have.property('serviceOrderId').to.equal(serviceOrder.id);
            expect(result.orderItems.length).to.equal(orderItems.length);
            expect(result).to.not.have.property('totalItemsToDelete');
        });

        it('should return one existing modifier', async () => {
            const serviceOrderItem = await createPerPoundOrderItemWithModifier(store.id, serviceOrder.id);
            const result = await removeDeletedOrderItems({
                transaction: null, 
                serviceOrderId: serviceOrder.id,
                orderItems: [...orderItems, serviceOrderItem],
            });

            expect(result).to.have.property('serviceOrderId').to.equal(serviceOrder.id);
            expect(result.orderItems.length).to.equal(orderItems.length + 1);
            expect(result.existingModifiers.length).to.equal(1);
            expect(result.existingModifiers[0].id).to.equal(serviceOrderItem.id);
        });

        it('existingModifiers should be empty if modifier already deleted', async () => {
            const deletedAt = new Date().toISOString();
            const serviceOrderItem = await createPerPoundOrderItemWithModifier(store.id, serviceOrder.id, deletedAt);
            const result = await removeDeletedOrderItems({
                transaction: null, 
                serviceOrderId: serviceOrder.id,
                orderItems: [...orderItems, serviceOrderItem],
            });

            expect(result).to.have.property('serviceOrderId').to.equal(serviceOrder.id);
            expect(result.orderItems.length).to.equal(orderItems.length + 1);
            expect(result.existingModifiers).to.be.empty;
        });

        it('should delete all the modifiers', async () => {
            const serviceOrderItem = await createPerPoundOrderItemWithModifier(store.id, serviceOrder.id);
            orderItems[0].category = 'PER_POUND'
            orderItems[0].serviceModifierIds = [];
            const result = await removeDeletedOrderItems({
                transaction: null, 
                serviceOrderId: serviceOrder.id,
                orderItems: orderItems,
            });

            expect(result).to.have.property('serviceOrderId').to.equal(serviceOrder.id);
            expect(result.orderItems.length).to.equal(orderItems.length);
            expect(result.existingModifiers.length).to.equal(1);
            expect(result.existingModifiers[0].id).to.equal(serviceOrderItem.id);
            expect(result.totalItemsToDelete.length).to.equal(1);
            expect(result.totalItemsToDelete[0].id).to.equal(serviceOrderItem.id);
            expect(result.totalItemsToDelete[0].deletedAt).to.not.be.null;
        });

        it('should remove the already existing modifiers from the serviceModifierIds', async () => {
            const serviceModifier = await factory.create(FN.serviceModifier);
            const serviceOrderItem = await createPerPoundOrderItemWithModifier(store.id, serviceOrder.id);
            orderItems[0].category = 'PER_POUND'
            orderItems[0].serviceModifierIds = [serviceModifier.id];
            const result = await removeDeletedOrderItems({
                transaction: null, 
                serviceOrderId: serviceOrder.id,
                orderItems: orderItems,
            });

            expect(result).to.have.property('serviceOrderId').to.equal(serviceOrder.id);
            expect(result.orderItems.length).to.equal(orderItems.length);
            expect(result.existingModifiers.length).to.equal(1);
            expect(result.existingModifiers[0].id).to.equal(serviceOrderItem.id);
            expect(result.totalItemsToDelete.length).to.equal(1);
            expect(result.totalItemsToDelete[0].id).to.equal(serviceOrderItem.id);
            expect(result.totalItemsToDelete[0].deletedAt).to.not.be.null;
        });

        it('should remove a service orderItem with associated modifierLineItems', async () => {
            const orderDetails = await createServiceOrderWithLineItemAndModifier(business.id, store.id);
            const {
                serviceCategory,
                serviceModifier,
                servicePrice,
                serviceOrder,
                serviceOrderItem,
                serviceReferenceItem,
                serviceReferenceItemDetail,
                serviceReferenceItemDetailModifier,
            } = orderDetails;
            const orderItemsPayload = [
                {
                    id: serviceOrderItem.id,
                    category: serviceCategory.category,
                    priceId: servicePrice.id,
                    lineItemType: 'SERVICE',
                    isDeleted: true,
                    weight: 10,
                    count: 1,
                    serviceModifierIds: [serviceModifier.id]
                }
            ];
            const result = await removeDeletedOrderItems({
                transaction: null,
                serviceOrderId: serviceOrder.id,
                orderItems: orderItemsPayload,
            });

            expect(result).to.have.property('serviceOrderId').to.equal(serviceOrder.id);
            expect(result.orderItems.length).to.equal(0);
            expect(result.totalItemsToDelete.length).to.equal(1);
            expect(result.totalItemsToDelete[0].deletedAt).to.not.be.null;
            expect(result.totalItemsToDelete[0].referenceItems[0].id).to.equal(
                serviceReferenceItem.id,
            );
            expect(result.totalItemsToDelete[0].referenceItems[0].deletedAt).to.not.be.null;
            expect(result.totalItemsToDelete[0].referenceItems[0].lineItemDetail.id).to.equal(
                serviceReferenceItemDetail.id,
            );
            expect(result.totalItemsToDelete[0].referenceItems[0].lineItemDetail.deletedAt).to.not
                .be.null;
            expect(
                result.totalItemsToDelete[0].referenceItems[0].lineItemDetail.modifierLineItems[0]
                    .id,
            ).to.equal(serviceReferenceItemDetailModifier.id);
            expect(
                result.totalItemsToDelete[0].referenceItems[0].lineItemDetail.modifierLineItems[0]
                    .deletedAt,
            ).to.not.be.null;
        });
    });
});
