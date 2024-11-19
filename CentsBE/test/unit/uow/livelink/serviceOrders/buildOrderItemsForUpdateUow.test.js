require('../../../../testHelper');
const factory = require('../../../../factories');
const { expect } = require('../../../../support/chaiHelper');
const { createServicePayload } = require('../../../../support/serviceOrderTestHelper');
const buildOrderItemsForUpdate = require('../../../../../uow/liveLink/serviceOrders/buildOrderItemsForUpdate');
const { FACTORIES_NAMES: FN } = require('../../../../constants/factoriesNames');
const { statuses, ORDER_TYPES } = require('../../../../../constants/constants');

describe('test buildOrderItemsForUpdate UOW test', () => {
    let store,
        serviceOrder,
        serviceOrderItem,
        fixedPriceServicePayload,
        serviceOrderItems;

    beforeEach(async () => {
        store = await factory.create(FN.store);
        fixedPriceServicePayload = await createServicePayload(store);

        serviceOrder = await factory.create(FN.serviceOrder, {
            netOrderTotal: 0,
            orderCode: '13',
            storeId: store.id,
            status: statuses.COMPLETED,
            taxAmountInCents: 1,
        });

        serviceOrderItem = await factory.create(FN.serviceOrderItem, {
            orderId: serviceOrder.id,
            status: 'random',
            promotionAmountInCents: 10,
        });

        serviceOrderItems = [
            {
                orderItemId: serviceOrderItem.id,
                priceId: fixedPriceServicePayload.servicePrice.id,
                promotionAmountInCents: serviceOrderItem.promotionAmountInCents,
                taxAmountInCents: serviceOrder.taxAmountInCents,
                count: 1,
                weight: 1,
                serviceModifierIds: [],
                lineItemType: ORDER_TYPES.SERVICE,
                category: 'FIXED_PRICE',
                hasMinPrice: true,
                perItemPrice: 10,
            },
        ];
    });

    it('should return the updated orderItems payload', async () => {
        const result = await buildOrderItemsForUpdate({ serviceOrderItems });

        expect(Object.keys(result.serviceOrderItems[0])).to.have.lengthOf(3);
        expect(result.serviceOrderItems[0])
            .to.have.property('promotionAmountInCents')
            .equal(serviceOrderItem.promotionAmountInCents);
        expect(result.serviceOrderItems[0])
            .to.have.property('taxAmountInCents')
            .equal(serviceOrder.taxAmountInCents);
        expect(result.serviceOrderItems[0])
            .to.have.property('id')
            .equal(serviceOrderItem.id);
    });
});
