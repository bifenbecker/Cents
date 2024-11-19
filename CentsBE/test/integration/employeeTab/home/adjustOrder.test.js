require('../../../testHelper');
const ChaiHttpRequestHelper = require('../../../support/chaiHttpRequestHelper');
const { generateToken } = require('../../../support/apiTestHelper');
const factory = require('../../../factories');
const { expect } = require('../../../support/chaiHelper');
const {
    createInventoryPayload,
    createServicePayload,
} = require('../../../support/serviceOrderTestHelper');
const {
    fixedPriceServiceItemPayload,
    perPoundServiceItemPayload,
    perPoundModifierItemPayload,
    inventoryItemPayload,
} = require('../../../support/adjustOrderTestHelper');
const ServiceOrder = require('../../../../models/serviceOrders');
const { FACTORIES_NAMES } = require('../../../constants/factoriesNames');
const ServiceModifier = require('../../../../models/serviceModifiers');
const adjustOrder = require('../../../../routes/employeeTab/home/adjustOrder');
const {
    createMiddlewareMockedArgs,
} = require('../../../support/mockers/createMiddlewareMockedArgs');

function getToken(storeId) {
    return generateToken({ id: storeId });
}

async function createServiceOrder(payload, inventoryItemsOnly = false, inventoryItemQuantity) {
    const { store, storeCustomer, promotion, centsCustomer, convenienceFeeId } = payload;
    const items = inventoryItemsOnly
        ? [await inventoryItemPayload(store, centsCustomer, false, inventoryItemQuantity)]
        : [
              await fixedPriceServiceItemPayload(store, centsCustomer),
              await perPoundServiceItemPayload(store, centsCustomer),
              await perPoundModifierItemPayload(store, centsCustomer),
              await inventoryItemPayload(store, centsCustomer),
          ];
    const serviceOrderPayload = {
        storeCustomerId: storeCustomer.id,
        tipAmount: 10,
        orderTotal: 10,
        promotionAmount: 10,
        taxAmountInCents: 1,
        netOrderTotal: 5.4,
        promotionId: promotion.id,
        convenienceFee: 5,
        convenienceFeeId,
        orderType: 'SERVICE',
        paymentTiming: 'POST-PAY',
        storeId: store.id,
        orderItems: items,
    };
    return ServiceOrder.query().insertGraphAndFetch(serviceOrderPayload);
}

function adjustOrderItemsPayload(
    orderItems,
    { withModifiers = false, isDeleted = false, inventoryItemCount = 1 },
) {
    const modifierIds = [];
    const items = [];
    orderItems.forEach((orderItem) => {
        if (orderItem.referenceItems[0].servicePriceId) {
            items.push({
                id: orderItem.id,
                priceId: orderItem.referenceItems[0].servicePriceId,
                category: orderItem.referenceItems[0].lineItemDetail.category,
                lineItemType: 'SERVICE',
                serviceCategoryType: 'ALTERATIONS',
                turnAroundInHours: 1,
                pricingType: 'PER_POUND',
                count: 1,
                weight: 1,
            });
        }
        if (orderItem.referenceItems[0].inventoryItemId) {
            items.push({
                id: orderItem.id,
                priceId: orderItem.referenceItems[0].inventoryItemId,
                category: 'INVENTORY',
                lineItemType: 'INVENTORY',
                count: inventoryItemCount,
                isDeleted: isDeleted,
            });
        }
        if (withModifiers && orderItem.referenceItems[0].serviceModifierId) {
            modifierIds.push(orderItem.referenceItems[0].serviceModifierId);
        }
    });
    const perPoundItem = items.find((item) => {
        return item.category === 'PER_POUND';
    });
    if (perPoundItem) perPoundItem.serviceModifierIds = withModifiers ? modifierIds : [];
    return items;
}

