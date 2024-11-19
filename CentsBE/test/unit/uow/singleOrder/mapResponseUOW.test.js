const sinon = require('sinon');
require('../../../testHelper');
const factory = require('../../../factories');
const { expect } = require('../../../support/chaiHelper');
const getSingleOrderLogic = require('../../../../uow/singleOrder/getSingleOrderLogicUOW');
const { statuses } = require('../../../../constants/constants');
const { FACTORIES_NAMES: FN } = require('../../../constants/factoriesNames');
const LDClient = require('../../../../launch-darkly/LaunchDarkly');
const { getStoreSettings } = require('../../../support/storeSettingsHelper');
const { createServiceOrderWithLineItemAndModifier } = require('../../../support/serviceOrderTestHelper');

describe('test mapResponse', () => {
    let business,
        store,
        serviceOrder,
        order,
        serviceCategory,
        serviceMaster,
        inventoryItem,
        modifier,
        serviceModifier;

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
        serviceCategory = await factory.create(FN.perPoundServiceCategory, {
            businessId: store.businessId,
        });
        serviceMaster = await factory.create(FN.serviceMaster, {
            serviceCategoryId: serviceCategory.id,
        });
        inventoryItem = await factory.create(FN.inventoryItem, {
            storeId: store.id,
        });
        modifier = await factory.create(FN.modifier, {
            businessId: store.businessId,
        });
        serviceModifier = await factory.create(FN.serviceModifier, {
            modifierId: modifier.id,
            serviceId: serviceMaster.id,
        });
        const stub = sinon.stub(LDClient, 'evaluateFlag');
        stub.returns(false);
    });

    it('should return order details when soldItemType is Modifier', async () => {
        const centsCustomer = await factory.create(FN.centsCustomer);
        const storeCustomer = await factory.create(FN.storeCustomer, {
            phoneNumber: null,
            email: null,
            centsCustomerId: centsCustomer.id,
        });
        const convenienceFee = await factory.create(FN.convenienceFee, {
            businessId: store.businessId,
        });
        serviceOrder = await factory.create(FN.serviceOrder, {
            storeId: store.id,
            rack: 'A',
            notes: 'notes',
            hubId: store.id,
            storeCustomerId: storeCustomer.id,
            status: statuses.CANCELLED,
            refundableAmount: 5,
            convenienceFeeId: convenienceFee.id,
        });
        order = await factory.create(FN.order, {
            orderableType: 'ServiceOrder',
            orderableId: serviceOrder.id,
        });
        const serviceOrderWeights = await factory.create(FN.serviceOrderWeight, {
            serviceOrderId: serviceOrder.id,
        });
        const serviceOrderItem = await factory.create(FN.serviceOrderItem, {
            orderId: serviceOrder.id,
        });
        const serviceReferenceItem = await factory.create(FN.serviceReferenceItem, {
            orderItemId: serviceOrderItem.id,
            serviceModifierId: serviceModifier.id,
        });
        await factory.create(FN.serviceReferenceItemDetail, {
            serviceReferenceItemId: serviceReferenceItem.id,
            soldItemId: modifier.id,
            soldItemType: 'Modifier',
            lineItemName: 'Service Test',
            lineItemTotalCost: 10,
            lineItemUnitCost: 15,
        });
        await factory.create(FN.orderPromoDetail, {
            orderId: order.id,
            itemIds: [],
            promoDetails: {},
        });
        const orderDelivery = await factory.create(FN.orderDelivery, {
            orderId: order.id,
            storeId: store.id,
            storeCustomerId: storeCustomer.id,
        });

        const orderDetails = await getSingleOrderLogic(serviceOrder.id, store);
        expect(orderDetails.id).to.equal(serviceOrder.id);
        expect(orderDetails.storeId).to.equal(store.id);
        expect(orderDetails.weightLogs).to.not.be.empty;
        expect(orderDetails.weightLogs[0]).to.have.property('id').to.equal(serviceOrderWeights.id);
        expect(orderDetails.orderItems).to.be.empty;
        expect(orderDetails.rack).to.equal(serviceOrder.rack);
        expect(orderDetails.hub).to.have.property('id').to.equal(store.id);
        expect(orderDetails.promotion.itemIds).to.be.empty;
        expect(orderDetails.customer.phoneNumber).to.equal(centsCustomer.phoneNumber);
        expect(orderDetails.refundableAmount).to.equal(serviceOrder.refundableAmount);
        expect(orderDetails.convenienceFeePercentage).to.equal(convenienceFee.fee);
        expect(orderDetails.deliveries).to.not.be.empty;
        expect(orderDetails.deliveries[0].id).to.equal(orderDelivery.id);
    });

    it('should return order details with orderItems when order has service and modifiers', async () => {
        const centsCustomer = await factory.create(FN.centsCustomer);
        const storeCustomer = await factory.create(FN.storeCustomer, {
            phoneNumber: null,
            email: null,
            centsCustomerId: centsCustomer.id,
        });
        const convenienceFee = await factory.create(FN.convenienceFee, {
            businessId: store.businessId,
        });
        const servicePrice = await factory.create(FN.servicePrice, {
            serviceId: serviceMaster.id,
            storeId: store.id,
        });
        serviceOrder = await factory.create(FN.serviceOrder, {
            storeId: store.id,
            rack: 'A',
            notes: 'notes',
            hubId: store.id,
            storeCustomerId: storeCustomer.id,
            status: statuses.CANCELLED,
            refundableAmount: 5,
            convenienceFeeId: convenienceFee.id,
        });
        order = await factory.create(FN.order, {
            orderableType: 'ServiceOrder',
            orderableId: serviceOrder.id,
        });
        const serviceOrderWeights = await factory.create(FN.serviceOrderWeight, {
            serviceOrderId: serviceOrder.id,
        });
        const serviceOrderItem = await factory.create(FN.serviceOrderItem, {
            orderId: serviceOrder.id,
        });
        const serviceReferenceItem = await factory.create(FN.serviceReferenceItem, {
            orderItemId: serviceOrderItem.id,
            servicePriceId: servicePrice.id,
        });
        const serviceOrderItemForModifier = await factory.create(FN.serviceOrderItem, {
            orderId: serviceOrder.id,
        });
        const serviceReferenceItemForModifier = await factory.create(FN.serviceReferenceItem, {
            orderItemId: serviceOrderItemForModifier.id,
            serviceModifierId: serviceModifier.id,
        });
        await factory.create(FN.serviceReferenceItemDetail, {
            serviceReferenceItemId: serviceReferenceItem.id,
            soldItemId: servicePrice.id,
            soldItemType: 'ServicePrices',
            lineItemName: 'Service Test',
            lineItemTotalCost: 10,
            lineItemUnitCost: 15,
            pricingType: 'PER_POUND',
        });
        await factory.create(FN.serviceReferenceItemDetail, {
            serviceReferenceItemId: serviceReferenceItemForModifier.id,
            soldItemId: modifier.id,
            soldItemType: 'Modifier',
            lineItemName: 'Service Test',
            lineItemTotalCost: 10,
            lineItemUnitCost: 15,
            pricingType: 'PER_POUND',
        });
        await factory.create(FN.orderPromoDetail, {
            orderId: order.id,
            itemIds: [],
            promoDetails: {},
        });

        const orderDetails = await getSingleOrderLogic(serviceOrder.id, store);
        expect(orderDetails.id).to.equal(serviceOrder.id);
        expect(orderDetails.storeId).to.equal(store.id);
        expect(orderDetails.weightLogs).to.not.be.empty;
        expect(orderDetails.weightLogs[0]).to.have.property('id').to.equal(serviceOrderWeights.id);
        expect(orderDetails.orderItems).to.not.be.empty;
        expect(orderDetails.orderItems[0].modifiers).to.not.be.empty;
        expect(orderDetails.orderItems[0].modifiers[0].pricingType).to.equal('PER_POUND');
        expect(orderDetails.rack).to.equal(serviceOrder.rack);
        expect(orderDetails.hub).to.have.property('id').to.equal(store.id);
        expect(orderDetails.promotion.itemIds).to.be.empty;
        expect(orderDetails.customer.phoneNumber).to.equal(centsCustomer.phoneNumber);
        expect(orderDetails.refundableAmount).to.equal(serviceOrder.refundableAmount);
        expect(orderDetails.convenienceFeePercentage).to.equal(convenienceFee.fee);
    });

    it('should return order details when soldItemType is ServicePrices', async () => {
        // create businessSettings with requiresEmployeeCode: true
        await factory.create(FN.businessSetting, {
            requiresEmployeeCode: true,
            businessId: store.businessId,
        });
        store.settings = await getStoreSettings({
            businessId: store.businessId,
            requiresEmployeeCode: true,
        });
        const teamMember = await factory.create(FN.teamMember, {
            businessId: store.businessId,
        });
        serviceOrder = await factory.create(FN.serviceOrder, {
            storeId: store.id,
            employeeCode: teamMember.id,
        });
        order = await factory.create(FN.order, {
            orderableType: 'ServiceOrder',
            orderableId: serviceOrder.id,
        });
        const serviceOrderWeights = await factory.create(FN.serviceOrderWeight, {
            serviceOrderId: serviceOrder.id,
        });
        const serviceOrderItem = await factory.create(FN.serviceOrderItem, {
            orderId: serviceOrder.id,
        });
        const serviceReferenceItem = await factory.create(FN.serviceReferenceItem, {
            orderItemId: serviceOrderItem.id,
            serviceId: serviceMaster.id,
        });
        const serviceReferenceItemDetail = await factory.create(FN.serviceReferenceItemDetail, {
            serviceReferenceItemId: serviceReferenceItem.id,
            soldItemId: inventoryItem.id,
            soldItemType: 'ServicePrices',
            lineItemName: 'Service Test',
            lineItemTotalCost: 10,
            lineItemUnitCost: 15,
            category: 'PER_POUND',
        });
        await factory.create(FN.orderPromoDetail, {
            orderId: order.id,
            itemIds: [serviceReferenceItem.id],
            promoDetails: {
                appliesToType: 'specific-items',
            },
        });
        const orderDelivery = await factory.create(FN.orderDelivery, {
            orderId: order.id,
            storeId: store.id,
            type: 'PICKUP',
        });

        const orderDetails = await getSingleOrderLogic(serviceOrder.id, store);
        expect(orderDetails.id).to.equal(serviceOrder.id);
        expect(orderDetails.storeId).to.equal(store.id);
        expect(orderDetails.weightLogs).to.not.be.empty;
        expect(orderDetails.weightLogs[0].id).to.equal(serviceOrderWeights.id);
        expect(orderDetails.orderItems).to.not.be.empty;
        expect(orderDetails.orderItems[0].category).to.equal(serviceReferenceItemDetail.category);
        expect(orderDetails.orderItems[0].id).to.equal(serviceOrderItem.id);
        expect(orderDetails.orderItems[0].modifierLineItems).to.deep.equal([]);
        expect(orderDetails.employee.employeeCode).to.equal(`${teamMember.employeeCode}`);
        expect(orderDetails.promotion.itemIds.includes(serviceReferenceItem.id)).to.be.true;
        expect(orderDetails.refundableAmount).to.be.undefined;
        expect(orderDetails.deliveries[0].id).to.equal(orderDelivery.id);
    });

    it('should return taxAmount', async () => {
        await factory.create(FN.businessSetting, {
            businessId: store.businessId,
        });
        store.settings = await getStoreSettings({
            businessId: store.businessId,
        });
        serviceOrder = await factory.create(FN.serviceOrder, {
            storeId: store.id,
            taxAmountInCents: 85,
        });
        order = await factory.create(FN.order, {
            orderableType: 'ServiceOrder',
            orderableId: serviceOrder.id,
        });
        const serviceOrderItem = await factory.create(FN.serviceOrderItem, {
            orderId: serviceOrder.id,
        });
        await factory.create(FN.serviceReferenceItem, {
            orderItemId: serviceOrderItem.id,
            serviceId: serviceMaster.id,
        });

        const orderDetails = await getSingleOrderLogic(serviceOrder.id, store);
        expect(orderDetails).to.have.property('orderCalculationResponse');
        expect(orderDetails).to.have.property('taxAmount', 0.85);
    });

    // create two orderItems with different soldItemType: Modifier and ServicePrices for test mapModifiers
    it('test mapModifiers', async () => {
        const servicePrice = await factory.create(FN.servicePrice, {
            serviceId: serviceMaster.id,
            storeId: store.id,
        });
        const pricesOrderItem = await factory.create(FN.serviceOrderItem, {
            orderId: serviceOrder.id,
        });
        const pricesReferenceItem = await factory.create(FN.serviceReferenceItem, {
            servicePriceId: servicePrice.id,
            orderItemId: pricesOrderItem.id,
        });
        const pricesReferenceItemDetail = await factory.create(FN.serviceReferenceItemDetail, {
            serviceReferenceItemId: pricesReferenceItem.id,
            soldItemId: servicePrice.id,
            soldItemType: 'ServicePrices',
            lineItemName: 'Service Test',
            lineItemTotalCost: 15,
            lineItemUnitCost: 5,
            lineItemQuantity: 3,
            category: 'PER_POUND',
            pricingType: 'PER_POUND',
        });
        const modifier = await factory.create(FN.modifier, {
            businessId: business.id,
        });
        await factory.create(FN.serviceModifier, {
            modifierId: modifier.id,
            serviceId: serviceMaster.id,
        });
        await factory.create(FN.serviceReferenceItemDetailModifier, {
            serviceReferenceItemDetailId: pricesReferenceItemDetail.id,
            modifierId: modifier.id,
            modifierName: modifier.name,
            unitCost: modifier.price,
            quantity: pricesReferenceItemDetail.lineItemQuantity,
            totalCost: Number(modifier.price * pricesReferenceItemDetail.lineItemQuantity),
        });

        const orderDetails = await getSingleOrderLogic(serviceOrder.id, store);
        expect(orderDetails.orderItems).to.not.be.empty;
        expect(orderDetails.orderItems[0].category).to.equal(pricesReferenceItemDetail.category);

        const servicePriceLineItem = orderDetails.orderItems.find(item => item.servicePriceId === servicePrice.id);
        expect(servicePriceLineItem.totalAmount).to.equal(Number(pricesReferenceItemDetail.lineItemTotalCost).toFixed(2));
    });

    it('should return order details when soldItemType is ServicePrices and has modifierLineItems', async () => {
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
        expect(orderDetails.orderItems[0].totalAmount).to.equal(Number(serviceReferenceItemDetail.lineItemTotalCost).toFixed(2));
    });
});
