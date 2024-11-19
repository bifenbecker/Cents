require('../../../testHelper');
const sinon = require('sinon');
const Joi = require('@hapi/joi');
const updatePaymentIntentValidation = require('../../../../validations/liveLink/updatePaymentIntent');
const {
    createMiddlewareMockedArgs,
} = require('../../../support/mockers/createMiddlewareMockedArgs');
const { expect } = require('../../../support/chaiHelper');

async function checkForResponseError({ body, expectedStatusCode, expectedError }) {
    const { mockedReq, mockedRes, mockedNext } = createMiddlewareMockedArgs({
        body,
    });

    await updatePaymentIntentValidation(mockedReq, mockedRes, mockedNext);

    expect(mockedRes.status.calledWith(expectedStatusCode)).to.be.true;
    expect(mockedRes.json.getCall(0).args[0]).to.have.property('error').to.be.equal(expectedError);
}

describe('test updatePaymentIntent validation', () => {
    it('should pass the validation when body payload is valid', async () => {
        const { mockedReq, mockedRes, mockedNext } = createMiddlewareMockedArgs({
            body: {
                paymentToken: 'test token',
            },
        });

        await updatePaymentIntentValidation(mockedReq, mockedRes, mockedNext);

        expect(mockedNext.called, 'should call next()').to.be.true;
        expect(mockedNext.getCall(0).args, 'should call next() without error in args').to.be.an(
            'array',
        ).that.is.empty;
    });

    it('should fail the validation when body payload is an empty object', async () => {
        await checkForResponseError({
            body: {},
            expectedStatusCode: 422,
            expectedError: 'child "paymentToken" fails because ["paymentToken" is required]',
        });
    });

    it('should fail the validation when paymentToken has the wrong type', async () => {
        await checkForResponseError({
            body: {
                paymentToken: 123,
            },
            expectedStatusCode: 422,
            expectedError: 'child "paymentToken" fails because ["paymentToken" must be a string]',
        });
    });

    it('should call next(error) when have unexpected error', async () => {
        const { mockedReq, mockedRes, mockedNext } = createMiddlewareMockedArgs({
            body: {
                paymentToken: 'test token',
            },
        });

        const unexpectedError = 'unexpectedError';
        sinon.stub(Joi, 'validate').throws(new Error(unexpectedError));
        await updatePaymentIntentValidation(mockedReq, mockedRes, mockedNext);

        expect(mockedNext.called, 'should call next(error)').to.be.true;
        expect(mockedNext.getCall(0).args[0].message).equals(unexpectedError);
    });
});
