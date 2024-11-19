require('../../../../../testHelper');
const factory = require('../../../../../factories');
const { expect } = require('../../../../../support/chaiHelper');
const { FACTORIES_NAMES: FN } = require('../../../../../constants/factoriesNames');
const addAdjustmentLog = require('../../../../../../uow/order/serviceOrder/adjustOrder/addAdjustmentLog');
const OrderAdjustmentLog = require('../../../../../../models/orderAdjustmentLog');

describe('test addAdjustmentLog UOW', () => {
    let store, serviceOrder;
    beforeEach(async () => {
        store = await factory.create(FN.store);
        serviceOrder = await factory.create(FN.serviceOrder, {
            storeId: store.id,
        });
    });

    it('should fail when payload is empty', async () => {
        await expect(addAdjustmentLog({})).to.be.rejected;
    });

    it('should add adjustmentLog and return payload', async () => {
        const payload = {
            serviceOrderId: serviceOrder.id,
            orderTotal: 200,
            netOrderTotal: 100,
            currentOrderDetails: {
                previousOrderTotal: 100,
                previousNetOrderTotal: 50,
            },
        }
        const expectedLog = {
            previousNetOrderTotal: payload.currentOrderDetails.previousNetOrderTotal,
            previousOrderTotal: payload.currentOrderDetails.previousOrderTotal,
            newNetOrderTotal: payload.netOrderTotal,
            newOrderTotal: payload.orderTotal,
        }
        const result = await addAdjustmentLog(payload);
        const adjustmentLog = await OrderAdjustmentLog.query().select('*').findOne({
            serviceOrderId: serviceOrder.id,
        });

        expect(result).to.include(payload);
        expect(adjustmentLog).to.include(expectedLog);
    });
});
