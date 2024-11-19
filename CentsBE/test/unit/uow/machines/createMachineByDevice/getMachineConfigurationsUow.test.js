require('../../../../testHelper');

const factory = require('../../../../factories');
const { FACTORIES_NAMES } = require('../../../../constants/factoriesNames');
const { expect, chai } = require('../../../../support/chaiHelper');
const { mockMachineModelConfig, mockMachineFeatureConfig, mockMachineProgrammingWasherConfig } = require('../../../../support/machineConfiguartionsHelper');
const { deviceStatuses } = require('../../../../../constants/constants');
const Device = require('../../../../../models/device');
const { mapMachineProgramming, mapMachineModel, mapMachineFeature } = require('../../../../../services/machines/devicesResponseMappers');
const getMachineConfigurationsUow = require('../../../../../uow/machines/createMachineByDevice/getMachineConfigurationsUow');

describe('createMachineByDevice/getMachineConfigurationsUow function test', () => {
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

    describe('when device configuration does not exist or wrong device', () => {
        it('should throw an error if configurations has not been stored', async () => {
            const payloadMock = {
                device: {
                    name: '00:00:00:00'
                },
            };
            const spyErrorHandler = chai.spy(() => {});

            await expect(getMachineConfigurationsUow(payloadMock, spyErrorHandler)).to.be.rejectedWith('Requested device configuration does not exist');
            expect(spyErrorHandler).to.have.been.called();
        });
    });

    describe('when device configuration exists', () => {
        it('should attach mapped configurations to returning payload', async () => {
            const deviceMock = await Device.query().findById(device.id);
            const payloadMock = { device: deviceMock };
            const spyErrorHandler = chai.spy(() => {});

            const result = await getMachineConfigurationsUow(payloadMock, spyErrorHandler);

            expect(result).to.deep.equal({
                ...payloadMock,
                configurations: {
                    machineFeature: mapMachineFeature(configurations),
                    machineModel: mapMachineModel(configurations),
                    machineProgramming: mapMachineProgramming(configurations),
                }
            });
            expect(spyErrorHandler).not.to.have.been.called();
        });
    });
});
