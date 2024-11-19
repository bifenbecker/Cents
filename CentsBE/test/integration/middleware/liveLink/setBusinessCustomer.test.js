require('../../../testHelper');
const { expect } = require('../../../support/chaiHelper');
const {
    createUserWithBusinessAndCustomerOrders: createBusiness,
} = require('../../../support/factoryCreators/createUserWithBusinessAndCustomerOrders');
const {
    createMiddlewareMockedArgs,
} = require('../../../support/mockers/createMiddlewareMockedArgs');
const setBusinessCustomer = require('../../../../middlewares/liveLink/setBusinessCustomer');

describe('test setBusinessCustomer middleware', () => {
    const testData = 'testData';
    let entities;

    beforeEach(async () => {
        entities = await createBusiness();
    });

    describe('with constants.businessCustomer and initial data in req', () => {
        it('should call next()', async () => {
            const { centsCustomer, store, businessCustomer } = entities;
            const req = {
                testData,
                currentCustomer: centsCustomer,
                params: { storeId: store.id },
            };
            const { mockedReq, mockedRes, mockedNext } = createMiddlewareMockedArgs(req);

            // call validator
            await setBusinessCustomer(mockedReq, mockedRes, mockedNext);

            // assert
            expect(mockedNext.called, 'should call next()').to.be.true;
            expect(mockedNext.getCall(0).args, 'should call next() without error in args').to.be.an(
                'array',
            ).that.is.empty;
            expect(mockedReq, 'req.constants should have businessCustomer')
                .have.property('constants')
                .have.property('businessCustomer')
                .deep.equal(businessCustomer);
            expect(mockedReq, 'req should have initial values').have.property('testData', testData);
        });
    });

    it('should call next(error) with unprovided error', async () => {
        const { store } = entities;
        const req = {
            testData,
            params: { storeId: store.id },
        };
        const { mockedReq, mockedRes, mockedNext } = createMiddlewareMockedArgs(req);

        // call validator
        await setBusinessCustomer(mockedReq, mockedRes, mockedNext);

        // assert
        expect(mockedNext.called, 'should call next(error)').to.be.true;
        expect(
            mockedNext.getCall(0).args[0],
            'next(error) should have message in error',
        ).have.property('message');
    });
});
