require('../../../testHelper');
const { date } = require('faker');
const { expect } = require('../../../support/chaiHelper');
const factory = require('../../../factories');

const StageThreeTimelineBuilder = require('../../../../services/liveLink/timeline/stageThreeTimelineBuilder');
const { livelinkImageKeys } = require('../../../../constants/constants');

describe('live-link timeline for stage 3', () => {
    let serviceOrder;
    let order;
    let storeSettings;
    let returnOrderDelivery;
    let timeline;
    let timings;
    let store;
    let teamMember;
    describe('set stage three headerName', () => {
        describe('service orderType', async () => {
            beforeEach(async () => {
                serviceOrder = await factory.create('serviceOrderWithReturnMethod', {
                    orderType: 'SERVICE',
                });
                order = await factory.create('serviceOrderMasterOrder', {
                    orderableId: serviceOrder.id,
                });
            });
            it('orderDelivery pickup scheduled', async () => {
                stageThreeObject = await new StageThreeTimelineBuilder(serviceOrder.id);
                stageThreeObject.addStep();
                await stageThreeObject.setServiceOrderDetails();
                await stageThreeObject.setOrderStage();
                await stageThreeObject.buildHeader();
                expect(stageThreeObject.timeline.header)
                    .to.have.property('name')
                    .to.equal('Processing');
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
                stageThreeObject = await new StageThreeTimelineBuilder(serviceOrder.id);
                stageThreeObject.addStep();
                await stageThreeObject.setServiceOrderDetails();
                await stageThreeObject.setOrderStage();
                await stageThreeObject.buildHeader();
                expect(stageThreeObject.timeline.header)
                    .to.have.property('name')
                    .to.equal('Canceled');
            });
        });
        describe('Online order type', () => {
            it('order is cancelled', async () => {
                serviceOrder = await factory.create('serviceOrderWithReturnMethod', {
                    orderType: 'ONLINE',
                });
                order = await factory.create('serviceOrderMasterOrder', {
                    orderableId: serviceOrder.id,
                });
                stageThreeObject = await new StageThreeTimelineBuilder(serviceOrder.id);
                stageThreeObject.addStep();
                await stageThreeObject.setServiceOrderDetails();
                await stageThreeObject.setOrderStage();
                await stageThreeObject.buildHeader();
                expect(stageThreeObject.timeline.header)
                    .to.have.property('name')
                    .to.equal('Received & Processing');
            });
        });
    });

    describe('set stage three footerName', async () => {
        describe('order is canceled', async () => {
            beforeEach(async () => {
                serviceOrder = await factory.create('serviceOrderWithReturnMethod', {
                    status: 'CANCELLED',
                    orderType: 'ONLINE',
                });
                order = await factory.create('serviceOrderMasterOrder', {
                    orderableId: serviceOrder.id,
                });
            });

            it('orderDelivery is canceled', async () => {
                stageThreeObject = await new StageThreeTimelineBuilder(serviceOrder.id);
                stageThreeObject.addStep();
                await stageThreeObject.setServiceOrderDetails();
                await stageThreeObject.setOrderStage();
                await stageThreeObject.buildFooter();
                expect(stageThreeObject.timeline.footer)
                    .to.have.property('name')
                    .to.equal('Would you like to place another order?');
            });
        });
    });

    describe('set stage three footerDescription', async () => {
        describe('returnMethod inStorePickUp', async () => {
            it('order pickup by customer', async () => {
                serviceOrder = await factory.create('serviceOrderWithReturnMethod', {
                    orderType: 'ONLINE',
                    returnMethod: 'IN_STORE_PICKUP',
                });
                order = await factory.create('serviceOrderMasterOrder', {
                    orderableId: serviceOrder.id,
                });
                stageThreeObject = await new StageThreeTimelineBuilder(serviceOrder.id);
                stageThreeObject.addStep();
                await stageThreeObject.setServiceOrderDetails();
                await stageThreeObject.setOrderStage();
                await stageThreeObject.buildFooter();
                expect(stageThreeObject.timeline.footer)
                    .to.have.property('description')
                    .to.equal("We'll notify you when your laundry is ready");
            });
        });

        describe('ordertype residential', async () => {
            it('order pickup scheduled', async () => {
                serviceOrder = await factory.create('serviceOrderWithReturnMethod', {
                    orderType: 'RESIDENTIAL',
                });
                order = await factory.create('serviceOrderMasterOrder', {
                    orderableId: serviceOrder.id,
                });
                returnOrderDelivery = await factory.create('orderDelivery', {
                    status: 'SCHEDULED',
                    orderId: order.id,
                    storeId: serviceOrder.storeId,
                });
                stageThreeObject = await new StageThreeTimelineBuilder(serviceOrder.id);
                stageThreeObject.addStep();
                await stageThreeObject.setServiceOrderDetails();
                await stageThreeObject.setOrderStage();
                await stageThreeObject.buildFooter();
                expect(stageThreeObject.timeline.footer)
                    .to.have.property('description')
                    .to.equal("We'll notify you when it's on it's way back to you");
            });
        });

        describe('ordertype residential', async () => {
            it('order pickup scheduled', async () => {
                serviceOrder = await factory.create('serviceOrderWithReturnMethod', {
                    orderType: 'RESIDENTIAL',
                });
                order = await factory.create('serviceOrderMasterOrder', {
                    orderableId: serviceOrder.id,
                });
                stageThreeObject = await new StageThreeTimelineBuilder(serviceOrder.id);
                stageThreeObject.addStep();
                await stageThreeObject.setServiceOrderDetails();
                await stageThreeObject.setOrderStage();
                await stageThreeObject.buildFooter();
                expect(stageThreeObject.timeline.footer)
                    .to.have.property('description')
                    .to.equal("We'll notify you when it's on it's way back to you");
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
                stageThreeObject = await new StageThreeTimelineBuilder(serviceOrder.id);
                stageThreeObject.addStep();
                await stageThreeObject.setServiceOrderDetails();
                await stageThreeObject.setOrderStage();
                await stageThreeObject.buildFooter();
                expect(stageThreeObject.timeline.footer)
                    .to.have.property('description')
                    .to.equal('');
            });
        });
    });
    describe('set stage three image key', () => {
        describe('order is processing', async () => {
            beforeEach(async () => {
                serviceOrder = await factory.create('serviceOrderWithReturnMethod');
                order = await factory.create('serviceOrderMasterOrder', {
                    orderableId: serviceOrder.id,
                });
            });

            it('order pickup selected(OWN-DELIVERY)', async () => {
                stageThreeObject = await new StageThreeTimelineBuilder(serviceOrder.id);
                stageThreeObject.addStep();
                await stageThreeObject.setServiceOrderDetails();
                await stageThreeObject.setOrderStage();
                await stageThreeObject.setImageKey();
                expect(stageThreeObject.timeline)
                    .to.have.property('imageKey')
                    .to.equal(livelinkImageKeys.PROCESSING);
            });
        });

        describe('cancelled order', async () => {
            it('order is canceled', async () => {
                serviceOrder = await factory.create('serviceOrderWithReturnMethod', {
                    status: 'CANCELLED',
                });
                stageThreeObject = await new StageThreeTimelineBuilder(serviceOrder.id);
                stageThreeObject.addStep();
                await stageThreeObject.setServiceOrderDetails();
                await stageThreeObject.setOrderStage();
                await stageThreeObject.setImageKey();
                expect(stageThreeObject.timeline)
                    .to.have.property('imageKey')
                    .to.equal(livelinkImageKeys.ORDER_CANCELED);
            });
        });
    });
});
