require('../../../../testHelper');
const { expect } = require('../../../../support/chaiHelper');
const factory = require('../../../../factories');
const adjustServiceOrderPipeline = require('../../../../../pipeline/employeeApp/serviceOrder/adjustServiceOrderPipeline');
const { FACTORIES_NAMES: FN } = require('../../../../constants/factoriesNames');
const { createServicePayload } = require('../../../../support/serviceOrderTestHelper');
const {
    getServiceOrderAndCustomerDetails,
} = require('../../../../../utils/addOrderCustomerAndEmployee');
const StoreSettings = require('../../../../../models/storeSettings');

describe('test adjustServiceOrderPipeline', () => {
    it('should return expected result', async () => {
        const business = await factory.create(FN.laundromatBusiness);
        const store = await factory.create(FN.store, {
            businessId: business.id,
        });
        const storeSettings = await StoreSettings.query().findOne({ storeId: store.id });
        const storeCustomer = await factory.create(FN.storeCustomer, {
            storeId: store.id,
            businessId: business.id,
        });
        const serviceOrder = await factory.create(FN.serviceOrder, {
            storeId: store.id,
            netOrderTotal: 100,
            balanceDue: 20,
            orderTotal: 20,
            paymentToken: 'cash',
        });
        const order = await factory.create(FN.order, {
            orderableId: serviceOrder.id,
            orderableType: 'ServiceOrder',
        });
        const serviceOrderWeight = await factory.create(FN.serviceOrderWeight, {
            serviceOrderId: serviceOrder.id,
            step: 1,
            totalWeight: 5,
            chargeableWeight: 5,
        });
        const convenienceFee = await factory.create(FN.convenienceFee, {
            businessId: store.businessId,
        });

        const { servicePrice, serviceModifier } = await createServicePayload(store);
        const details = await getServiceOrderAndCustomerDetails(order.id);

        const payload = {
            id: serviceOrder.id,
            serviceOrderId: serviceOrder.id,
            store: {
                id: store.id,
                businessId: store.businessId,
                laundromatBusiness: { id: business.id },
                settings: { requiresEmployeeCode: storeSettings.requiresEmployeeCode },
            },
            customer: storeCustomer,
            serviceOrder: serviceOrder,
            promotionId: serviceOrder.promotionId,
            totalWeight: serviceOrderWeight.totalWeight,
            orderType: 'ServiceOrder',
            convenienceFeeId: convenienceFee.id,
            currentOrderDetails: { ...details },
            chargeableWeight: 1,
            storeId: store.id,
            orderId: order.id,
            tipAmount: serviceOrder.tipAmount,
            orderItems: [
                {
                    priceId: servicePrice.id,
                    category: 'PER_POUND',
                    pricingType: 'PER_POUND',
                    lineItemType: 'SERVICE',
                    count: 1,
                    weight: 5,
                    serviceModifierIds: [serviceModifier.id],
                    turnAroundInHours: 24,
                },
            ],
        };

        const result = await adjustServiceOrderPipeline(payload);

        expect(result.completedAt).to.be.a.dateString();
        expect(result.convenienceFeeId).to.eq(convenienceFee.id);
        expect(result.convenienceFeePercentage).to.eq(convenienceFee.fee);
        expect(result.deliveries.length).to.eq(0);
        expect(result.fullName).to.equal(`${storeCustomer.firstName} ${storeCustomer.lastName}`);
        expect(result.hasDryCleaning).to.be.false;
        expect(result.isBagTrackingEnabled).to.be.false;
        expect(result.isProcessedAtHub).to.be.false;
        expect(result.isTaxable).to.be.true;
        expect(result.notificationLogs.length).to.eq(0);

        expect(result.orderableId).to.eq(order.orderableId);
        expect(result.orderId).to.eq(order.id);
        expect(result.storeId).to.eq(store.id);
        expect(result.orderableType).to.eq(order.orderableType);
        expect(result.orderItems.length).to.eq(1);
        expect(result.status).to.eq(serviceOrder.status);
        expect(result.paymentStatus).to.eq(serviceOrder.paymentStatus);
        expect(result.paymentTiming).to.eq(details.paymentTiming);

        expect(result).to.include.all.keys(
            'activityLog',
            'bagCount',
            'balanceDue',
            'canCancel',
            'changeDue',
            'creditAmount',
            'creditApplied',
            'delivery',
            'deliveryId',
            'deliveryReminderText',
            'hubId',
            'hub',
            'hubAddress',
            'hubName',
            'pickupDeliveryFee',
            'pickupDeliveryTip',
        );
    });

    it('should be rejected with an error if passed payload with incorrect data', async () => {
        await expect(adjustServiceOrderPipeline()).to.be.rejected;
        await expect(adjustServiceOrderPipeline(null)).to.be.rejected;
        await expect(adjustServiceOrderPipeline({})).to.be.rejected;
    });
});
