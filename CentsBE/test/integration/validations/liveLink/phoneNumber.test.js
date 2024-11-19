require('../../../testHelper');
const sinon = require('sinon');
const Joi = require('@hapi/joi');
const phoneNumberTypeValidator = require('../../../../validations/liveLink/phoneNumber');
const {
    createMiddlewareMockedArgs,
} = require('../../../support/mockers/createMiddlewareMockedArgs');
const { expect } = require('../../../support/chaiHelper');

describe('test phoneNumberType validation', () => {
    async function checkForSuccessValidation({ body }) {
        const { mockedReq, mockedRes, mockedNext } = createMiddlewareMockedArgs({
            body,
        });

        await phoneNumberTypeValidator(mockedReq, mockedRes, mockedNext);

        expect(mockedNext.called, 'should call next()').to.be.true;
        expect(mockedNext.getCall(0).args, 'should call next() without error in args').to.be.an(
            'array',
        ).that.is.empty;
    }

    async function checkForResponseError({ body, expectedStatusCode, expectedError }) {
        const { mockedReq, mockedRes, mockedNext } = createMiddlewareMockedArgs({
            body,
        });

        await phoneNumberTypeValidator(mockedReq, mockedRes, mockedNext);

        expect(mockedRes.status.calledWith(expectedStatusCode)).to.be.true;
        expect(mockedRes.json.getCall(0).args[0])
            .to.have.property('error')
            .to.be.equal(expectedError);
    }

    it('should pass the validation when body payload is valid', async () => {
        const body = {
            phoneNumber: '1234567891',
            storeId: null,
        };

        await checkForSuccessValidation({ body });
    });

    it('should fail the validation when body payload is an empty object', async () => {
        const body = {};
        const expectedStatusCode = 422;
        const expectedError = 'Phone number is required. Phone number must have 10 digits.';

        await checkForResponseError({ body, expectedStatusCode, expectedError });
    });

    it('should fail the validation when phoneNumber has wrong type', async () => {
        const body = {
            phoneNumber: 1234567891,
        };
        const expectedStatusCode = 422;
        const expectedError = 'Phone number is required. Phone number must have 10 digits.';

        await checkForResponseError({ body, expectedStatusCode, expectedError });
    });

    it('should fail the validation when phoneNumber has wrong length', async () => {
        const body = {
            phoneNumber: '12345678',
        };
        const expectedStatusCode = 422;
        const expectedError = 'Phone number is required. Phone number must have 10 digits.';

        await checkForResponseError({ body, expectedStatusCode, expectedError });
    });

    it('should call next(error) when have unexpected error', async () => {
        const body = {
            phoneNumber: '1234567891',
        };

        const { mockedReq, mockedRes, mockedNext } = createMiddlewareMockedArgs({
            body,
        });

        const unexpectedError = 'unexpectedError';
        sinon.stub(Joi, 'validate').throws(new Error(unexpectedError));
        await phoneNumberTypeValidator(mockedReq, mockedRes, mockedNext);

        expect(mockedNext.called, 'should call next(error)').to.be.true;
        expect(mockedNext.getCall(0).args[0].message).equals(unexpectedError);
    });
});
