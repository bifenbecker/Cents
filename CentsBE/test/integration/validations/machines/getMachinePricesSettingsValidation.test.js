require('../../../testHelper');

const factory = require('../../../factories');
const { FACTORIES_NAMES } = require('../../../constants/factoriesNames');
const { expect } = require('../../../support/chaiHelper');
const {
    createMiddlewareMockedArgs,
} = require('../../../support/mockers/createMiddlewareMockedArgs');
const getMachinePricesSettingsValidation = require('../../../../validations/machines/getMachinePricesSettingsValidation');

describe('getMachinePricesSettingsValidation function test', () => {
    let user, business, store, machine;

    beforeEach(async () => {
        user = await factory.create(FACTORIES_NAMES.userWithBusinessOwnerRole);
        business = await factory.create(FACTORIES_NAMES.laundromatBusiness, { userId: user.id });
        store = await factory.create(FACTORIES_NAMES.store, {
            businessId: business.id,
        });
        machine = await factory.create(FACTORIES_NAMES.machine, {
            storeId: store.id,
        });
    });

    describe('when "machineId" param is wrong', () => {
        it('should return 422 response when param is string letters', async () => {
            const req = {
                params: {
                    machineId: 'sdsajk',
                },
            };
            const { mockedReq, mockedRes, mockedNext, expectedResponseCall } = createMiddlewareMockedArgs(req);

            await getMachinePricesSettingsValidation(mockedReq, mockedRes, mockedNext);

            expectedResponseCall(422, (response) => {
                expect(response).to.have.property('error');
            });
        });

        it('should return 422 response when param is float value', async () => {
            const req = {
                params: {
                    machineId: '46.47',
                },
            };
            const { mockedReq, mockedRes, mockedNext, expectedResponseCall } = createMiddlewareMockedArgs(req);

            await getMachinePricesSettingsValidation(mockedReq, mockedRes, mockedNext);

            expectedResponseCall(422, (response) => {
                expect(response).to.have.property('error');
            });
        });

        it('should return 422 response when param is negative integer', async () => {
            const req = {
                params: {
                    machineId: '-67',
                },
            };
            const { mockedReq, mockedRes, mockedNext, expectedResponseCall } = createMiddlewareMockedArgs(req);

            await getMachinePricesSettingsValidation(mockedReq, mockedRes, mockedNext);

            expectedResponseCall(422, (response) => {
                expect(response).to.have.property('error');
            });
        });

        it('should return 422 response when param is equal 0', async () => {
            const req = {
                params: {
                    machineId: '0',
                },
            };
            const { mockedReq, mockedRes, mockedNext, expectedResponseCall } = createMiddlewareMockedArgs(req);

            await getMachinePricesSettingsValidation(mockedReq, mockedRes, mockedNext);

            expectedResponseCall(422, (response) => {
                expect(response).to.have.property('error');
            });
        });
    });

    describe('when success execution', () => {
        it('should call next() function and attach constants', async () => {
            const req = {
                params: {
                    machineId: machine.id,
                },
            };

            const { mockedReq, mockedRes, mockedNext } = createMiddlewareMockedArgs(req);

            await getMachinePricesSettingsValidation(mockedReq, mockedRes, mockedNext);

            expect(mockedNext.called, 'should call next()').to.be.true;
        });
    });
});
