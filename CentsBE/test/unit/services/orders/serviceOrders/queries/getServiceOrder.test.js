require('../../../../../testHelper');
const factory = require('../../../../../factories');
const { expect } = require('../../../../../support/chaiHelper');
const { FACTORIES_NAMES: FN } = require('../../../../../constants/factoriesNames');
const getServiceOrder = require('../../../../../../services/orders/serviceOrders/queries/getServiceOrder');

describe('test getServiceOrder', () => {
    let serviceOrder;

    beforeEach(async () => {
        serviceOrder = await factory.create(FN.serviceOrder);
    });

    it('should return ServiceOrder without order', async () => {
        const result = await getServiceOrder(serviceOrder.id);

        expect(result).to.be.an('object');
        expect(result.id).to.equal(serviceOrder.id);
        expect(result.order).to.be.null;
    });

    it('should return ServiceOrder without order', async () => {
        await factory.create(FN.order, {
            orderableType: 'ServiceOrder',
            orderableId: serviceOrder.id,
        });
        const result = await getServiceOrder(serviceOrder.id);

        expect(result).to.be.an('object');
        expect(result.id).to.equal(serviceOrder.id);
        expect(result.order).to.be.an('object');
    });

    it('should fail if invalid params are passed', async () => {
        await expect(getServiceOrder()).to.be.rejected;
        await expect(getServiceOrder({})).to.be.rejected;
    });
});
