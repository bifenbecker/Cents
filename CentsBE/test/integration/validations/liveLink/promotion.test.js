require('../../../testHelper');
const {
    createMiddlewareMockedArgs,
} = require('../../../support/mockers/createMiddlewareMockedArgs');
const { expect } = require('../../../support/chaiHelper');
const factory = require('../../../factories');
const validatePromotion = require('../../../../validations/liveLink/promotion');
const ServiceOrder = require('../../../../models/serviceOrders');
const { FACTORIES_NAMES: FN } = require('../../../constants/factoriesNames');

async function checkForResponseError({ body, statusCode, constants = {} }) {
    const { mockedReq, mockedRes, mockedNext } = createMiddlewareMockedArgs({
        body,
    });
    mockedReq.constants = constants;
    await validatePromotion(mockedReq, mockedRes, mockedNext);

    expect(mockedRes.status.calledWith(statusCode), `status should be ${statusCode}`).to.be.true;
    expect(mockedRes.json.getCall(0).args[0]).to.have.property('error');
}

async function checkForSuccessValidation({ body, constants = {}, ...args }) {
    const { mockedReq, mockedRes, mockedNext } = createMiddlewareMockedArgs({
        body,
    });
    mockedReq.constants = constants;
    await validatePromotion(mockedReq, mockedRes, mockedNext);

    expect(mockedNext.called, 'should call next()').to.be.true;
    expect(mockedNext.getCall(0).args, 'should call next() without error in args').to.be.an('array')
        .that.is.empty;
    if (args.tipAmount) {
        expect(mockedReq.constants.orderCalculationAttributes.tipAmount)
            .to.be.a('number')
            .to.be.equal(args.tipAmount);
    }
}

