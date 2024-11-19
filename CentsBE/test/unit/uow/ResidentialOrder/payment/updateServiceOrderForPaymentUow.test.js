require('../../../../testHelper');
const { expect } = require('../../../../support/chaiHelper');
const {
    createUserWithBusinessAndCustomerOrders,
} = require('../../../../support/factoryCreators/createUserWithBusinessAndCustomerOrders');
const updateServiceOrderForPaymentUow = require('../../../../../uow/ResidentialOrder/payment/updateServiceOrderForPaymentUow');
const { paymentStatuses } = require('../../../../../constants/constants');

let entities;
describe('test updateServiceOrderForPayment UoW', () => {
    describe('should return valid newPayload', () => {
        beforeEach(async () => {
            const { serviceOrder } = await createUserWithBusinessAndCustomerOrders({
                createPartnerSubsidiary: true,
            });
            entities = {
                payload: { serviceOrder },
            };
        });

        it('when have balance due', async () => {
            // call Uow
            const {
                payload,
                payload: { serviceOrder },
            } = entities;
            const paymentAmount = serviceOrder.balanceDue / 2;
            const newPayload = await updateServiceOrderForPaymentUow({
                paymentModel: { totalAmount: paymentAmount },
                ...payload,
            });

            // assert
            expect(newPayload, 'with serviceOrder property').to.have.property('serviceOrder');
            expect(newPayload.serviceOrder.balanceDue, 'with correct balanceDue').equals(
                payload.serviceOrder.balanceDue - paymentAmount,
            );
            expect(newPayload.serviceOrder.paymentStatus, 'with correct paymentStatus').equals(
                paymentStatuses.BALANCE_DUE,
            );
        });

        it('when fully paid', async () => {
            // call Uow
            const {
                payload,
                payload: { serviceOrder },
            } = entities;
            const newPayload = await updateServiceOrderForPaymentUow({
                paymentModel: { totalAmount: serviceOrder.balanceDue },
                ...payload,
            });

            // assert
            expect(newPayload, 'with serviceOrder property').to.have.property('serviceOrder');
            expect(newPayload.serviceOrder.balanceDue, 'with correct balanceDue').equals(0);
            expect(newPayload.serviceOrder.paymentStatus, 'with correct paymentStatus').equals(
                paymentStatuses.PAID,
            );
        });
    });
});
