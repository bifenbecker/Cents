require('../../../../testHelper');
const sinon = require('sinon');
const Joi = require('@hapi/joi');
const {
    createMiddlewareMockedArgs,
} = require('../../../../support/mockers/createMiddlewareMockedArgs');
const factory = require('../../../../factories');
const { expect } = require('../../../../support/chaiHelper');
const validateStore = require('../../../../../validations/liveLink/store/validateStore');

describe('test validateStore', () => {
    let req;

    it('when validation is passed', async () => {
        const store = await factory.create('store');

        req = {
            params: {
                storeId: store.id
            },
        };

        const { mockedReq, mockedRes, mockedNext } = createMiddlewareMockedArgs(req);
        const joiSpy = sinon.spy(Joi, 'validate');
        const schema = [
            {
                key: 'storeId',
                type: 'number',
            },
        ];

        await validateStore(mockedReq, mockedRes, mockedNext);

        expect(mockedNext.called, 'should call next()').to.be.true;
        expect(mockedNext.getCall(0).args, 'should call next() without error in args').to.be.an(
            'array',
        ).that.is.empty;
        expect(
            joiSpy.getCall(0).args[1]._inner.children.map((item) => ({
                key: item.key,
                type: item.schema._type,
            })),
            'should have valid schema',
        ).deep.equal(schema);
    });

    
    it('error when necessary storeId is not passed', async () => {
        req = {
            params: {
                storeId: 0
            },
        };
      
        const { mockedReq, mockedRes, mockedNext } = createMiddlewareMockedArgs(req);

        await validateStore(mockedReq, mockedRes, mockedNext);

        expect(mockedRes.status.calledWith(422)).to.be.true;
        expect(mockedRes.json.getCall(0).args[0]).to.have.property(
            'error',
            'Store not available',
        );
        expect(mockedNext.called, 'should call next()').to.be.false;
    });

    it('error when validation is not passed', async () => {
        req = {
            params: {},
        };
        
        const { mockedReq, mockedRes, mockedNext } = createMiddlewareMockedArgs(req);

        await validateStore(mockedReq, mockedRes, mockedNext);

        expect(mockedRes.status.calledWith(422)).to.be.true;
        expect(mockedRes.json.getCall(0).args[0]).to.have.property(
            'error',
            'child "storeId" fails because [storeId must be a number]',
        );
        expect(mockedNext.called, 'should call next()').to.be.false;
    });

    it('with unprovided error', async () => {
        req = {
            params: {},
        };
        
        const errorMessage = 'Unprovided error!';

        const { mockedReq, mockedRes, mockedNext } = createMiddlewareMockedArgs(req);
        sinon.stub(Joi, 'validate').throws(new Error(errorMessage));

        await validateStore(mockedReq, mockedRes, mockedNext);

        expect(mockedNext.called, 'should call next(error)').to.be.true;
        expect(mockedNext.getCall(0).args[0].message).equals(errorMessage);
    });
});