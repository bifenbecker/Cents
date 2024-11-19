require('../../../testHelper');
const ChaiHttpRequestHepler = require('../../../support/chaiHttpRequestHelper');
const { generateToken } = require('../../../support/apiTestHelper');
const factory = require('../../../factories');
const CentsCustomer = require('../../../../models/centsCustomer');
const { expect } = require('../../../support/chaiHelper');
const Timings = require('../../../../models/timings');
const StoreSettings = require('../../../../models/storeSettings');
const CentsCustomerAddress = require('../../../../models/centsCustomerAddress');


async function getToken(params) {
    return generateToken(params);
}

describe('test cents driverApp api', () => {
    describe('test updateETAForRouteDelivery API', () => {
        const createOrderDelivery = async (
            status,
            orderId,
            storeId,
            deliveryProvider = 'OWN_DRIVER',
        ) => {
            const orderDelivery = await factory.create('orderDelivery', {
                status,
                orderId,
                storeId,
                deliveryProvider,
                deliveryWindow: ['1631043000000', '1631057400000'],
            });
            return orderDelivery;
        };

        it('should throw an error if token is not sent', async () => {
            const apiEndPoint = `/api/v1/driver-app/route-deliveries/xxx/go`;
            // act
            const res = await ChaiHttpRequestHepler.post(
                `${apiEndPoint}`,
                {},
            ).set('authtoken', '');
            // assert
            res.should.have.status(401);
        });

        it('should throw validation error if driverLat is not passed', async () => {
            const apiEndPoint = `/api/v1/driver-app/route-deliveries/xxx/go`;
            driver = await factory.create('user');
            teamMember = await factory.create('teamMember', { userId: driver.id });
            const token_params = {
                id: driver.id,
                teamMemberId: teamMember.id,
            };
            const token = await getToken(token_params);
            const payload = { driverLng: '-74.005974'};
            const res = await ChaiHttpRequestHepler.post(`${apiEndPoint}/`, {}, payload).set(
                'authtoken',
                token,
            );
            // assert
            res.should.have.status(422);
            expect(res.body)
                    .to.have.property('error')
                    .equal('Driver latitude is required');
        });

        it('should throw validation error if driverLng is not passed', async () => {
            const routeDeliveryId = 111
            const apiEndPoint = `/api/v1/driver-app/route-deliveries/xxx/go`;
            driver = await factory.create('user');
            teamMember = await factory.create('teamMember', { userId: driver.id });
            const token_params = {
                id: driver.id,
                teamMemberId: teamMember.id,
            };
            const token = await getToken(token_params);
            const payload = { driverLat: '-74.005974'};
            const res = await ChaiHttpRequestHepler.post(`${apiEndPoint}`, {}, payload).set(
                'authtoken',
                token,
            );
            // assert
            res.should.have.status(422);
            expect(res.body)
                    .to.have.property('error')
                    .equal('Driver longitude is required');
        });

        xit('returns updated ETA in response', async () => {
            serviceOrder = await factory.create('serviceOrderWithReturnMethod', {
                        orderType: 'ONLINE',
                        returnMethod: 'DELIVERY',
                    });
            order = await factory.create('serviceOrderMasterOrder', {
                orderableId: serviceOrder.id,
            });
            storeSettings = await StoreSettings.query().findOne({
                storeId: serviceOrder.storeId,
            });
            returnOrderDelivery = await createOrderDelivery(
                        'EN_ROUTE_TO_DROP_OFF',
                        order.id,
                        serviceOrder.storeId,
                    );
            centsCustomerAddress = await CentsCustomerAddress.query().findById(returnOrderDelivery.centsCustomerAddressId);
            await centsCustomerAddress.$query().update({
                lat: '40.748817',
                lng: '-73.985428',
            });
            driver = await factory.create('user');
            teamMember = await factory.create('teamMember', { userId: driver.id });
            timings = await Timings.query().findById(returnOrderDelivery.timingsId);
            route = await factory.create('route', {
                driverId: teamMember.id,
                storeId: serviceOrder.storeId,
                timingId: timings.id,
            });
            routeDelivery = await factory.create('orderDeliveryRouteDelivery', {
                        routeId: route.id,
                        routableId: returnOrderDelivery.id,
                        eta: '1644900487',
                    });
            serviceOrderRouteDelivery = await factory.create('serviceOrderRouteDelivery', {
                        serviceOrderId: serviceOrder.id,
                        routeDeliveryId: routeDelivery.id,
                        status: 'ASSIGNED',
                    });
            const routeDeliveryId = routeDelivery.id;
            const apiEndPoint = `/api/v1/driver-app/route-deliveries/${routeDeliveryId}/go`;
            const token_params = {
                id: driver.id,
                teamMemberId: teamMember.id,
            };
            const token = await getToken(token_params);
            const payload = { driverLat: '40.712776', driverLng: '-74.005974'};
            const res = await ChaiHttpRequestHepler.post(`${apiEndPoint}`, {}, payload).set(
                'authtoken',
                token,
            );
            res.should.have.status(200);
            expect(res.body.routeDelivery)
                    .to.have.property('eta')
                    .not.equal('1644900487');
        });
    })
})
