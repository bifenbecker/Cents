const sinon = require('sinon');

// Helpers
require('../../../../testHelper');
const { expect } = require('../../../../support/chaiHelper');
const factory = require('../../../../factories');
const { FACTORIES_NAMES: FN } = require('../../../../constants/factoriesNames');
const { STRIPE_TERMINAL_WEBHOOK_EVENT_TYPES } = require('../../../../../constants/constants');
const logger = require('../../../../../lib/logger');

// Function to test
const updatedOrderableForCapturedPaymentIntent = require('../../../../../uow/stripe/terminal/updateOrderableForCapturedPaymentIntentUow');

// Models
const ServiceOrder = require('../../../../../models/serviceOrders');
const InventoryOrder = require('../../../../../models/inventoryOrders');

describe('test updatedOrderableForCapturedPaymentIntent uow', () => {
    let serviceOrder, order, payment;
    beforeEach(async () => {
        serviceOrder = await factory.create(FN.serviceOrder, {
            paymentStatus: 'BALANCE_DUE',
            balanceDue: 10,
            netOrderTotal: 10,
        });
        order = await factory.create(FN.order, {
            orderableType: 'ServiceOrder',
            orderableId: serviceOrder.id,
        });
        payment = await factory.create(FN.payment, {
            orderId: order.id,
            storeId: serviceOrder.storeId,
            paymentProcessor: 'stripe',
            paymentToken: 'pi_test',
            status: 'succeeded',
            totalAmount: 10,
        });
    });

    it('should skip orderable update if webhook type is not terminal.reader.action_succeeded', async () => {
        const payload = {
            paymentIntent: {
                id: 'pi_test',
                status: 'succeeded',
                amount: 1000,
            },
            payment,
            order,
            webhookType: STRIPE_TERMINAL_WEBHOOK_EVENT_TYPES.ACTION_FAILED,
        };

        await updatedOrderableForCapturedPaymentIntent(payload);

        expect(serviceOrder.paymentStatus).to.equal('BALANCE_DUE');
        expect(serviceOrder.balanceDue).to.equal(10);
    });

    it('should skip orderable update if paymentIntent is not defined', async () => {
        const payload = {
            payment,
            webhookType: STRIPE_TERMINAL_WEBHOOK_EVENT_TYPES.ACTION_SUCCEEDED,
            order,
        };

        await updatedOrderableForCapturedPaymentIntent(payload);

        expect(serviceOrder.paymentStatus).to.equal('BALANCE_DUE');
        expect(serviceOrder.balanceDue).to.equal(10);
    });

    it('should skip orderable update if paymentIntent status is not succeeded', async () => {
        const payload = {
            payment,
            paymentIntent: {
                id: 'pi_test',
                status: 'requires_payment_method',
                amount: 1000,
            },
            order,
            webhookType: STRIPE_TERMINAL_WEBHOOK_EVENT_TYPES.ACTION_SUCCEEDED,
        };

        await updatedOrderableForCapturedPaymentIntent(payload);

        expect(serviceOrder.paymentStatus).to.equal('BALANCE_DUE');
        expect(serviceOrder.balanceDue).to.equal(10);
    });

    it('should skip orderable update if payment status is not succeeded', async () => {
        const payload = {
            payment: {
                ...payment,
                status: 'requires_payment_method'
            },
            paymentIntent: {
                id: 'pi_test',
                status: 'succeeded',
                amount: 1000,
            },
            order,
            webhookType: STRIPE_TERMINAL_WEBHOOK_EVENT_TYPES.ACTION_SUCCEEDED,
        };

        await updatedOrderableForCapturedPaymentIntent(payload);

        expect(serviceOrder.paymentStatus).to.equal('BALANCE_DUE');
        expect(serviceOrder.balanceDue).to.equal(10);
    });

    it('should skip orderable update if order is not defined', async () => {
        const payload = {
            payment,
            paymentIntent: {
                id: 'pi_test',
                status: 'succeeded',
                amount: 1000,
            },
            webhookType: STRIPE_TERMINAL_WEBHOOK_EVENT_TYPES.ACTION_SUCCEEDED,
        };

        await updatedOrderableForCapturedPaymentIntent(payload);

        expect(serviceOrder.paymentStatus).to.equal('BALANCE_DUE');
        expect(serviceOrder.balanceDue).to.equal(10);
    });

    it('should successfully update the ServiceOrder paymentStatus and balanceDue', async () => {
        const payload = {
            payment,
            paymentIntent: {
                id: 'pi_test',
                status: 'succeeded',
                amount: 1000,
            },
            order,
            webhookType: STRIPE_TERMINAL_WEBHOOK_EVENT_TYPES.ACTION_SUCCEEDED,
        };

        await updatedOrderableForCapturedPaymentIntent(payload);

        const foundServiceOrder = await ServiceOrder.query().findById(order?.orderableId);

        expect(foundServiceOrder.paymentStatus).to.equal('PAID');
        expect(foundServiceOrder.balanceDue).to.equal(0);
    });

    it('should successfully update the InventoryOrder paymentStatus and balanceDue', async () => {
        const inventoryOrder = await factory.create(FN.inventoryOrder, {
            paymentStatus: 'BALANCE_DUE',
            balanceDue: 10,
            netOrderTotal: 10,
        });
        const order = await factory.create(FN.order, {
            orderableType: 'InventoryOrder',
            orderableId: inventoryOrder.id,
        });
        const payment = await factory.create(FN.payment, {
            orderId: order.id,
            storeId: inventoryOrder.storeId,
            paymentProcessor: 'stripe',
            paymentToken: 'pi_test',
            status: 'succeeded',
            totalAmount: 10,
        });
        
        const payload = {
            payment,
            paymentIntent: {
                id: 'pi_test',
                status: 'succeeded',
                amount: 1000,
            },
            order,
            webhookType: STRIPE_TERMINAL_WEBHOOK_EVENT_TYPES.ACTION_SUCCEEDED,
        };

        await updatedOrderableForCapturedPaymentIntent(payload);

        const foundInventoryOrder = await InventoryOrder.query().findById(order?.orderableId);

        expect(foundInventoryOrder.paymentStatus).to.equal('PAID');
        expect(foundInventoryOrder.balanceDue).to.equal(0);
    });

    it('should successfully update the ServiceOrder paymentStatus to BALANCE_DUE and balanceDue to 5', async () => {
        const payload = {
            payment: {
                ...payment,
                totalAmount: 5,
            },
            paymentIntent: {
                id: 'pi_test',
                status: 'succeeded',
                amount: 500,
            },
            order,
            webhookType: STRIPE_TERMINAL_WEBHOOK_EVENT_TYPES.ACTION_SUCCEEDED,
        };

        await updatedOrderableForCapturedPaymentIntent(payload);

        const foundServiceOrder = await ServiceOrder.query().findById(order?.orderableId);

        expect(foundServiceOrder.paymentStatus).to.equal('BALANCE_DUE');
        expect(foundServiceOrder.balanceDue).to.equal(5);
    });

    it('should successfully update the InventoryOrder paymentStatus to BALANCE_DUE and balanceDue to 5', async () => {
        const inventoryOrder = await factory.create(FN.inventoryOrder, {
            paymentStatus: 'BALANCE_DUE',
            balanceDue: 10,
            netOrderTotal: 10,
        });
        const order = await factory.create(FN.order, {
            orderableType: 'InventoryOrder',
            orderableId: inventoryOrder.id,
        });
        const payment = await factory.create(FN.payment, {
            orderId: order.id,
            storeId: inventoryOrder.storeId,
            paymentProcessor: 'stripe',
            paymentToken: 'pi_test',
            status: 'succeeded',
            totalAmount: 5,
        });
        
        const payload = {
            payment,
            paymentIntent: {
                id: 'pi_test',
                status: 'succeeded',
                amount: 500,
            },
            order,
            webhookType: STRIPE_TERMINAL_WEBHOOK_EVENT_TYPES.ACTION_SUCCEEDED,
        };

        await updatedOrderableForCapturedPaymentIntent(payload);

        const foundInventoryOrder = await InventoryOrder.query().findById(order?.orderableId);

        expect(foundInventoryOrder.paymentStatus).to.equal('BALANCE_DUE');
        expect(foundInventoryOrder.balanceDue).to.equal(5);
    });

    it('should throw error and log error when UoW processing fails', async () => {
        const spy = sinon.spy(logger, "error");

        try {
            await updatedOrderableForCapturedPaymentIntent({});
        } catch (error) {
            expect(error).to.be.an('Error');
            expect(spy.called).to.be.true;
            return error;
        }
    });
});
