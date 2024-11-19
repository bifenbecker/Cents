require('../../../../testHelper');
const factory = require('../../../../factories');
const { expect } = require('../../../../support/chaiHelper');
const { FACTORIES_NAMES: FN } = require('../../../../constants/factoriesNames');
const setPickupAndDeliveryFee = require('../../../../../uow/order/serviceOrder/setPickupAndDeliveryFee');

describe('test setPickupAndDeliveryFee UOW', () => {
    let store, order, serviceOrder;
    beforeEach(async () => {
        store = await factory.create(FN.store);
        serviceOrder = await factory.create(FN.serviceOrder, {
            storeId: store.id,
            pickupDeliveryFee: 10,
            pickupDeliveryTip: 20,
            returnDeliveryTip: 30,
            returnDeliveryFee: 40,
        });
        order = await factory.create(FN.serviceOrderMasterOrder, {
            orderableId: serviceOrder.id,
        });
    });

    it('should return tip and fee', async () => {
        const result = await setPickupAndDeliveryFee({
            orderId: order.id,
        });
        expect(result).to.have.property('orderId').to.equal(order.id);
        expect(result).to.have.property('orderId').to.equal(order.id);
        expect(result).to.have.property('pickupDeliveryFee').to.equal(10);
        expect(result).to.have.property('pickupDeliveryTip').to.equal(20);
        expect(result).to.have.property('returnDeliveryTip').to.equal(30);
        expect(result).to.have.property('returnDeliveryFee').to.equal(40);
    });

    it('should return payload when orderId is not passed', async () => {
        const field = 'field';
        const result = await setPickupAndDeliveryFee({
            field,
        });

        expect(result).to.have.property('field').to.equal(field);
        expect(result).to.not.have.property('orderId');
        expect(result).to.not.have.property('pickupDeliveryFee');
        expect(result).to.not.have.property('pickupDeliveryTip');
        expect(result).to.not.have.property('returnDeliveryTip');
        expect(result).to.not.have.property('returnDeliveryFee');
    });

    it('should return payload when orderableType is not ServiceOrder', async () => {
        const inventoryOrderMasterOrder = await factory.create(FN.inventoryOrderMasterOrder, {
            orderableId: serviceOrder.id,
        })
        const result = await setPickupAndDeliveryFee({
            orderId: inventoryOrderMasterOrder.id,
        });

        expect(result).to.have.property('orderId').to.equal(inventoryOrderMasterOrder.id);
        expect(result).to.not.have.property('pickupDeliveryFee');
        expect(result).to.not.have.property('pickupDeliveryTip');
        expect(result).to.not.have.property('returnDeliveryTip');
        expect(result).to.not.have.property('returnDeliveryFee');
    });
    
    it('should be rejected when orderId is invalid', async () => {
        await expect(setPickupAndDeliveryFee({
            orderId: -1,
        })).to.be.rejected;
        await expect(setPickupAndDeliveryFee({
            orderId: 'string',
        })).to.be.rejected;
    });
});
