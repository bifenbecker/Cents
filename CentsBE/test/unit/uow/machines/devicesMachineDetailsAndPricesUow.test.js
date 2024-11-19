require('../../../testHelper');

const factory = require('../../../factories');
const { FACTORIES_NAMES } = require('../../../constants/factoriesNames');
const { expect, chai } = require('../../../support/chaiHelper');
const { mockMachineModelConfig, mockMachineFeatureConfig, mockMachineProgrammingWasherConfig } = require('../../../support/machineConfiguartionsHelper');
const { deviceStatuses } = require('../../../../constants/constants');
const devicesMachineDetailsAndPricesUow = require('../../../../uow/machines/devices/deviceMachineDetailsAndPricesUow');
const { mapMachineProgramming, mapMachineModel, mapMachineFeature } = require('../../../../services/machines/devicesResponseMappers');

describe('devicesMachineDetailsAndPricesUow function test', () => {
    let user, business, store, batch, device, configurations;

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

        const mockConfigurationsBody = {
            ...mockMachineFeatureConfig({ PennyID: device.name }),
            ...mockMachineModelConfig({ PennyID: device.name }),
            ...mockMachineProgrammingWasherConfig({ PennyID: device.name }),
        };
        configurations = await factory.create(FACTORIES_NAMES.machineConfiguration, mockConfigurationsBody);
    });

    describe('when device configuration does not exist or no device', () => {
        it('should throw an error if device is not not found', async () => {
            const payloadMock = { deviceId: 4683 };
            const spyErrorHandler = chai.spy(() => {});

            await expect(devicesMachineDetailsAndPricesUow(payloadMock, spyErrorHandler)).to.be.rejectedWith('Device is not found');
            expect(spyErrorHandler).to.have.been.called();
        });

        it('should throw an error if device name is wrong', async () => {
            const deviceWrong = await factory.create(FACTORIES_NAMES.device, {
                name: null
            });
            const payloadMock = { deviceId: deviceWrong.id };
            const spyErrorHandler = chai.spy(() => {});

            await expect(devicesMachineDetailsAndPricesUow(payloadMock, spyErrorHandler)).to.be.rejectedWith('Device is not found');
            expect(spyErrorHandler).to.have.been.called();
        });

        it('should throw an error if configurations has not been stored', async () => {
            const deviceWrong = await factory.create(FACTORIES_NAMES.device, {
                name: '00:00:00:00'
            });
            const payloadMock = { deviceId: deviceWrong.id };
            const spyErrorHandler = chai.spy(() => {});

            await expect(devicesMachineDetailsAndPricesUow(payloadMock, spyErrorHandler)).to.be.rejectedWith('Requested device configuration does not exist');
            expect(spyErrorHandler).to.have.been.called();
        });
    });

    describe('when device configuration exists', () => {
        it('should return mapped result', async () => {
            const payloadMock = { deviceId: device.id };
            const spyErrorHandler = chai.spy(() => {});

            const result = await devicesMachineDetailsAndPricesUow(payloadMock, spyErrorHandler);

            expect(result).to.deep.equal({
                machineFeature: mapMachineFeature(configurations),
                machineModel: mapMachineModel(configurations),
                machineProgramming: mapMachineProgramming(configurations),
            });
            expect(spyErrorHandler).not.to.have.been.called();
        });
    });
});
