require('../../../../testHelper');
const { expect } = require('../../../../support/chaiHelper');
const {
    createMiddlewareMockedArgs,
} = require('../../../../support/mockers/createMiddlewareMockedArgs');
const factory = require('../../../../factories');
const updateSubscriptionsValidation = require('../../../../../validations/liveLink/subscriptions/updateSubscriptions');
const { FACTORIES_NAMES: FN } = require('../../../../constants/factoriesNames');

describe('test updateSubscriptionsValidation', () => {
    let centsCustomer;
    let recurringSubscription;

    beforeEach(async () => {
        centsCustomer = await factory.create(FN.centsCustomer);
        recurringSubscription = await factory.create(FN.recurringSubscription, {
            centsCustomerId: centsCustomer.id,
        });
    });

    describe('should call next()', () => {
        it('with optional keys', async () => {
            const req = {
                body: {
                    isDeleted: true,
                    cancelNextPickup: true,
                    reinstateNextPickup: true,
                    interval: 1,
                },
                params: { id: recurringSubscription.id },
                currentCustomer: {
                    id: centsCustomer.id,
                },
            };
            const { mockedReq, mockedRes, mockedNext } = createMiddlewareMockedArgs(req);

            // call validator
            await updateSubscriptionsValidation(mockedReq, mockedRes, mockedNext);

            // assert
            expect(mockedNext.called, 'should call next()').to.be.true;
            expect(mockedNext.getCall(0).args, 'should call next() without error in args').to.be.an(
                'array',
            ).that.is.empty;
        });

        it('without optional keys', async () => {
            const req = {
                params: { id: recurringSubscription.id },
                currentCustomer: {
                    id: centsCustomer.id,
                },
            };
            const { mockedReq, mockedRes, mockedNext } = createMiddlewareMockedArgs(req);

            // call validator
            await updateSubscriptionsValidation(mockedReq, mockedRes, mockedNext);

            // assert
            expect(mockedNext.called, 'should call next()').to.be.true;
            expect(mockedNext.getCall(0).args, 'should call next() without error in args').to.be.an(
                'array',
            ).that.is.empty;
        });
    });

    describe('should response', () => {
        it('error when validation is not passed', async () => {
            const req = {
                body: {},
                params: { id: true },
            };
            const { mockedReq, mockedRes, mockedNext } = createMiddlewareMockedArgs(req);

            // call validator
            await updateSubscriptionsValidation(mockedReq, mockedRes, mockedNext);

            // assert
            expect(mockedRes.status.calledWith(422)).to.be.true;
            expect(mockedRes.json.getCall(0).args[0]).to.have.property(
                'error',
                '"id" must be a number',
            );
            expect(mockedNext.called, 'should call next()').to.be.false;
        });
    });

    describe('should call next(error)', () => {
        it('when subscription is not exist', async () => {
            const req = {
                body: {
                    isDeleted: true,
                    cancelNextPickup: true,
                    reinstateNextPickup: true,
                    interval: 1,
                },
                params: { id: 999999 },
                currentCustomer: {
                    id: centsCustomer.id,
                },
            };
            const { mockedReq, mockedRes, mockedNext } = createMiddlewareMockedArgs(req);

            // call validator
            await updateSubscriptionsValidation(mockedReq, mockedRes, mockedNext);

            // assert
            expect(mockedNext.called, 'should call next(error)').to.be.true;
            expect(mockedNext.getCall(0).args[0]).to.have.property(
                'message',
                'Invalid subscription id',
            );
        });

        it('with unprovided error', () => {
            const req = {
                body: {
                    isDeleted: true,
                    cancelNextPickup: true,
                    reinstateNextPickup: true,
                    interval: 1,
                },
                params: { id: recurringSubscription.id },
            };
            const { mockedReq, mockedRes, mockedNext } = createMiddlewareMockedArgs(req);

            // call validator
            updateSubscriptionsValidation(mockedReq, mockedRes, mockedNext);

            // assert
            expect(mockedNext.called, 'should call next(error)').to.be.true;
            expect(mockedNext.getCall(0).args[0]).to.have.property('message');
        });
    });
});
