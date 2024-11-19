const { expect } = require('chai');
const chai = require('chai');
chai.use(require('chai-as-promised'));
const factory = require('../../../factories');
const updateOrderReturnMethod = require('../../../../uow/order/updateReturnMethod');
const { FACTORIES_NAMES } = require('../../../constants/factoriesNames');
const { returnMethods } = require('../../../../constants/constants');

describe('test updateReturnMethod UoW', () => {
    it('should return valid updated payload', async () => {
        const serviceOrder = await factory.create(FACTORIES_NAMES.serviceOrder, {
            returnMethod: returnMethods.DELIVERY,
        });

        const payload = {
            serviceOrderId: serviceOrder.id,
            returnMethod: returnMethods.IN_STORE_PICKUP,
        };

        const updatedPayload = await updateOrderReturnMethod(payload);

        expect(updatedPayload.returnMethod).to.be.equal(returnMethods.IN_STORE_PICKUP);
        expect(updatedPayload.serviceOrder).to.not.be.null;
        expect(updatedPayload.serviceOrder).to.not.be.undefined;
        expect(updatedPayload.serviceOrder.id).to.be.equal(serviceOrder.id);
    });

    it('should not create serviceOrder field when id is null', async () => {
        const serviceOrderId = null;
        const payload = {
            serviceOrderId,
            returnMethods: returnMethods.DELIVERY,
        };

        const updatedPayload = await updateOrderReturnMethod(payload);

        expect(updatedPayload.seriveOrder).to.be.undefined;
        expect(updatedPayload.serviceOrderId).to.be.null;
    });

    it('should return old payload when there is no returnMethod', async () => {
        const returnMethod = undefined;
        const payload = {
            serviceOrderId: 2,
            returnMethod,
        };

        const updatedPayload = await updateOrderReturnMethod(payload);

        expect(updatedPayload).to.be.eql({
            serviceOrderId: payload.serviceOrderId,
            returnMethod: payload.returnMethod,
        });

        expect(updatedPayload.seriveOrder).to.be.undefined;
    });

    it('should throw error when returnMethod is not determined in returnMethods object', async () => {
        const returnMethod = 'UNEXISTING_TEST_METHOD';

        const payload = {
            serviceOrderId: 2,
            returnMethod,
        };

        await expect(updateOrderReturnMethod(payload)).to.be.rejectedWith(Error);
    });

    it('should throw error when there is no payload', async () => {
        await expect(updateOrderReturnMethod()).to.be.rejectedWith(Error);
    });
});