describe('test validatePromotion validation', () => {
    it('should return 409 status if order has promotionId', async () => {
        const promotion = await factory.create(FN.promotion);
        const body = {
            promoCode: promotion.name,
        };
        const serviceOrder = await factory.create(FN.serviceOrder, {
            promotionId: promotion.id,
        });
        const orderDB = await ServiceOrder.query().findById(serviceOrder.id);
        const constants = {
            order: orderDB,
        };
        await checkForResponseError({
            body,
            constants,
            statusCode: 409,
        });
    });

    it('should return 409 status if orderType is not "ONLINE" and balanceDue is 0 or paymentStatus is "PAID"', async () => {
        const promotion = await factory.create(FN.promotion);
        const body = {
            promoCode: promotion.name,
        };
        const serviceOrder = await factory.create(FN.serviceOrder, {
            netOrderTotal: 0,
        });
        const orderDB = await ServiceOrder.query().findById(serviceOrder.id);
        const constants = {
            order: orderDB,
        };
        await checkForResponseError({
            body,
            constants,
            statusCode: 409,
        });
    });

    it('should return 404 status if does not exist PromotionProgram instance', async () => {
        const promotion = await factory.create(FN.promotion);
        const body = {
            promoCode: 'invalid promo',
        };
        const serviceOrder = await factory.create(FN.serviceOrder, {
            orderType: 'ONLINE',
        });
        const orderDB = await ServiceOrder.query().findById(serviceOrder.id);
        const constants = {
            order: {
                ...orderDB,
                businessId: promotion.businessId,
            },
        };
        await checkForResponseError({
            body,
            constants,
            statusCode: 404,
        });
    });

    it('should return 422 status if Promotion is invalid', async () => {
        const promotion = await factory.create(FN.promotion);
        const body = {
            promoCode: promotion.name,
        };
        const serviceOrder = await factory.create(FN.serviceOrder, {
            orderType: 'ONLINE',
        });
        const orderDB = await ServiceOrder.query().findById(serviceOrder.id);
        const constants = {
            order: {
                ...orderDB,
                businessId: promotion.businessId,
            },
        };
        await checkForResponseError({
            body,
            constants,
            statusCode: 422,
        });
    });

    it('success validation', async () => {
        const daysOfWeek = [
            'sunday',
            'monday',
            'tuesday',
            'wednesday',
            'thursday',
            'friday',
            'saturday',
        ];

        const promotion = await factory.create(FN.promotion, {
            active: true,
            appliesToType: 'entire-order',
            customerRedemptionLimit: 0,
            activeDays: JSON.stringify(
                daysOfWeek.map((day) => {
                    return { day };
                }),
            ),
        });
        const serviceOrder = await factory.create(FN.serviceOrder, {
            orderType: 'ONLINE',
        });
        const serviceOrderItem = await factory.create(FN.serviceOrderItem, {
            orderId: serviceOrder.id,
        });
        const serviceReferenceItem = await factory.create(FN.serviceReferenceItem, {
            orderItemId: serviceOrderItem.id,
        });
        const serviceReferenceItemDetails = await factory.create(
            'serviceReferenceItemDetailForServicePrices',
            {
                serviceReferenceItemId: serviceReferenceItem.id,
            },
        );
        const servicePrice = await factory.create(FN.servicePrice, {
            storeId: serviceOrder.storeId,
        });
        const inventoryItems = await factory.create(FN.inventoryItem, {
            storeId: serviceOrder.storeId,
        });
        const centsCustomer = await factory.create(FN.centsCustomer);
        const body = {
            promoCode: promotion.name,
        };

        const orderDB = await ServiceOrder.query().findById(serviceOrder.id);
        const constants = {
            order: {
                ...orderDB,
                businessId: promotion.businessId,
                centsCustomerId: centsCustomer.id,
            },
            orderCalculationAttributes: {},
        };
        await checkForSuccessValidation({
            body,
            constants,
        });
    });

    it('should replace "$" in tipAmount if tipOption is not empty', async () => {
        const daysOfWeek = [
            'sunday',
            'monday',
            'tuesday',
            'wednesday',
            'thursday',
            'friday',
            'saturday',
        ];
        const tipAmount = 10;
        const promotion = await factory.create(FN.promotion, {
            active: true,
            appliesToType: 'entire-order',
            customerRedemptionLimit: 0,
            activeDays: JSON.stringify(
                daysOfWeek.map((day) => {
                    return { day };
                }),
            ),
        });
        const serviceOrder = await factory.create(FN.serviceOrder, {
            orderType: 'ONLINE',
        });
        const serviceOrderItem = await factory.create(FN.serviceOrderItem, {
            orderId: serviceOrder.id,
        });
        const serviceReferenceItem = await factory.create(FN.serviceReferenceItem, {
            orderItemId: serviceOrderItem.id,
        });
        const serviceReferenceItemDetails = await factory.create(
            'serviceReferenceItemDetailForServicePrices',
            {
                serviceReferenceItemId: serviceReferenceItem.id,
            },
        );
        const servicePrice = await factory.create(FN.servicePrice, {
            storeId: serviceOrder.storeId,
        });
        const inventoryItems = await factory.create(FN.inventoryItem, {
            storeId: serviceOrder.storeId,
        });
        const centsCustomer = await factory.create(FN.centsCustomer);
        const body = {
            promoCode: promotion.name,
        };

        const orderDB = await ServiceOrder.query().findById(serviceOrder.id);
        const constants = {
            order: {
                ...orderDB,
                businessId: promotion.businessId,
                centsCustomerId: centsCustomer.id,
                previousTipOption: `${tipAmount}$`,
            },
            orderCalculationAttributes: {},
        };
        await checkForSuccessValidation({
            body,
            constants,
            tipAmount,
        });
    });

    it('should throw an error', async () => {
        const promotion = await factory.create(FN.promotion);
        const body = {
            promoCode: promotion.name,
        };
        const constants = {};
        const { mockedReq, mockedRes, mockedNext } = createMiddlewareMockedArgs({
            body,
        });
        mockedReq.constants = constants;
        await validatePromotion(mockedReq, mockedRes, mockedNext);
        expect(mockedNext.called).to.be.true;
        expect(mockedNext.args[0]).to.be.not.empty;
    });
});
