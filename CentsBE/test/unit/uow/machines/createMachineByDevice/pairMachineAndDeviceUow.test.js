require('../../../../testHelper');

const factory = require('../../../../factories');
const { FACTORIES_NAMES } = require('../../../../constants/factoriesNames');
const { expect } = require('../../../../support/chaiHelper');
const { deviceStatuses, origins } = require('../../../../../constants/constants');
const Pairing = require('../../../../../models/pairing');
const Device = require('../../../../../models/device');

const pairMachineAndDeviceUow = require('../../../../../uow/machines/createMachineByDevice/pairMachineAndDeviceUow');

describe('createMachineByDevice/pairMachineAndDeviceUow function test', () => {
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
        machine = await factory.create(FACTORIES_NAMES.machine);
    });

    describe('when pair a machine with a device', () => {
        it('should attach created pairing entity and set isPaired flag into the device', async () => {
            const payloadMock = {
                device: {
                    ...device,
                    batch: {
                        storeId: store.id,
                    },
                },
                origin: origins.BUSINESS_MANAGER,
                machine,
                currentUser: user,
            };

            const result = await pairMachineAndDeviceUow(payloadMock);

            const pairingExpected = await Pairing.query().findOne({
                origin: origins.BUSINESS_MANAGER,
                deviceId: device.id,
                machineId: machine.id,
                pairedByUserId: user.id,
            }).orderBy('id', 'desc');
            const deviceExpected = await Device.query().findById(device.id);

            expect(result).to.deep.equal({
                ...payloadMock,
                pairing: pairingExpected
            });
            expect(device).to.have.property('isPaired').to.be.false;
            expect(deviceExpected).to.have.property('isPaired').to.be.true;
        });
    });
});
