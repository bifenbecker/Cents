require('../../../testHelper');
const sinon = require('sinon');
const {
    createMiddlewareMockedArgs,
} = require('../../../support/mockers/createMiddlewareMockedArgs');
const { expect } = require('../../../support/chaiHelper');
const JwtService = require('../../../../services/tokenOperations/main');
const orderTokenValidations = require('../../../../middlewares/liveLink/orderTokenValidations');

describe('test orderTokenValidations', () => {
    describe('with correct token', async () => {
        let token;
        const testJWTPayload = 'test payload';
        const defaultAssert = (mockedReq, mockedNext) => {
            expect(mockedNext.called, 'should call next()').to.be.true;
            expect(mockedNext.getCall(0).args, 'should call next() without error in args').to.be.an(
                'array',
            ).that.is.empty;
            expect(
                mockedReq.constants.order,
                'req.constants.order should equals JWT payload',
            ).equals(testJWTPayload);
        };

        beforeEach(async () => {
            const jwtService = new JwtService(testJWTPayload);
            token = jwtService.tokenGenerator(process.env.JWT_SECRET_TOKEN_ORDER);
        });

        it('with empty req.constants', () => {
            const req = {
                query: { token },
            };
            const { mockedReq, mockedRes, mockedNext } = createMiddlewareMockedArgs(req);

            // call validator
            orderTokenValidations(mockedReq, mockedRes, mockedNext);

            // assert
            defaultAssert(mockedReq, mockedNext);
        });

        it('with initial data in req.constants', () => {
            const req = {
                constants: {
                    test: 'test',
                },
                query: { token },
            };
            const { mockedReq, mockedRes, mockedNext } = createMiddlewareMockedArgs(req);

            // call validator
            orderTokenValidations(mockedReq, mockedRes, mockedNext);

            // assert
            defaultAssert(mockedReq, mockedNext);
            expect(mockedReq.constants, 'req.constants should have initial values')
                .have.property('test')
                .equals('test');
        });
    });

    describe('should response correct error', async () => {
        it('with incorrect token type', async () => {
            const req = {
                query: { token: null },
            };
            const { mockedReq, mockedRes, mockedNext } = createMiddlewareMockedArgs(req);

            // call validator
            orderTokenValidations(mockedReq, mockedRes, mockedNext);

            // assert
            expect(mockedRes.status.calledWith(422), 'with 422 status code').to.be.true;
            expect(mockedRes.json.getCall(0).args[0], 'with error in response').have.property(
                'error',
            );
        });

        it('with incorrect token', async () => {
            const req = {
                query: { token: 'invalidToken' },
            };
            const { mockedReq, mockedRes, mockedNext } = createMiddlewareMockedArgs(req);

            // call validator
            orderTokenValidations(mockedReq, mockedRes, mockedNext);

            // assert
            expect(mockedRes.status.calledWith(403), 'with 403 status code').to.be.true;
            expect(mockedRes.json.getCall(0).args[0], 'with error in response').have.property(
                'error',
            );
        });
    });

    it('should call next(error) with unprovided error', async () => {
        const errorMessage = 'Unprovided error!';
        const req = {
            query: { token: 'invalidToken' },
        };
        const { mockedReq, mockedRes, mockedNext } = createMiddlewareMockedArgs(req);
        sinon.stub(JwtService.prototype, 'verifyToken').throws(new Error(errorMessage));

        // call validator
        orderTokenValidations(mockedReq, mockedRes, mockedNext);

        // assert
        expect(mockedNext.called, 'should call next(error)').to.be.true;
        expect(mockedNext.getCall(0).args[0].message).equals(errorMessage);
    });
});
