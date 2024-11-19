require('../../../testHelper');
const { expect, chai } = require('../../../support/chaiHelper');
const { createMiddlewareMockedArgs } = require('../../../support/mockers/createMiddlewareMockedArgs')
chai.use(require('chai-as-promised'));
const customerInfoByStoreValidation = require('../../../../validations/liveLink/customerInfoByStoreValidation');
const factory = require('../../../factories');
const { FACTORIES_NAMES } = require('../../../constants/factoriesNames');


describe('test customerInfoByStoreValidation endpoint validator', () => {
    let business;
    let store;
    let centsCustomer;

    beforeEach(async () => {
        business = await factory.create(FACTORIES_NAMES.laundromatBusiness);
        store = await factory.create(FACTORIES_NAMES.store, {
            businessId: business.id,
        });
        centsCustomer = await factory.create(FACTORIES_NAMES.centsCustomer);
    })

    describe('when parameters are valid', () => {
        it('should call next() function', async () => {
            const req = {
                params: {
                    storeId: store.id,
                }
            };
            const { mockedReq, mockedRes, mockedNext } = createMiddlewareMockedArgs(req);

            await customerInfoByStoreValidation(mockedReq, mockedRes, mockedNext);

            expect(mockedNext.called).to.be.true;
            expect(mockedRes.called).not.to.be.true;
        });
    });

    describe('when parameters are invalid', () => {
        it('should have a status 422 if "storeId" is missed', async () => {
            const req = {
                params: {
                    wrongParam: store.id,
                }
            };
            const { mockedReq, mockedRes, mockedNext } = createMiddlewareMockedArgs(req);

            await customerInfoByStoreValidation(mockedReq, mockedRes, mockedNext);

            expect(mockedNext.called).to.be.false;
            expect(mockedRes.status.calledWith(422)).to.be.true;
            expect(mockedRes.json.getCall(0).args[0], 'with error in response').have.property(
                'error',
            );
        });

        it('should have a status 422 if "storeId" is invalid', async () => {
            const req = {
                params: {
                    storeId: 'dsjkhfkadh',
                }
            };
            const { mockedReq, mockedRes, mockedNext } = createMiddlewareMockedArgs(req);

            await customerInfoByStoreValidation(mockedReq, mockedRes, mockedNext);

            expect(mockedNext.called).to.be.false;
            expect(mockedRes.status.calledWith(422)).to.be.true;
            expect(mockedRes.json.getCall(0).args[0], 'with error in response').have.property(
                'error',
            );
        });

        it('should have a status 404 if a store is not found', async () => {
            const req = {
                params: {
                    storeId: 424242,
                },
                currentCustomer: centsCustomer,
            };
            const { mockedReq, mockedRes, mockedNext } = createMiddlewareMockedArgs(req);

            await customerInfoByStoreValidation(mockedReq, mockedRes, mockedNext);

            expect(mockedNext.called).to.be.false;
            expect(mockedRes.status.calledWith(404)).to.be.true;
            expect(mockedRes.json.getCall(0).args[0], 'with error in response').have.property(
                'error',
            );
        });
    });
});
