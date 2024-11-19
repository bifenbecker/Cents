require('../../../../testHelper');
const { expect } = require('../../../../support/chaiHelper');
const factory = require('../../../../factories');
const { FACTORIES_NAMES } = require('../../../../constants/factoriesNames');
const updateServiceOrderStatus = require('../../../../../uow/superAdmin/serviceOrder/updateServiceOrderStatusUow');
const ServiceOrder = require('../../../../../models/serviceOrders');
const { statuses } = require('../../../../../constants/constants');

describe('test updateServiceOrderStatus uow', () => {
    it('should update service order status', async () => {
        const serviceOrder = await factory.create(FACTORIES_NAMES.serviceOrder, {
            status: statuses.PROCESSING,
        });

        const payload = {
            status: statuses.COMPLETED,
            serviceOrderId: serviceOrder.id,
        };

        const result = await updateServiceOrderStatus(payload);

        expect(result.serviceOrder).to.be.an('object');
        expect(result.serviceOrder.id).to.equal(payload.serviceOrderId);

        const serviceOrderInDb = await ServiceOrder.query().findById(payload.serviceOrderId);
        expect(serviceOrderInDb.status).to.equal(payload.status);
    });

    it('should reject if invalid args were passed', async () => {
        await expect(updateServiceOrderStatus()).to.be.rejected;
        await expect(updateServiceOrderStatus(null)).to.be.rejected;
        await expect(updateServiceOrderStatus({})).to.be.rejected;
    });
});
