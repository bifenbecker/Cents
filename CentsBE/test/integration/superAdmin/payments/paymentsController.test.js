const {
    itShouldCorrectlyAssertTokenPresense,
    assertGetResponseSuccess,
    assertGetResponseError,
} = require('../../../support/httpRequestsHelper');
const { expect } = require('../../../support/chaiHelper');
const factory = require('../../../factories');
const { generateToken } = require('../../../support/apiTestHelper');
const { FACTORIES_NAMES: FN } = require('../../../constants/factoriesNames');
const { ORDERABLE_TYPES } = require('../../../../constants/constants');

describe('test super admin payments controller', () => {
    describe('Get all payments in the Cents ecosystem', () => {
        let token;
        const url = '/api/v1/super-admin/payments';
        
        beforeEach(async () => {
            const superAdmin = await factory.create(FN.userWithSuperAdminRole);

            const inventoryOrder = await factory.create(FN.inventoryOrder, {
                netOrderTotal: 40,
                creditAmount: 60,
                orderCode: 1000,
            });

            const serviceOrder = await factory.create(FN.serviceOrder, {
                paymentTiming: 'POST-PAY',
                orderCode: 1001,
            });

            const inventoryOrderMaster = await factory.create(FN.inventoryOrderMasterOrder, {
                orderableId: inventoryOrder.id,
                orderableType: ORDERABLE_TYPES.INVENTORY_ORDER,
            });

            const serviceOrderMaster = await factory.create(FN.serviceOrderMasterOrder, {
                orderableId: serviceOrder.id,
                orderableType: ORDERABLE_TYPES.SERVICE_ORDER,
            });

            for(let i = 1; i <= 22; i++) {
                await factory.create(FN.payment, {
                    orderId: i < 12 ? inventoryOrderMaster.id : serviceOrderMaster.id,
                });
            }

            token = generateToken({ id: superAdmin.id });
        });

        itShouldCorrectlyAssertTokenPresense(assertGetResponseError, () => url);

        it('should return the payments and total count', async () => {
            const { body } = await assertGetResponseSuccess({
                url,
                token,
            });

            expect(body).to.have.property('success').to.be.true;
            expect(body).to.have.property('total').equal(22);
            expect(body).to.have.property('payments');
        });

        it('should return payments for a specific page', async () => {
            const pageNumber = 1;

            const { body } = await assertGetResponseSuccess({
                url: `${url}?pageNumber=${pageNumber}`,
                token,
            });

            expect(body).to.have.property('total').equal(22);
            expect(body.payments.length).to.equal(2);
        });

        it('should return matching payments with a specific orderCode from query param', async () => {
            const searchTerm = '1001';

            const { body } = await assertGetResponseSuccess({
                url: `${url}?searchTerm=${searchTerm}`,
                token,
            });

            expect(body).to.have.property('total').equal(11);
            expect(body.payments.length).to.equal(11);
        });
    });

    describe('Get payment details', () => {
        let token, payment, serviceOrder;
        const getApiEndpoint = (paymentId) => {
            return `/api/v1/super-admin/payments/${paymentId}`;
        };
        
        beforeEach(async () => {
            const superAdmin = await factory.create(FN.userWithSuperAdminRole);

            serviceOrder = await factory.create(FN.serviceOrder, {
                paymentTiming: 'POST-PAY',
                orderCode: 1001,
            });

            const serviceOrderMaster = await factory.create(FN.serviceOrderMasterOrder, {
                orderableId: serviceOrder.id,
                orderableType: ORDERABLE_TYPES.SERVICE_ORDER,
            });

            payment = await factory.create(FN.payment, {
                orderId: serviceOrderMaster.id,
            });

            token = generateToken({ id: superAdmin.id });
        });

        itShouldCorrectlyAssertTokenPresense(assertGetResponseError, () => getApiEndpoint(payment.id));

        it('should return certain payment details by id', async () => {
            const { body } = await assertGetResponseSuccess({
                url: getApiEndpoint(payment.id),
                token,
            });

            expect(body).to.have.property('success').to.be.true;
            expect(body.payment).to.have.property('id').equal(payment.id);
            expect(body.payment.order).to.have.property('id').equal(serviceOrder.id);
        });
    });
});
