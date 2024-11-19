require('../../../../testHelper');
const updateServiceOrderItemStatus = require('../../../../../uow/superAdmin/serviceOrder/updateServiceOrderItemStatusUow');
const factory = require('../../../../factories');
const { FACTORIES_NAMES } = require('../../../../constants/factoriesNames');
const ServiceOrderItem = require('../../../../../models/serviceOrderItem');
const { expect } = require('../../../../support/chaiHelper');
const { statuses } = require('../../../../../constants/constants');

describe('test updateServiceOrderItemStatus uow', () => {
    it('should update service order item status', async () => {
        const serviceOrder = await factory.create(FACTORIES_NAMES.serviceOrder, {
                status: statuses.COMPLETED,
            }),
            serviceOrderItems = await factory.createMany(FACTORIES_NAMES.serviceOrderItem, 2, {
                orderId: serviceOrder.id,
            });

        const payload = {
            serviceOrder,
        };

        const result = await updateServiceOrderItemStatus(payload);

        expect(result.serviceOrderItems).to.be.an('array');
        expect(result.serviceOrderItems).to.have.lengthOf(2);
        expect(result.serviceOrderItems.map((item) => item.id)).to.have.members([
            serviceOrderItems[0].id,
            serviceOrderItems[1].id,
        ]);

        const serviceOrderItemsInDb = await ServiceOrderItem.query().where({
            orderId: serviceOrder.id,
        });
        expect(serviceOrderItemsInDb).to.have.lengthOf(2);
        expect(serviceOrderItemsInDb[0].status).to.equal(serviceOrder.status);
        expect(serviceOrderItemsInDb[1].status).to.equal(serviceOrder.status);
    });

    it('should reject if invalid args were passed', async () => {
        await expect(updateServiceOrderItemStatus()).to.be.rejected;
        await expect(updateServiceOrderItemStatus(null)).to.be.rejected;
        await expect(updateServiceOrderItemStatus({})).to.be.rejected;
    });
});
