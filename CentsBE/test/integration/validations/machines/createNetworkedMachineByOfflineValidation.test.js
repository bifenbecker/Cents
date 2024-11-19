require('../../../testHelper');

const factory = require('../../../factories');
const { FACTORIES_NAMES } = require('../../../constants/factoriesNames');
const { expect } = require('../../../support/chaiHelper');
const {
    createMiddlewareMockedArgs,
} = require('../../../support/mockers/createMiddlewareMockedArgs');
const createNetworkedMachineByOfflineValidation = require('../../../../validations/machines/createNetworkedMachineByOfflineValidation');
const { deviceStatuses } = require('../../../../constants/constants');

describe('createMachineByDeviceValidation function test', () => {
    let user, business, store, batch, device, machine;

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
        machine = await factory.create(FACTORIES_NAMES.machineWasher, {
            storeId: store.id,
        });
    });

    describe('when "deviceId" param is wrong', () => {
        it('should return 422 response when param is string letters', async () => {
            const req = {
                params: {
                    machineId: `${machine.id}`,
                },
                body: {
                    name: 'Afrodita',
                    deviceId: 'sdsajk',
                },
            };
            const { mockedReq, mockedRes, mockedNext, expectedResponseCall } = createMiddlewareMockedArgs(req);

            await createNetworkedMachineByOfflineValidation(mockedReq, mockedRes, mockedNext);

            expectedResponseCall(422, (response) => {
                expect(response).to.have.property('error');
            });
        });

        it('should return 422 response when param is float value', async () => {
            const req = {
                params: {
                    machineId: `${machine.id}`,
                },
                body: {
                    name: 'Afrodita',
                    deviceId: '46.47',
                },
            };
            const { mockedReq, mockedRes, mockedNext, expectedResponseCall } = createMiddlewareMockedArgs(req);

            await createNetworkedMachineByOfflineValidation(mockedReq, mockedRes, mockedNext);

            expectedResponseCall(422, (response) => {
                expect(response).to.have.property('error');
            });
        });

        it('should return 422 response when param is negative integer', async () => {
            const req = {
                params: {
                    machineId: `${machine.id}`,
                },
                body: {
                    name: 'Afrodita',
                    deviceId: '-67',
                },
            };
            const { mockedReq, mockedRes, mockedNext, expectedResponseCall } = createMiddlewareMockedArgs(req);

            await createNetworkedMachineByOfflineValidation(mockedReq, mockedRes, mockedNext);

            expectedResponseCall(422, (response) => {
                expect(response).to.have.property('error');
            });
        });

        it('should return 422 response when param is equal 0', async () => {
            const req = {
                params: {
                    machineId: `${machine.id}`,
                },
                body: {
                    name: 'Afrodita',
                    deviceId: 0,
                },
            };
            const { mockedReq, mockedRes, mockedNext, expectedResponseCall } = createMiddlewareMockedArgs(req);

            await createNetworkedMachineByOfflineValidation(mockedReq, mockedRes, mockedNext);

            expectedResponseCall(422, (response) => {
                expect(response).to.have.property('error');
            });
        });
    });

    describe('when "machineId" param is wrong', () => {
        it('should return 422 response when param is string letters', async () => {
            const req = {
                params: {
                    machineId: 'dfjknfks',
                },
                body: {
                    name: 'Afrodita',
                    deviceId: device.id,
                },
            };
            const { mockedReq, mockedRes, mockedNext, expectedResponseCall } = createMiddlewareMockedArgs(req);

            await createNetworkedMachineByOfflineValidation(mockedReq, mockedRes, mockedNext);

            expectedResponseCall(422, (response) => {
                expect(response).to.have.property('error');
            });
        });

        it('should return 422 response when param is float value', async () => {
            const req = {
                params: {
                    machineId: `46.47`,
                },
                body: {
                    name: 'Afrodita',
                    deviceId: device.id,
                },
            };
            const { mockedReq, mockedRes, mockedNext, expectedResponseCall } = createMiddlewareMockedArgs(req);

            await createNetworkedMachineByOfflineValidation(mockedReq, mockedRes, mockedNext);

            expectedResponseCall(422, (response) => {
                expect(response).to.have.property('error');
            });
        });

        it('should return 422 response when param is negative integer', async () => {
            const req = {
                params: {
                    machineId: `-67`,
                },
                body: {
                    name: 'Afrodita',
                    deviceId: device.id,
                },
            };
            const { mockedReq, mockedRes, mockedNext, expectedResponseCall } = createMiddlewareMockedArgs(req);

            await createNetworkedMachineByOfflineValidation(mockedReq, mockedRes, mockedNext);

            expectedResponseCall(422, (response) => {
                expect(response).to.have.property('error');
            });
        });

        it('should return 422 response when param is equal 0', async () => {
            const req = {
                params: {
                    machineId: `0`,
                },
                body: {
                    name: 'Afrodita',
                    deviceId: device.id,
                },
            };
            const { mockedReq, mockedRes, mockedNext, expectedResponseCall } = createMiddlewareMockedArgs(req);

            await createNetworkedMachineByOfflineValidation(mockedReq, mockedRes, mockedNext);

            expectedResponseCall(422, (response) => {
                expect(response).to.have.property('error');
            });
        });
    });

    describe('when "name" param is wrong', () => {
        it('should return 422 response when param is empty string', async () => {
            const req = {
                params: {
                    machineId: `${machine.id}`,
                },
                body: {
                    name: '',
                    deviceId: device.id
                },
            };
            const { mockedReq, mockedRes, mockedNext, expectedResponseCall } = createMiddlewareMockedArgs(req);

            await createNetworkedMachineByOfflineValidation(mockedReq, mockedRes, mockedNext);

            expectedResponseCall(422, (response) => {
                expect(response).to.have.property('error');
            });
        });

        it('should return 422 response when param is too long string', async () => {
            const req = {
                params: {
                    machineId: `${machine.id}`,
                },
                body: {
                    name: 'Afroditaaaaaaa',
                    deviceId: device.id
                },
            };
            const { mockedReq, mockedRes, mockedNext, expectedResponseCall } = createMiddlewareMockedArgs(req);

            await createNetworkedMachineByOfflineValidation(mockedReq, mockedRes, mockedNext);

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
                    machineId: `${machine.id}`,
                },
                body: {
                    name: 'Afrodita',
                    deviceId: device.id,
                },
                currentUser: user,
            };

            const { mockedReq, mockedRes, mockedNext } = createMiddlewareMockedArgs(req);

            await createNetworkedMachineByOfflineValidation(mockedReq, mockedRes, mockedNext);

            expect(mockedNext.called, 'should call next()').to.be.true;
        });
    });
});
