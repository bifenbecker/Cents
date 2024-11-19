require('../../../../testHelper');
const validateTip = require('../../../../../validations/liveLink/validateTip');
const factory = require('../../../../factories');
const {
    createMiddlewareMockedArgs,
} = require('../../../../support/mockers/createMiddlewareMockedArgs');
const { expect } = require('../../../../support/chaiHelper');
const { FACTORIES_NAMES: FN } = require('../../../../constants/factoriesNames');

async function checkForResponseError({ body, statusCode, constants = {}, orderCalculationAttributes = {}, serviceOrder = null }) {
    const { mockedReq, mockedRes, mockedNext } = createMiddlewareMockedArgs({
        body,
    });
    if (!serviceOrder) {
        serviceOrder = await factory.create(FN.serviceOrder);
    }
    mockedReq.constants = {
        ...constants,
        orderCalculationAttributes,
        order: serviceOrder
    };
    await validateTip(mockedReq, mockedRes, mockedNext);

    expect(mockedRes.status.calledWith(statusCode), `status should be ${statusCode}`).to.be.true;
    expect(mockedRes.json.getCall(0).args[0]).to.have.property('error');
}

async function checkForSuccessValidation({ body, constants = {}, orderCalculationAttributes = {}, serviceOrder = null }) {
    const { mockedReq, mockedRes, mockedNext } = createMiddlewareMockedArgs({
        body,
    });
    if (!serviceOrder) {
        serviceOrder = await factory.create(FN.serviceOrder);
    }
    mockedReq.constants = {
        ...constants,
        orderCalculationAttributes,
        order: serviceOrder
    };
    await validateTip(mockedReq, mockedRes, mockedNext);

    expect(mockedNext.called, 'should call next()').to.be.true;
    expect(mockedNext.getCall(0).args, 'should call next() without error in args').to.be.an('array')
        .that.is.empty;
    expect(mockedReq.constants).to.have.keys([
        'order',
        'orderCalculationAttributes',
    ]);
    const { isTipRemoved, appliedTip } = body;
    if (isTipRemoved) {
        expect(mockedReq.constants.orderCalculationAttributes).to.have.property('tipAmount');
        expect(mockedReq.constants.orderCalculationAttributes).to.have.property('tipOption');
        expect(mockedReq.constants.orderCalculationAttributes.tipAmount).to.be.equal(0);
        expect(mockedReq.constants.orderCalculationAttributes.tipOption).to.be.null;
    } else {
        expect(mockedReq.constants.orderCalculationAttributes).to.have.property('tipAmount');
        if (appliedTip.includes('$')) {
            tipAmount = Number(appliedTip.replace('$', ''));
            expect(mockedReq.constants.orderCalculationAttributes.tipAmount).to.be.equal(tipAmount);
        } else {
            expect(mockedReq.constants.orderCalculationAttributes.tipAmount).to.be.equal(appliedTip);
        }
    }

}


describe('test tipValidator validation', () => {
    it('should pass the validation when body payload is valid', async () => {
        const body = {
            isTipRemoved: true,
            appliedTip: '1'
        };
        const serviceOrder = await factory.create(FN.serviceOrder, {
            tipAmount: 10
        });
        await checkForSuccessValidation({
            body,
            serviceOrder
        });
    });

    it('should throw an error when there is no body payload', async () => {
        const body = undefined;
        const { mockedReq, mockedRes, mockedNext } = createMiddlewareMockedArgs({
            body,
        });

        await validateTip(mockedReq, mockedRes, mockedNext);
        expect(mockedNext.called, 'should call next(error)').to.be.true;
        expect(mockedNext.getCall(0).args[0].message).to.not.be.empty;
    });

    it('should return response with 422 code if payload is invalid', async () => {
        const body = {
            isTipRemoved: 'true',
            appliedTip: null
        };
        await checkForResponseError({
            body,
            statusCode: 422,
        });
    });

    it('should return response with 409 code if isTipRemoved is true and tipAmount is empty', async () => {
        const body = {
            isTipRemoved: true,
            appliedTip: '1'
        };
        await checkForResponseError({
            body,
            statusCode: 409,
        });
    });

    it('should return response with 409 code if balanceDue is 0 or paymentStatus is "PAID" for orderType is not "ONLINE"', async () => {
        const body = {
            isTipRemoved: true,
            appliedTip: '1'
        };
        const serviceOrder = await factory.create(FN.serviceOrder, {
            netOrderTotal: 0,
            orderType: 'ONLINE',
        })
        await checkForResponseError({
            body,
            statusCode: 409,
            serviceOrder
        });
    });

    it('should return success response if isTipRemoved is false and appliedTip contains "$"', async () => {
        const body = {
            isTipRemoved: false,
            appliedTip: '1$'
        };
        await checkForSuccessValidation({
            body,
        });
    });

    it('should return success response if isTipRemoved is false and appliedTip does not contain "$"', async () => {
        const body = {
            isTipRemoved: false,
            appliedTip: '1'
        };
        await checkForSuccessValidation({
            body,
        });
    });

});
