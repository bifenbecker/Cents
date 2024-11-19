require('../../../testHelper');
const { expect } = require('../../../support/chaiHelper');
const { createCustomerWithAddress } = require('../../../support/customerAddressHelper');
const {
    createOrderDeliveryAndRelatedEntities,
} = require('../../../support/createOrderDeliveryHelper');
const {
    createMiddlewareMockedArgs,
} = require('../../../support/mockers/createMiddlewareMockedArgs');
const validateCredits = require('../../../../validations/liveLink/credits');
const { ORDER_TYPES } = require('../../../../constants/constants');

async function checkForResponseError({ body, constants, statusCode }) {
    const { mockedReq, mockedRes, mockedNext } = createMiddlewareMockedArgs({
        body,
        constants
    });

    await validateCredits(mockedReq, mockedRes, mockedNext);

    expect(mockedRes.status.calledWith(statusCode)).to.be.true;
    expect(mockedRes.json.getCall(0).args[0]).to.have.property('error');
}

async function checkForSuccessValidation({ body, constants }) {
    const { mockedReq, mockedRes, mockedNext } = createMiddlewareMockedArgs({
        body,
        constants
    });

    await validateCredits(mockedReq, mockedRes, mockedNext);

    expect(mockedNext.called, 'should call next()').to.be.true;
    expect(mockedNext.getCall(0).args, 'should call next() without error in args').to.be.an('array')
        .that.is.empty;
    expect(mockedReq.constants).to.have.keys([
        'order',
        'orderCalculationAttributes',
    ]);
}

describe('test validateCredits validation', () => {
    let req;

    beforeEach(async () => {
        const { storeCustomer, store } =
            await createCustomerWithAddress();
        const { serviceOrder } = await createOrderDeliveryAndRelatedEntities(store, storeCustomer);

        req = {
            body: { appliedCredits: 12 },
            constants: {
                order: {
                    ...serviceOrder,
                    balanceDue: 15,
                    orderTotal: 15,
                    netOrderTotal: 15,
                    paymentStatus: 'UNPAID',
                    availableCredits: 13,
                    orderType: ORDER_TYPES.ONLINE
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

        await validateCredits(mockedReq, mockedRes, mockedNext);
        expect(mockedNext.called, 'should call next(error)').to.be.true;
        expect(mockedNext.getCall(0).args[0].message).to.not.be.empty;
    });

    it('should have status 422 when appliedCredits is undefined', async () => {
        req.body.appliedCredits = undefined;

        await checkForResponseError({
            ...req,
            statusCode: 422
        });
    });

    it('should have status 409 when creditAmount is present', async () => {
        req.constants.order.creditAmount = 1;

        await checkForResponseError({
            ...req,
            statusCode: 409
        });
    });

    it('should have status 409 when availableCredits is less than appliedCredits', async () => {
        req.constants.order = {
            ...req.constants.order,
            availableCredits: 1
        };

        await checkForResponseError({
            ...req,
            statusCode: 409
        });
    });

    it('should have status 409 when balanceDue is less than appliedCredits and orderType is not ONLINE', async () => {
        req.constants.order = {
            ...req.constants.order,
            balanceDue: 1,
            orderType: ORDER_TYPES.SERVICE
        };

        await checkForResponseError({
            ...req,
            statusCode: 409
        });
    });

    it('should have status 409 when balanceDue is zero and orderType is not ONLINE', async () => {
        req.constants.order = {
            ...req.constants.order,
            paymentStatus: 'PAID',
            orderType: ORDER_TYPES.SERVICE
        };

        await checkForResponseError({
            ...req,
            statusCode: 409
        });
    });

    it('should have status 409 when netOrderTotal is less than appliedCredits and orderType is ONLINE', async () => {
        req.constants.order = {
            ...req.constants.order,
            netOrderTotal: 1,
        };

        await checkForResponseError({
            ...req,
            statusCode: 409
        });
    });
});
