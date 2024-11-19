require('../../testHelper');
const { expect, chai } = require('../../support/chaiHelper');
const { createMiddlewareMockedArgs } = require('../../support/mockers/createMiddlewareMockedArgs')
chai.use(require('chai-as-promised'));
const getTurnDetailsWithOrderValidation = require('../../../validations/liveLink/machine/getTurnDetailsWithOrderValidation');
const factory = require('../../factories');
const { FACTORIES_NAMES } = require('../../constants/factoriesNames');


describe('test getTurnDetailsWithOrderValidation endpoint validator', () => {
    let business;
    let store;
    let centsCustomer;
    let storeCustomer;
    let turn;

    beforeEach(async () => {
        business = await factory.create(FACTORIES_NAMES.laundromatBusiness);
        store = await factory.create(FACTORIES_NAMES.store, {
            businessId: business.id,
        });
        centsCustomer = await factory.create(FACTORIES_NAMES.centsCustomer);
        storeCustomer = await factory.create(FACTORIES_NAMES.storeCustomer, {
            centsCustomerId: centsCustomer.id,
            businessId: business.id,
            storeId: store.id,
        });
        turn = await factory.create(FACTORIES_NAMES.turn, {
            storeCustomerId: storeCustomer.id,
            storeId: store.id,
        });
    })

    describe('when parameters are valid', () => {
        it('should call next() function', async () => {
            const req = {
                params: {
                    turnId: turn.id,
                }
            };
            const { mockedReq, mockedRes, mockedNext } = createMiddlewareMockedArgs(req);

            await getTurnDetailsWithOrderValidation(mockedReq, mockedRes, mockedNext);

            expect(mockedNext.called).to.be.true;
            expect(mockedRes.called).not.to.be.true;
        });
    });

    describe('when parameters are invalid', () => {
        it('should have a status 422 if "turnId" is missed', async () => {
            const req = {
                params: {
                    wrongParam: turn.id,
                }
            };
            const { mockedReq, mockedRes, mockedNext } = createMiddlewareMockedArgs(req);

            await getTurnDetailsWithOrderValidation(mockedReq, mockedRes, mockedNext);

            expect(mockedNext.called).to.be.false;
            expect(mockedRes.status.calledWith(422)).to.be.true;
            expect(mockedRes.json.getCall(0).args[0], 'with error in response').have.property(
                'error',
            );
        });

        it('should have a status 422 if "turnId" is invalid', async () => {
            const req = {
                params: {
                    turnId: 'dsjkhfkadh',
                }
            };
            const { mockedReq, mockedRes, mockedNext } = createMiddlewareMockedArgs(req);

            await getTurnDetailsWithOrderValidation(mockedReq, mockedRes, mockedNext);

            expect(mockedNext.called).to.be.false;
            expect(mockedRes.status.calledWith(422)).to.be.true;
            expect(mockedRes.json.getCall(0).args[0], 'with error in response').have.property(
                'error',
            );
        });

        it('should have a status 404 if a turn is not found', async () => {
            const req = {
                params: {
                    turnId: 424242,
                },
                currentCustomer: centsCustomer,
            };
            const { mockedReq, mockedRes, mockedNext } = createMiddlewareMockedArgs(req);

            await getTurnDetailsWithOrderValidation(mockedReq, mockedRes, mockedNext);

            expect(mockedNext.called).to.be.false;
            expect(mockedRes.status.calledWith(404)).to.be.true;
            expect(mockedRes.json.getCall(0).args[0], 'with error in response').have.property(
                'error',
            );
        });

        it('should have a status 400 if a customer is not found', async () => {
            const req = {
                params: {
                    turnId: turn.id,
                },
                currentCustomer: { id: 64782 },
            };
            const { mockedReq, mockedRes, mockedNext } = createMiddlewareMockedArgs(req);

            await getTurnDetailsWithOrderValidation(mockedReq, mockedRes, mockedNext);

            expect(mockedNext.called).to.be.false;
            expect(mockedRes.status.calledWith(400)).to.be.true;
            expect(mockedRes.json.getCall(0).args[0], 'with error in response').have.property(
                'error',
            );
        });

        it('should have a status 403 if a customer is not allowed', async () => {
            const centsCustomerWrong = await factory.create(FACTORIES_NAMES.centsCustomer);
            const storeCustomerWrong = await factory.create(FACTORIES_NAMES.storeCustomer, {
                centsCustomerId: centsCustomerWrong.id,
                businessId: business.id,
                storeId: store.id,
            });
            const device = await factory.create(FACTORIES_NAMES.devicePairedOnline, {
                name: '33:44:dd:ii:pp:dd'
            });
            const turnForbidden = await factory.create(FACTORIES_NAMES.turn, {
                storeCustomerId: storeCustomerWrong.id,
                storeId: store.id,
                deviceId: device.id,
            });
            const req = {
                params: {
                    turnId: turnForbidden.id,
                },
                currentCustomer: { id: centsCustomer.id },
            };

            const { mockedReq, mockedRes, mockedNext } = createMiddlewareMockedArgs(req);

            await getTurnDetailsWithOrderValidation(mockedReq, mockedRes, mockedNext);

            expect(mockedNext.called).to.be.false;
            expect(mockedRes.status.calledWith(403)).to.be.true;
            expect(mockedRes.json.getCall(0).args[0], 'with error in response').have.property(
                'error',
            );
        });
    });


});
