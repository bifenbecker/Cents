require('../../../testHelper');
const { expect } = require('../../../support/chaiHelper');
const { createCustomerWithAddress } = require('../../../support/customerAddressHelper');
const {
    createOrderDeliveryAndRelatedEntities,
} = require('../../../support/createOrderDeliveryHelper');
const {
    createMiddlewareMockedArgs,
} = require('../../../support/mockers/createMiddlewareMockedArgs');
const removeCredits = require('../../../../validations/liveLink/removeCredits');
const { ORDER_TYPES } = require('../../../../constants/constants');

async function checkForResponseError({ body, constants, statusCode }) {
    const { mockedReq, mockedRes, mockedNext } = createMiddlewareMockedArgs({
        body,
        constants
    });

    await removeCredits(mockedReq, mockedRes, mockedNext);

    expect(mockedRes.status.calledWith(statusCode)).to.be.true;
    expect(mockedRes.json.getCall(0).args[0]).to.have.property('error');
}

async function checkForSuccessValidation({ body, constants }) {
    const { mockedReq, mockedRes, mockedNext } = createMiddlewareMockedArgs({
        body,
        constants
    });

    await removeCredits(mockedReq, mockedRes, mockedNext);

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
            body: {},
            constants: {
                order: {
                    ...serviceOrder,
                    balanceDue: 15,
                    orderTotal: 15,
                    netOrderTotal: 15,
                    paymentStatus: 'PAID',
                    availableCredits: 13,
                    creditAmount: 15,
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

        await removeCredits(mockedReq, mockedRes, mockedNext);
        expect(mockedNext.called, 'should call next(error)').to.be.true;
        expect(mockedNext.getCall(0).args[0].message).to.not.be.empty;
    });

    it('should have status 409 when creditAmount is undefined', async () => {
        req.constants.order.creditAmount = undefined;

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
});
