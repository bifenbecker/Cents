require('../../../testHelper');
const sinon = require('sinon');
const jwt = require('jsonwebtoken');
const { expect } = require('../../../support/chaiHelper');
const factory = require('../../../factories');
const {
    createMiddlewareMockedArgs,
} = require('../../../support/mockers/createMiddlewareMockedArgs');
const JwtService = require('../../../../services/tokenOperations/main');
const checkIfCustomerSignedIn = require('../../../../middlewares/liveLink/checkIfCustomerSignedIn');
const { FACTORIES_NAMES: FN } = require('../../../constants/factoriesNames');

describe('test checkIfCustomerSignedIn', () => {
    describe('should call next()', async () => {
        it('when customerauthtoken exists and valid', async () => {
            const centsCustomer = await factory.create(FN.centsCustomer);
            const jwtService = new JwtService({ id: centsCustomer.id });
            const customerauthtoken = jwtService.tokenGenerator(process.env.JWT_SECRET_TOKEN_ORDER);
            const req = {
                headers: { customerauthtoken },
            };
            const { mockedReq, mockedRes, mockedNext } = createMiddlewareMockedArgs(req);

            // call validator
            await checkIfCustomerSignedIn(mockedReq, mockedRes, mockedNext);

            // assert
            expect(mockedReq)
                .have.property('currentCustomer')
                .have.property('id', centsCustomer.id, 'should add centsCustomer to req');
            expect(mockedNext.called, 'should call next()').to.be.true;
            expect(mockedNext.getCall(0).args, 'should call next() without error in args').to.be.an(
                'array',
            ).that.is.empty;
        });

        it('when customerauthtoken exists but not valid', async () => {
            const jwtService = new JwtService({ id: 999999 });
            const customerauthtoken = jwtService.tokenGenerator(process.env.JWT_SECRET_TOKEN_ORDER);
            const req = {
                headers: { customerauthtoken },
            };
            const { mockedReq, mockedRes, mockedNext } = createMiddlewareMockedArgs(req);

            // call validator
            await checkIfCustomerSignedIn(mockedReq, mockedRes, mockedNext);

            // assert
            expect(mockedReq).not.have.property('currentCustomer');
            expect(mockedNext.called, 'should call next()').to.be.true;
            expect(mockedNext.getCall(0).args, 'should call next() without error in args').to.be.an(
                'array',
            ).that.is.empty;
        });

        it('when customerauthtoken not exists', async () => {
            const req = {
                headers: { customerauthtoken: null },
            };
            const { mockedReq, mockedRes, mockedNext } = createMiddlewareMockedArgs(req);

            // call validator
            await checkIfCustomerSignedIn(mockedReq, mockedRes, mockedNext);

            // assert
            expect(mockedReq).not.have.property('currentCustomer');
            expect(mockedNext.called, 'should call next()').to.be.true;
            expect(mockedNext.getCall(0).args, 'should call next() without error in args').to.be.an(
                'array',
            ).that.is.empty;
        });
    });

    it('should call next(error) with unprovided error', async () => {
        const errorMessage = 'Unprovided error!';
        const req = {
            headers: { customerauthtoken: 999999 },
        };
        const { mockedReq, mockedRes, mockedNext } = createMiddlewareMockedArgs(req);
        sinon.stub(jwt, 'verify').throws(new Error(errorMessage));

        // call validator
        await checkIfCustomerSignedIn(mockedReq, mockedRes, mockedNext);

        // assert
        expect(mockedNext.called, 'should call next(error)').to.be.true;
        expect(mockedNext.getCall(0).args[0].message).equals(errorMessage);
    });
});
