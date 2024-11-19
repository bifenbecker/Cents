require('../../../testHelper');
const chai = require('chai');
const factory = require('../../../factories');
const { FACTORIES_NAMES: FN } = require('../../../constants/factoriesNames');
const { expect } = require('../../../support/chaiHelper');
const updateOrderPromotionValidation = require('../../../../validations/employeeTab/home/updateOrderPromotionValidation');
const {
    createMiddlewareMockedArgs,
} = require('../../../support/mockers/createMiddlewareMockedArgs');

describe('test updateOrderPromotionValidations', () => {
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

    it('should throw an error if promotionId is invalid', async () => {
        const body = { promotionId: 'test' };

        const { mockedReq, mockedRes, mockedNext } = createMiddlewareMockedArgs({ body });

        await updateOrderPromotionValidation(mockedReq, mockedRes, mockedNext);

        expect(mockedRes.status.calledWith(422), 'with 422 status code').to.be.true;
        expect(mockedRes.json.getCall(0).args[0], 'with error in response').have.property('error');
    });

    it('should call next() if data is correct', async () => {
        const serviceOrder = await factory.create(FN.serviceOrder, {
            storeCustomerId: storeCustomer.id,
        });
        await factory.create(FN.order, {
            orderableId: serviceOrder.id,
            orderableType: 'ServiceOrder',
        });

        const req = {
            body: {
                promotionId: serviceOrder.promotionId,
            },
            constants: {
                isPromoApplied: null,
                orderCalculationAttributes: {
                    promotionId: null,
                    creditAmount: null,
                },
            },
        };
        const res = null;
        const next = chai.spy();

        await updateOrderPromotionValidation(req, res, next);
        expect(next).to.have.been.called();
    });

    it('should call next() if data is correct (alternative)', async () => {
        const promotion = await factory.create(FN.promotion);
        const serviceOrder = await factory.create(FN.serviceOrder, {
            storeCustomerId: storeCustomer.id,
            promotionId: promotion.id,
        });
        await factory.create(FN.order, {
            orderableId: serviceOrder.id,
            orderableType: 'ServiceOrder',
        });

        const req = {
            body: {
                promotionId: serviceOrder.promotionId, // alternative
            },
            constants: {
                isPromoApplied: null,
                orderCalculationAttributes: {
                    promotionId: null,
                    creditAmount: null,
                },
            },
        };
        const { mockedReq, mockedRes, mockedNext } = createMiddlewareMockedArgs(req);

        await updateOrderPromotionValidation(mockedReq, mockedRes, mockedNext);

        expect(mockedNext.called, 'should call next()').to.be.true;
        // alternative
        expect(mockedReq.constants.orderCalculationAttributes.creditAmount).to.be.equal(0);
    });

    it('should call next(error)', async () => {
        const req = {
            constants: {
                isPromoApplied: null,
                orderCalculationAttributes: {
                    promotionId: null,
                    creditAmount: null,
                },
            },
        };
        const { mockedReq, mockedRes, mockedNext } = createMiddlewareMockedArgs(req);

        await updateOrderPromotionValidation(mockedReq, mockedRes, mockedNext);

        expect(mockedNext.called, 'should call next(error)').to.be.true;
        expect(mockedNext.getCall(0).args[0].message).to.not.be.empty;
    });
});
