require('../../../testHelper');
const factory = require('../../../factories');
const { FACTORIES_NAMES: FN } = require('../../../constants/factoriesNames');
const { expect } = require('../../../support/chaiHelper');
const updateOrderCreditValidations = require('../../../../validations/employeeTab/home/updateOrderCredits');
const {
    createMiddlewareMockedArgs,
} = require('../../../support/mockers/createMiddlewareMockedArgs');

describe('test updateOrderCreditValidations', () => {
    let store, laundromatBusiness, centsCustomer, storeCustomer;

    beforeEach(async () => {
        laundromatBusiness = await factory.create(FN.laundromatBusiness);
        centsCustomer = await factory.create(FN.centsCustomer);
        store = await factory.create(FN.store);
        storeCustomer = await factory.create(FN.storeCustomer, {
            storeId: store.id,
            businessId: laundromatBusiness.id,
            centsCustomerId: centsCustomer.id,
        });
    });

    it('should throw an error if creditAmount is invalid', async () => {
        const body = { creditAmount: 'test' };

        const { mockedReq, mockedRes, mockedNext } = createMiddlewareMockedArgs({ body });

        await updateOrderCreditValidations(mockedReq, mockedRes, mockedNext);

        expect(mockedRes.status.calledWith(422), 'with 422 status code').to.be.true;
        expect(mockedRes.json.getCall(0).args[0], 'with error in response').have.property('error');
    });

    it('should call next() if data is correct', async () => {
        const serviceOrder = await factory.create(FN.serviceOrder, {
            storeCustomerId: storeCustomer.id,
            creditAmount: 10,
        });
        await factory.create(FN.order, {
            orderableId: serviceOrder.id,
            orderableType: 'ServiceOrder',
        });

        const req = {
            body: {
                creditAmount: serviceOrder.creditAmount,
            },
            constants: {
                orderCalculationAttributes: { creditAmount: null },
                isCreditApplied: null,
            },
        };
        const { mockedReq, mockedRes, mockedNext } = createMiddlewareMockedArgs(req);

        await updateOrderCreditValidations(mockedReq, mockedRes, mockedNext);
        expect(mockedNext.called, 'should call next()').to.be.true;
        expect(mockedReq.constants.orderCalculationAttributes)
            .to.have.property('creditAmount')
            .to.equal(serviceOrder.creditAmount);
        expect(mockedReq.constants)
            .to.have.property('isCreditApplied')
            .to.equal(serviceOrder.creditAmount);
    });

    it('should call next(error)', async () => {
        const req = {
            body: {},
            constants: {},
        };
        const { mockedReq, mockedRes, mockedNext } = createMiddlewareMockedArgs(req);

        await updateOrderCreditValidations(mockedReq, mockedRes, mockedNext);

        expect(mockedNext.called, 'should call next(error)').to.be.true;
        expect(mockedNext.getCall(0).args[0].message).to.not.be.empty;
    });
});
