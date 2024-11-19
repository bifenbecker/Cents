require('../../../testHelper');
const sinon = require('sinon');
const Joi = require('@hapi/joi');
const { expect } = require('../../../support/chaiHelper');
const {
    createMiddlewareMockedArgs,
} = require('../../../support/mockers/createMiddlewareMockedArgs');
const customerAddress = require('../../../../validations/liveLink/customerAddress');

async function checkForResponseError({ body, statusCode }) {
    const { mockedReq, mockedRes, mockedNext } = createMiddlewareMockedArgs({
        body,
    });

    customerAddress(mockedReq, mockedRes, mockedNext);

    expect(mockedRes.status.calledWith(statusCode)).to.be.true;
    expect(mockedRes.json.getCall(0).args[0]).to.have.property('error');
}

async function checkForSuccessValidation({ body }) {
    const { mockedReq, mockedRes, mockedNext } = createMiddlewareMockedArgs({
        body,
    });

    customerAddress(mockedReq, mockedRes, mockedNext);

    expect(mockedNext.called, 'should call next()').to.be.true;
    expect(mockedNext.getCall(0).args, 'should call next() without error in args').to.be.an('array')
        .that.is.empty;
    expect(mockedReq.body).to.have.keys([
        'address1',
        'city',
        'countryCode',
        'firstLevelSubdivisionCode',
        'postalCode',
    ]);
}

describe('test customerAddress validation', () => {
    let req;

    beforeEach(async () => {
        req = {
            body: {
                address1: '755 washington street',
                city: 'New york',
                firstLevelSubdivisionCode: 'NY',
                postalCode: '10014',
                countryCode: 'USA',
            }
        };
    });

    it('should pass the validation when body payload is valid', async () => {
        await checkForSuccessValidation(req);
    });

    it('should not pass the validation when city is undefined', async () => {
        req.body.city = undefined;

        await checkForResponseError({
            ...req,
            statusCode: 422,
        });
    });

    it('should call next(error) when have unexpected error', async () => {
        const body = {
            address1: '755 washington street',
        };

        const { mockedReq, mockedRes, mockedNext } = createMiddlewareMockedArgs({
            body,
        });

        const unexpectedError = 'unexpectedError';
        sinon.stub(Joi, 'validate').throws(new Error(unexpectedError));
        customerAddress(mockedReq, mockedRes, mockedNext);

        expect(mockedNext.called, 'should call next(error)').to.be.true;
        expect(mockedNext.getCall(0).args[0].message).equals(unexpectedError);
    });
});