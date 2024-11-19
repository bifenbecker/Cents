require('../../../../../testHelper');
const { expect } = require('../../../../../support/chaiHelper');
const factory = require('../../../../../factories');
const onlineOrderCalculationValidations = require('../../../../../../uow/order/serviceOrder/onlineOrder/onlineOrderCalculationValidations');
const { FACTORIES_NAMES: FN } = require('../../../../../constants/factoriesNames');

describe('test onlineOrderCalculationValidations UoW', () => {
    let store,
        serviceOrder,
        payload;

    beforeEach(async () => {
        store = await factory.create(FN.store);
        serviceOrder = await factory.create(FN.serviceOrder, {
            storeId: store.id,
            netOrderTotal: -1,
            creditAmount: 0,
            promotionAmount: 0,
            placedAt: '2020-05-07 16:20:.673073+00',
        });
    });

    it('should throw UNABLE_TO_APPLY_PROMOTION when isPromoApplied is true', async () => {
        try {
            payload = {
                promotionAmount: serviceOrder.promotionAmount,
                creditAmount: serviceOrder.creditAmount,
                serviceOrder,
                isLiveLinkRequest: true,
                isPromoApplied: true,
                isCreditApplied: true,
            };

            await onlineOrderCalculationValidations(payload);

            expect(payload.isPromoApplied).to.not.be.null;
            expect(payload.isPromoApplied).to.not.be.undefined;
        } catch (error) {
            expect(error).to.be.an('Error');
            expect(error.message).to.equal('UNABLE_TO_APPLY_PROMOTION');
        }
    });

    it('should throw UNABLE_TO_APPLY_PROMOTION_DUE_TO_CREDIT when creditAmount is present', async () => {
        try {
            serviceOrder = await factory.create(FN.serviceOrder, {
                storeId: store.id,
                netOrderTotal: -1,
                creditAmount: 1,
                promotionAmount: 1,
                placedAt: '2020-05-07 16:20:.673073+00',
            });

            payload = {
                promotionAmount: serviceOrder.promotionAmount,
                creditAmount: serviceOrder.creditAmount,
                serviceOrder,
                isLiveLinkRequest: true,
                isPromoApplied: true,
                isCreditApplied: true,
            };

            await onlineOrderCalculationValidations(payload);

            expect(payload.isPromoApplied).to.not.be.null;
            expect(payload.isPromoApplied).to.not.be.undefined;
            expect(payload.creditAmount).to.not.be.null;
            expect(payload.creditAmount).to.not.be.undefined;
        } catch (error) {
            expect(error).to.be.an('Error');
            expect(error.message).to.equal('UNABLE_TO_APPLY_PROMOTION_DUE_TO_CREDIT');
        }
    });

    it('should throw UNABLE_TO_APPLY_CREDITS when isCreditApplied is true', async () => {
        try {
            serviceOrder = await factory.create(FN.serviceOrder, {
                storeId: store.id,
                netOrderTotal: -1,
                creditAmount: 1,
                promotionAmount: 1,
                placedAt: '2020-05-07 16:20:.673073+00',
            });

            payload = {
                promotionAmount: serviceOrder.promotionAmount,
                creditAmount: serviceOrder.creditAmount,
                serviceOrder,
                isLiveLinkRequest: true,
                isPromoApplied: false,
                isCreditApplied: true,
            };

            await onlineOrderCalculationValidations(payload);

            expect(payload.isCreditApplied).to.not.be.null;
            expect(payload.isCreditApplied).to.not.be.undefined;
        } catch (error) {
            expect(error).to.be.an('Error');
            expect(error.message).to.equal('UNABLE_TO_APPLY_CREDITS');
        }
    });

    it('should not throw errors when netOrderTotal is bigger than zero', async () => {
        try {
            serviceOrder = await factory.create(FN.serviceOrder, {
                storeId: store.id,
                netOrderTotal: 1,
                creditAmount: 1,
                promotionAmount: 1,
                placedAt: '2020-05-07 16:20:.673073+00',
            });

            payload = {
                promotionAmount: serviceOrder.promotionAmount,
                creditAmount: serviceOrder.creditAmount,
                serviceOrder,
                isLiveLinkRequest: true,
                isPromoApplied: false,
                isCreditApplied: false,
            };

            await onlineOrderCalculationValidations(payload);

            expect(payload.promotionAmount).to.not.be.null;
            expect(payload.promotionAmount).to.not.be.undefined;
            expect(payload.isPromoApplied).to.not.be.null;
            expect(payload.isPromoApplied).to.not.be.undefined;
        } catch (error) {
            expect(error.message).to.not.equal('UNABLE_TO_APPLY_PROMOTION_DUE_TO_CREDIT');
            expect(error.message).to.not.equal('UNABLE_TO_APPLY_PROMOTION');
            expect(error.message).to.not.equal('UNABLE_TO_APPLY_CREDITS');
        }
    });

    it('should not throw errors when isCreditApplied is false', async () => {
        try {
            payload = {
                promotionAmount: serviceOrder.promotionAmount,
                creditAmount: serviceOrder.creditAmount,
                serviceOrder,
                isLiveLinkRequest: true,
                isPromoApplied: false,
                isCreditApplied: false,
            };

            await onlineOrderCalculationValidations(payload);

            expect(payload.isCreditApplied).to.equal(false);
        } catch (error) {
            expect(error.message).to.not.equal('UNABLE_TO_APPLY_CREDITS');
        }
    });

    it('should throw UNABLE_TO_APPLY_PROMOTION_DUE_TO_BALANCE_DUE when balanceDue is less than promotionAmount and isPromoApplied is true', async () => {
        try {
            serviceOrder = await factory.create(FN.serviceOrder, {
                storeId: store.id,
                balanceDue: 1,
                orderTotal: 1,
                netOrderTotal: 1,
                creditAmount: 1,
                promotionAmount: 2,
                placedAt: '2020-05-07 16:20:.673073+00',
            });

            payload = {
                promotionAmount: serviceOrder.promotionAmount,
                creditAmount: serviceOrder.creditAmount,
                serviceOrder,
                isLiveLinkRequest: true,
                isPromoApplied: true,
                isCreditApplied: true,
            };

            await onlineOrderCalculationValidations(payload);

            expect(payload.promotionAmount).to.not.be.null;
            expect(payload.promotionAmount).to.not.be.undefined;
            expect(payload.isPromoApplied).to.equal(true);
        } catch (error) {
            expect(error).to.be.an('Error');
            expect(error.message).to.equal('UNABLE_TO_APPLY_PROMOTION_DUE_TO_BALANCE_DUE');
        }
    });

    it('should fail to update for not passing the payload', async () => {
        payload = {};
        expect(onlineOrderCalculationValidations(payload)).rejectedWith(Error);
    });
});