require('../../../../testHelper');
const {
    createMiddlewareMockedArgs,
} = require('../../../../support/mockers/createMiddlewareMockedArgs');
const { expect } = require('../../../../support/chaiHelper');
const validateZipCodeInQuery = require('../../../../../validations/liveLink/store/validateZipCodeInQuery');
const factory = require('../../../../factories');

describe('test validateZipCodeInQuery', () => {
    let req;

    it('when validation is passed', async () => {
        const store = await factory.create('store');

        req = {
            query: {
                zipCode: store.zipCode
            },
        };

        const { mockedReq, mockedRes, mockedNext } = createMiddlewareMockedArgs(req);

        await validateZipCodeInQuery(mockedReq, mockedRes, mockedNext);

        expect(mockedNext.called, 'should call next()').to.be.true;
        expect(mockedNext.getCall(0).args, 'should call next() without error in args').to.be.an(
            'array',
        ).that.is.empty;
    });


    it('error when necessary zipCode is not passed', async () => {
        req = {
            query: {
                zipCode: ''
            },
        };

        const { mockedReq, mockedRes, mockedNext } = createMiddlewareMockedArgs(req);

        await validateZipCodeInQuery(mockedReq, mockedRes, mockedNext);

        expect(mockedRes.status.calledWith(422)).to.be.true;
        expect(mockedRes.json.getCall(0).args[0]).to.have.property(
            'error',
            'zipCode is required.',
        );
        expect(mockedNext.called, 'should call next()').to.be.false;
    });

    it('error when validation is not passed', async () => {
        req = {
            query: {},
        };

        const { mockedReq, mockedRes, mockedNext } = createMiddlewareMockedArgs(req);

        await validateZipCodeInQuery(mockedReq, mockedRes, mockedNext);

        expect(mockedRes.status.calledWith(422)).to.be.true;
        expect(mockedRes.json.getCall(0).args[0]).to.have.property(
            'error',
            'zipCode is required.',
        );
        expect(mockedNext.called, 'should call next()').to.be.false;
    });
});