describe('test adjustOrder api', () => {
    let store, token, storeCustomer, centsCustomer, promotion, convenienceFee;
    const apiEndPoint = '/api/v1/employee-tab/home/orders';

    beforeEach(async () => {
        const business = await factory.create(FACTORIES_NAMES.laundromatBusiness);
        store = await factory.create(FACTORIES_NAMES.store, {
            businessId: business.id,
        });
        token = getToken(store.id);
        centsCustomer = await factory.create(FACTORIES_NAMES.centsCustomer);
        storeCustomer = await factory.create(FACTORIES_NAMES.storeCustomer, {
            centsCustomerId: centsCustomer.id,
            storeId: store.id,
            businessId: store.businessId,
        });
        promotion = await factory.create(FACTORIES_NAMES.promotion, {
            businessId: store.businessId,
        });
        convenienceFee = await factory.create(FACTORIES_NAMES.convenienceFee, {
            businessId: store.businessId,
        });
    });

    it('should throw an error if token is not sent', async () => {
        const serviceOrder = await createServiceOrder({
            store,
            storeCustomer,
            promotion,
            centsCustomer,
            convenienceFeeId: convenienceFee.id,
        });
        const order = await factory.create(FACTORIES_NAMES.order, {
            storeId: store.id,
            orderableId: serviceOrder.id,
            orderableType: 'ServiceOrder',
        });
        const body = {
            id: serviceOrder.id,
            promotionId: serviceOrder.promotionId,
            totalWeight: 1,
            orderType: 'ServiceOrder',
            convenienceFeeId: convenienceFee.id,
            chargeableWeight: 1,
            orderId: order.id,
            storeId: store.id,
            tipAmount: 1,
            orderItems: adjustOrderItemsPayload(serviceOrder.orderItems, {}),
        };
        const res = await ChaiHttpRequestHelper.put(
            `${apiEndPoint}/${serviceOrder.id}`,
            {},
            body,
        ).set('authtoken', '');

        res.should.have.status(401);
    });

    it('should return store not found error', async () => {
        const serviceOrder = await createServiceOrder({
            store,
            storeCustomer,
            promotion,
            centsCustomer,
            convenienceFeeId: convenienceFee.id,
        });
        const order = await factory.create(FACTORIES_NAMES.order, {
            storeId: store.id,
            orderableId: serviceOrder.id,
            orderableType: 'ServiceOrder',
        });
        const body = {
            id: serviceOrder.id,
            promotionId: serviceOrder.promotionId,
            totalWeight: 1,
            orderType: 'ServiceOrder',
            convenienceFeeId: convenienceFee.id,
            chargeableWeight: 1,
            orderId: order.id,
            storeId: store.id,
            tipAmount: 1,
            orderItems: adjustOrderItemsPayload(serviceOrder.orderItems, {}),
        };
        const token = getToken(100);
        const res = await ChaiHttpRequestHelper.put(
            `${apiEndPoint}/${serviceOrder.id}`,
            {},
            body,
        ).set('authtoken', token);
        res.should.have.status(403);
    });

    it('should throw an error if orderId is not sent', async () => {
        const serviceOrder = await createServiceOrder({
            store,
            storeCustomer,
            promotion,
            centsCustomer,
            convenienceFeeId: convenienceFee.id,
        });
        await factory.create(FACTORIES_NAMES.order, {
            storeId: store.id,
            orderableId: serviceOrder.id,
            orderableType: 'ServiceOrder',
        });
        const body = {
            id: serviceOrder.id,
            promotionId: serviceOrder.promotionId,
            totalWeight: 1,
            orderType: 'ServiceOrder',
            convenienceFeeId: convenienceFee.id,
            chargeableWeight: 1,
            storeId: store.id,
            tipAmount: 1,
            orderItems: adjustOrderItemsPayload(serviceOrder.orderItems, {}),
        };
        const res = await ChaiHttpRequestHelper.put(
            `${apiEndPoint}/${serviceOrder.id}`,
            {},
            body,
        ).set('authtoken', token);
        res.should.have.status(422);
        expect(res.body).to.have.property('error').equal('orderId is required');
    });

    it('should call next(error) if data is not correct', async () => {
        const { mockedReq, mockedRes, mockedNext } = createMiddlewareMockedArgs();

        await adjustOrder(mockedReq, mockedRes, mockedNext);

        expect(mockedNext.called, 'should call next(error)').to.be.true;
        expect(mockedNext.getCall(0).args[0].message).to.not.be.empty;
    });

    describe('service items', () => {
        it('should add the new modifiers', async () => {
            const serviceOrder = await createServiceOrder({
                store,
                storeCustomer,
                promotion,
                centsCustomer,
                convenienceFeeId: convenienceFee.id,
            });
            const order = await factory.create(FACTORIES_NAMES.order, {
                storeId: store.id,
                orderableId: serviceOrder.id,
                orderableType: 'ServiceOrder',
            });
            const serviceOrderWeight = await factory.create(FACTORIES_NAMES.serviceOrderWeight, {
                serviceOrderId: serviceOrder.id,
                step: 1,
                totalWeight: 5,
                chargeableWeight: 5,
            });
            const body = {
                id: serviceOrder.id,
                promotionId: serviceOrder.promotionId,
                totalWeight: serviceOrderWeight.totalWeight,
                orderType: 'ServiceOrder',
                convenienceFeeId: convenienceFee.id,
                chargeableWeight: 1,
                storeId: store.id,
                orderId: order.id,
                tipAmount: serviceOrder.tipAmount,
                orderItems: adjustOrderItemsPayload(serviceOrder.orderItems, {
                    withModifiers: true,
                }),
            };
            await ServiceModifier.query().patch({ isFeatured: true });

            const res = await ChaiHttpRequestHelper.put(
                `${apiEndPoint}/${serviceOrder.id}`,
                {},
                body,
            ).set('authtoken', token);

            res.should.have.status(200);
            expect(res.body.orderItems.length).to.eq(3);
            expect(res.body.orderItems[0].category).to.not.eq('PER_POUND');
            expect(res.body.orderItems[0].modifiers.length).to.eq(0);
            expect(res.body.orderItems[1].category).to.eq('PER_POUND');
            expect(res.body.orderItems[1].modifiers.length).to.eq(1);
            expect(res.body.orderItems[2].category).to.not.eq('PER_POUND');
            expect(res.body.orderItems[2].modifiers.length).to.eq(0);
        });

        it('should return status 200 and correct data', async () => {
            const serviceOrder = await createServiceOrder({
                store,
                storeCustomer,
                promotion,
                centsCustomer,
                convenienceFeeId: convenienceFee.id,
            });
            const order = await factory.create(FACTORIES_NAMES.order, {
                storeId: store.id,
                orderableId: serviceOrder.id,
                orderableType: 'ServiceOrder',
            });
            const serviceOrderWeight = await factory.create(FACTORIES_NAMES.serviceOrderWeight, {
                serviceOrderId: serviceOrder.id,
                step: 1,
                totalWeight: 5,
                chargeableWeight: 5,
            });
            const body = {
                id: serviceOrder.id,
                promotionId: serviceOrder.promotionId,
                totalWeight: serviceOrderWeight.totalWeight,
                orderType: 'ServiceOrder',
                convenienceFeeId: convenienceFee.id,
                chargeableWeight: 1,
                storeId: store.id,
                orderId: order.id,
                tipAmount: serviceOrder.tipAmount,
                notes: 'test order note',
                customerNotes: 'test customer note',
                orderItems: adjustOrderItemsPayload(serviceOrder.orderItems, {}),
            };
            const res = await ChaiHttpRequestHelper.put(
                `${apiEndPoint}/${serviceOrder.id}`,
                {},
                body,
            ).set('authtoken', token);
            res.should.have.status(200);
            expect(res.body.id).to.eq(serviceOrder.id);
            expect(res.body.activityLog[0].isAdjusted).to.be.true;
            expect(res.body.convenienceFeeId).to.eq(convenienceFee.id);
            expect(res.body.orderableId).to.eq(serviceOrder.id);
            expect(res.body.orderableType).to.eq(order.orderableType);
            expect(res.body.orderId).to.eq(order.id);
            expect(res.body.orderItems.map((order) => order.id)).to.include.members(
                body.orderItems.map((order) => order.id),
            );
            expect(res.body.paymentTiming).to.eq(serviceOrder.paymentTiming);
            expect(res.body.paymentStatus).to.eq(serviceOrder.paymentStatus);
            expect(res.body.placedAt).to.be.a.dateString();
            expect(res.body.serviceOrderBags).to.be.empty;
            expect(res.body.storeId).to.eq(store.id);
            expect(res.body.tipAmount).to.eq(serviceOrder.tipAmount);
            expect(res.body.weightLogs.length).to.eq(1);
            expect(res.body.weightLogs[0].totalWeight).to.eq(serviceOrderWeight.totalWeight);
            expect(res.body.weightLogs[0].teamMemberId).to.eq(serviceOrderWeight.teamMemberId);
            expect(res.body.weightLogs[0].step).to.eq(serviceOrderWeight.step);
            expect(res.body).to.have.property('notes', body.notes);
            expect(res.body.customer).to.have.property('notes', body.customerNotes);

            expect(res.body).to.include.all.keys(
                'totalPaid',
                'totalAmount',
                'tier',
                'subscription',
                'taxAmount',
                'promotionAmount',
                'promotionId',
                'rack',
                'recurringDiscountInCents',
                'refundAmount',
                'returnDeliveryFee',
                'returnDeliveryTip',
                'returnMethod',
                'service',
                'promotion',
                'pickupDeliveryTip',
                'pickupDeliveryFee',
                'pickup',
                'payments',
                'orderType',
                'orderCodeWithPrefix',
                'orderCode',
                'notificationLogs',
                'netOrderTotal',
                'isTaxable',
                'isProcessedAtHub',
                'isBagTrackingEnabled',
                'employee',
                'deliveryReminderText',
                'deliveries',
                'customer',
                'creditApplied',
                'creditAmount',
                'completedAt',
                'canCancel',
                'balanceDue',
                'convenienceFee',
                'convenienceFeePercentage',
            );
        });
    });

    describe('inventory items', () => {
        it('should return status 200', async () => {
            const serviceOrder = await factory.create(FACTORIES_NAMES.serviceOrder, {
                storeId: store.id,
                storeCustomerId: storeCustomer.id,
                netOrderTotal: 100,
                orderTotal: 200,
                balanceDue: 150,
                convenienceFee: 300,
                promotionAmount: 1,
            });
            const order = await factory.create(FACTORIES_NAMES.order, {
                storeId: store.id,
                orderableId: serviceOrder.id,
                orderableType: 'ServiceOrder',
            });
            const inventoryPayload = await createInventoryPayload(store);
            const serviceOrderWeight = await factory.create(FACTORIES_NAMES.serviceOrderWeight, {
                serviceOrderId: serviceOrder.id,
                step: 1,
                totalWeight: 5,
                chargeableWeight: 5,
            });
            const body = {
                id: serviceOrder.id,
                promotionId: serviceOrder.promotionId,
                totalWeight: serviceOrderWeight.totalWeight,
                orderType: 'ServiceOrder',
                convenienceFeeId: convenienceFee.id,
                chargeableWeight: 1,
                storeId: store.id,
                orderId: order.id,
                tipAmount: serviceOrder.tipAmount,
                orderItems: [
                    {
                        priceId: inventoryPayload.inventoryItem.id,
                        lineItemType: 'INVENTORY',
                        count: 1,
                        category: 'INVENTORY',
                    },
                ],
            };
            const res = await ChaiHttpRequestHelper.put(
                `${apiEndPoint}/${serviceOrder.id}`,
                {},
                body,
            ).set('authtoken', token);
            res.should.have.status(200);
            expect(res.body.orderItems.length).to.eq(1);
            expect(res.body.orderItems[0].price).to.eq(inventoryPayload.inventoryItem.price);
            expect(res.body.orderItems[0].lineItemName).to.eq(
                inventoryPayload.inventory.productName,
            );
            expect(res.body.orderItems[0].inventoryItemId).to.eq(inventoryPayload.inventoryItem.id);
        });
        it('should decrease the quantity of the item when it is deleted', async () => {
            const serviceOrder = await createServiceOrder(
                {
                    store,
                    storeCustomer,
                    promotion,
                    centsCustomer,
                    convenienceFeeId: convenienceFee.id,
                },
                true,
            );
            const order = await factory.create(FACTORIES_NAMES.order, {
                storeId: store.id,
                orderableId: serviceOrder.id,
                orderableType: 'ServiceOrder',
            });
            const serviceOrderWeight = await factory.create(FACTORIES_NAMES.serviceOrderWeight, {
                serviceOrderId: serviceOrder.id,
                step: 1,
                totalWeight: 5,
                chargeableWeight: 5,
            });
            const orderItems = adjustOrderItemsPayload(serviceOrder.orderItems, {
                withModifiers: false,
                isDeleted: true,
            });
            const body = {
                id: serviceOrder.id,
                promotionId: serviceOrder.promotionId,
                totalWeight: serviceOrderWeight.totalWeight,
                orderType: 'ServiceOrder',
                convenienceFeeId: convenienceFee.id,
                chargeableWeight: 1,
                storeId: store.id,
                orderId: order.id,
                tipAmount: serviceOrder.tipAmount,
                orderItems,
            };
            const res = await ChaiHttpRequestHelper.put(
                `${apiEndPoint}/${serviceOrder.id}`,
                {},
                body,
            ).set('authtoken', token);

            res.should.have.status(200);
            expect(!res.body.orderItems.find((order) => order.lineItemType === 'Inventory')).to.be
                .true;
            expect(res.body.orderItems.length).to.eq(orderItems.length - 1);
        });

        it('should not update the quantity of the inventory item when the item count is not updated', async () => {
            const serviceOrder = await createServiceOrder(
                {
                    store,
                    storeCustomer,
                    promotion,
                    centsCustomer,
                    convenienceFeeId: convenienceFee.id,
                },
                true,
            );
            const order = await factory.create(FACTORIES_NAMES.order, {
                storeId: store.id,
                orderableId: serviceOrder.id,
                orderableType: 'ServiceOrder',
            });
            const serviceOrderWeight = await factory.create(FACTORIES_NAMES.serviceOrderWeight, {
                serviceOrderId: serviceOrder.id,
                step: 1,
                totalWeight: 5,
                chargeableWeight: 5,
            });
            const orderItems = adjustOrderItemsPayload(serviceOrder.orderItems, {
                withModifiers: false,
            });
            const body = {
                id: serviceOrder.id,
                promotionId: serviceOrder.promotionId,
                totalWeight: serviceOrderWeight.totalWeight,
                orderType: 'ServiceOrder',
                convenienceFeeId: convenienceFee.id,
                chargeableWeight: 1,
                storeId: store.id,
                orderId: order.id,
                tipAmount: serviceOrder.tipAmount,
                orderItems,
            };
            const res = await ChaiHttpRequestHelper.put(
                `${apiEndPoint}/${serviceOrder.id}`,
                {},
                body,
            ).set('authtoken', token);

            res.should.have.status(200);
            expect(res.body.orderItems[0].lineItemType).to.eq('INVENTORY');
            expect(res.body.orderItems.length).to.eq(orderItems.length);
            expect(res.body.orderItems[0].count).to.eq(orderItems[0].count);
        });

        it('should increase the quantity of the inventory item when the count of selected item is increased', async () => {
            const serviceOrder = await createServiceOrder(
                {
                    store,
                    storeCustomer,
                    promotion,
                    centsCustomer,
                    convenienceFeeId: convenienceFee.id,
                },
                true,
            );
            const order = await factory.create(FACTORIES_NAMES.order, {
                storeId: store.id,
                orderableId: serviceOrder.id,
                orderableType: 'ServiceOrder',
            });
            const serviceOrderWeight = await factory.create(FACTORIES_NAMES.serviceOrderWeight, {
                serviceOrderId: serviceOrder.id,
                step: 1,
                totalWeight: 5,
                chargeableWeight: 5,
            });
            const referenceItem = serviceOrder.orderItems[0].referenceItems[0];
            const increasedQuantity = referenceItem.quantity + 1;
            const orderItems = adjustOrderItemsPayload(serviceOrder.orderItems, {
                withModifiers: false,
                inventoryItemCount: increasedQuantity,
            });
            const body = {
                id: serviceOrder.id,
                promotionId: serviceOrder.promotionId,
                totalWeight: serviceOrderWeight.totalWeight,
                orderType: 'ServiceOrder',
                convenienceFeeId: convenienceFee.id,
                chargeableWeight: 1,
                storeId: store.id,
                orderId: order.id,
                tipAmount: serviceOrder.tipAmount,
                orderItems,
            };
            const res = await ChaiHttpRequestHelper.put(
                `${apiEndPoint}/${serviceOrder.id}`,
                {},
                body,
            ).set('authtoken', token);

            res.should.have.status(200);
            expect(res.body.orderItems.length).to.eq(1);
            expect(res.body.orderItems[0].count).to.eq(increasedQuantity);
            expect(res.body.orderItems[0].orderItemId).to.eq(referenceItem.orderItemId);
            expect(res.body.orderItems[0].inventoryItemId).to.eq(referenceItem.inventoryItemId);
        });

        it('should decrease the quantity of the inventory item when the count of selected item is decreased', async () => {
            const serviceOrder = await createServiceOrder(
                {
                    store,
                    storeCustomer,
                    promotion,
                    centsCustomer,
                    convenienceFeeId: convenienceFee.id,
                },
                true,
                2,
            );
            const order = await factory.create(FACTORIES_NAMES.order, {
                storeId: store.id,
                orderableId: serviceOrder.id,
                orderableType: 'ServiceOrder',
            });
            const serviceOrderWeight = await factory.create(FACTORIES_NAMES.serviceOrderWeight, {
                serviceOrderId: serviceOrder.id,
                step: 1,
                totalWeight: 5,
                chargeableWeight: 5,
            });
            const referenceItem = serviceOrder.orderItems[0].referenceItems[0];
            const decreasedQuantity = referenceItem.quantity - 1;
            const orderItems = adjustOrderItemsPayload(serviceOrder.orderItems, {
                withModifiers: false,
                inventoryItemCount: decreasedQuantity,
            });
            const body = {
                id: serviceOrder.id,
                promotionId: serviceOrder.promotionId,
                totalWeight: serviceOrderWeight.totalWeight,
                orderType: 'ServiceOrder',
                convenienceFeeId: convenienceFee.id,
                chargeableWeight: 1,
                storeId: store.id,
                orderId: order.id,
                tipAmount: serviceOrder.tipAmount,
                orderItems,
            };
            const res = await ChaiHttpRequestHelper.put(
                `${apiEndPoint}/${serviceOrder.id}`,
                {},
                body,
            ).set('authtoken', token);

            res.should.have.status(200);
            expect(res.body.orderItems.length).to.eq(1);
            expect(res.body.orderItems[0].count).to.eq(decreasedQuantity);
            expect(res.body.orderItems[0].orderItemId).to.eq(referenceItem.orderItemId);
            expect(res.body.orderItems[0].inventoryItemId).to.eq(referenceItem.inventoryItemId);
        });
    });
});
