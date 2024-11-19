require('../../../../../testHelper');
const { expect } = require('../../../../../support/chaiHelper');
const factory = require('../../../../../factories');
const OrderPromoDetail = require('../../../../../../models/orderPromoDetail');
const updateOrderPromoDetails = require('../../../../../../uow/order/serviceOrder/adjustOrder/updateOrderPromoDetails');
const { FACTORIES_NAMES: FN } = require('../../../../../constants/factoriesNames');
const { statuses } = require('../../../../../../constants/constants');

describe('test updateOrderPromoDetails UOW', () => {
    let store, serviceOrder, order, promotion, promotionDetails, payload;

    beforeEach(async () => {
        store = await factory.create(FN.store);

        serviceOrder = await factory.create(FN.serviceOrder, {
            storeId: store.id,
            status: statuses.READY_FOR_PROCESSING,
        });

        order = await factory.create(FN.order, {
            storeId: store.id,
            orderableId: serviceOrder.id,
            orderableType: 'ServiceOrder',
        });

        promotion = await factory.create(FN.promotion, {
            businessId: store.businessId,
        });

        promotionDetails = await factory.create(FN.orderPromoDetail, {
            orderId: order.id,
            promoDetails: {
                test: 'test'
            }
        });

        payload = {
            orderId: order.id,
            promotionId: promotion.id,
            promotionDetails
        };
    });

    it('should be able to update promotion details if promotionId is sent for the order', async () => {
        await updateOrderPromoDetails(payload);

        const orderPromoDetails = await OrderPromoDetail.query()
            .where({ orderId: payload.orderId })
            .first();

        expect(orderPromoDetails).to.have.property('orderId').equal(order.id);
        expect(orderPromoDetails.promoDetails).to.have.property('test').equal('test');
    });

    it('should not update orderPromoDetails if promotionId is not sent', async () => {
        payload = {
            orderId: order.id,
            promotionDetails
        }

        await updateOrderPromoDetails(payload);

        const orderPromoDetails = await OrderPromoDetail.query()
            .where('orderId', payload.orderId)
            .first();

        expect(orderPromoDetails).to.be.undefined;
    });
});
