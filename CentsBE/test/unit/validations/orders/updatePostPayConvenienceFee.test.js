require('../../../testHelper');
const { expect } = require('../../../support/chaiHelper');

const updatePostPayConvenienceFee = require('../../../../validations/orders/updatePostPayConvenienceFee');
const { createMiddlewareMockedArgs } = require('../../../support/mockers/createMiddlewareMockedArgs');

const getRequestObject = ({convenienceFeeId, orderCalculationAttributes = {}}) => ({
    body: {
        convenienceFeeId
    },
    constants: {
        orderCalculationAttributes,
    }
});

describe('test updatePostPayConvenienceFee middleware', () => {
    it('should pass when correct input params are passed', async () => {
        const req = getRequestObject({convenienceFeeId: 100});
        const { mockedReq, mockedRes, mockedNext } = createMiddlewareMockedArgs(req);

        await updatePostPayConvenienceFee(mockedReq, mockedRes, mockedNext);

        expect(mockedNext.called, 'expected to continue w/o errors').to.be.true;
        expect(mockedNext.getCall(0).args[0]).to.be.a('undefined');
    });

    it('should respond with error if convenienceFeeId is not a number', async () => {
        const req = getRequestObject({convenienceFeeId: 'not-a-number'});
        const { mockedReq, mockedRes, mockedNext } = createMiddlewareMockedArgs(req);

        await updatePostPayConvenienceFee(mockedReq, mockedRes, mockedNext);

        expect(mockedRes.status.called, 'expected res.status to be callsed').to.be.true;
        expect(mockedRes.status.getCall(0).args[0]).to.be.eql(422);

        expect(mockedRes.json.called, 'expected res.json to be called').to.be.true;
        expect(
            mockedRes.json.getCall(0).args[0].error
        ).to.be.eql('child "convenienceFeeId" fails because ["convenienceFeeId" must be a number]');
    });

    it('should call next with error if required constants not in place', async () => {
        const req = getRequestObject({
            convenienceFeeId: 1, 
            orderCalculationAttributes: null
        });
        const { mockedReq, mockedRes, mockedNext } = createMiddlewareMockedArgs(req);

        await updatePostPayConvenienceFee(mockedReq, mockedRes, mockedNext);

        expect(mockedNext.called, 'expected next to be called').to.be.true;
        expect(
            mockedNext.getCall(0).args[0].message
        ).to.be.eql('Cannot set property \'convenienceFeeId\' of null');
    });
});