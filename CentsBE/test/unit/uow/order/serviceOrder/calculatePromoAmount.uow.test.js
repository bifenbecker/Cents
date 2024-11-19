require('../../../../testHelper');
const calculatePromoAmount = require('../../../../../uow/order/serviceOrder/calculatePromoAmount');
const factory = require('../../../../factories');
const { expect } = require('../../../../support/chaiHelper');
const { createServicePayload } = require('../../../../support/serviceOrderTestHelper');
const { FACTORIES_NAMES: FN } = require('../../../../constants/factoriesNames');
const { ORDER_TYPES } = require('../../../../../constants/constants');

describe('test calculatePromoAmount UOW', () => {
    let store, laundromatBusiness;
    beforeEach(async () => {
        laundromatBusiness = await factory.create(FN.laundromatBusiness);
        store = await factory.create(FN.store, {
            businessId: laundromatBusiness.id,
        });
    });

    describe('fixed price discount', () => {
        describe('apply promo on specific items', () => {
            describe('promo for service items', () => {
                let promotion, promotionProgramItems, payload;
                beforeEach(async () => {
                    servicePayload = await createServicePayload(store);
                    const { serviceMaster } = servicePayload;
                    promotion = await factory.create(FN.promotion, {
                        businessId: laundromatBusiness.id,
                    });
                    promotionProgramItems = await factory.create(FN.promotionServiceItem, {
                        promotionItemId: serviceMaster.id,
                        businessPromotionProgramId: promotion.id,
                    });
                    payload = {
                        serviceOrderItems: [
                            {
                                serviceMasterId: serviceMaster.id,
                                lineItemType: ORDER_TYPES.SERVICE,
                                totalPrice: 10,
                            },
                        ],
                        promotionId: promotion.id,
                        orderItemsTotal: 10,
                    };
                });

                it('should not have orderPromotionAmount inside of promoDetails', async () => {
                    servicePayload = await createServicePayload(store);
                    const { serviceMaster } = servicePayload;

                    const serviceOrder = await factory.create(FN.serviceOrder, {
                        storeId: store.id,
                    });

                    const order = await factory.create(FN.order, {
                        orderableType: 'ServiceOrder',
                        orderableId: serviceOrder.id,
                        storeId: store.id,
                    });

                    factory.create(FN.promoDetails, {
                        orderId: order.id,
                        promoDetails: {
                            test: 'test'
                        }
                    })

                    payload = {
                        ...payload,
                        serviceOrderItems: [
                            {
                                serviceMasterId: serviceMaster.id,
                                lineItemType: ORDER_TYPES.SERVICE,
                                totalPrice: 10,
                            },
                        ],
                    };

                    const result = await calculatePromoAmount(payload);

                    expect(result).to.have.property('promotionAmount').equal(0);
                    expect(result.serviceOrderItems[0])
                        .to.have.property('promotionAmountInCents')
                        .to.equal(0);
                });

                it('should apply a discount of 5 on the item price', async () => {
                    const result = await calculatePromoAmount(payload);
                    expect(result).to.have.property('promotionAmount').to.equal(5);
                    expect(result.serviceOrderItems[0])
                        .to.have.property('promotionAmountInCents')
                        .to.equal(500);
                });

                it('should distribute the promo amount to the items according to the item price', async () => {
                    servicePayload = await createServicePayload(store);
                    promotionProgramItems = await factory.create(FN.promotionServiceItem, {
                        promotionItemId: servicePayload.serviceMaster.id,
                        businessPromotionProgramId: promotion.id,
                    });
                    payload.serviceOrderItems.push({
                        serviceMasterId: servicePayload.serviceMaster.id,
                        totalPrice: 20,
                    });
                    payload.orderItemsTotal = 30;
                    const result = await calculatePromoAmount(payload);
                    expect(result).to.have.property('promotionAmount').equal(5);
                    expect(result.serviceOrderItems[0])
                        .to.have.property('promotionAmountInCents')
                        .to.equal(167);
                    expect(result.serviceOrderItems[1])
                        .to.have.property('promotionAmountInCents')
                        .to.equal(333);
                });
            });
        });

        describe('apply promo on entire order', () => {
            let promotion, serviceItemsPayload, payload;
            beforeEach(async () => {
                serviceItemsPayload = await createServicePayload(store);
                const { servicePrice } = serviceItemsPayload;
                payload = {
                    serviceOrderItems: [
                        {
                            priceId: servicePrice.id,
                            category: 'PER_POUND',
                            lineItemType: 'MODIFIER',
                            count: 1,
                            weight: 1,
                        },
                    ],
                    orderItemsTotal: servicePrice.storePrice,
                };
            });

            it('should apply a discount of 5 on the order total', async () => {
                promotion = await factory.create(FN.entireOrderPromo);
                payload.promotionId = promotion.id;
                const result = await calculatePromoAmount(payload);
                expect(result).to.have.property('promotionAmount').to.equal(5);
            });

            it('should apply only the orderamount as promotion when promo amount is greater than order total', async () => {
                promotion = await factory.create(FN.entireOrderPromo, {
                    discountValue: 20,
                });
                payload.promotionId = promotion.id;
                const result = await calculatePromoAmount(payload);
                expect(result).to.have.property('promotionAmount').to.equal(10);
            });

            it('should not apply any promotion when promotionId is not sent', async () => {
                const result = await calculatePromoAmount(payload);
                expect(result).to.have.property('promotionAmount').to.equal(0);
            });
        });
    });

    describe('percentage discount', () => {
        describe('apply promo on specific items', () => {
            describe('promo for service items', () => {
                let promotion, promotionProgramItems, payload;
                beforeEach(async () => {
                    servicePayload = await createServicePayload(store);
                    const { serviceMaster, servicePrice } = servicePayload;
                    promotion = await factory.create(FN.promotion, {
                        businessId: laundromatBusiness.id,
                        promotionType: 'percentage-discount',
                    });
                    promotionProgramItems = await factory.create(FN.promotionServiceItem, {
                        promotionItemId: serviceMaster.id,
                        businessPromotionProgramId: promotion.id,
                    });
                    payload = {
                        serviceOrderItems: [
                            {
                                serviceMasterId: serviceMaster.id,
                                lineItemType: 'SERVICE',
                                totalPrice: 10,
                                price: 10,
                                priceId: servicePrice.id,
                            },
                        ],
                        promotionId: promotion.id,
                        orderItemsTotal: 10,
                    };
                });

                it('should apply a discount of 5% on the item price', async () => {
                    const result = await calculatePromoAmount(payload);
                    expect(result).to.have.property('promotionAmount').to.equal(0.5);
                    expect(result.serviceOrderItems[0])
                        .to.have.property('promotionAmountInCents')
                        .to.equal(50);
                });

                it('should distribute the promo amount to the items according to the item price', async () => {
                    servicePayload = await createServicePayload(store);
                    promotionProgramItems = await factory.create(FN.promotionServiceItem, {
                        promotionItemId: servicePayload.serviceMaster.id,
                        businessPromotionProgramId: promotion.id,
                    });
                    payload.serviceOrderItems.push({
                        serviceMasterId: servicePayload.serviceMaster.id,
                        totalPrice: 20,
                        price: 20,
                        priceId: servicePayload.servicePrice.id,
                    });
                    payload.orderItemsTotal = 30;
                    const result = await calculatePromoAmount(payload);
                    expect(result).to.have.property('promotionAmount').equal(1.5);
                    expect(result.serviceOrderItems[0])
                        .to.have.property('promotionAmountInCents')
                        .to.equal(50);
                    expect(result.serviceOrderItems[1])
                        .to.have.property('promotionAmountInCents')
                        .to.equal(100);
                });

                it('should apply the promotion amount only to the specific item', async () => {
                    servicePayload = await createServicePayload(store);
                    payload.serviceOrderItems.push({
                        serviceMasterId: servicePayload.serviceMaster.id,
                        price: 20,
                        totalPrice: 20,
                        priceId: servicePayload.servicePrice.id,
                    });
                    payload.orderItemsTotal = 30;
                    const result = await calculatePromoAmount(payload);
                    expect(result).to.have.property('promotionAmount').equal(0.5);
                    expect(result.serviceOrderItems[0])
                        .to.have.property('promotionAmountInCents')
                        .to.equal(50);
                    expect(result.serviceOrderItems[1])
                        .to.have.property('promotionAmountInCents')
                        .to.equal(0);
                });
            });
        });

        describe('apply promo on entire order', () => {
            let promotion, serviceItemsPayload, payload;
            beforeEach(async () => {
                serviceItemsPayload = await createServicePayload(store);
                const { servicePrice } = serviceItemsPayload;
                payload = {
                    serviceOrderItems: [
                        {
                            priceId: servicePrice.id,
                            category: 'FIXED_PRICE',
                            lineItemType: 'SERVICE',
                            count: 1,
                            weight: 1,
                        },
                    ],
                    orderItemsTotal: servicePrice.storePrice,
                };
            });

            it('should apply a discount of 5% on the order total', async () => {
                promotion = await factory.create(FN.entireOrderPromo, {
                    promotionType: 'percentage-discount',
                });
                payload.promotionId = promotion.id;
                const result = await calculatePromoAmount(payload);
                expect(result).to.have.property('promotionAmount').to.equal(0.5);
            });

            it('should not apply any promotion when promotionId is not sent', async () => {
                const result = await calculatePromoAmount(payload);
                expect(result).to.have.property('promotionAmount').to.equal(0);
            });
        });
    });

    describe('test promotion edge cases for service order', () => {
        let promotion, payload, servicePayload;
        beforeEach(async () => {
            servicePayload = await createServicePayload(store);
            const { serviceMaster, servicePrice } = servicePayload;
            promotion = await factory.create(FN.promotion, {
                businessId: laundromatBusiness.id,
                promotionType: 'percentage-discount',
            });
            promotionProgramItems = await factory.create(FN.promotionServiceItem, {
                promotionItemId: serviceMaster.id,
                businessPromotionProgramId: promotion.id,
            });
            payload = {
                serviceOrderItems: [
                    {
                        serviceMasterId: serviceMaster.id,
                        lineItemType: 'SERVICE',
                        totalPrice: 10,
                        priceId: servicePrice.id,
                    },
                ],
                promotionId: promotion.id,
                orderItemsTotal: 10,
            };
        });

        describe('with existing promotion', () => {
            let payload, promotion;
            beforeEach(async () => {
                const serviceOrder = await factory.create(FN.serviceOrder, {
                    promotionId: promotion.id,
                    promotionAmount: 10,
                });
                const serviceOrderItem = await factory.create(FN.serviceOrderItem, {
                    orderId: serviceOrder.id,
                    promotionAmountInCents: 10,
                });
                const serviceOrderReferenceItem = await factory.create(FN.serviceReferenceItem, {
                    orderItemId: serviceOrderItem.id,
                });
                payload = {
                    serviceOrderItems: [
                        {
                            serviceMasterId: serviceOrderReferenceItem.serviceId,
                            priceId: serviceOrderReferenceItem.servicePriceId,
                            totalPrice: 10,
                        },
                    ],
                    orderItemsTotal: 10,
                };
            });
        });

        it('should set the promotionAmount as 0 when promotionId is not sent for existing serviceOrder', async () => {
            delete payload.promotionId;

            const result = await calculatePromoAmount(payload);
            expect(result).to.have.property('promotionAmount').equal(0);
            expect(result.serviceOrderItems[0]).to.have.property('promotionAmountInCents').equal(0);
        });

        it('should apply the latest promotion when different promotion is applied for the service order', async () => {
            promotion = await factory.create(FN.entireOrderPromo, {
                businessId: laundromatBusiness.id,
                discountValue: 2,
            });
            payload.promotionId = promotion.id;
            const result = await calculatePromoAmount(payload);
            expect(result).to.have.property('promotionAmount').equal(2);
            expect(result.serviceOrderItems[0])
                .to.have.property('promotionAmountInCents')
                .equal(200);
        });
    });
});
