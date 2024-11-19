require('../../../testHelper');

const factory = require('../../../factories');
const { FACTORIES_NAMES } = require('../../../constants/factoriesNames');
const { expect } = require('../../../support/chaiHelper');
const {
    createMiddlewareMockedArgs,
} = require('../../../support/mockers/createMiddlewareMockedArgs');
const getDeviceMachineDetailsValidation = require('../../../../validations/machines/getDeviceMachineDetailsValidation');
const { deviceStatuses } = require('../../../../constants/constants');

describe('getDeviceMachineDetailsValidation function test', () => {
    let user, business, store, batch, device;

    beforeEach(async () => {
        user = await factory.create(FACTORIES_NAMES.userWithBusinessOwnerRole);
        business = await factory.create(FACTORIES_NAMES.laundromatBusiness, { userId: user.id });
        store = await factory.create(FACTORIES_NAMES.store, {
            businessId: business.id,
        });
        batch = await factory.create(FACTORIES_NAMES.batch, {
            storeId: store.id,
            businessId: business.id,
        });
        device = await factory.create(FACTORIES_NAMES.device, {
            batchId: batch.id,
            isActive: true,
            isPaired: false,
            status: deviceStatuses.ONLINE,
            name: '66:cc:88:dd'
        });
    });

    describe('when deviceId param is wrong', () => {
        it('should return 422 response when param is string letters', async () => {
            const req = {
                params: {
                    deviceId: 'sdsajk',
                },
            };
            const { mockedReq, mockedRes, mockedNext, expectedResponseCall } = createMiddlewareMockedArgs(req);

            await getDeviceMachineDetailsValidation(mockedReq, mockedRes, mockedNext);

            expectedResponseCall(422, (response) => {
                expect(response).to.have.property('error');
            });
        });

        it('should return 422 response when param is float value', async () => {
            const req = {
                params: {
                    deviceId: '46.47',
                },
            };
            const { mockedReq, mockedRes, mockedNext, expectedResponseCall } = createMiddlewareMockedArgs(req);

            await getDeviceMachineDetailsValidation(mockedReq, mockedRes, mockedNext);

            expectedResponseCall(422, (response) => {
                expect(response).to.have.property('error');
            });
        });

        it('should return 422 response when param is negative integer', async () => {
            const req = {
                params: {
                    deviceId: '-67',
                },
            };
            const { mockedReq, mockedRes, mockedNext, expectedResponseCall } = createMiddlewareMockedArgs(req);

            await getDeviceMachineDetailsValidation(mockedReq, mockedRes, mockedNext);

            expectedResponseCall(422, (response) => {
                expect(response).to.have.property('error');
            });
        });

        it('should return 422 response when param is equal 0', async () => {
            const req = {
                params: {
                    deviceId: '0',
                },
            };
            const { mockedReq, mockedRes, mockedNext, expectedResponseCall } = createMiddlewareMockedArgs(req);

            await getDeviceMachineDetailsValidation(mockedReq, mockedRes, mockedNext);

            expectedResponseCall(422, (response) => {
                expect(response).to.have.property('error');
            });
        });
    });

    describe('when success execution', () => {
        it('should call the next() function', async () => {
            const req = {
                params: {
                    deviceId: device.id,
                },
            };
            const { mockedReq, mockedRes, mockedNext } = createMiddlewareMockedArgs(req);

            await getDeviceMachineDetailsValidation(mockedReq, mockedRes, mockedNext);

            expect(mockedNext.called, 'should call next()').to.be.true;
        });
    });
});
