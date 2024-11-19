require('../../../../testHelper');
const factory = require('../../../../factories');
const { expect } = require('../../../../support/chaiHelper');
const definePaymentStatusAndBalanceDue = require('../../../../../uow/liveLink/serviceOrders/definePaymentStatusAndBalanceDueUow');
const { FACTORIES_NAMES: FN } = require('../../../../constants/factoriesNames');

describe('test definePaymentStatusAndBalanceDue UOW test', () => {
    let store;

    beforeEach(async () => {
        store = await factory.create(FN.store);
    })
    
    it('should return the balanceDue of 0 and paymentStatus of PAID for the order when serviceOrder is provided', async () => {
        const serviceOrder = await factory.create(FN.serviceOrder, {
            netOrderTotal: 30,
            balanceDue: 30,
            paymentStatus: 'BALANCE_DUE',
            storeId: store.id,
        });
        const order = await factory.create(FN.order, {
            orderableType: 'ServiceOrder',
            orderableId: serviceOrder.id,
        });
        await factory.create(FN.payment, {
            orderId: order.id,
            storeId: store.id,
            status: 'succeeded',
            totalAmount: 15,
        });
        await factory.create(FN.payment, {
            orderId: order.id,
            storeId: store.id,
            status: 'succeeded',
            totalAmount: 15,
        });
        
        const payload = {
            serviceOrderId: serviceOrder.id,
            serviceOrder,
        };

        const output = await definePaymentStatusAndBalanceDue(payload);
        expect(output.balanceDue).to.equal(0);
        expect(output.paymentStatus).to.equal('PAID');
    });

    it('should return the balanceDue of 15 and paymentStatus of BALANCE_DUE for the order when serviceOrder is provided', async () => {
        const serviceOrder = await factory.create(FN.serviceOrder, {
            netOrderTotal: 30,
            balanceDue: 30,
            paymentStatus: 'BALANCE_DUE',
            storeId: store.id,
        });
        const order = await factory.create(FN.order, {
            orderableType: 'ServiceOrder',
            orderableId: serviceOrder.id,
        });
        await factory.create(FN.payment, {
            orderId: order.id,
            storeId: store.id,
            status: 'succeeded',
            totalAmount: 15,
        });
        
        const payload = {
            serviceOrderId: serviceOrder.id,
            serviceOrder,
        };

        const output = await definePaymentStatusAndBalanceDue(payload);
        expect(output.balanceDue).to.equal(15);
        expect(output.paymentStatus).to.equal('BALANCE_DUE');
    });

    it('should return the balanceDue of 30 and paymentStatus of BALANCE_DUE for the order where no payments exist and when serviceOrder is provided', async () => {
        const serviceOrder = await factory.create(FN.serviceOrder, {
            netOrderTotal: 30,
            balanceDue: 30,
            paymentStatus: 'BALANCE_DUE',
            storeId: store.id,
        });
        await factory.create(FN.order, {
            orderableType: 'ServiceOrder',
            orderableId: serviceOrder.id,
        });
        
        const payload = {
            serviceOrderId: serviceOrder.id,
            serviceOrder,
        };

        const output = await definePaymentStatusAndBalanceDue(payload);
        expect(output.balanceDue).to.equal(30);
        expect(output.paymentStatus).to.equal('BALANCE_DUE');
    });

    it('should return the balanceDue of 10 and paymentStatus of BALANCE_DUE for the order when serviceOrder is provided but netOrderTotal is different', async () => {
        const serviceOrder = await factory.create(FN.serviceOrder, {
            netOrderTotal: 30,
            balanceDue: 30,
            paymentStatus: 'BALANCE_DUE',
            storeId: store.id,
        });
        const order = await factory.create(FN.order, {
            orderableType: 'ServiceOrder',
            orderableId: serviceOrder.id,
        });
        await factory.create(FN.payment, {
            orderId: order.id,
            storeId: store.id,
            status: 'succeeded',
            totalAmount: 15,
        });
        await factory.create(FN.payment, {
            orderId: order.id,
            storeId: store.id,
            status: 'succeeded',
            totalAmount: 15,
        });
        
        const payload = {
            serviceOrderId: serviceOrder.id,
            serviceOrder: {
                netOrderTotal: 40,
            },
        };

        const output = await definePaymentStatusAndBalanceDue(payload);
        expect(output.balanceDue).to.equal(10);
        expect(output.paymentStatus).to.equal('BALANCE_DUE');
    });

    it('should return the balanceDue of 0 and paymentStatus of PAID for the order when serviceOrder is not provided', async () => {
        const serviceOrder = await factory.create(FN.serviceOrder, {
            netOrderTotal: 30,
            balanceDue: 30,
            paymentStatus: 'BALANCE_DUE',
            storeId: store.id,
        });
        const order = await factory.create(FN.order, {
            orderableType: 'ServiceOrder',
            orderableId: serviceOrder.id,
        });
        await factory.create(FN.payment, {
            orderId: order.id,
            storeId: store.id,
            status: 'succeeded',
            totalAmount: 15,
        });
        await factory.create(FN.payment, {
            orderId: order.id,
            storeId: store.id,
            status: 'succeeded',
            totalAmount: 15,
        });
        
        const payload = {
            serviceOrderId: serviceOrder.id,
        };

        const output = await definePaymentStatusAndBalanceDue(payload);
        expect(output.balanceDue).to.equal(0);
        expect(output.paymentStatus).to.equal('PAID');
    });

    it('should return the balanceDue of 15 and paymentStatus of BALANCE_DUE for the order when serviceOrder is not provided', async () => {
        const serviceOrder = await factory.create(FN.serviceOrder, {
            netOrderTotal: 30,
            balanceDue: 30,
            paymentStatus: 'BALANCE_DUE',
            storeId: store.id,
        });
        const order = await factory.create(FN.order, {
            orderableType: 'ServiceOrder',
            orderableId: serviceOrder.id,
        });
        await factory.create(FN.payment, {
            orderId: order.id,
            storeId: store.id,
            status: 'succeeded',
            totalAmount: 15,
        });
        
        const payload = {
            serviceOrderId: serviceOrder.id,
        };

        const output = await definePaymentStatusAndBalanceDue(payload);
        expect(output.balanceDue).to.equal(15);
        expect(output.paymentStatus).to.equal('BALANCE_DUE');
    });

    it('should return the balanceDue of 30 and paymentStatus of BALANCE_DUE for the order where no payments exist and when serviceOrder is not provided', async () => {
        const serviceOrder = await factory.create(FN.serviceOrder, {
            netOrderTotal: 30,
            balanceDue: 30,
            paymentStatus: 'BALANCE_DUE',
            storeId: store.id,
        });
        await factory.create(FN.order, {
            orderableType: 'ServiceOrder',
            orderableId: serviceOrder.id,
        });
        
        const payload = {
            serviceOrderId: serviceOrder.id,
        };

        const output = await definePaymentStatusAndBalanceDue(payload);
        expect(output.balanceDue).to.equal(30);
        expect(output.paymentStatus).to.equal('BALANCE_DUE');
    });
});
