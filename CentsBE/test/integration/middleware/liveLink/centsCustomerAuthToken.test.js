require('../../../testHelper');
const sinon = require('sinon');
const jwt = require('jsonwebtoken');
const { expect } = require('../../../support/chaiHelper');
const factory = require('../../../factories');
const {
    createMiddlewareMockedArgs,
} = require('../../../support/mockers/createMiddlewareMockedArgs');
const validateCustomer = require('../../../../middlewares/liveLink/centsCustomerAuthToken');
const JwtService = require('../../../../services/tokenOperations/main');
const CentsCustomer = require('../../../../models/centsCustomer');
const { FACTORIES_NAMES: FN } = require('../../../constants/factoriesNames');
const { MAX_DB_INTEGER } = require('../../../constants/dbValues');

describe('test centsCustomerAuthToken middleware', () => {
    describe('should call next() with correct token', async () => {
        it('with currentCustomer and initial data in req', async () => {
            const centsCustomerFactory = await factory.create(FN.centsCustomer);
            const centsCustomerEntity = await CentsCustomer.query().findById(
                centsCustomerFactory.id,
            );
            const jwtService = new JwtService(JSON.stringify({ id: centsCustomerEntity.id }));
            const customerauthtoken = jwtService.tokenGenerator(
                process.env.JWT_SECRET_LIVE_LINK_CUSTOMER,
            );
            const testData = 'testData';
            const req = {
                testData,
                headers: { customerauthtoken },
            };
            const { mockedReq, mockedRes, mockedNext } = createMiddlewareMockedArgs(req);

            // call validator
            await validateCustomer(mockedReq, mockedRes, mockedNext);

            // assert
            expect(mockedNext.called, 'should call next()').to.be.true;
            expect(mockedNext.getCall(0).args, 'should call next() without error in args').to.be.an(
                'array',
            ).that.is.empty;
            expect(mockedReq, 'req should have currentCustomer')
                .have.property('currentCustomer')
                .deep.equal(centsCustomerEntity);
            expect(mockedReq, 'req should have initial values').have.property('testData', testData);
        });
    });

    describe('should response correct error', async () => {
        it('without token', async () => {
            const { mockedReq, mockedRes, mockedNext } = createMiddlewareMockedArgs({
                headers: {},
            });

            // call validator
            await validateCustomer(mockedReq, mockedRes, mockedNext);

            // assert
            expect(mockedNext.called, 'should not call next()').to.be.false;
            expect(mockedRes.status.calledWith(401), 'with 401 status code').to.be.true;
            expect(mockedRes.json.getCall(0).args[0], 'with error in response').have.property(
                'error',
                'Please provide customerToken to proceed.',
            );
        });

        it('if currentCustomer (centsCustomer) does not exist', async () => {
            const jwtService = new JwtService(JSON.stringify({ id: MAX_DB_INTEGER }));
            const customerauthtoken = jwtService.tokenGenerator(
                process.env.JWT_SECRET_LIVE_LINK_CUSTOMER,
            );
            const { mockedReq, mockedRes, mockedNext } = createMiddlewareMockedArgs({
                headers: { customerauthtoken },
            });

            // call validator
            await validateCustomer(mockedReq, mockedRes, mockedNext);

            // assert
            expect(mockedNext.called, 'should not call next()').to.be.false;
            expect(mockedRes.status.calledWith(404), 'with 404 status code').to.be.true;
            expect(mockedRes.json.getCall(0).args[0], 'with error in response').have.property(
                'error',
                'Customer could not be found',
            );
        });
    });

    it('should call next(error) with unprovided error', async () => {
        const errorMessage = 'Unprovided error!';
        const req = {
            headers: { customerauthtoken: 'token' },
        };
        const { mockedReq, mockedRes, mockedNext } = createMiddlewareMockedArgs(req);
        sinon.stub(jwt, 'verify').throws(new Error(errorMessage));

        // call validator
        await validateCustomer(mockedReq, mockedRes, mockedNext);

        // assert
        expect(mockedNext.called, 'should call next(error)').to.be.true;
        expect(mockedNext.getCall(0).args[0].message).equals(errorMessage);
    });
});
