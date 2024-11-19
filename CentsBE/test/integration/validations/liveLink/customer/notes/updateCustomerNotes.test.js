require('../../../../../testHelper');
const sinon = require('sinon');
const Joi = require('@hapi/joi');
const { expect } = require('../../../../../support/chaiHelper');
const {
    createMiddlewareMockedArgs,
} = require('../../../../../support/mockers/createMiddlewareMockedArgs');
const updateCustomerNotes = require('../../../../../../validations/liveLink/customer/notes/updateCustomerNotes');

async function checkForResponseError({ body, statusCode }) {
    const { mockedReq, mockedRes, mockedNext } = createMiddlewareMockedArgs({
        body,
    });

    await updateCustomerNotes(mockedReq, mockedRes, mockedNext);

    expect(mockedRes.status.calledWith(statusCode)).to.be.true;
    expect(mockedRes.json.getCall(0).args[0]).to.have.property('error');
}

async function checkForSuccessValidation({ body }) {
    const { mockedReq, mockedRes, mockedNext } = createMiddlewareMockedArgs({
        body,
    });

    await updateCustomerNotes(mockedReq, mockedRes, mockedNext);

    expect(mockedNext.called, 'should call next()').to.be.true;
    expect(mockedNext.getCall(0).args, 'should call next() without error in args').to.be.an('array')
        .that.is.empty;
    expect(mockedReq.body).to.have.keys([
        'isHangDrySelected',
        'hangDryInstructions',
        'notes',
    ]);
}

describe('test updateCustomerNotes validation', () => {
    let req;

    beforeEach(async () => {
        req = {
            body: {
                isHangDrySelected: true,
                hangDryInstructions: 'Bleach everything',
                notes: 'test note',
            }
        };
    });

    it('should pass the validation when body payload is valid', async () => {
        await checkForSuccessValidation(req);
    });

    it('should call next(error) when have unexpected error', async () => {
        const body = {
            isHangDrySelected: true,
        };

        const { mockedReq, mockedRes, mockedNext } = createMiddlewareMockedArgs({
            body,
        });

        const unexpectedError = 'unexpectedError';
        sinon.stub(Joi, 'validate').throws(new Error(unexpectedError));
        await updateCustomerNotes(mockedReq, mockedRes, mockedNext);

        expect(mockedNext.called, 'should call next(error)').to.be.true;
        expect(mockedNext.getCall(0).args[0].message).equals(unexpectedError);
    });

    it('should not pass the validation when isHangDrySelected is undefined', async () => {
        req.body.isHangDrySelected = undefined;

        await checkForResponseError({
            ...req,
            statusCode: 422,
        });
    });
}); 