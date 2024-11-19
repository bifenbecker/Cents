require('../../../testHelper');
const { expect } = require('../../../support/chaiHelper');
const { createCustomerWithAddress } = require('../../../support/customerAddressHelper');
const {
    createOrderDeliveryAndRelatedEntities,
} = require('../../../support/createOrderDeliveryHelper');
const factory = require('../../../factories');
const {
    createMiddlewareMockedArgs,
} = require('../../../support/mockers/createMiddlewareMockedArgs');
const removePromotion = require('../../../../validations/liveLink/removePromotion');
const { ORDER_TYPES } = require('../../../../constants/constants');
const { FACTORIES_NAMES: FN } = require('../../../constants/factoriesNames');

async function checkForResponseError({ body, constants, statusCode }) {
    const { mockedReq, mockedRes, mockedNext } = createMiddlewareMockedArgs({
        body,
        constants
    });

    await removePromotion(mockedReq, mockedRes, mockedNext);

    expect(mockedRes.status.calledWith(statusCode)).to.be.true;
    expect(mockedRes.json.getCall(0).args[0]).to.have.property('error');
}

async function checkForSuccessValidation({ body, constants }) {
    const { mockedReq, mockedRes, mockedNext } = createMiddlewareMockedArgs({
        body,
        constants
    });

    await removePromotion(mockedReq, mockedRes, mockedNext);

    expect(mockedNext.called, 'should call next()').to.be.true;
    expect(mockedNext.getCall(0).args, 'should call next() without error in args').to.be.an('array')
        .that.is.empty;
    expect(mockedReq.constants).to.have.keys([
        'order',
        'orderCalculationAttributes',
    ]);
}

describe('test removePromotion validation', () => {
    let req;

    beforeEach(async () => {
        const { storeCustomer, store } =
            await createCustomerWithAddress();
        const { serviceOrder } = await createOrderDeliveryAndRelatedEntities(store, storeCustomer);
        const promotion = await factory.create(FN.promotion);

        req = {
            body: {
                isPromoRemoved: false
            },
            constants: {
                order: {
                    ...serviceOrder,
                    balanceDue: 15,
                    orderTotal: 15,
                    netOrderTotal: 15,
                    paymentStatus: 'PAID',
                    creditAmount: 15,
                    orderType: ORDER_TYPES.ONLINE,
                    promotionId: promotion.id,
                    previousTipOption: `7`,
                },
                orderCalculationAttributes: {}
            },
        };
    });

    it('should pass the validation when body payload is valid', async () => {
        await checkForSuccessValidation(req);
    });

    it('should throw an error when there is no body payload', async () => {
        const body = undefined;
        const { mockedReq, mockedRes, mockedNext } = createMiddlewareMockedArgs({
            body,
        });

        await removePromotion(mockedReq, mockedRes, mockedNext);
        expect(mockedNext.called, 'should call next(error)').to.be.true;
        expect(mockedNext.getCall(0).args[0].message).to.not.be.empty;
    });

    it('should have status 409 when promotionId is undefined', async () => {
        req.constants.order.promotionId = undefined;

        await checkForResponseError({
            ...req,
            statusCode: 409
        });
    });

    it('should have status 409 when balanceDue is zero and orderType is not ONLINE', async () => {
        req.constants.order = {
            ...req.constants.order,
            orderType: ORDER_TYPES.SERVICE
        };

        await checkForResponseError({
            ...req,
            statusCode: 409
        });
    });

    it('should pass the validation when body payload is valid and previousTipOption contains $', async () => {
        req.constants.order.previousTipOption = `$7`;

        await checkForSuccessValidation(req);
    });
});