require('../../../testHelper');
const sinon = require('sinon');
const { expect } = require('../../../support/chaiHelper');
const {
    createMiddlewareMockedArgs,
} = require('../../../support/mockers/createMiddlewareMockedArgs');
const {
    createUserWithBusinessAndCustomerOrders,
} = require('../../../support/factoryCreators/createUserWithBusinessAndCustomerOrders');
const validateCustomerAndOrder = require('../../../../middlewares/liveLink/checkOrder');
const JwtService = require('../../../../services/tokenOperations/main');

describe('test validateCustomerAndOrder', () => {
    let customerauthtoken;
    let centsCustomer;
    let serviceOrder;

    beforeEach(async () => {
        const entities = await createUserWithBusinessAndCustomerOrders();
        centsCustomer = entities.centsCustomer;
        serviceOrder = entities.serviceOrder;

        const jwtService = new JwtService(JSON.stringify(centsCustomer));
        customerauthtoken = jwtService.tokenGenerator(process.env.JWT_SECRET_LIVE_LINK_CUSTOMER);
    });

    describe('should call next() with correct token', async () => {
        it('with initial data in req.constants', async () => {
            const req = {
                constants: {
                    order: serviceOrder,
                    test: 'test',
                },
                headers: { customerauthtoken },
            };
            const { mockedReq, mockedRes, mockedNext } = createMiddlewareMockedArgs(req);

            // call validator
            await validateCustomerAndOrder(mockedReq, mockedRes, mockedNext);

            // assert
            expect(mockedNext.called, 'should call next()').to.be.true;
            expect(mockedNext.getCall(0).args, 'should call next() without error in args').to.be.an(
                'array',
            ).that.is.empty;
            expect(
                mockedReq.constants.order,
                'req.constants.order should have correct serviceOrder',
            ).to.have.keys([
                'availableCredits',
                'balanceDue',
                'businessId',
                'centsCustomerId',
                'convenienceFee',
                'convenienceFeeId',
                'creditAmount',
                'email',
                'employeeCode',
                'firstName',
                'hangDryInstructions',
                'id',
                'orderTotal',
                'netOrderTotal',
                'isHangDrySelected',
                'lastName',
                'masterOrderId',
                'orderType',
                'paymentStatus',
                'phoneNumber',
                'pickupDeliveryFee',
                'pickupDeliveryTip',
                'previousTipOption',
                'promotionAmount',
                'promotionId',
                'returnDeliveryFee',
                'returnDeliveryTip',
                'status',
                'storeCustomerId',
                'storeCustomerPhone',
                'storeId',
                'taxAmountInCents',
                'tipAmount',
            ]);
            expect(mockedReq.constants, 'req.constants should have initial values')
                .have.property('test')
                .equals('test');
        });
    });

    describe('should response correct error', async () => {
        it('with incorrect token type', async () => {
            const { mockedReq, mockedRes, mockedNext } = createMiddlewareMockedArgs({
                constants: {
                    order: serviceOrder,
                },
                headers: { customerauthtoken: null },
            });

            // call validator
            await validateCustomerAndOrder(mockedReq, mockedRes, mockedNext);

            // assert
            expect(mockedRes.status.calledWith(401), 'with 401 status code').to.be.true;
            expect(mockedRes.json.getCall(0).args[0], 'with error in response').have.property(
                'error',
            );
        });

        it('if serviceOrder is not associated', async () => {
            const { mockedReq, mockedRes, mockedNext } = createMiddlewareMockedArgs({
                constants: {
                    order: { id: null },
                },
                headers: { customerauthtoken },
            });

            // call validator
            await validateCustomerAndOrder(mockedReq, mockedRes, mockedNext);

            // assert
            expect(mockedRes.status.calledWith(401), 'with 401 status code').to.be.true;
            expect(mockedRes.json.getCall(0).args[0], 'with error in response').have.property(
                'error',
            );
        });
    });

    it('should call next(error) with unprovided error', async () => {
        const errorMessage = 'Unprovided error!';
        const req = {
            constants: {
                order: { id: null },
            },
            headers: { customerauthtoken },
        };
        const { mockedReq, mockedRes, mockedNext } = createMiddlewareMockedArgs(req);
        sinon.stub(JwtService.prototype, 'verifyToken').throws(new Error(errorMessage));

        // call validator
        await validateCustomerAndOrder(mockedReq, mockedRes, mockedNext);

        // assert
        expect(mockedNext.called, 'should call next(error)').to.be.true;
        expect(mockedNext.getCall(0).args[0].message).equals(errorMessage);
    });
});
