require('../../../../testHelper');
const sinon = require('sinon');
const { expect } = require('../../../../support/chaiHelper');
const factory = require('../../../../factories');
const updateServiceOrderTotals = require('../../../../../uow/delivery/pickup/updateServiceOrderTotals');
const {
    createUserWithBusinessAndCustomerOrders,
} = require('../../../../support/factoryCreators/createUserWithBusinessAndCustomerOrders');
const BusinessSettings = require('../../../../../models/businessSettings');
const ServiceOrder = require('../../../../../models/serviceOrders');
const { FACTORIES_NAMES: FN } = require('../../../../constants/factoriesNames');
const { paymentStatuses } = require('../../../../../constants/constants');

describe('test updateServiceOrderTotals UoW', () => {
    describe('should return valid payload', () => {
        it('without convenienceFeeId and the need to pay', async () => {
            const { store, serviceOrder } = await createUserWithBusinessAndCustomerOrders(
                { createPartnerSubsidiary: false, createBusinessPromotionPrograms: false },
                { serviceOrder: { balanceDue: 0, netOrderTotal: 0 } },
            );
            const orderDelivery = {};
            const payload = { orderDelivery, serviceOrder, itemsTotal: 0, storeId: store.id };

            // call UoW
            const newPayload = await updateServiceOrderTotals(payload);

            // assert
            expect(newPayload).have.property('serviceOrder');
            expect(newPayload.serviceOrder).have.property('orderTotal', 0);
            expect(newPayload.serviceOrder).have.property('netOrderTotal', 0);
            expect(newPayload.serviceOrder).have.property('convenienceFee', 0);
            expect(newPayload.serviceOrder).have.property('balanceDue', 0);
            expect(newPayload.serviceOrder).have.property('paymentStatus', paymentStatuses.PAID);
            expect(newPayload.serviceOrder).have.property('pickupDeliveryFee', 0);
            expect(newPayload.serviceOrder).have.property('pickupDeliveryTip', 0);
            expect(newPayload.serviceOrder).have.property('returnDeliveryFee', 0);
            expect(newPayload.serviceOrder).have.property('returnDeliveryTip', 0);
            expect(newPayload.serviceOrder).have.property('convenienceFeeId', null);
        });

        it('with convenienceFeeId and shipping fees', async () => {
            const pickupCourierTip = 1;
            const pickupTotalDeliveryCost = 5;
            const deliveryCourierTip = 2;
            const deliveryTotalDeliveryCost = 6;
            const itemsTotal = 7;

            const { store, serviceOrder, laundromatBusiness } =
                await createUserWithBusinessAndCustomerOrders();
            await BusinessSettings.query()
                .patch({ hasConvenienceFee: true })
                .where({ businessId: laundromatBusiness.id });
            const convenienceFee = await factory.create(FN.convenienceFee, {
                businessId: laundromatBusiness.id,
            });
            const orderDelivery = {
                pickup: {
                    courierTip: pickupCourierTip,
                    totalDeliveryCost: pickupTotalDeliveryCost,
                },
                delivery: {
                    courierTip: deliveryCourierTip,
                    totalDeliveryCost: deliveryTotalDeliveryCost,
                },
            };
            const payload = { orderDelivery, serviceOrder, itemsTotal, storeId: store.id };

            // call UoW
            const newPayload = await updateServiceOrderTotals(payload);

            // assert
            expect(newPayload)
                .have.property('serviceOrder')
                .have.property('orderTotal', itemsTotal);
            expect(newPayload.serviceOrder).have.property(
                'paymentStatus',
                paymentStatuses.BALANCE_DUE,
            );
            expect(newPayload.serviceOrder).have.property('convenienceFee');
            expect(newPayload.serviceOrder).have.property(
                'netOrderTotal',
                newPayload.serviceOrder.balanceDue,
            );
            expect(newPayload.serviceOrder).have.property(
                'balanceDue',
                Number(
                    Number(
                        newPayload.serviceOrder.convenienceFee +
                            serviceOrder.balanceDue +
                            payload.itemsTotal +
                            orderDelivery.pickup.courierTip +
                            orderDelivery.pickup.totalDeliveryCost +
                            orderDelivery.delivery.courierTip +
                            orderDelivery.delivery.totalDeliveryCost,
                    ).toFixed(2),
                ),
            );
            expect(newPayload.serviceOrder).have.property(
                'pickupDeliveryFee',
                pickupTotalDeliveryCost,
            );
            expect(newPayload.serviceOrder).have.property('pickupDeliveryTip', pickupCourierTip);
            expect(newPayload.serviceOrder).have.property(
                'returnDeliveryFee',
                deliveryTotalDeliveryCost,
            );
            expect(newPayload.serviceOrder).have.property('returnDeliveryTip', deliveryCourierTip);
            expect(newPayload.serviceOrder).have.property('convenienceFeeId', convenienceFee.id);
        });
    });

    it('should throw Error', async () => {
        const errorMessage = 'Unprovided error!';
        const { store, serviceOrder } = await createUserWithBusinessAndCustomerOrders(
            { createPartnerSubsidiary: false, createBusinessPromotionPrograms: false },
            { serviceOrder: { balanceDue: 0, netOrderTotal: 0 } },
        );
        const orderDelivery = {};
        const payload = { orderDelivery, serviceOrder, itemsTotal: 0, storeId: store.id };
        sinon.stub(ServiceOrder, 'query').callsFake(() => {
            throw new Error(errorMessage);
        });

        // assert
        await expect(updateServiceOrderTotals(payload)).to.be.rejectedWith(errorMessage);
    });
});
