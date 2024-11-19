require('../../../testHelper');
const { expect } = require('../../../support/chaiHelper');
const factory = require('../../../factories');
const {
    createUserWithBusinessAndCustomerOrders,
} = require('../../../support/factoryCreators/createUserWithBusinessAndCustomerOrders');
const createServiceOrder = require('../../../../uow/order/createServiceOrder');
const BusinessOrderCount = require('../../../../models/businessOrderCount');
const { paymentTimings } = require('../../../../constants/constants');
const { MAX_DB_INTEGER } = require('../../../constants/dbValues');

describe('test createServiceOrder UoW', () => {
    describe('should return valid payload', () => {
        let entities;

        beforeEach(async () => {
            entities = await createUserWithBusinessAndCustomerOrders({
                createBusinessPromotionPrograms: true,
            });
        });

        const defaultAssert = (newPayload) => {
            const { serviceOrder } = entities;
            expect(newPayload.serviceOrder.id, 'should create new serviceOrder').not.equals(
                serviceOrder.id,
            );
            expect(newPayload.serviceOrder.activityLog).to.have.property(
                'status',
                serviceOrder.status,
            );
            expect(newPayload.serviceOrder.activityLog).to.have.property('origin', 'origin');
            expect(newPayload.serviceOrder).to.have.keys([
                'activityLog',
                'balanceDue',
                'completedAt',
                'convenienceFee',
                'convenienceFeeId',
                'createdAt',
                'creditAmount',
                'employeeCode',
                'hubId',
                'hasDryCleaning',
                'id',
                'isAdjusted',
                'isBagTrackingEnabled',
                'isProcessedAtHub',
                'netOrderTotal',
                'notes',
                'orderCode',
                'orderTotal',
                'orderType',
                'paymentStatus',
                'paymentTiming',
                'paymentToken',
                'pickupDeliveryFee',
                'pickupDeliveryTip',
                'placedAt',
                'promotionAmount',
                'promotionId',
                'rack',
                'rating',
                'recurringDiscountInCents',
                'refundableAmount',
                'returnDeliveryFee',
                'returnDeliveryTip',
                'returnMethod',
                'status',
                'storeCustomerId',
                'storeId',
                'taxAmountInCents',
                'tierId',
                'tipAmount',
                'tipOption',
                'turnAroundInHours',
                'turnAroundInHoursSetManually',
                'uniqueOrderId',
                'updatedAt',
                'userId',
                'uuid',
            ]);
        };

        it('with paymentTiming', async () => {
            const {
                serviceOrder,
                laundromatBusiness: { id: businessId },
            } = entities;
            await BusinessOrderCount.query().insert({
                businessId,
                totalOrders: 1,
            });

            // call Uow
            const newPayload = await createServiceOrder({
                ...serviceOrder,
                businessId,
                origin: 'origin',
            });

            // assert
            defaultAssert(newPayload);
            const { totalOrders } = await BusinessOrderCount.query().findOne({
                businessId,
            });
            expect(totalOrders, 'should update BusinessOrderCount').equals(2);
        });

        it('with promotionId', async () => {
            const {
                serviceOrder,
                laundromatBusiness: { id: businessId },
                businessPromotionPrograms,
            } = entities;

            // call Uow
            const newPayload = await createServiceOrder({
                ...serviceOrder,
                businessId,
                promotion: businessPromotionPrograms,
                origin: 'origin',
            });

            // assert
            defaultAssert(newPayload);
            expect(newPayload.serviceOrder.promotionId, 'should have promotionId').equals(
                businessPromotionPrograms.id,
            );
        });

        it('with notes', async () => {
            const {
                serviceOrder,
                laundromatBusiness: { id: businessId },
            } = entities;
            delete serviceOrder.paymentTiming;
            const customNotes = 'customNotes';

            // call Uow
            const newPayload = await createServiceOrder({
                ...serviceOrder,
                businessId,
                origin: 'origin',
                orderNotes: customNotes,
            });

            // assert
            defaultAssert(newPayload);
            expect(
                newPayload.serviceOrder.activityLog.notes,
                'should have correct notes in status',
            ).equals(customNotes);
            expect(
                newPayload.serviceOrder.notes,
                'should have correct notes in serviceOrder',
            ).equals(customNotes);
        });

        it('without paymentTiming', async () => {
            const {
                serviceOrder,
                laundromatBusiness: { id: businessId },
            } = entities;
            delete serviceOrder.paymentTiming;

            // call Uow
            const newPayload = await createServiceOrder({
                ...serviceOrder,
                businessId,
                origin: 'origin',
            });

            // assert
            defaultAssert(newPayload);
            expect(
                newPayload.serviceOrder.paymentTiming,
                'should have correct paymentTiming',
            ).equals(paymentTimings['POST-PAY']);
        });
    });

    it('should throw Error with invalid payload', async () => {
        await expect(
            createServiceOrder({
                storeId: MAX_DB_INTEGER,
                centsCustomer: { id: MAX_DB_INTEGER },
            }),
        ).to.be.rejected;
    });

    describe('Dry Cleaning tests', () => {
        let payload;

        beforeEach(async () => {
            const business = await factory.create('laundromatBusiness');
            const store = await factory.create('store', { businessId: business.id });

            const centsCustomer = await factory.create('centsCustomer');
            const storeCustomer = await factory.create('storeCustomer', {
                centsCustomerId: centsCustomer.id,
                storeId: store.id,
                businessId: store.businessId,
            });
            payload = {
                storeCustomerId: storeCustomer.id,
                hubId: null,
                storeId: store.id,
                orderNotes: null,
                businessId: business.id,
                status: 'SUBMITTED',
                orderType: 'ONLINE',
                isProcessedAtHub: false,
                isBagTrackingEnabled: false,
                paymentTiming: 'POST-PAY',
                promotion: null,
                returnMethod: '',
                tierId: null,
                turnAroundInHours: 24,
            };
        });

        it('should be able to create a service order with order count', async () => {
            const result = await createServiceOrder(payload);
            expect(result.serviceOrder).to.have.property('id');
            expect(result.serviceOrder).to.have.property('orderCode').equal('1001');
            expect(result.serviceOrder.hasDryCleaning).to.be.false;
        });

        it('should be able to create a service order with hasDryCleaning as true', async () => {
            payload.hasDryCleaning = true;
            const result = await createServiceOrder(payload);
            expect(result.serviceOrder).to.have.property('id');
            expect(result.serviceOrder).to.have.property('orderCode').equal('1001');
            expect(result.serviceOrder).to.have.property('turnAroundInHours').equal(24);
            expect(result.serviceOrder.hasDryCleaning).to.be.true;
        });
    });
});
