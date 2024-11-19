require('../../../../testHelper');
const { expect } = require('chai');
const chai = require('chai');
chai.use(require('chai-as-promised'));
const routeDeliveryDetails = require('../../../../../uow/liveLink/serviceOrders/routeDeliveryUOW');
const factory = require('../../../../factories');
const { FACTORIES_NAMES } = require('../../../../constants/factoriesNames');

describe('test routeDeliveryUOW', () => {
    it('should return mapped routeDelivery object', async () => {
        const serviceOrder = await factory.create(FACTORIES_NAMES.serviceOrder);
        const order = await factory.create(FACTORIES_NAMES.order, {
            orderableId: serviceOrder.id,
            orderableType: 'ServiceOrder',
        });
        const orderDelivery = await factory.create(FACTORIES_NAMES.orderDelivery, {
            orderId: order.id,
        });
        const user = await factory.create(FACTORIES_NAMES.user, {
            phone: '333333',
        });
        const driver = await factory.create(FACTORIES_NAMES.teamMember, {
            role: 'Driver',
            userId: user.id,
        });
        const route = await factory.create(FACTORIES_NAMES.route, {
            driverId: driver.id,
        });
        const routeDelivery = await factory.create(FACTORIES_NAMES.routeDelivery, {
            routeId: route.id,
            routableId: orderDelivery.id,
            routableType: 'OrderDelivery',
            notes: 'test notes',
            imageUrl: 'testUrl',
        });
        const mappedRouteDeliveryDetails = await routeDeliveryDetails(routeDelivery);

        expect(mappedRouteDeliveryDetails).to.be.eql({
            id: routeDelivery.id,
            status: routeDelivery.status,
            eta: routeDelivery.eta.toString(),
            notes: routeDelivery.notes,
            imageUrl: routeDelivery.imageUrl,
            route: {
                id: route.id,
                status: route.status,
                driver: {
                    firstName: user.firstname,
                    lastName: user.lastname,
                    phoneNumber: user.phone,
                },
            },
        });
    });

    it('should return empty object when did not find the associated query', async () => {
        const payload = {
            routableId: 0,
        };
        const mappedRouteDeliveryDetails = await routeDeliveryDetails(payload);

        expect(mappedRouteDeliveryDetails).to.not.be.null;
        expect(mappedRouteDeliveryDetails).to.not.be.undefined;
        expect(mappedRouteDeliveryDetails).to.be.eql({});
    });

    it('should throw error when routableId is undefined', async () => {
        const payload = {
            routableId: undefined,
        };

        await expect(routeDeliveryDetails(payload)).to.be.rejectedWith(Error);
    });

    it('should throw error when there is no payload', async () => {
        await expect(routeDeliveryDetails()).to.be.rejectedWith(Error);
    });
});
