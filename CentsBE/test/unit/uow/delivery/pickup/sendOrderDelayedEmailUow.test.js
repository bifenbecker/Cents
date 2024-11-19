require('../../../../testHelper');
const sinon = require('sinon');

const factory = require('../../../../factories');

const EmailService = require('../../../../../services/emailService');
const StoreSettings = require('../../../../../models/storeSettings');
const sendOrderDelayedEmail = require('../../../../../uow/delivery/pickup/sendOrderDelayedEmailUow');
const { deliveryProviders, orderDeliveryStatuses } = require('../../../../../constants/constants');

describe('sendOrderDelayedEmailUow tests', () => {
    let business, businessOwner, store;

    beforeEach(async () => {
        business = await factory.create('laundromatBusiness');
        businessOwner = await factory.create('userWithBusinessOwnerRole');
        store = await factory.create('store');
        await StoreSettings.query()
            .where({
                storeId: store.id,
            })
            .patch({ timeZone: 'America/Los_Angeles' });
    });

    it('should send delayed order email when conditions are true', async () => {
        // arrange
        const serviceOrder = await factory.create('serviceOrder', {
            storeId: store.id,
        });
        const order = await factory.create('serviceOrderMasterOrder', {
            orderableId: serviceOrder.id,
        });

        await factory.create('orderDelivery', {
            orderId: order.id,
            storeId: store.id,
            type: 'PICKUP',
            deliveryProvider: deliveryProviders.DOORDASH,
        });

        const payload = {
            serviceOrderId: serviceOrder.id,
        };

        const emailServiceStub = sinon.stub(EmailService.prototype, 'email');

        // act
        await sendOrderDelayedEmail(payload);

        // assert
        sinon.assert.called(emailServiceStub);
    });

    it('should not send delayed order email when status is cancelled', async () => {
        // arrange
        const serviceOrder = await factory.create('serviceOrder', {
            storeId: store.id,
            status: 'CANCELLED',
        });
        const order = await factory.create('serviceOrderMasterOrder', {
            orderableId: serviceOrder.id,
        });

        await factory.create('orderDelivery', {
            orderId: order.id,
            storeId: store.id,
            type: 'PICKUP',
            deliveryProvider: deliveryProviders.DOORDASH,
        });

        const payload = {
            serviceOrderId: serviceOrder.id,
        };

        const emailServiceStub = sinon.stub(EmailService.prototype, 'email');

        // act
        await sendOrderDelayedEmail(payload);

        // assert
        sinon.assert.notCalled(emailServiceStub);
    });

    it('should not send delayed order email when own driver', async () => {
        // arrange
        const serviceOrder = await factory.create('serviceOrder', {
            storeId: store.id,
        });
        const order = await factory.create('serviceOrderMasterOrder', {
            orderableId: serviceOrder.id,
        });

        await factory.create('orderDelivery', {
            orderId: order.id,
            storeId: store.id,
            type: 'PICKUP',
            deliveryProvider: deliveryProviders.OWN_DRIVER,
        });

        const payload = {
            serviceOrderId: serviceOrder.id,
        };

        const emailServiceStub = sinon.stub(EmailService.prototype, 'email');

        // act
        await sendOrderDelayedEmail(payload);

        // assert
        sinon.assert.notCalled(emailServiceStub);
    });

    it('should not send delayed order email when en route to pickup', async () => {
        // arrange
        const serviceOrder = await factory.create('serviceOrder', {
            storeId: store.id,
        });
        const order = await factory.create('serviceOrderMasterOrder', {
            orderableId: serviceOrder.id,
        });

        await factory.create('orderDelivery', {
            orderId: order.id,
            storeId: store.id,
            type: 'PICKUP',
            deliveryProvider: deliveryProviders.DOORDASH,
            status: orderDeliveryStatuses.EN_ROUTE_TO_PICKUP,
        });

        const payload = {
            serviceOrderId: serviceOrder.id,
        };

        const emailServiceStub = sinon.stub(EmailService.prototype, 'email');

        // act
        await sendOrderDelayedEmail(payload);

        // assert
        sinon.assert.notCalled(emailServiceStub);
    });
});
