const sinon = require('sinon');

require('../../../../testHelper');
const { expect } = require('../../../../support/chaiHelper');
const factory = require('../../../../factories');

const {
    orderDeliveryStatuses,
    ORDER_DELIVERY_TYPES,
    deliveryProviders,
} = require('../../../../../constants/constants');
const EmailService = require('../../../../../services/emailService');
const StoreSettings = require('../../../../../models/storeSettings');
const {
    sendDeliveryOrderEmailToBusinessOwner,
    TEST_ONLY,
} = require('../../../../../uow/delivery/pickup/sendDeliveryOrderEmailToBusinessOwnerUow');

describe('test send delivery order email to business owner UOW', () => {
    let business, businessOwner, centsCustomer, order, store, serviceOrder, storeCustomer;

    beforeEach(async () => {
        centsCustomer = await factory.create('centsCustomer');
        business = await factory.create('laundromatBusiness');
        businessOwner = await factory.create('userWithBusinessOwnerRole');
        store = await factory.create('store');
        await StoreSettings.query()
            .where({
                storeId: store.id,
            })
            .patch({ timeZone: 'America/Los_Angeles' });

        storeCustomer = await factory.create('storeCustomer', {
            centsCustomerId: centsCustomer.id,
            storeId: store.id,
            businessId: store.businessId,
            isHangDrySelected: true,
            hangDryInstructions: 'Hang it upside down.',
        });
        serviceOrder = await factory.create('serviceOrder', {
            storeId: store.id,
        });
        order = await factory.create('serviceOrderMasterOrder', { orderableId: serviceOrder.id });
    });

    it('should send order email with customer preferences', async () => {
        // arrange
        const singleOptionPreference = await factory.create('businessCustomerPreferences', {
            businessId: business.id,
            type: 'single',
        });
        const selectedOption = await factory.create('preferenceOptions', {
            businessCustomerPreferenceId: singleOptionPreference.id,
        });
        await factory.create('customerPreferencesOptionSelection', {
            preferenceOptionId: selectedOption.id,
            centsCustomerId: centsCustomer.id,
        });

        const orderDelivery = {
            pickup: {
                status: orderDeliveryStatuses.SCHEDULED,
                orderId: order.id,
                postalCode: '10003',
                type: ORDER_DELIVERY_TYPES.PICKUP,
                deliveryWindow: [1652949609, 1652989609],
                deliveryProvider: deliveryProviders.OWN_DRIVER,
            },
        };

        const payload = {
            businessId: business.id,
            customer: storeCustomer,
            serviceOrder,
            orderDelivery,
            customerNotes: 'test customer note',
            centsCustomer,
        };

        const emailServiceStub = sinon.stub(EmailService.prototype, 'email');

        // act
        await sendDeliveryOrderEmailToBusinessOwner(payload);

        // assert
        sinon.assert.called(emailServiceStub);
    });

    it('should send order email without customer preferences', async () => {
        // arrange
        const orderDelivery = {
            pickup: {
                status: orderDeliveryStatuses.SCHEDULED,
                orderId: order.id,
                postalCode: '10003',
                type: ORDER_DELIVERY_TYPES.PICKUP,
                deliveryWindow: [1652949609, 1652989609],
                deliveryProvider: deliveryProviders.OWN_DRIVER,
            },
        };

        const payload = {
            businessId: business.id,
            customer: storeCustomer,
            serviceOrder,
            orderDelivery,
            customerNotes: 'test customer note',
            centsCustomer,
        };

        const emailServiceStub = sinon.stub(EmailService.prototype, 'email');

        // act
        await sendDeliveryOrderEmailToBusinessOwner(payload);

        // assert
        sinon.assert.called(emailServiceStub);
    });

    describe('doordash pickup flows', () => {
        it('sends email when only pickup is scheduled', async () => {
            // arrange
            const orderDelivery = {
                pickup: {
                    status: orderDeliveryStatuses.SCHEDULED,
                    orderId: order.id,
                    postalCode: '10003',
                    type: ORDER_DELIVERY_TYPES.PICKUP,
                    deliveryWindow: [1652949609, 1652989609],
                    deliveryProvider: deliveryProviders.DOORDASH,
                },
            };

            const payload = {
                businessId: business.id,
                customer: storeCustomer,
                serviceOrder,
                orderDelivery,
                customerNotes: 'test customer note',
                centsCustomer,
            };

            const emailServiceStub = sinon.stub(EmailService.prototype, 'email');

            // act
            await sendDeliveryOrderEmailToBusinessOwner(payload);

            // assert
            sinon.assert.called(emailServiceStub);
        });

        it('does not send email when pickup window is missing', async () => {
            // arrange
            const orderDelivery = {
                pickup: {
                    status: orderDeliveryStatuses.SCHEDULED,
                    orderId: order.id,
                    postalCode: '10003',
                    type: ORDER_DELIVERY_TYPES.PICKUP,
                    deliveryProvider: deliveryProviders.DOORDASH,
                },
            };

            const payload = {
                businessId: business.id,
                customer: storeCustomer,
                serviceOrder,
                orderDelivery,
                customerNotes: 'test customer note',
                centsCustomer,
            };

            const emailServiceStub = sinon.stub(EmailService.prototype, 'email');

            // act
            await sendDeliveryOrderEmailToBusinessOwner(payload);

            // assert
            sinon.assert.notCalled(emailServiceStub);
        });

        it('sends email when pickup and delivery is scheduled', async () => {
            // arrange
            const orderDelivery = {
                pickup: {
                    status: orderDeliveryStatuses.SCHEDULED,
                    orderId: order.id,
                    postalCode: '10003',
                    type: ORDER_DELIVERY_TYPES.PICKUP,
                    deliveryWindow: [1652949609, 1652989609],
                    deliveryProvider: deliveryProviders.DOORDASH,
                },
                delivery: {
                    status: orderDeliveryStatuses.INTENT_CREATED,
                    orderId: order.id,
                    postalCode: '10003',
                    type: ORDER_DELIVERY_TYPES.RETURN,
                    deliveryWindow: [1859999609, 1899999999],
                    deliveryProvider: deliveryProviders.DOORDASH,
                },
            };

            const payload = {
                businessId: business.id,
                customer: storeCustomer,
                serviceOrder,
                orderDelivery,
                customerNotes: 'test customer note',
                centsCustomer,
            };

            const emailServiceStub = sinon.stub(EmailService.prototype, 'email');

            // act
            await sendDeliveryOrderEmailToBusinessOwner(payload);

            // assert
            sinon.assert.called(emailServiceStub);
        });

        it('formats email when only pickup is scheduled', async () => {
            // arrange
            const orderDelivery = {
                pickup: {
                    status: orderDeliveryStatuses.SCHEDULED,
                    orderId: order.id,
                    postalCode: '10003',
                    type: ORDER_DELIVERY_TYPES.PICKUP,
                    deliveryWindow: [1652949609, 1652989609],
                    deliveryProvider: deliveryProviders.DOORDASH,
                },
                delivery: {},
            };

            // act
            const res = await TEST_ONLY.formatEmail(
                centsCustomer,
                orderDelivery,
                'America/Los_Angeles',
                'test customer note',
                serviceOrder,
                [],
                storeCustomer,
                true,
            );

            // assert
            expect(res).to.equal(
                '\n' +
                    '            <p>New Doordash Pickup Scheduled!</p>\n' +
                    '            <p>\n' +
                    `                Customer Name: ${centsCustomer.firstName} ${centsCustomer.lastName}\n` +
                    '            </p>\n' +
                    '            <p>\n' +
                    `            Customer Address: ${orderDelivery.pickup.address1}, ${orderDelivery.pickup.city}, ${orderDelivery.pickup.firstLevelSubdivisionCode}, ${orderDelivery.pickup.postalCode}\n` +
                    '            </p>\n' +
                    '            <p>Scheduled Date: Jan 19th</p>\n' +
                    '            <p>Scheduled Time Window: 07:09 pm PST - 07:09 pm PST</p>            \n' +
                    '            <p>Delivery Date: Text When Ready</p>\n' +
                    '            <p>Delivery Time Window: Text When Ready</p>\n' +
                    '    ',
            );
        });

        it('formats email when pickup and delivery is scheduled', async () => {
            // arrange
            const orderDelivery = {
                pickup: {
                    status: orderDeliveryStatuses.SCHEDULED,
                    orderId: order.id,
                    postalCode: '10003',
                    type: ORDER_DELIVERY_TYPES.PICKUP,
                    deliveryWindow: [1652949609, 1652989609],
                    deliveryProvider: deliveryProviders.DOORDASH,
                },
                delivery: {
                    status: orderDeliveryStatuses.INTENT_CREATED,
                    orderId: order.id,
                    postalCode: '10003',
                    type: ORDER_DELIVERY_TYPES.RETURN,
                    deliveryWindow: [1859999609, 1899999999],
                    deliveryProvider: deliveryProviders.DOORDASH,
                },
            };

            // act
            const res = await TEST_ONLY.formatEmail(
                centsCustomer,
                orderDelivery,
                'America/Los_Angeles',
                'test customer note',
                serviceOrder,
                [],
                storeCustomer,
                true,
            );

            // assert
            expect(res).to.equal(
                '\n' +
                    '            <p>New Doordash Pickup Scheduled!</p>\n' +
                    '            <p>\n' +
                    `                Customer Name: ${centsCustomer.firstName} ${centsCustomer.lastName}\n` +
                    '            </p>\n' +
                    '            <p>\n' +
                    `            Customer Address: ${orderDelivery.pickup.address1}, ${orderDelivery.pickup.city}, ${orderDelivery.pickup.firstLevelSubdivisionCode}, ${orderDelivery.pickup.postalCode}\n` +
                    '            </p>\n' +
                    '            <p>Scheduled Date: Jan 19th</p>\n' +
                    '            <p>Scheduled Time Window: 07:09 pm PST - 07:09 pm PST</p>            \n' +
                    '            <p>Delivery Date: Jan 22nd</p>\n' +
                    '            <p>Delivery Time Window: 04:39 am PST - 03:46 pm PST</p>\n' +
                    '    ',
            );
        });
    });
});
