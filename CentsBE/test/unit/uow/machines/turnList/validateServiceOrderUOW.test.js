require('../../../../testHelper');
const { expect } = require('../../../../support/chaiHelper');
const factory = require('../../../../factories');
const validateServiceOrder = require('../../../../../uow/machines/turnList/validateServiceOrderUOW');
const { FACTORIES_NAMES: FN } = require('../../../../constants/factoriesNames');
const ServiceOrder = require('../../../../../models/serviceOrders');

describe('test validateServiceOrderUOW', () => {
    let serviceOrder;

    beforeEach(async () => {
        serviceOrder = await factory.create(FN.serviceOrder);
    });

    it('should return newPayload with serviceOrder successfully', async () => {
        const payload = {
            serviceOrderId: serviceOrder.id,
        };
        const result = await validateServiceOrder(payload);
        const serviceOrderInDB = await ServiceOrder.query().findById(serviceOrder.id);
        expect(result.serviceOrderId).to.eq(serviceOrderInDB.id);
        expect(result.serviceOrder).to.deep.eq(serviceOrderInDB);
    });

    it('should throw an error if serviceOrder is not found', async () => {
        const serviceOrderId = serviceOrder.id + 1;
        const payload = {
            serviceOrderId,
        };
        await expect(validateServiceOrder(payload)).to.be.rejectedWith('Invalid serviceOrder id.');
    });

    it('should be rejected with an error if passed payload with incorrect data', async () => {
        await expect(validateServiceOrder()).to.be.rejected;
        await expect(validateServiceOrder(null)).to.be.rejected;
        await expect(validateServiceOrder({})).to.be.rejected;
    });
});