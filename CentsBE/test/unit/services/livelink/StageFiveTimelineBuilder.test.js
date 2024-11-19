require('../../../testHelper');
const { expect } = require('../../../support/chaiHelper');
const factory = require('../../../factories');

const { dateFormat } = require('../../../../helpers/dateFormatHelper');

const StoreSettings = require('../../../../models/storeSettings');

const StageFiveTimelineBuilder = require('../../../../services/liveLink/timeline/stageFiveTimelineBuilder');
const { livelinkImageKeys } = require('../../../../constants/constants');

describe('live-link timeline for stage 5', () => {
    let serviceOrder, order, storeSettings, returnOrderDelivery, returnRouteDelivery, timeline;
    describe('set stage five headerName', () => {
        describe('deliver to me selected', async () => {
            beforeEach(async () => {});
            it('ONLINE order orderDelivery completed', async () => {
                serviceOrder = await factory.create('serviceOrderWithReturnMethod', {
                    status: 'COMPLETED',
                    orderType: 'ONLINE',
                });
                order = await factory.create('serviceOrderMasterOrder', {
                    orderableId: serviceOrder.id,
                });
                returnOrderDelivery = await factory.create('orderDelivery', {
                    status: 'COMPLETED',
                    orderId: order.id,
                    storeId: serviceOrder.storeId,
                    deliveryProvider: 'OWN_DELIVERY',
                });
                stageFiveObject = await new StageFiveTimelineBuilder(serviceOrder.id);
                stageFiveObject.addStep();
                await stageFiveObject.setServiceOrderDetails();
                await stageFiveObject.setOrderStage();
                await stageFiveObject.buildHeader();
                expect(stageFiveObject.timeline.header)
                    .to.have.property('name')
                    .to.equal('Order Complete');
            });

            it('WALK-IN order orderDelivery completed', async () => {
                serviceOrder = await factory.create('serviceOrderWithReturnMethod', {
                    status: 'COMPLETED',
                });
                order = await factory.create('serviceOrderMasterOrder', {
                    orderableId: serviceOrder.id,
                });
                returnOrderDelivery = await factory.create('orderDelivery', {
                    status: 'COMPLETED',
                    orderId: order.id,
                    storeId: serviceOrder.storeId,
                    deliveryProvider: 'OWN_DELIVERY',
                });
                stageFiveObject = await new StageFiveTimelineBuilder(serviceOrder.id);
                stageFiveObject.addStep();
                await stageFiveObject.setServiceOrderDetails();
                await stageFiveObject.setOrderStage();
                await stageFiveObject.buildHeader();
                expect(stageFiveObject.timeline.header)
                    .to.have.property('name')
                    .to.equal('Order Complete');
            });

            it('RESIDENTIAL order completed', async () => {
                serviceOrder = await factory.create('serviceOrderWithReturnMethod', {
                    status: 'COMPLETED',
                    orderType: 'RESIDENTIAL',
                });
                stageFiveObject = await new StageFiveTimelineBuilder(serviceOrder.id);
                stageFiveObject.addStep();
                await stageFiveObject.setServiceOrderDetails();
                await stageFiveObject.setOrderStage();
                await stageFiveObject.buildHeader();
                expect(stageFiveObject.timeline.header)
                    .to.have.property('name')
                    .to.equal('Order Complete');
            });
        });

        describe('customer will pickup by himself', () => {
            it('ONLINE order in store picked-up', async () => {
                serviceOrder = await factory.create('serviceOrderWithReturnMethod', {
                    status: 'COMPLETED',
                    orderType: 'ONLINE',
                    returnMethod: 'IN_STORE_PICKUP',
                });
                stageFiveObject = await new StageFiveTimelineBuilder(serviceOrder.id);
                stageFiveObject.addStep();
                await stageFiveObject.setServiceOrderDetails();
                await stageFiveObject.setOrderStage();
                await stageFiveObject.buildHeader();
                expect(stageFiveObject.timeline.header)
                    .to.have.property('name')
                    .to.equal('Picked up & complete');
            });
            it('WALK-IN order in store picked-up', async () => {
                serviceOrder = await factory.create('serviceOrderWithReturnMethod', {
                    status: 'COMPLETED',
                    returnMethod: 'IN_STORE_PICKUP',
                });
                stageFiveObject = await new StageFiveTimelineBuilder(serviceOrder.id);
                stageFiveObject.addStep();
                await stageFiveObject.setServiceOrderDetails();
                await stageFiveObject.setOrderStage();
                await stageFiveObject.buildHeader();
                expect(stageFiveObject.timeline.header)
                    .to.have.property('name')
                    .to.equal('Picked up & complete');
            });
        });
    });

    describe('set stage five headerDescription', () => {
        describe('deliver to me selected', async () => {
            beforeEach(async () => {});
            it('ONLINE order orderDelivery completed', async () => {
                serviceOrder = await factory.create('serviceOrderWithReturnMethod', {
                    status: 'COMPLETED',
                    orderType: 'ONLINE',
                });
                stageFiveObject = await new StageFiveTimelineBuilder(serviceOrder.id);
                stageFiveObject.addStep();
                await stageFiveObject.setServiceOrderDetails();
                await stageFiveObject.setOrderStage();
                expect(stageFiveObject.timeline.header)
                    .to.have.property('description')
                    .to.equal('');
            });

            it('WALK-IN order orderDelivery completed', async () => {
                serviceOrder = await factory.create('serviceOrderWithReturnMethod', {
                    status: 'COMPLETED',
                });
                stageFiveObject = await new StageFiveTimelineBuilder(serviceOrder.id);
                stageFiveObject.addStep();
                await stageFiveObject.setServiceOrderDetails();
                await stageFiveObject.setOrderStage();
                expect(stageFiveObject.timeline.header)
                    .to.have.property('description')
                    .to.equal('');
            });

            it('RESIDENTIAL order orderDelivery completed', async () => {
                serviceOrder = await factory.create('serviceOrderWithReturnMethod', {
                    status: 'COMPLETED',
                    orderType: 'RESIDENTIAL',
                });
                stageFiveObject = await new StageFiveTimelineBuilder(serviceOrder.id);
                stageFiveObject.addStep();
                await stageFiveObject.setServiceOrderDetails();
                await stageFiveObject.setOrderStage();
                expect(stageFiveObject.timeline.header)
                    .to.have.property('description')
                    .to.equal('');
            });
        });

        describe('customer will pickup by himself', () => {
            it('ONLINE order in store picked-up', async () => {
                serviceOrder = await factory.create('serviceOrderWithReturnMethod', {
                    status: 'COMPLETED',
                    orderType: 'ONLINE',
                    returnMethod: 'IN_STORE_PICKUP',
                });
                order = await factory.create('serviceOrderMasterOrder', {
                    orderableId: serviceOrder.id,
                });
                stageFiveObject = await new StageFiveTimelineBuilder(serviceOrder.id);
                stageFiveObject.addStep();
                await stageFiveObject.setServiceOrderDetails();
                await stageFiveObject.setOrderStage();
                expect(stageFiveObject.timeline.header)
                    .to.have.property('description')
                    .to.equal('');
            });
            it('WALK-IN order in store picked-up', async () => {
                serviceOrder = await factory.create('serviceOrderWithReturnMethod', {
                    status: 'COMPLETED',
                    returnMethod: 'IN_STORE_PICKUP',
                });
                order = await factory.create('serviceOrderMasterOrder', {
                    orderableId: serviceOrder.id,
                });
                stageFiveObject = await new StageFiveTimelineBuilder(serviceOrder.id);
                stageFiveObject.addStep();
                await stageFiveObject.setServiceOrderDetails();
                await stageFiveObject.setOrderStage();
                expect(stageFiveObject.timeline.header)
                    .to.have.property('description')
                    .to.equal('');
            });
        });
    });

    describe('set stage five footer Name', () => {
        describe('deliver to me selected', async () => {
            beforeEach(async () => {});
            it('ONLINE order orderDelivery completed', async () => {
                serviceOrder = await factory.create('serviceOrderWithReturnMethod', {
                    status: 'COMPLETED',
                    orderType: 'ONLINE',
                });
                order = await factory.create('serviceOrderMasterOrder', {
                    orderableId: serviceOrder.id,
                });
                returnOrderDelivery = await factory.create('orderDelivery', {
                    status: 'COMPLETED',
                    orderId: order.id,
                    storeId: serviceOrder.storeId,
                    deliveryProvider: 'OWN_DELIVERY',
                });
                stageFiveObject = await new StageFiveTimelineBuilder(serviceOrder.id);
                stageFiveObject.addStep();
                await stageFiveObject.setServiceOrderDetails();
                await stageFiveObject.setOrderStage();
                await stageFiveObject.buildFooter();
                expect(stageFiveObject.timeline.footer)
                    .to.have.property('name')
                    .to.equal('Your laundry has been delivered');
            });

            it('WALK-IN order orderDelivery completed', async () => {
                serviceOrder = await factory.create('serviceOrderWithReturnMethod', {
                    status: 'COMPLETED',
                });
                order = await factory.create('serviceOrderMasterOrder', {
                    orderableId: serviceOrder.id,
                });
                returnOrderDelivery = await factory.create('orderDelivery', {
                    status: 'COMPLETED',
                    orderId: order.id,
                    storeId: serviceOrder.storeId,
                    deliveryProvider: 'OWN_DELIVERY',
                });
                stageFiveObject = await new StageFiveTimelineBuilder(serviceOrder.id);
                stageFiveObject.addStep();
                await stageFiveObject.setServiceOrderDetails();
                await stageFiveObject.setOrderStage();
                await stageFiveObject.buildFooter();
                expect(stageFiveObject.timeline.footer)
                    .to.have.property('name')
                    .to.equal('Your laundry has been delivered');
            });

            it('RESIDENTIAL order orderDelivery completed', async () => {
                serviceOrder = await factory.create('serviceOrderWithReturnMethod', {
                    status: 'COMPLETED',
                    orderType: 'RESIDENTIAL',
                });
                order = await factory.create('serviceOrderMasterOrder', {
                    orderableId: serviceOrder.id,
                });
                returnOrderDelivery = await factory.create('orderDelivery', {
                    status: 'COMPLETED',
                    orderId: order.id,
                    storeId: serviceOrder.storeId,
                    deliveryProvider: 'OWN_DELIVERY',
                });
                stageFiveObject = await new StageFiveTimelineBuilder(serviceOrder.id);
                stageFiveObject.addStep();
                await stageFiveObject.setServiceOrderDetails();
                await stageFiveObject.setOrderStage();
                await stageFiveObject.buildFooter();
                expect(stageFiveObject.timeline.footer)
                    .to.have.property('name')
                    .to.equal('Your laundry has been delivered');
            });
        });

        describe('customer will pickup by himself', () => {
            it('ONLINE order in store picked-up', async () => {
                serviceOrder = await factory.create('serviceOrderWithReturnMethod', {
                    status: 'COMPLETED',
                    orderType: 'ONLINE',
                    returnMethod: 'IN_STORE_PICKUP',
                });
                order = await factory.create('serviceOrderMasterOrder', {
                    orderableId: serviceOrder.id,
                });
                stageFiveObject = await new StageFiveTimelineBuilder(serviceOrder.id);
                stageFiveObject.addStep();
                await stageFiveObject.setServiceOrderDetails();
                await stageFiveObject.setOrderStage();
                await stageFiveObject.buildFooter();
                expect(stageFiveObject.timeline.footer)
                    .to.have.property('name')
                    .to.equal('Thanks for doing your laundry with us!');
            });
            it('WALK-IN order in store picked-up', async () => {
                serviceOrder = await factory.create('serviceOrderWithReturnMethod', {
                    status: 'COMPLETED',
                    returnMethod: 'IN_STORE_PICKUP',
                });
                order = await factory.create('serviceOrderMasterOrder', {
                    orderableId: serviceOrder.id,
                });
                stageFiveObject = await new StageFiveTimelineBuilder(serviceOrder.id);
                stageFiveObject.addStep();
                await stageFiveObject.setServiceOrderDetails();
                await stageFiveObject.setOrderStage();
                await stageFiveObject.buildFooter();
                expect(stageFiveObject.timeline.footer)
                    .to.have.property('name')
                    .to.equal('Thanks for doing your laundry with us!');
            });
        });
    });

    describe('set stage five footer Description', () => {
        describe('deliver to me selected', async () => {
            beforeEach(async () => {});
            it('ONLINE order orderDelivery completed', async () => {
                serviceOrder = await factory.create('serviceOrderWithReturnMethod', {
                    status: 'COMPLETED',
                    orderType: 'ONLINE',
                });
                storeSettings = await StoreSettings.query().findOne({
                    storeId: serviceOrder.storeId,
                });
                const completedAt = dateFormat(
                    serviceOrder.completedAt,
                    storeSettings.timeZone || 'America/Los_Angeles',
                    'hh:mma, ddd, MMMM Do',
                );
                order = await factory.create('serviceOrderMasterOrder', {
                    orderableId: serviceOrder.id,
                });
                returnOrderDelivery = await factory.create('orderDelivery', {
                    status: 'COMPLETED',
                    orderId: order.id,
                    storeId: serviceOrder.storeId,
                    deliveryProvider: 'OWN_DELIVERY',
                });
                stageFiveObject = await new StageFiveTimelineBuilder(serviceOrder.id);
                stageFiveObject.addStep();
                await stageFiveObject.setServiceOrderDetails();
                await stageFiveObject.setOrderStage();
                await stageFiveObject.buildFooter();
                expect(stageFiveObject.timeline.footer)
                    .to.have.property('description')
                    .to.equal(`Delivered ${completedAt}`);
            });

            it('WALK-IN order orderDelivery completed', async () => {
                serviceOrder = await factory.create('serviceOrderWithReturnMethod', {
                    status: 'COMPLETED',
                });
                storeSettings = await StoreSettings.query().findOne({
                    storeId: serviceOrder.storeId,
                });
                const completedAt = dateFormat(
                    serviceOrder.completedAt,
                    storeSettings.timeZone || 'America/Los_Angeles',
                    'hh:mma, ddd, MMMM Do',
                );
                order = await factory.create('serviceOrderMasterOrder', {
                    orderableId: serviceOrder.id,
                });
                returnOrderDelivery = await factory.create('orderDelivery', {
                    status: 'COMPLETED',
                    orderId: order.id,
                    storeId: serviceOrder.storeId,
                    deliveryProvider: 'OWN_DELIVERY',
                });
                stageFiveObject = await new StageFiveTimelineBuilder(serviceOrder.id);
                stageFiveObject.addStep();
                await stageFiveObject.setServiceOrderDetails();
                await stageFiveObject.setOrderStage();
                await stageFiveObject.buildFooter();
                expect(stageFiveObject.timeline.footer)
                    .to.have.property('description')
                    .to.equal(`Delivered ${completedAt}`);
            });

            it('RESIDENTIAL order orderDelivery completed', async () => {
                serviceOrder = await factory.create('serviceOrderWithReturnMethod', {
                    status: 'COMPLETED',
                    orderType: 'RESIDENTIAL',
                });
                storeSettings = await StoreSettings.query().findOne({
                    storeId: serviceOrder.storeId,
                });
                const completedAt = dateFormat(
                    serviceOrder.completedAt,
                    storeSettings.timeZone || 'America/Los_Angeles',
                    'hh:mma, ddd, MMMM Do',
                );
                order = await factory.create('serviceOrderMasterOrder', {
                    orderableId: serviceOrder.id,
                });
                returnOrderDelivery = await factory.create('orderDelivery', {
                    status: 'COMPLETED',
                    orderId: order.id,
                    storeId: serviceOrder.storeId,
                    deliveryProvider: 'OWN_DELIVERY',
                });
                stageFiveObject = await new StageFiveTimelineBuilder(serviceOrder.id);
                stageFiveObject.addStep();
                await stageFiveObject.setServiceOrderDetails();
                await stageFiveObject.setOrderStage();
                await stageFiveObject.buildFooter();
                expect(stageFiveObject.timeline.footer)
                    .to.have.property('description')
                    .to.equal(`Delivered ${completedAt}`);
            });
        });

        describe('customer will pickup by himself', () => {
            it('ONLINE order in store picked-up', async () => {
                serviceOrder = await factory.create('serviceOrderWithReturnMethod', {
                    status: 'COMPLETED',
                    orderType: 'ONLINE',
                    returnMethod: 'IN_STORE_PICKUP',
                });
                order = await factory.create('serviceOrderMasterOrder', {
                    orderableId: serviceOrder.id,
                });
                storeSettings = await StoreSettings.query().findOne({
                    storeId: serviceOrder.storeId,
                });
                const completedAt = dateFormat(
                    serviceOrder.completedAt,
                    storeSettings.timeZone || 'America/Los_Angeles',
                    'hh:mma, ddd, MMMM Do',
                );
                stageFiveObject = await new StageFiveTimelineBuilder(serviceOrder.id);
                stageFiveObject.addStep();
                await stageFiveObject.setServiceOrderDetails();
                await stageFiveObject.setOrderStage();
                await stageFiveObject.buildFooter();
                expect(stageFiveObject.timeline.footer)
                    .to.have.property('description')
                    .to.equal(`Picked up in-store at ${completedAt}`);
            });
            it('WALK-IN order in store picked-up', async () => {
                serviceOrder = await factory.create('serviceOrderWithReturnMethod', {
                    status: 'COMPLETED',
                    returnMethod: 'IN_STORE_PICKUP',
                });
                order = await factory.create('serviceOrderMasterOrder', {
                    orderableId: serviceOrder.id,
                });
                storeSettings = await StoreSettings.query().findOne({
                    storeId: serviceOrder.storeId,
                });
                const completedAt = dateFormat(
                    serviceOrder.completedAt,
                    storeSettings.timeZone || 'America/Los_Angeles',
                    'hh:mma, ddd, MMMM Do',
                );
                stageFiveObject = await new StageFiveTimelineBuilder(serviceOrder.id);
                stageFiveObject.addStep();
                await stageFiveObject.setServiceOrderDetails();
                await stageFiveObject.setOrderStage();
                await stageFiveObject.buildFooter();
                expect(stageFiveObject.timeline.footer)
                    .to.have.property('description')
                    .to.equal(`Picked up in-store at ${completedAt}`);
            });
        });
    });
    describe('set stage five image key', () => {
        it('deliver to me selected', async () => {
            serviceOrder = await factory.create('serviceOrderWithReturnMethod', {
                status: 'COMPLETED',
                returnMethod: 'DELIVERY',
            });
            order = await factory.create('serviceOrderMasterOrder', {
                orderableId: serviceOrder.id,
            });
            returnOrderDelivery = await factory.create('orderDelivery', {
                status: 'COMPLETED',
                orderId: order.id,
                storeId: serviceOrder.storeId,
                deliveryProvider: 'OWN_DELIVERY',
            });
            stageFiveObject = await new StageFiveTimelineBuilder(serviceOrder.id);
            stageFiveObject.addStep();
            await stageFiveObject.setServiceOrderDetails();
            await stageFiveObject.setOrderStage();
            await stageFiveObject.setImageKey();
            expect(stageFiveObject.timeline)
                .to.have.property('imageKey')
                .to.equal(livelinkImageKeys.DELIVERY_ORDER_COMPLETED);
        });

        it('pick-up in store to me selected', async () => {
            serviceOrder = await factory.create('serviceOrderWithReturnMethod', {
                status: 'COMPLETED',
                returnMethod: 'IN_STORE_PICKUP',
            });
            stageFiveObject = await new StageFiveTimelineBuilder(serviceOrder.id);
            stageFiveObject.addStep();
            await stageFiveObject.setServiceOrderDetails();
            await stageFiveObject.setOrderStage();
            await stageFiveObject.setImageKey();
            expect(stageFiveObject.timeline)
                .to.have.property('imageKey')
                .to.equal(livelinkImageKeys.IN_STORE_PICKUP_COMPLETED);
        });
    });

    describe('set stage five delivery provider key', () => {
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
                returnOrderDelivery = await factory.create('orderDelivery', {
                    status: 'EN_ROUTE_TO_DROP_OFF',
                    orderId: order.id,
                    storeId: serviceOrder.storeId,
                });
                stageFiveObject = await new StageFiveTimelineBuilder(serviceOrder.id);
                stageFiveObject.addStep();
                await stageFiveObject.setServiceOrderDetails();
                await stageFiveObject.setOrderStage();
                await stageFiveObject.setDeliveryProvider();
                expect(stageFiveObject.timeline)
                    .to.have.property('deliveryProvider')
                    .to.equal('OWN_DRIVER');
            });

            it('deliver to me selected(ON-DEMAND)', async () => {
                returnOrderDelivery = await factory.create('orderDelivery', {
                    status: 'EN_ROUTE_TO_DROP_OFF',
                    orderId: order.id,
                    storeId: serviceOrder.storeId,
                    deliveryProvider: 'ON_DEMAND',
                });
                stageFiveObject = await new StageFiveTimelineBuilder(serviceOrder.id);
                stageFiveObject.addStep();
                await stageFiveObject.setServiceOrderDetails();
                await stageFiveObject.setOrderStage();
                await stageFiveObject.setDeliveryProvider();
                expect(stageFiveObject.timeline)
                    .to.have.property('deliveryProvider')
                    .to.equal('ON_DEMAND');
            });
        });

        describe('in store pick up selected', async () => {
            it('pick-up in store to me selected', async () => {
                serviceOrder = await factory.create('serviceOrderWithReturnMethod', {
                    returnMethod: 'IN_STORE_PICKUP',
                });
                stageFiveObject = await new StageFiveTimelineBuilder(serviceOrder.id);
                stageFiveObject.addStep();
                await stageFiveObject.setServiceOrderDetails();
                await stageFiveObject.setOrderStage();
                await stageFiveObject.setDeliveryProvider();
                expect(stageFiveObject.timeline).to.have.property('deliveryProvider').to.equal('');
            });
        });
    });
});
