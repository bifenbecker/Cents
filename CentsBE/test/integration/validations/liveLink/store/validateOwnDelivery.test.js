require('../../../../testHelper');
const {
    createMiddlewareMockedArgs,
} = require('../../../../support/mockers/createMiddlewareMockedArgs');
const { expect } = require('../../../../support/chaiHelper');
const factory = require('../../../../factories');
const validateOwnDelivery = require('../../../../../validations/liveLink/store/validateOwnDelivery');

describe('test validateOwnDelivery', () => {
    let req;

    it('when validation is passed', async () => {
        const store = await factory.create('store');

        req = {
            params: {
                storeId: store.id,
            },
            query: {
                zipCode: 94541,
                serviceType: 'ALL',
                startDate: new Date().getTime(),
            },
        };

        const { mockedReq, mockedRes, mockedNext } = createMiddlewareMockedArgs(req);

        await validateOwnDelivery(mockedReq, mockedRes, mockedNext);

        expect(mockedNext.called, 'should call next()').to.be.true;
        expect(mockedNext.getCall(0).args, 'should call next() without error in args').to.be.an(
            'array',
        ).that.is.empty;
    });


    it('error when serviceType is not a string', async () => {
        req = {
            params: {
                storeId: 0,
            },
            query: {
                zipCode: 'test',
                serviceType: 1,
                startDate: new Date().getTime(),
            },
        };

        const { mockedReq, mockedRes, mockedNext } = createMiddlewareMockedArgs(req);

        await validateOwnDelivery(mockedReq, mockedRes, mockedNext);

        expect(mockedRes.status.calledWith(422)).to.be.true;
        expect(mockedRes.json.getCall(0).args[0]).to.have.property(
            'error',
            'child "serviceType" fails because [serviceType must be a string]',
        );
        expect(mockedNext.called, 'should call next()').to.be.false;
    });

    it('error when zipCode is not a number', async () => {
        const store = await factory.create('store');

        req = {
            params: {
                storeId: store.id,
            },
            query: {
                zipCode: 'test',
                serviceType: 'ALL',
                startDate: new Date().getTime(),
            },
        };

        const { mockedReq, mockedRes, mockedNext } = createMiddlewareMockedArgs(req);

        await validateOwnDelivery(mockedReq, mockedRes, mockedNext);

        expect(mockedRes.status.calledWith(422)).to.be.true;
        expect(mockedRes.json.getCall(0).args[0]).to.have.property(
            'error',
            'child "zipCode" fails because [zipCode must be a number]',
        );
        expect(mockedNext.called, 'should call next()').to.be.false;
    });

    it('error when validation is not passed', async () => {
        req = {
            params: {},
            query: {},
        };

        const { mockedReq, mockedRes, mockedNext } = createMiddlewareMockedArgs(req);

        await validateOwnDelivery(mockedReq, mockedRes, mockedNext);

        expect(mockedRes.status.calledWith(422)).to.be.true;
        expect(mockedRes.json.getCall(0).args[0]).to.have.property(
            'error',
            'child "storeId" fails because [storeId must be a number]',
        );
        expect(mockedNext.called, 'should call next()').to.be.false;
    });
});