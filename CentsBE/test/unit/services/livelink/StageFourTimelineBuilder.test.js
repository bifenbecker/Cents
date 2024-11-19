require('../../../testHelper');
const { expect } = require('../../../support/chaiHelper');
const factory = require('../../../factories');

const { dateFormat, unixDateFormat } = require('../../../../helpers/dateFormatHelper');

const Timings = require('../../../../models/timings');
const StoreSettings = require('../../../../models/storeSettings');

const { setupGetDoordashDriveDeliveriesHttpMock } = require('../../../support/mockedHttpRequests');
const BaseOrderStage = require('../../../../services/liveLink/timeline/orderStage/baseOrderStage');
const StageFourTimelineBuilder = require('../../../../services/liveLink/timeline/stageFourTimelineBuilder');
const { livelinkImageKeys } = require('../../../../constants/constants');
const Timing = require('../../../../models/timings');

describe('live-link timeline for stage 4', () => {
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
        thirdPartyDeliveryId = null,
    ) => {
        const orderDelivery = await factory.create('orderDelivery', {
            status,
            orderId,
            storeId,
            deliveryProvider,
            deliveryWindow: ['1631043000000', '1631057400000'],
            thirdPartyDeliveryId,
        });
        return orderDelivery;
    };
    describe('set stage four headerName', () => {
        describe('deliver to me selected', async () => {
            describe('ONLINE order', async () => {
                beforeEach(async () => {
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
                });
                it('Delivery scheduled', async () => {
                    returnOrderDelivery = await createOrderDelivery(
                        'SCHEDULED',
                        order.id,
                        serviceOrder.storeId,
                    );
                    stageFourObject = await new StageFourTimelineBuilder(serviceOrder.id);
                    stageFourObject.addStep();
                    await stageFourObject.setServiceOrderDetails();
                    await stageFourObject.setOrderStage();
                    await stageFourObject.buildHeader();
                    expect(stageFourObject.timeline.header)
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

                it('Delivery intentCreated', async () => {
                    returnOrderDelivery = await createOrderDelivery(
                        'INTENT_CREATED',
                        order.id,
                        serviceOrder.storeId,
                    );
                    stageFourObject = await new StageFourTimelineBuilder(serviceOrder.id);
                    stageFourObject.addStep();
                    await stageFourObject.setServiceOrderDetails();
                    await stageFourObject.setOrderStage();
                    await stageFourObject.buildHeader();
                    expect(stageFourObject.timeline.header)
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

                it('driver enrouteToDropOff', async () => {
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
                    });
                    const time = unixDateFormat(
                        routeDelivery.eta,
                        storeSettings.timeZone || 'America/Los_Angeles',
                        'hh:mma',
                    );
                    stageFourObject = await new StageFourTimelineBuilder(serviceOrder.id);
                    stageFourObject.addStep();
                    await stageFourObject.setServiceOrderDetails();
                    await stageFourObject.setOrderStage();
                    await stageFourObject.buildHeader();
                    expect(stageFourObject.timeline.header)
                        .to.have.property('name')
                        .to.equal('Driver is headed your way');
                });
            });
            describe('WALK-IN order', async () => {
                beforeEach(async () => {
                    serviceOrder = await factory.create('serviceOrderWithReturnMethod', {
                        orderType: 'SERVICE',
                        returnMethod: 'DELIVERY',
                    });
                    order = await factory.create('serviceOrderMasterOrder', {
                        orderableId: serviceOrder.id,
                    });
                    storeSettings = await StoreSettings.query().findOne({
                        storeId: serviceOrder.storeId,
                    });
                });
                it('delivery scheduled', async () => {
                    returnOrderDelivery = await createOrderDelivery(
                        'SCHEDULED',
                        order.id,
                        serviceOrder.storeId,
                    );
                    stageFourObject = await new StageFourTimelineBuilder(serviceOrder.id);
                    stageFourObject.addStep();
                    await stageFourObject.setServiceOrderDetails();
                    await stageFourObject.setOrderStage();
                    await stageFourObject.buildHeader();
                    expect(stageFourObject.timeline.header)
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

                it('driver enrouteToDropOff', async () => {
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
                    });
                    const time = unixDateFormat(
                        routeDelivery.eta,
                        storeSettings.timeZone || 'America/Los_Angeles',
                        'hh:mma',
                    );
                    stageFourObject = await new StageFourTimelineBuilder(serviceOrder.id);
                    stageFourObject.addStep();
                    await stageFourObject.setServiceOrderDetails();
                    await stageFourObject.setOrderStage();
                    await stageFourObject.buildHeader();
                    expect(stageFourObject.timeline.header)
                        .to.have.property('name')
                        .to.equal('Driver is headed your way');
                });
            });
            // describe('RESIDENTIAL order', async () => {
            //     beforeEach(async () => {
            //         serviceOrder = await factory.create('serviceOrderWithReturnMethod', {
            //             orderType: 'RESIDENTIAL',
            //             returnMethod: 'DELIVERY',
            //         });
            //         order = await factory.create('serviceOrderMasterOrder', {
            //             orderableId: serviceOrder.id,
            //         });
            //         storeSettings = await StoreSettings.query().findOne({
            //             storeId: serviceOrder.storeId,
            //         });
            //     });
            //     it('routeDelivery scheduled', async () => {
            //         driver = await factory.create('user');
            //         teamMember = await factory.create('teamMember', { userId: driver.id });
            //         route = await factory.create('route', {
            //             driverId: teamMember.id,
            //             storeId: serviceOrder.storeId,
            //         });
            //         returnRouteDelivery = await factory.create('storeRouteDelivery', {
            //             routeId: route.id,
            //             status: 'PICKED_UP',
            //             routableId: serviceOrder.hubId,
            //         });
            //         serviceOrderRouteDelivery = await factory.create('serviceOrderRouteDelivery', {
            //             serviceOrderId: serviceOrder.id,
            //             routeDeliveryId: returnRouteDelivery.id,
            //             status: 'ASSIGNED',
            //         });
            //         stageFourObject = await new StageFourTimelineBuilder(serviceOrder.id);
            //         stageFourObject.addStep();
            //         await stageFourObject.setServiceOrderDetails();
            //         await stageFourObject.setOrderStage();
            //         await stageFourObject.buildHeader();
            //         expect(stageFourObject.timeline.header)
            //             .to.have.property('name')
            //             .to.equal(
            //                 `${unixDateFormat(
            //                     returnRouteDelivery.eta,
            //                     storeSettings.timeZone || 'America/Los_Angeles',
            //                     'hh:mma',
            //                 )}`,
            //             );
            //     });

            //     it('driver enrouteToDropOff', async () => {
            //         driver = await factory.create('user');
            //         teamMember = await factory.create('teamMember', { userId: driver.id });
            //         route = await factory.create('route', {
            //             driverId: teamMember.id,
            //             storeId: serviceOrder.storeId,
            //         });
            //         returnRouteDelivery = await factory.create('storeRouteDelivery', {
            //             routeId: route.id,
            //             status: 'PICKED_UP',
            //             routableId: serviceOrder.hubId,
            //         });
            //         serviceOrderRouteDelivery = await factory.create('serviceOrderRouteDelivery', {
            //             serviceOrderId: serviceOrder.id,
            //             routeDeliveryId: returnRouteDelivery.id,
            //             status: 'PICKED_UP',
            //         });
            //         const time = unixDateFormat(
            //             returnRouteDelivery.eta,
            //             storeSettings.timeZone || 'America/Los_Angeles',
            //             'hh:mma',
            //         );
            //         stageFourObject = await new StageFourTimelineBuilder(serviceOrder.id);
            //         stageFourObject.addStep();
            //         await stageFourObject.setServiceOrderDetails();
            //         await stageFourObject.setOrderStage();
            //         await stageFourObject.buildHeader();
            //         expect(stageFourObject.timeline.header)
            //             .to.have.property('name')
            //             .to.equal(`${time}`);
            //     });
            // });
        });

        describe('customer will pickup by himself', () => {
            it('return method in store pickup', async () => {
                serviceOrder = await factory.create('serviceOrderWithReturnMethod', {
                    returnMethod: 'IN_STORE_PICKUP',
                });
                order = await factory.create('serviceOrderMasterOrder', {
                    orderableId: serviceOrder.id,
                });
                stageFourObject = await new StageFourTimelineBuilder(serviceOrder.id);
                stageFourObject.addStep();
                await stageFourObject.setServiceOrderDetails();
                await stageFourObject.setOrderStage();
                await stageFourObject.buildHeader();
                expect(stageFourObject.timeline.header)
                    .to.have.property('name')
                    .to.equal('Ready for pickup in-store');
            });
        });
    });

    describe('set stage four headerDescription', () => {
        describe('deliver to me selected', async () => {
            describe('ONLINE order', async () => {
                beforeEach(async () => {
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
                });
                it('Delivery scheduled', async () => {
                    returnOrderDelivery = await createOrderDelivery(
                        'SCHEDULED',
                        order.id,
                        serviceOrder.storeId,
                    );
                    stageFourObject = await new StageFourTimelineBuilder(serviceOrder.id);
                    stageFourObject.addStep();
                    await stageFourObject.setServiceOrderDetails();
                    await stageFourObject.setOrderStage();
                    await stageFourObject.buildHeader();
                    expect(stageFourObject.timeline.header)
                        .to.have.property('description')
                        .to.equal(
                            `${dateFormat(
                                Number(returnOrderDelivery.deliveryWindow[0]),
                                storeSettings.timeZone || 'America/Los_Angeles',
                                'ddd, MMMM Do',
                            )}`,
                        );
                });

                it('Delivery intentCreated', async () => {
                    returnOrderDelivery = await createOrderDelivery(
                        'INTENT_CREATED',
                        order.id,
                        serviceOrder.storeId,
                    );
                    stageFourObject = await new StageFourTimelineBuilder(serviceOrder.id);
                    stageFourObject.addStep();
                    await stageFourObject.setServiceOrderDetails();
                    await stageFourObject.setOrderStage();
                    await stageFourObject.buildHeader();
                    expect(stageFourObject.timeline.header)
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
            describe('WALK-IN order', async () => {
                beforeEach(async () => {
                    serviceOrder = await factory.create('serviceOrderWithReturnMethod', {
                        orderType: 'SERVICE',
                        returnMethod: 'DELIVERY',
                    });
                    order = await factory.create('serviceOrderMasterOrder', {
                        orderableId: serviceOrder.id,
                    });
                    storeSettings = await StoreSettings.query().findOne({
                        storeId: serviceOrder.storeId,
                    });
                });
                it('delivery scheduled', async () => {
                    returnOrderDelivery = await createOrderDelivery(
                        'SCHEDULED',
                        order.id,
                        serviceOrder.storeId,
                    );
                    stageFourObject = await new StageFourTimelineBuilder(serviceOrder.id);
                    stageFourObject.addStep();
                    await stageFourObject.setServiceOrderDetails();
                    await stageFourObject.setOrderStage();
                    await stageFourObject.buildHeader();
                    expect(stageFourObject.timeline.header)
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
            // describe('RESIDENTIAL order', async () => {
            //     beforeEach(async () => {
            //         serviceOrder = await factory.create('serviceOrderWithReturnMethod', {
            //             orderType: 'RESIDENTIAL',
            //             returnMethod: 'DELIVERY',
            //         });
            //         order = await factory.create('serviceOrderMasterOrder', {
            //             orderableId: serviceOrder.id,
            //         });
            //         storeSettings = await StoreSettings.query().findOne({
            //             storeId: serviceOrder.storeId,
            //         });
            //     });
            //     it('routeDelivery scheduled', async () => {
            //         driver = await factory.create('user');
            //         teamMember = await factory.create('teamMember', { userId: driver.id });
            //         route = await factory.create('route', {
            //             driverId: teamMember.id,
            //             storeId: serviceOrder.storeId,
            //         });
            //         returnRouteDelivery = await factory.create('storeRouteDelivery', {
            //             routeId: route.id,
            //             status: 'ASSIGNED',
            //             routableId: serviceOrder.hubId,
            //         });
            //         serviceOrderRouteDelivery = await factory.create('serviceOrderRouteDelivery', {
            //             serviceOrderId: serviceOrder.id,
            //             routeDeliveryId: returnRouteDelivery.id,
            //             status: 'ASSIGNED',
            //         });
            //         stageFourObject = await new StageFourTimelineBuilder(serviceOrder.id);
            //         stageFourObject.addStep();
            //         await stageFourObject.setServiceOrderDetails();
            //         await stageFourObject.setOrderStage();
            //         await stageFourObject.buildHeader();
            //         expect(stageFourObject.timeline.header)
            //             .to.have.property('description')
            //             .to.equal(
            //                 `${unixDateFormat(
            //                     returnRouteDelivery.eta,
            //                     storeSettings.timeZone || 'America/Los_Angeles',
            //                     'ddd, MMMM Do',
            //                 )}`,
            //             );
            //     });

            //     it('driver enrouteToDropOff', async () => {
            //         driver = await factory.create('user');
            //         teamMember = await factory.create('teamMember', { userId: driver.id });
            //         route = await factory.create('route', {
            //             driverId: teamMember.id,
            //             storeId: serviceOrder.storeId,
            //         });
            //         returnRouteDelivery = await factory.create('storeRouteDelivery', {
            //             routeId: route.id,
            //             status: 'PICKED_UP',
            //             routableId: serviceOrder.hubId,
            //         });
            //         serviceOrderRouteDelivery = await factory.create('serviceOrderRouteDelivery', {
            //             serviceOrderId: serviceOrder.id,
            //             routeDeliveryId: returnRouteDelivery.id,
            //             status: 'PICKED_UP',
            //         });
            //         const time = unixDateFormat(
            //             returnRouteDelivery.eta,
            //             storeSettings.timeZone || 'America/Los_Angeles',
            //             'ddd, MMMM Do',
            //         );
            //         stageFourObject = await new StageFourTimelineBuilder(serviceOrder.id);
            //         stageFourObject.addStep();
            //         await stageFourObject.setServiceOrderDetails();
            //         await stageFourObject.setOrderStage();
            //         await stageFourObject.buildHeader();
            //         expect(stageFourObject.timeline.header)
            //             .to.have.property('description')
            //             .to.equal(`${time}`);
            //     });
            // });
        });

        describe('returnMethod inStorePickUp', async () => {
            it('order pickup by customer', async () => {
                serviceOrder = await factory.create('serviceOrderWithReturnMethod', {
                    returnMethod: 'IN_STORE_PICKUP',
                });
                order = await factory.create('serviceOrderMasterOrder', {
                    orderableId: serviceOrder.id,
                });
                stageFourObject = await new StageFourTimelineBuilder(serviceOrder.id);
                stageFourObject.addStep();
                await stageFourObject.setServiceOrderDetails();
                await stageFourObject.setOrderStage();
                await stageFourObject.buildHeader();
                expect(stageFourObject.timeline.header)
                    .to.have.property('description')
                    .to.equal('');
            });
        });
    });

    describe('set stage four footerName', async () => {
        describe('deliver to me selected', async () => {
            describe('ONLINE order', async () => {
                beforeEach(async () => {
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
                });
                it('Delivery scheduled', async () => {
                    returnOrderDelivery = await createOrderDelivery(
                        'SCHEDULED',
                        order.id,
                        serviceOrder.storeId,
                    );
                    stageFourObject = await new StageFourTimelineBuilder(serviceOrder.id);
                    stageFourObject.addStep();
                    await stageFourObject.setServiceOrderDetails();
                    await stageFourObject.setOrderStage();
                    await stageFourObject.buildFooter();
                    expect(stageFourObject.timeline.footer)
                        .to.have.property('name')
                        .to.equal('Delivery Scheduled');
                });

                it('Delivery intentCreated', async () => {
                    returnOrderDelivery = await createOrderDelivery(
                        'INTENT_CREATED',
                        order.id,
                        serviceOrder.storeId,
                    );
                    stageFourObject = await new StageFourTimelineBuilder(serviceOrder.id);
                    stageFourObject.addStep();
                    await stageFourObject.setServiceOrderDetails();
                    await stageFourObject.setOrderStage();
                    await stageFourObject.buildFooter();
                    expect(stageFourObject.timeline.footer)
                        .to.have.property('name')
                        .to.equal('Delivery Scheduled');
                });

                it('driver enrouteToDropOff', async () => {
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
                    });
                    stageFourObject = await new StageFourTimelineBuilder(serviceOrder.id);
                    stageFourObject.addStep();
                    await stageFourObject.setServiceOrderDetails();
                    await stageFourObject.setOrderStage();
                    await stageFourObject.buildFooter();
                    expect(stageFourObject.timeline.footer)
                        .to.have.property('name')
                        .to.equal(`${driver.firstname} ${driver.lastname}`);
                });

                it('driver doordash enrouteToDropOff', async () => {
                    // arrange
                    const thirdPartyDeliveryId = 1458004025;
                    returnOrderDelivery = await createOrderDelivery(
                        'EN_ROUTE_TO_DROP_OFF',
                        order.id,
                        serviceOrder.storeId,
                        'DOORDASH',
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

                    stageFourObject = await new StageFourTimelineBuilder(serviceOrder.id);
                    stageFourObject.addStep();
                    await stageFourObject.setServiceOrderDetails();
                    await stageFourObject.setOrderStage();

                    // act
                    await stageFourObject.buildFooter();

                    // assert
                    expect(stageFourObject.timeline.footer)
                        .to.have.property('name')
                        .to.equal('Bobby Tables');
                });
            });

            describe('WALK-IN order', async () => {
                beforeEach(async () => {
                    serviceOrder = await factory.create('serviceOrderWithReturnMethod', {
                        orderType: 'SERVICE',
                        returnMethod: 'DELIVERY',
                    });
                    order = await factory.create('serviceOrderMasterOrder', {
                        orderableId: serviceOrder.id,
                    });
                    storeSettings = await StoreSettings.query().findOne({
                        storeId: serviceOrder.storeId,
                    });
                });
                it('delivery scheduled', async () => {
                    returnOrderDelivery = await createOrderDelivery(
                        'SCHEDULED',
                        order.id,
                        serviceOrder.storeId,
                    );
                    stageFourObject = await new StageFourTimelineBuilder(serviceOrder.id);
                    stageFourObject.addStep();
                    await stageFourObject.setServiceOrderDetails();
                    await stageFourObject.setOrderStage();
                    await stageFourObject.buildFooter();
                    expect(stageFourObject.timeline.footer)
                        .to.have.property('name')
                        .to.equal('Delivery Scheduled');
                });

                it('driver enrouteToDropOff', async () => {
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
                    });
                    stageFourObject = await new StageFourTimelineBuilder(serviceOrder.id);
                    stageFourObject.addStep();
                    await stageFourObject.setServiceOrderDetails();
                    await stageFourObject.setOrderStage();
                    await stageFourObject.buildFooter();
                    expect(stageFourObject.timeline.footer)
                        .to.have.property('name')
                        .to.equal(`${driver.firstname} ${driver.lastname}`);
                });
            });
            // describe('RESIDENTIAL order', async () => {
            //     beforeEach(async () => {
            //         serviceOrder = await factory.create('serviceOrderWithReturnMethod', {
            //             orderType: 'RESIDENTIAL',
            //             returnMethod: 'DELIVERY',
            //         });
            //         order = await factory.create('serviceOrderMasterOrder', {
            //             orderableId: serviceOrder.id,
            //         });
            //         storeSettings = await StoreSettings.query().findOne({
            //             storeId: serviceOrder.storeId,
            //         });
            //     });

            //     it('driver enrouteToDropOff', async () => {
            //         driver = await factory.create('user');
            //         teamMember = await factory.create('teamMember', { userId: driver.id });
            //         route = await factory.create('route', {
            //             driverId: teamMember.id,
            //             storeId: serviceOrder.storeId,
            //         });
            //         returnRouteDelivery = await factory.create('storeRouteDelivery', {
            //             routeId: route.id,
            //             status: 'PICKED_UP',
            //             routableId: serviceOrder.hubId,
            //         });
            //         serviceOrderRouteDelivery = await factory.create('serviceOrderRouteDelivery', {
            //             serviceOrderId: serviceOrder.id,
            //             routeDeliveryId: returnRouteDelivery.id,
            //             status: 'PICKED_UP',
            //         });
            //         stageFourObject = await new StageFourTimelineBuilder(serviceOrder.id);
            //         stageFourObject.addStep();
            //         await stageFourObject.setServiceOrderDetails();
            //         await stageFourObject.setOrderStage();
            //         await stageFourObject.buildFooter();
            //         // expect(stageFourObject.timeline.footer)
            //         //     .to.have.property('name')
            //         //     .to.equal(`${driver.firstname} ${driver.lastname} is heading your way`);
            //         expect(stageFourObject.timeline.footer)
            //             .to.have.property('name')
            //             .to.equal("We'll notify you when it's on it's way back to you");
            //     });
            // });
        });

        describe('return method in store pickup', async () => {
            it('order pickup by customer', async () => {
                serviceOrder = await factory.create('serviceOrderWithReturnMethod', {
                    returnMethod: 'IN_STORE_PICKUP',
                });
                order = await factory.create('serviceOrderMasterOrder', {
                    orderableId: serviceOrder.id,
                });
                stageFourObject = await new StageFourTimelineBuilder(serviceOrder.id);
                stageFourObject.addStep();
                await stageFourObject.setServiceOrderDetails();
                await stageFourObject.setOrderStage();
                await stageFourObject.buildFooter();
                expect(stageFourObject.timeline.footer)
                    .to.have.property('name')
                    .to.equal('You can now pickup your order');
            });
        });
    });

    describe('set stage four footerDescription', async () => {
        describe('deliver to me selected', async () => {
            describe('ONLINE order', async () => {
                beforeEach(async () => {
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
                });
                it('Delivery scheduled', async () => {
                    returnOrderDelivery = await createOrderDelivery(
                        'SCHEDULED',
                        order.id,
                        serviceOrder.storeId,
                    );
                    stageFourObject = await new StageFourTimelineBuilder(serviceOrder.id);
                    stageFourObject.addStep();
                    await stageFourObject.setServiceOrderDetails();
                    await stageFourObject.setOrderStage();
                    await stageFourObject.buildFooter();
                    expect(stageFourObject.timeline.footer)
                        .to.have.property('description')
                        .to.equal('Latest arrival by 04:00pm - 04:30pm');
                });

                it('Delivery intentCreated', async () => {
                    returnOrderDelivery = await createOrderDelivery(
                        'INTENT_CREATED',
                        order.id,
                        serviceOrder.storeId,
                    );
                    stageFourObject = await new StageFourTimelineBuilder(serviceOrder.id);
                    stageFourObject.addStep();
                    await stageFourObject.setServiceOrderDetails();
                    await stageFourObject.setOrderStage();
                    await stageFourObject.buildFooter();
                    expect(stageFourObject.timeline.footer)
                        .to.have.property('description')
                        .to.equal('Latest arrival by 04:00pm - 04:30pm');
                });

                it('driver enrouteToDropOff', async () => {
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
                    });
                    stageFourObject = await new StageFourTimelineBuilder(serviceOrder.id);
                    stageFourObject.addStep();
                    await stageFourObject.setServiceOrderDetails();
                    await stageFourObject.setOrderStage();
                    await stageFourObject.buildFooter();
                    expect(stageFourObject.timeline.footer)
                        .to.have.property('description')
                        .to.equal('Estimated Arrival 11:01am');
                });

                it('driver doordash enrouteToDropOff', async () => {
                    // arrange
                    const thirdPartyDeliveryId = 1458004025;
                    returnOrderDelivery = await createOrderDelivery(
                        'EN_ROUTE_TO_DROP_OFF',
                        order.id,
                        serviceOrder.storeId,
                        'DOORDASH',
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

                    stageFourObject = await new StageFourTimelineBuilder(serviceOrder.id);
                    stageFourObject.addStep();
                    await stageFourObject.setServiceOrderDetails();
                    await stageFourObject.setOrderStage();

                    // act
                    await stageFourObject.buildFooter();

                    // assert
                    expect(stageFourObject.timeline.footer)
                        .to.have.property('description')
                        .to.equal('Estimated Arrival 11:01am');
                });
            });
            describe('WALK-IN order', async () => {
                beforeEach(async () => {
                    serviceOrder = await factory.create('serviceOrderWithReturnMethod', {
                        orderType: 'SERVICE',
                        returnMethod: 'DELIVERY',
                    });
                    order = await factory.create('serviceOrderMasterOrder', {
                        orderableId: serviceOrder.id,
                    });
                    storeSettings = await StoreSettings.query().findOne({
                        storeId: serviceOrder.storeId,
                    });
                });
                it('delivery scheduled', async () => {
                    returnOrderDelivery = await createOrderDelivery(
                        'SCHEDULED',
                        order.id,
                        serviceOrder.storeId,
                    );
                    stageFourObject = await new StageFourTimelineBuilder(serviceOrder.id);
                    stageFourObject.addStep();
                    await stageFourObject.setServiceOrderDetails();
                    await stageFourObject.setOrderStage();
                    await stageFourObject.buildFooter();
                    expect(stageFourObject.timeline.footer)
                        .to.have.property('description')
                        .to.equal('Latest arrival by 04:00pm - 04:30pm');
                });

                it('driver enrouteToDropOff', async () => {
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
                    });
                    stageFourObject = await new StageFourTimelineBuilder(serviceOrder.id);
                    stageFourObject.addStep();
                    await stageFourObject.setServiceOrderDetails();
                    await stageFourObject.setOrderStage();
                    await stageFourObject.buildFooter();
                    expect(stageFourObject.timeline.footer)
                        .to.have.property('description')
                        .to.equal('Estimated Arrival 11:01am');
                });
            });
            // describe('RESIDENTIAL order', async () => {
            //     beforeEach(async () => {
            //         serviceOrder = await factory.create('serviceOrderWithReturnMethod', {
            //             orderType: 'RESIDENTIAL',
            //             returnMethod: 'DELIVERY',
            //         });
            //         order = await factory.create('serviceOrderMasterOrder', {
            //             orderableId: serviceOrder.id,
            //         });
            //         storeSettings = await StoreSettings.query().findOne({
            //             storeId: serviceOrder.storeId,
            //         });
            //     });
            //     it('routeDelivery scheduled', async () => {
            //         driver = await factory.create('user');
            //         teamMember = await factory.create('teamMember', { userId: driver.id });
            //         route = await factory.create('route', {
            //             driverId: teamMember.id,
            //             storeId: serviceOrder.storeId,
            //         });
            //         timing = await Timing.query().findById(route.timingId);
            //         returnRouteDelivery = await factory.create('storeRouteDelivery', {
            //             routeId: route.id,
            //             status: 'ASSIGNED',
            //             routableId: serviceOrder.hubId,
            //         });
            //         serviceOrderRouteDelivery = await factory.create('serviceOrderRouteDelivery', {
            //             serviceOrderId: serviceOrder.id,
            //             routeDeliveryId: returnRouteDelivery.id,
            //             status: 'ASSIGNED',
            //         });
            //         stageFourObject = await new StageFourTimelineBuilder(serviceOrder.id);
            //         stageFourObject.addStep();
            //         await stageFourObject.setServiceOrderDetails();
            //         await stageFourObject.setOrderStage();
            //         await stageFourObject.buildFooter();
            //         expect(stageFourObject.timeline.footer)
            //             .to.have.property('description')
            //             .to.equal('Latest arrival by 12:49pm - 01:19pm');
            //     });

            //     it('driver enrouteToDropOff', async () => {
            //         driver = await factory.create('user');
            //         teamMember = await factory.create('teamMember', { userId: driver.id });
            //         route = await factory.create('route', {
            //             driverId: teamMember.id,
            //             storeId: serviceOrder.storeId,
            //         });
            //         timing = await Timing.query().findById(route.timingId);
            //         returnRouteDelivery = await factory.create('storeRouteDelivery', {
            //             routeId: route.id,
            //             status: 'PICKED_UP',
            //             routableId: serviceOrder.hubId,
            //         });
            //         serviceOrderRouteDelivery = await factory.create('serviceOrderRouteDelivery', {
            //             serviceOrderId: serviceOrder.id,
            //             routeDeliveryId: returnRouteDelivery.id,
            //             status: 'PICKED_UP',
            //         });
            //         stageFourObject = await new StageFourTimelineBuilder(serviceOrder.id);
            //         stageFourObject.addStep();
            //         await stageFourObject.setServiceOrderDetails();
            //         await stageFourObject.setOrderStage();
            //         await stageFourObject.buildFooter();
            //         expect(stageFourObject.timeline.footer)
            //             .to.have.property('description')
            //             .to.equal('Latest arrival by 12:49pm - 01:19pm');
            //     });
            // });
        });

        describe('customer will pickup in store', async () => {
            it('order pickup by customer', async () => {
                store = await factory.create('store');
                serviceOrder = await factory.create('serviceOrderWithReturnMethod', {
                    returnMethod: 'IN_STORE_PICKUP',
                    storeId: store.id,
                });
                order = await factory.create('serviceOrderMasterOrder', {
                    orderableId: serviceOrder.id,
                });
                stageFourObject = await new StageFourTimelineBuilder(serviceOrder.id);
                stageFourObject.addStep();
                await stageFourObject.setServiceOrderDetails();
                await stageFourObject.setOrderStage();
                await stageFourObject.buildFooter();
                expect(stageFourObject.timeline.footer)
                    .to.have.property('description')
                    .to.equal(`${store.address}, ${store.city}, ${store.state}`);
            });
        });
    });
    describe('set stage four image key', () => {
        describe('deliver to me selected', async () => {
            beforeEach(async () => {
                serviceOrder = await factory.create('serviceOrderWithReturnMethod', {
                    returnMethod: 'DELIVERY',
                });
                order = await factory.create('serviceOrderMasterOrder', {
                    orderableId: serviceOrder.id,
                });
            });
            it('deliver to me selected(OWN-DELIVERY)', async () => {
                returnOrderDelivery = await createOrderDelivery(
                    'EN_ROUTE_TO_DROP_OFF',
                    order.id,
                    serviceOrder.storeId,
                );
                stageFourObject = await new StageFourTimelineBuilder(serviceOrder.id);
                stageFourObject.addStep();
                await stageFourObject.setServiceOrderDetails();
                await stageFourObject.setOrderStage();
                await stageFourObject.setImageKey();
                expect(stageFourObject.timeline)
                    .to.have.property('imageKey')
                    .to.equal(livelinkImageKeys.STD_DELIVERY_IN_PROGRESS);
            });

            it('deliver to me selected(ON-DEMAND)', async () => {
                returnOrderDelivery = await createOrderDelivery(
                    'EN_ROUTE_TO_DROP_OFF',
                    order.id,
                    serviceOrder.storeId,
                    'ON_DEMAND',
                );
                BaseOrderStage.prototype.setDoorDashDeliveryReturnDetails = () => {};
                stageFourObject = await new StageFourTimelineBuilder(serviceOrder.id);
                stageFourObject.addStep();
                await stageFourObject.setServiceOrderDetails();
                await stageFourObject.setOrderStage();
                await stageFourObject.setImageKey();
                expect(stageFourObject.timeline)
                    .to.have.property('imageKey')
                    .to.equal(livelinkImageKeys.ON_DEMAND_DELIVERY_IN_PROGRESS);
            });
        });

        describe('in store pick up selected', async () => {
            it('pick-up in store to me selected', async () => {
                serviceOrder = await factory.create('serviceOrderWithReturnMethod', {
                    returnMethod: 'IN_STORE_PICKUP',
                });
                stageFourObject = await new StageFourTimelineBuilder(serviceOrder.id);
                stageFourObject.addStep();
                await stageFourObject.setServiceOrderDetails();
                await stageFourObject.setOrderStage();
                await stageFourObject.setImageKey();
                expect(stageFourObject.timeline)
                    .to.have.property('imageKey')
                    .to.equal(livelinkImageKeys.READY_FOR_CUSTOMER_PICKUP);
            });
        });
    });
    describe('set stage four delivery provider key', () => {
        describe('deliver to me selected', async () => {
            beforeEach(async () => {
                serviceOrder = await factory.create('serviceOrderWithReturnMethod', {
                    returnMethod: 'DELIVERY',
                });
                order = await factory.create('serviceOrderMasterOrder', {
                    orderableId: serviceOrder.id,
                });
            });
            it('deliver to me selected(OWN-DELIVERY)', async () => {
                returnOrderDelivery = await createOrderDelivery(
                    'EN_ROUTE_TO_DROP_OFF',
                    order.id,
                    serviceOrder.storeId,
                );
                stageFourObject = await new StageFourTimelineBuilder(serviceOrder.id);
                stageFourObject.addStep();
                await stageFourObject.setServiceOrderDetails();
                await stageFourObject.setOrderStage();
                await stageFourObject.setDeliveryProvider();
                expect(stageFourObject.timeline)
                    .to.have.property('deliveryProvider')
                    .to.equal('OWN_DRIVER');
            });

            it('deliver to me selected(ON-DEMAND)', async () => {
                returnOrderDelivery = await createOrderDelivery(
                    'EN_ROUTE_TO_DROP_OFF',
                    order.id,
                    serviceOrder.storeId,
                    'ON_DEMAND',
                );
                BaseOrderStage.prototype.setDoorDashDeliveryReturnDetails = () => {};
                stageFourObject = await new StageFourTimelineBuilder(serviceOrder.id);
                stageFourObject.addStep();
                await stageFourObject.setServiceOrderDetails();
                await stageFourObject.setOrderStage();
                await stageFourObject.setDeliveryProvider();
                expect(stageFourObject.timeline)
                    .to.have.property('deliveryProvider')
                    .to.equal('ON_DEMAND');
            });
        });

        describe('in store pick up selected', async () => {
            it('pick-up in store to me selected', async () => {
                serviceOrder = await factory.create('serviceOrderWithReturnMethod', {
                    returnMethod: 'IN_STORE_PICKUP',
                });
                stageFourObject = await new StageFourTimelineBuilder(serviceOrder.id);
                stageFourObject.addStep();
                await stageFourObject.setServiceOrderDetails();
                await stageFourObject.setOrderStage();
                await stageFourObject.setDeliveryProvider();
                expect(stageFourObject.timeline).to.have.property('deliveryProvider').to.equal('');
            });
        });
    });
});
