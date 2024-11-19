require('../../../testHelper');
const factory = require('../../../factories');
const { FACTORIES_NAMES: FN } = require('../../../constants/factoriesNames');
const { expect } = require('../../../support/chaiHelper');
const mockResponse = require('./getDoorDashDeliveryDetails.mock.json');
const getDoorDashDeliveryDetails = require('../../../../uow/doorDash/getDoorDashDeliveryDetails');
const { setupGetDoordashDriveDeliveriesHttpMock } = require('../../../support/mockedHttpRequests');

describe('test getDoorDashDeliveryDetails', () => {
    it('should successfully retreive DoorDash data', async () => {
        const thirdPartyDeliveryId = mockResponse.id;
        setupGetDoordashDriveDeliveriesHttpMock({thirdPartyDeliveryId, responseBody: {...mockResponse}});

        const serviceOrder = await factory.create(FN.serviceOrder, {
            netOrderTotal: 100,
        });

        const order = await factory.create(FN.order, {
            orderableId: serviceOrder.id,
            orderableType: 'ServiceOrder',
        });
        const orderDelivery = await factory.create(FN.orderDelivery, {
            orderId: order.id,
            thirdPartyDeliveryId,
        });

        const res = await getDoorDashDeliveryDetails({
            id: orderDelivery.id
        });

        expect(res).to.have.keys('id', 'doorDashDelivery');
        expect(res.doorDashDelivery).to.be.deep.equal(mockResponse);
    });

    it('should reject if order does not exists', async () => {
        await expect(getDoorDashDeliveryDetails({ id: -1 })).to.be.rejected;
    });
});
