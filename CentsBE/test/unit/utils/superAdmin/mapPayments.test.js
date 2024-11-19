const { expect } = require('../../../support/chaiHelper');
const mapPayments = require('../../../../utils/superAdmin/mapPayments');
const formatCurrency = require('../../../../utils/formatCurrency');

describe('test mapPayments util', function () {
    let basePayment;

    beforeEach(() => {
        basePayment = {
            createdAt: '2022-06-15T10:10:59.668Z',
            id: 1,
            paymentProcessor: 'stripe',
            status: 'requires_confirmation',
            store: {
                name: 'storeName'
            },
            totalAmount: 0.8,
        }
    });

    it('should map payment with service order details', async () => {
        const payment = {
            ...basePayment,
            inventoryOrderCode: null,
            paymentTiming: 'POST-PAY',
            serviceOrderCode: '5000',
        };

        const [mappedPayment] = await mapPayments([payment]);

        expect(mappedPayment).to.have.property('orderCode').equal(payment.serviceOrderCode);
        expect(mappedPayment).to.have.property('paymentTiming').equal(payment.paymentTiming);
    });

    it('should map payment with inventory order details', async () => {
        const payment = {
            ...basePayment,
            inventoryOrderCode: '5000',
            paymentTiming: null,
            serviceOrderCode: null,
        };

        const [mappedPayment] = await mapPayments([payment]);

        expect(mappedPayment).to.have.property('orderCode').equal(payment.inventoryOrderCode);
        expect(mappedPayment).to.have.property('paymentTiming').equal(payment.paymentTiming);
    });

    it('should format totalAmount', async () => {
        const [mappedPayment] = await mapPayments([{...basePayment}]);

        expect(mappedPayment).to.have.property('totalAmount').equal(await formatCurrency(basePayment.totalAmount));
    });

    it('should set store name correctly', async () => {
        const [mappedPayment] = await mapPayments([{...basePayment}]);

        expect(mappedPayment).to.have.property('storeName').equal(basePayment.store.name);
    });
});
