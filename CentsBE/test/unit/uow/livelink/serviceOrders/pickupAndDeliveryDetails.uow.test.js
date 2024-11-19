require('../../../../testHelper');
const { expect, assert } = require('../../../../support/chaiHelper');
const pickupAndDeliveryDetails = require('../../../../../uow/liveLink/serviceOrders/pickupAndDeliveryDetails');
const factory = require('../../../../factories');

const Timings = require('../../../../../models/timings');

describe('test pickup and delivery details uow', async () => {
    let serviceOrder, order;
    beforeEach(async () => {
        serviceOrder = await factory.create('serviceOrder', { status: 'HUB_PROCESSING_COMPLETE' });
        order = await factory.create('serviceOrderMasterOrder', { orderableId: serviceOrder.id });
    });

    it('should return empty pickup and delivery details for invalid order', async () => {
        const response = await pickupAndDeliveryDetails({ orderId: 42 });
        expect(response).to.have.a.property('pickup').to.be.an('object');
        expect(response).to.have.a.property('delivery').to.be.an('object');
        expect(response.pickup).to.be.empty;
        expect(response.delivery).to.be.empty;
    });

    it('should return empty pickup and delivery details for no order deliveries', async () => {
        const response = await pickupAndDeliveryDetails({ orderId: order.id });
        expect(response).to.have.a.property('pickup').to.be.an('object');
        expect(response).to.have.a.property('delivery').to.be.an('object');
        expect(response.pickup).to.be.empty;
        expect(response.delivery).to.be.empty;
    });

    it('should return pickup details and delivery as empty', async () => {
        const pickupDetails = await factory.create('orderDelivery', {
            orderId: order.id,
            status: 'COMPLETED',
            type: 'PICKUP',
            storeId: serviceOrder.storeId,
        });
        timings = await Timings.query().findById(pickupDetails.timingsId);
        driver = await factory.create('user');
        teamMember = await factory.create('teamMember', { userId: driver.id });
        route = await factory.create('route', {
            driverId: teamMember.id,
            storeId: serviceOrder.storeId,
            timingId: timings.id,
            status: 'STARTED',
        });
        routeDelivery = await factory.create('orderDeliveryRouteDelivery', {
            routeId: route.id,
            routableId: pickupDetails.id,
            status: 'IN_PROGRESS',
        });
        const response = await pickupAndDeliveryDetails({ orderId: order.id });
        expect(response).to.have.a.property('pickup').to.be.an('object');
        expect(response).to.have.a.property('delivery').to.be.an('object');
        assert.extensible(response.pickup, {
            ...pickupDetails,
            routeDelivery,
        });
        expect(response.delivery).to.be.empty;
    });

    it('should return pickup and delivery details', async () => {
        const pickupDetails = await factory.create('orderDelivery', {
            orderId: order.id,
            status: 'COMPLETED',
            type: 'PICKUP',
        });
        timings = await Timings.query().findById(pickupDetails.timingsId);
        driver = await factory.create('user');
        teamMember = await factory.create('teamMember', { userId: driver.id });
        pickupRoute = await factory.create('route', {
            driverId: teamMember.id,
            storeId: serviceOrder.storeId,
            timingId: timings.id,
            status: 'STARTED',
        });
        pickupRouteDelivery = await factory.create('orderDeliveryRouteDelivery', {
            routeId: pickupRoute.id,
            routableId: pickupDetails.id,
            status: 'IN_PROGRESS',
        });
        const returnDeliveryDetails = await factory.create('orderDelivery', {
            orderId: order.id,
            status: 'EN_ROUTE_TO_DROPOFF',
        });
        timings = await Timings.query().findById(returnDeliveryDetails.timingsId);
        deliveryRoute = await factory.create('route', {
            driverId: teamMember.id,
            storeId: serviceOrder.storeId,
            timingId: timings.id,
            status: 'STARTED',
        });
        returnRouteDelivery = await factory.create('orderDeliveryRouteDelivery', {
            routeId: deliveryRoute.id,
            routableId: returnDeliveryDetails.id,
            status: 'IN_PROGRESS',
        });
        const response = await pickupAndDeliveryDetails({ orderId: order.id });
        expect(response).to.have.a.property('pickup').to.be.an('object');
        expect(response).to.have.a.property('delivery').to.be.an('object');
        assert.extensible(response.pickup, {
            ...pickupDetails,
            pickupRouteDelivery,
        });
        assert.extensible(response.delivery, {
            ...returnDeliveryDetails,
            returnRouteDelivery,
        });
    });

    it('should return pickup details and delivery as empty for status CANCELED', async () => {
        const pickupDetails = await factory.create('orderDelivery', {
            orderId: order.id,
            status: 'COMPLETED',
            type: 'PICKUP',
        });
        await factory.create('orderDelivery', {
            orderId: order.id,
            status: 'CANCELED',
        });
        const response = await pickupAndDeliveryDetails({ orderId: order.id });
        expect(response).to.have.a.property('pickup').to.be.an('object');
        expect(response).to.have.a.property('delivery').to.be.an('object');
        assert.extensible(response.pickup, pickupDetails);
        expect(response.delivery).to.be.empty;
    });

    it('should return empty pickup and delivery for payload without orderId', async () => {
        const initialData = 'initialData';
        const payload = {
            initialData,
        };

        // call Uow
        const newPayload = await pickupAndDeliveryDetails(payload);

        // assert
        expect(newPayload, 'newPayload should have initial data').to.have.property(
            'initialData',
            initialData,
        );

        expect(newPayload, 'newPayload should have empty pickup property').to.have.property(
            'pickup',
        ).to.be.empty;
        expect(newPayload, 'newPayload should have empty delivery property').to.have.property(
            'delivery',
        ).to.be.empty;
    });

    it('should throw error for not passing the payload', async () => {
        expect(pickupAndDeliveryDetails()).rejectedWith(Error);
    });
});
