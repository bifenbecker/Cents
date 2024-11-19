require('../../../testHelper');
const moment = require('moment');
const { expect } = require('../../../support/chaiHelper');
const factory = require('../../../factories');

const { dateFormat, unixDateFormat } = require('../../../../helpers/dateFormatHelper');

const Timings = require('../../../../models/timings');
const StoreSettings = require('../../../../models/storeSettings');

const { setupGetDoordashDriveDeliveriesHttpMock } = require('../../../support/mockedHttpRequests');
const StageTwoTimelineBuilder = require('../../../../services/liveLink/timeline/stageTwoTimelineBuilder');
const BaseOrderStage = require('../../../../services/liveLink/timeline/orderStage/baseOrderStage');
const { date } = require('faker');
const { livelinkImageKeys, orderDeliveryStatuses } = require('../../../../constants/constants');

describe('live-link timeline for stage 2', () => {
    let serviceOrder,
        order,
        storeSettings,
        returnOrderDelivery,
        timeline,
        timings,
        store,
        teamMember;

    const createOrderDelivery = async (
        status,
        orderId,
        storeId,
        deliveryProvider = 'OWN_DRIVER',
        type = 'PICKUP',
        thirdPartyDeliveryId = null,
        deliveryWindow = ['1631043000000', '1631057400000'],
    ) => {
        const orderDelivery = await factory.create('orderDelivery', {
            status,
            type,
            orderId,
            storeId,
            deliveryProvider,
            deliveryWindow,
            thirdPartyDeliveryId,
        });
        return orderDelivery;
    };
    describe('set stage two headerName', () => {
        describe('order pickup is scheduled', () => {
            beforeEach(async () => {
                serviceOrder = await factory.create('serviceOrderWithReturnMethod', {
                    orderType: 'ONLINE',
                });
                order = await factory.create('serviceOrderMasterOrder', {
                    orderableId: serviceOrder.id,
                });
                storeSettings = await StoreSettings.query().findOne({
                    storeId: serviceOrder.storeId,
                });
            });
            it('orderDelivery pickup scheduled', async () => {
                returnOrderDelivery = await createOrderDelivery(
                    'SCHEDULED',
                    order.id,
                    serviceOrder.storeId,
                );
                stageTwoObject = await new StageTwoTimelineBuilder(serviceOrder.id);
                stageTwoObject.addStep();
                await stageTwoObject.setServiceOrderDetails();
                await stageTwoObject.setOrderStage();
                await stageTwoObject.buildHeader();
                expect(stageTwoObject.timeline.header)
                    .to.have.property('name')
                    .to.equal(
                        `${dateFormat(
                            Number(returnOrderDelivery.deliveryWindow[0]),
                            storeSettings.timeZone || 'America/Los_Angeles',
                            'hh:mma',
                        )} - ${dateFormat(
                            Number(returnOrderDelivery.deliveryWindow[1]),
                            storeSettings.timeZone || 'America/Los_Angeles',
                            'hh:mma',
                        )}`,
                    );
            });

            it('orderDelivery enrouteTopickUp', async () => {
                returnOrderDelivery = await createOrderDelivery(
                    'EN_ROUTE_TO_PICKUP',
                    order.id,
                    serviceOrder.storeId,
                );
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
                    status: 'IN_PROGRESS',
                });
                const time = unixDateFormat(
                    routeDelivery.eta,
                    storeSettings.timeZone || 'America/Los_Angeles',
                    'hh:mma',
                );
                stageTwoObject = await new StageTwoTimelineBuilder(serviceOrder.id);
                stageTwoObject.addStep();
                await stageTwoObject.setServiceOrderDetails();
                await stageTwoObject.setOrderStage();
                await stageTwoObject.buildHeader();
                expect(stageTwoObject.timeline.header)
                    .to.have.property('name')
                    .to.equal('Driver is headed your way');
            });

            it('orderDelivery enrouteToDropOff', async () => {
                returnOrderDelivery = await createOrderDelivery(
                    'EN_ROUTE_TO_DROP_OFF',
                    order.id,
                    serviceOrder.storeId,
                );
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
                    status: 'PICKED_UP',
                });
                stageTwoObject = await new StageTwoTimelineBuilder(serviceOrder.id);
                stageTwoObject.addStep();
                await stageTwoObject.setServiceOrderDetails();
                await stageTwoObject.setOrderStage();
                await stageTwoObject.buildHeader();
                expect(stageTwoObject.timeline.header)
                    .to.have.property('name')
                    .to.equal('Picked up');
            });
        });

        describe('cancelled order', () => {
            it('order is cancelled', async () => {
                serviceOrder = await factory.create('serviceOrderWithReturnMethod', {
                    status: 'CANCELLED',
                });
                order = await factory.create('serviceOrderMasterOrder', {
                    orderableId: serviceOrder.id,
                });
                stageTwoObject = await new StageTwoTimelineBuilder(serviceOrder.id);
                stageTwoObject.addStep();
                await stageTwoObject.setServiceOrderDetails();
                await stageTwoObject.setOrderStage();
                await stageTwoObject.buildHeader();
                expect(stageTwoObject.timeline.header)
                    .to.have.property('name')
                    .to.equal('Canceled');
            });
        });
    });

    describe('set stage two headerDescription', () => {
        describe('order pickup is scheduled', async () => {
            beforeEach(async () => {
                serviceOrder = await factory.create('serviceOrderWithReturnMethod', {
                    orderType: 'ONLINE',
                });
                order = await factory.create('serviceOrderMasterOrder', {
                    orderableId: serviceOrder.id,
                });
                storeSettings = await StoreSettings.query().findOne({
                    storeId: serviceOrder.storeId,
                });
            });

            it('orderDelivery pickup scheduled', async () => {
                returnOrderDelivery = await createOrderDelivery(
                    'SCHEDULED',
                    order.id,
                    serviceOrder.storeId,
                );
                stageTwoObject = await new StageTwoTimelineBuilder(serviceOrder.id);
                stageTwoObject.addStep();
                await stageTwoObject.setServiceOrderDetails();
                await stageTwoObject.setOrderStage();
                await stageTwoObject.buildHeader();
                expect(stageTwoObject.timeline.header)
                    .to.have.property('description')
                    .to.equal(
                        `${dateFormat(
                            Number(returnOrderDelivery.deliveryWindow[0]),
                            storeSettings.timeZone || 'America/Los_Angeles',
                            'ddd, MMMM Do',
                        )}`,
                    );
            });
        });

        describe('canceled order', async () => {
            it('order is canceled', async () => {
                serviceOrder = await factory.create('serviceOrderWithReturnMethod', {
                    status: 'CANCELLED',
                });
                order = await factory.create('serviceOrderMasterOrder', {
                    orderableId: serviceOrder.id,
                });
                stageTwoObject = await new StageTwoTimelineBuilder(serviceOrder.id);
                stageTwoObject.addStep();
                await stageTwoObject.setServiceOrderDetails();
                await stageTwoObject.setOrderStage();
                await stageTwoObject.buildHeader();
                expect(stageTwoObject.timeline.header).to.have.property('description').to.equal('');
            });
        });
    });

    describe('set stage two footerName', async () => {
        describe('order pickup is scheduled', async () => {
            beforeEach(async () => {
                serviceOrder = await factory.create('serviceOrderWithReturnMethod', {
                    orderType: 'ONLINE',
                });
                order = await factory.create('serviceOrderMasterOrder', {
                    orderableId: serviceOrder.id,
                });
                storeSettings = await StoreSettings.query().findOne({
                    storeId: serviceOrder.storeId,
                });
            });

            it('orderDelivery pickup scheduled', async () => {
                returnOrderDelivery = await createOrderDelivery(
                    'SCHEDULED',
                    order.id,
                    serviceOrder.storeId,
                    'OWN_DRIVER',
                    'PICKUP',
                    null,
                    [moment().add(2, 'hour').unix(), moment().add(3, 'hour').unix()],
                );
                stageTwoObject = await new StageTwoTimelineBuilder(serviceOrder.id);
                stageTwoObject.addStep();
                await stageTwoObject.setServiceOrderDetails();
                await stageTwoObject.setOrderStage();
                await stageTwoObject.buildFooter();
                expect(stageTwoObject.timeline.footer)
                    .to.have.property('name')
                    .to.equal('Pickup Scheduled');
            });

            it('orderDelivery pickup delayed', async () => {
                returnOrderDelivery = await createOrderDelivery(
                    'SCHEDULED',
                    order.id,
                    serviceOrder.storeId,
                    'OWN_DRIVER',
                    'PICKUP',
                    null,
                    [moment().subtract(1, 'hour').unix(), moment().unix()],
                );
                stageTwoObject = await new StageTwoTimelineBuilder(serviceOrder.id);
                stageTwoObject.addStep();
                await stageTwoObject.setServiceOrderDetails();
                await stageTwoObject.setOrderStage();
                await stageTwoObject.buildFooter();
                expect(stageTwoObject.timeline.footer)
                    .to.have.property('name')
                    .to.equal('Pickup Delayed');
            });

            it('orderDelivery enRouteToPickup', async () => {
                returnOrderDelivery = await createOrderDelivery(
                    'EN_ROUTE_TO_PICKUP',
                    order.id,
                    serviceOrder.storeId,
                );
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
                    status: 'IN_PROGRESS',
                });
                stageTwoObject = await new StageTwoTimelineBuilder(serviceOrder.id);
                stageTwoObject.addStep();
                await stageTwoObject.setServiceOrderDetails();
                await stageTwoObject.setOrderStage();
                await stageTwoObject.buildFooter();
                expect(stageTwoObject.timeline.footer)
                    .to.have.property('name')
                    .to.equal(`${driver.firstname} ${driver.lastname}`);
            });

            it('doordash orderDelivery enRouteToPickup', async () => {
                // arrange
                const thirdPartyDeliveryId = 1458004025;
                returnOrderDelivery = await createOrderDelivery(
                    'EN_ROUTE_TO_PICKUP',
                    order.id,
                    serviceOrder.storeId,
                    'DOORDASH',
                    'PICKUP',
                    thirdPartyDeliveryId,
                );
                setupGetDoordashDriveDeliveriesHttpMock({
                    thirdPartyDeliveryId,
                    responseBody: {
                        estimated_pickup_time: new Date('Tue Aug 30 2022 11:01:00 GMT-0700'),
                        dasher: {
                            first_name: 'Bobby',
                            last_name: 'Tables',
                            phone_number: '1234567890',
                        },
                    },
                });

                stageTwoObject = await new StageTwoTimelineBuilder(serviceOrder.id);
                stageTwoObject.addStep();
                await stageTwoObject.setServiceOrderDetails();
                await stageTwoObject.setOrderStage();

                // act
                await stageTwoObject.buildFooter();

                // assert
                expect(stageTwoObject.timeline.footer)
                    .to.have.property('name')
                    .to.equal('Bobby Tables');
            });

            it('orderDelivery enrouteToDropOff', async () => {
                returnOrderDelivery = await createOrderDelivery(
                    'EN_ROUTE_TO_DROP_OFF',
                    order.id,
                    serviceOrder.storeId,
                );
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
                    status: 'PICKED_UP',
                });
                stageTwoObject = await new StageTwoTimelineBuilder(serviceOrder.id);
                stageTwoObject.addStep();
                await stageTwoObject.setServiceOrderDetails();
                await stageTwoObject.setOrderStage();
                await stageTwoObject.buildFooter();
                expect(stageTwoObject.timeline.footer)
                    .to.have.property('name')
                    .to.equal('Laundry is en route for processing');
            });
        });

        describe('canceled order', async () => {
            it('order is canceled', async () => {
                serviceOrder = await factory.create('serviceOrderWithReturnMethod', {
                    status: 'CANCELLED',
                    orderType: 'ONLINE',
                });
                order = await factory.create('serviceOrderMasterOrder', {
                    orderableId: serviceOrder.id,
                });
                stageTwoObject = await new StageTwoTimelineBuilder(serviceOrder.id);
                stageTwoObject.addStep();
                await stageTwoObject.setServiceOrderDetails();
                await stageTwoObject.setOrderStage();
                await stageTwoObject.buildFooter();
                expect(stageTwoObject.timeline.footer)
                    .to.have.property('name')
                    .to.equal('Would you like to place another order?');
            });
        });
    });

    describe('set stage two footerDescription', async () => {
        describe('order pickup is scheduled', async () => {
            beforeEach(async () => {
                serviceOrder = await factory.create('serviceOrderWithReturnMethod', {
                    orderType: 'ONLINE',
                });
                order = await factory.create('serviceOrderMasterOrder', {
                    orderableId: serviceOrder.id,
                });
                storeSettings = await StoreSettings.query().findOne({
                    storeId: serviceOrder.storeId,
                });
            });

            it('orderDelivery pickup scheduled', async () => {
                returnOrderDelivery = await createOrderDelivery(
                    'SCHEDULED',
                    order.id,
                    serviceOrder.storeId,
                );
                stageTwoObject = await new StageTwoTimelineBuilder(serviceOrder.id);
                stageTwoObject.addStep();
                await stageTwoObject.setServiceOrderDetails();
                await stageTwoObject.setOrderStage();
                await stageTwoObject.buildFooter();
                expect(stageTwoObject.timeline.footer)
                    .to.have.property('description')
                    .to.equal('Latest arrival by 04:00pm - 04:30pm');
            });

            it('doordash orderDelivery enRouteToPickup', async () => {
                // arrange
                const thirdPartyDeliveryId = 1458004025;
                returnOrderDelivery = await createOrderDelivery(
                    'EN_ROUTE_TO_PICKUP',
                    order.id,
                    serviceOrder.storeId,
                    'DOORDASH',
                    'PICKUP',
                    thirdPartyDeliveryId,
                );
                setupGetDoordashDriveDeliveriesHttpMock({
                    thirdPartyDeliveryId,
                    responseBody: {
                        estimated_pickup_time: new Date('Tue Aug 30 2022 11:01:00 GMT-0700'),
                        dasher: {
                            first_name: 'Bobby',
                            last_name: 'Tables',
                            phone_number: '1234567890',
                        },
                    },
                });

                stageTwoObject = await new StageTwoTimelineBuilder(serviceOrder.id);
                stageTwoObject.addStep();
                await stageTwoObject.setServiceOrderDetails();
                await stageTwoObject.setOrderStage();

                // act
                await stageTwoObject.buildFooter();

                // assert
                expect(stageTwoObject.timeline.footer)
                    .to.have.property('description')
                    .to.equal('Estimated Arrival 11:01am');
                expect(stageTwoObject.timeline.footer)
                    .to.have.property('driverPhoneNumber')
                    .to.equal('1234567890');
            });

            it('orderDelivery enRouteToPickup', async () => {
                returnOrderDelivery = await createOrderDelivery(
                    'EN_ROUTE_TO_PICKUP',
                    order.id,
                    serviceOrder.storeId,
                );
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
                    status: 'IN_PROGRESS',
                });
                stageTwoObject = await new StageTwoTimelineBuilder(serviceOrder.id);
                stageTwoObject.addStep();
                await stageTwoObject.setServiceOrderDetails();
                await stageTwoObject.setOrderStage();
                await stageTwoObject.buildFooter();
                expect(stageTwoObject.timeline.footer)
                    .to.have.property('description')
                    .to.equal('Estimated Arrival 11:01am');
            });
        });

        describe('canceled order', async () => {
            it('order is canceled', async () => {
                serviceOrder = await factory.create('serviceOrderWithReturnMethod', {
                    status: 'CANCELLED',
                });
                order = await factory.create('serviceOrderMasterOrder', {
                    orderableId: serviceOrder.id,
                });
                stageTwoObject = await new StageTwoTimelineBuilder(serviceOrder.id);
                stageTwoObject.addStep();
                await stageTwoObject.setServiceOrderDetails();
                await stageTwoObject.setOrderStage();
                await stageTwoObject.buildFooter();
                expect(stageTwoObject.timeline.footer).to.have.property('description').to.equal('');
            });
        });
    });

    describe('set stage two image key', () => {
        describe('order pickup is scheduled', async () => {
            beforeEach(async () => {
                serviceOrder = await factory.create('serviceOrderWithReturnMethod', {
                    orderType: 'ONLINE',
                });
                order = await factory.create('serviceOrderMasterOrder', {
                    orderableId: serviceOrder.id,
                });
            });

            it('order pickup selected(OWN-DELIVERY)', async () => {
                returnOrderDelivery = await createOrderDelivery(
                    orderDeliveryStatuses.SCHEDULED,
                    order.id,
                    serviceOrder.storeId,
                );
                stageTwoObject = await new StageTwoTimelineBuilder(serviceOrder.id);
                stageTwoObject.addStep();
                await stageTwoObject.setServiceOrderDetails();
                await stageTwoObject.setOrderStage();
                await stageTwoObject.setImageKey();
                expect(stageTwoObject.timeline)
                    .to.have.property('imageKey')
                    .to.equal(livelinkImageKeys.STD_PICKUP_SCHEDULED);
            });

            it('order pickup selected(ON-DEMAND)', async () => {
                returnOrderDelivery = await createOrderDelivery(
                    'SCHEDULED',
                    order.id,
                    serviceOrder.storeId,
                    'ON_DEMAND',
                );
                stageTwoObject = await new StageTwoTimelineBuilder(serviceOrder.id);
                stageTwoObject.addStep();
                await stageTwoObject.setServiceOrderDetails();
                await stageTwoObject.setOrderStage();
                await stageTwoObject.setImageKey();
                expect(stageTwoObject.timeline)
                    .to.have.property('imageKey')
                    .to.equal(livelinkImageKeys.ON_DEMAND_PICKUP_SCHEDULED);
            });

            it('order pickup EN_ROUTE_TO_PICKUP with ETA(OWN-DELIVERY)', async () => {
                returnOrderDelivery = await createOrderDelivery(
                    'EN_ROUTE_TO_PICKUP',
                    order.id,
                    serviceOrder.storeId,
                );
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
                    status: 'IN_PROGRESS',
                });
                stageTwoObject = await new StageTwoTimelineBuilder(serviceOrder.id);
                stageTwoObject.addStep();
                await stageTwoObject.setServiceOrderDetails();
                await stageTwoObject.setOrderStage();
                await stageTwoObject.setImageKey();
                expect(stageTwoObject.timeline)
                    .to.have.property('imageKey')
                    .to.equal(livelinkImageKeys.STD_PICKUP_INITIATED);
            });

            it('order pickup EN_ROUTE_TO_PICKUP without ETA(OWN-DELIVERY)', async () => {
                returnOrderDelivery = await createOrderDelivery(
                    'EN_ROUTE_TO_PICKUP',
                    order.id,
                    serviceOrder.storeId,
                );
                stageTwoObject = await new StageTwoTimelineBuilder(serviceOrder.id);
                stageTwoObject.addStep();
                await stageTwoObject.setServiceOrderDetails();
                await stageTwoObject.setOrderStage();
                await stageTwoObject.setImageKey();
                expect(stageTwoObject.timeline)
                    .to.have.property('imageKey')
                    .to.equal(livelinkImageKeys.STD_PICKUP_SCHEDULED);
            });

            it('order pickup EN_ROUTE_TO_PICKUP(ON-DEMAND)', async () => {
                returnOrderDelivery = await createOrderDelivery(
                    'EN_ROUTE_TO_PICKUP',
                    order.id,
                    serviceOrder.storeId,
                    'ON_DEMAND',
                );
                stageTwoObject = new StageTwoTimelineBuilder(serviceOrder.id);
                BaseOrderStage.prototype.setDoorDashDeliveryPickupDetails = () => {};
                stageTwoObject.addStep();
                await stageTwoObject.setServiceOrderDetails();
                await stageTwoObject.setOrderStage();
                await stageTwoObject.setImageKey();
                expect(stageTwoObject.timeline)
                    .to.have.property('imageKey')
                    .to.equal(livelinkImageKeys.ON_DEMAND_PICKUP_INITIATED);
            });

            it('order pickup EN_ROUTE_TO_DROP_OFF(OWN-DELIVERY)', async () => {
                returnOrderDelivery = await createOrderDelivery(
                    'EN_ROUTE_TO_DROP_OFF',
                    order.id,
                    serviceOrder.storeId,
                );
                stageTwoObject = await new StageTwoTimelineBuilder(serviceOrder.id);
                stageTwoObject.addStep();
                await stageTwoObject.setServiceOrderDetails();
                await stageTwoObject.setOrderStage();
                await stageTwoObject.setImageKey();
                expect(stageTwoObject.timeline)
                    .to.have.property('imageKey')
                    .to.equal(livelinkImageKeys.STD_PICKUP_COMPLETED);
            });

            it('order pickup EN_ROUTE_TO_DROP_OFF(ON-DEMAND)', async () => {
                returnOrderDelivery = await createOrderDelivery(
                    'EN_ROUTE_TO_DROP_OFF',
                    order.id,
                    serviceOrder.storeId,
                    'ON_DEMAND',
                );
                stageTwoObject = await new StageTwoTimelineBuilder(serviceOrder.id);
                stageTwoObject.addStep();
                await stageTwoObject.setServiceOrderDetails();
                await stageTwoObject.setOrderStage();
                await stageTwoObject.setImageKey();
                expect(stageTwoObject.timeline)
                    .to.have.property('imageKey')
                    .to.equal(livelinkImageKeys.ON_DEMAND_PICKUP_COMPLETED);
            });
        });

        describe('cancelled order', async () => {
            it('order is canceled', async () => {
                serviceOrder = await factory.create('serviceOrderWithReturnMethod', {
                    status: 'CANCELLED',
                });
                stageTwoObject = await new StageTwoTimelineBuilder(serviceOrder.id);
                stageTwoObject.addStep();
                await stageTwoObject.setServiceOrderDetails();
                await stageTwoObject.setOrderStage();
                await stageTwoObject.setImageKey();
                expect(stageTwoObject.timeline)
                    .to.have.property('imageKey')
                    .to.equal(livelinkImageKeys.ORDER_CANCELED);
            });
        });
    });
});
