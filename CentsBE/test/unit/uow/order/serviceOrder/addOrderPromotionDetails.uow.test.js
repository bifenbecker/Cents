require('../../../../testHelper');
const OrderPromoDetail = require('../../../../../models/orderPromoDetail');
const addOrderPromotionDetails = require('../../../../../uow/order/serviceOrder/addOrderPromotionDetails');
const factory = require('../../../../factories');
const { expect } = require('../../../../support/chaiHelper');

describe('test addOrderPromotionDetails UOW', () => {
    let store, payload;

    beforeEach(async () => {
        store = await factory.create('store');

        const centsCustomer = await factory.create('centsCustomer');
        const storeCustomer = await factory.create('storeCustomer', {
            centsCustomerId: centsCustomer.id,
            storeId: store.id,
            businessId: store.businessId,
        });
        payload = {
            storeId: store.id,
            status: 'READY_FOR_PROCESSING',
            storeCustomerId: storeCustomer.id,
        };
        const serviceOrder = await factory.create('serviceOrder', {
            ...payload,
        });
        const order = await factory.create('order', {
            storeId: store.id,
            orderableId: serviceOrder.id,
            orderableType: 'ServiceOrder',
        });

        payload.order = order;
    });

    it('should be able to add promotion details if promotionId is sent for the order', async () => {
        const promotion = await factory.create('promotion', {
            businessId: store.businessId,
        });
        payload.promotionId = promotion.id;
        await addOrderPromotionDetails(payload);
        const orderPromoDetails = await OrderPromoDetail.query()
            .where('orderId', payload.order.id)
            .first();
        expect(orderPromoDetails).to.have.property('orderId').equal(payload.order.id);
    });

    it('should not add orderPromoDetails if promotionId is not sent', async () => {
        await addOrderPromotionDetails(payload);
        const orderPromoDetails = await OrderPromoDetail.query()
            .where('orderId', payload.order.id)
            .first();
        expect(orderPromoDetails).to.be.undefined;
    });
});
