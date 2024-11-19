require('../../../testHelper');

const factory = require('../../../factories');
const { FACTORIES_NAMES } = require('../../../constants/factoriesNames');
const { expect } = require('../../../support/chaiHelper');
const {
    createMiddlewareMockedArgs,
} = require('../../../support/mockers/createMiddlewareMockedArgs');
const createMachineByDeviceValidation = require('../../../../validations/machines/createMachineByDeviceValidation');
const { deviceStatuses } = require('../../../../constants/constants');

describe('createMachineByDeviceValidation function test', () => {
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

    describe('when "deviceId" param is wrong', () => {
        it('should return 422 response when param is string letters', async () => {
            const req = {
                params: {
                    deviceId: 'sdsajk',
                },
                body: {
                    name: 'Afrodita'
                },
            };
            const { mockedReq, mockedRes, mockedNext, expectedResponseCall } = createMiddlewareMockedArgs(req);

            await createMachineByDeviceValidation(mockedReq, mockedRes, mockedNext);

            expectedResponseCall(422, (response) => {
                expect(response).to.have.property('error');
            });
        });

        it('should return 422 response when param is float value', async () => {
            const req = {
                params: {
                    deviceId: '46.47',
                },
                body: {
                    name: 'Afrodita'
                },
            };
            const { mockedReq, mockedRes, mockedNext, expectedResponseCall } = createMiddlewareMockedArgs(req);

            await createMachineByDeviceValidation(mockedReq, mockedRes, mockedNext);

            expectedResponseCall(422, (response) => {
                expect(response).to.have.property('error');
            });
        });

        it('should return 422 response when param is negative integer', async () => {
            const req = {
                params: {
                    deviceId: '-67',
                },
                body: {
                    name: 'Afrodita'
                },
            };
            const { mockedReq, mockedRes, mockedNext, expectedResponseCall } = createMiddlewareMockedArgs(req);

            await createMachineByDeviceValidation(mockedReq, mockedRes, mockedNext);

            expectedResponseCall(422, (response) => {
                expect(response).to.have.property('error');
            });
        });

        it('should return 422 response when param is equal 0', async () => {
            const req = {
                params: {
                    deviceId: '0',
                },
                body: {
                    name: 'Afrodita'
                },
            };
            const { mockedReq, mockedRes, mockedNext, expectedResponseCall } = createMiddlewareMockedArgs(req);

            await createMachineByDeviceValidation(mockedReq, mockedRes, mockedNext);

            expectedResponseCall(422, (response) => {
                expect(response).to.have.property('error');
            });
        });
    });

    describe('when "name" param is wrong', () => {
        it('should return 422 response when param is empty string', async () => {
            const req = {
                params: {
                    deviceId: device.id,
                },
                body: {
                    name: ''
                },
            };
            const { mockedReq, mockedRes, mockedNext, expectedResponseCall } = createMiddlewareMockedArgs(req);

            await createMachineByDeviceValidation(mockedReq, mockedRes, mockedNext);

            expectedResponseCall(422, (response) => {
                expect(response).to.have.property('error');
            });
        });

        it('should return 422 response when param is too long string', async () => {
            const req = {
                params: {
                    deviceId: device.id,
                },
                body: {
                    name: 'Afroditaaaaaaa'
                },
            };
            const { mockedReq, mockedRes, mockedNext, expectedResponseCall } = createMiddlewareMockedArgs(req);

            await createMachineByDeviceValidation(mockedReq, mockedRes, mockedNext);

            expectedResponseCall(422, (response) => {
                expect(response).to.have.property('error');
            });
        });
    });

    describe('when success execution', () => {
        it('should call next() function and attach constants', async () => {
            await factory.create(FACTORIES_NAMES.machineConfiguration, {
                PennyID: device.name,
            });
            const req = {
                params: {
                    deviceId: device.id,
                },
                body: {
                    name: 'Afrodita',
                },
                currentUser: user,
            };

            const { mockedReq, mockedRes, mockedNext } = createMiddlewareMockedArgs(req);

            await createMachineByDeviceValidation(mockedReq, mockedRes, mockedNext);

            expect(mockedNext.called, 'should call next()').to.be.true;
        });
    });
});
