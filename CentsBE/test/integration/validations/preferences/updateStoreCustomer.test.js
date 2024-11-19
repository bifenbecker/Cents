require('../../../testHelper');
const updateStoreCustomerValidation = require('../../../../validations/preferences/updateStoreCustomer');
const {
    createMiddlewareMockedArgs,
} = require('../../../support/mockers/createMiddlewareMockedArgs');
const { expect } = require('../../../support/chaiHelper');

async function checkForSuccessValidation({ body }) {
    const { mockedReq, mockedRes, mockedNext } = createMiddlewareMockedArgs({
        body,
    });

    await updateStoreCustomerValidation(mockedReq, mockedRes, mockedNext);

    expect(mockedNext.called, 'should call next()').to.be.true;
    expect(mockedNext.getCall(0).args, 'should call next() without error in args').to.be.an('array')
        .that.is.empty;
}

async function checkForResponseError({ body, expectedStatusCode, expectedError }) {
    const { mockedReq, mockedRes, mockedNext } = createMiddlewareMockedArgs({
        body,
    });

    await updateStoreCustomerValidation(mockedReq, mockedRes, mockedNext);

    expect(mockedRes.status.calledWith(expectedStatusCode)).to.be.true;
    expect(mockedRes.json.getCall(0).args[0]).to.have.property('error').to.be.equal(expectedError);
}

describe('test updateStoreCustomer validation', () => {
    it('should pass validation when request body is correct', async () => {
        const body = {
            notes: 'test',
            isHangDrySelected: false,
            hangDryInstructions: 'test',
        };

        await checkForSuccessValidation({
            body,
        });
    });

    it('should pass validation when request body is an empty object', async () => {
        const body = {};

        await checkForSuccessValidation({
            body,
        });
    });

    it('should fail the validation when isHangDrySelected is not a bool', async () => {
        const body = {
            isHangDrySelected: 0,
        };

        await checkForResponseError({
            body,
            expectedError: '"isHangDrySelected" must be a boolean',
            expectedStatusCode: 400,
        });
    });

    it('should fail the validation when there are excess fields', async () => {
        const body = {
            notes: 'test notes',
            phoneNumber: '1231231231',
        };

        await checkForResponseError({
            body,
            expectedError: '"phoneNumber" is not allowed',
            expectedStatusCode: 400,
        });
    });
});
