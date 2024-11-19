require('../../../../testHelper');
const { expect, chai } = require('../../../../support/chaiHelper');
const factory = require('../../../../factories');
const { FACTORIES_NAMES } = require('../../../../constants/factoriesNames');
const { deviceStatuses } = require('../../../../../constants/constants');
const validateBusinessWithDeviceUow = require('../../../../../uow/machines/createMachineByDevice/validateBusinessWithDeviceUow');
const Device = require('../../../../../models/device');

describe('createMachineByDevice/validateBusinessWithDeviceUow function test', () => {
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
    });

    describe('when something is wrong with the device', () => {
        it('should throw an error if the device does not exist', async () => {
            const payloadMock = {
                deviceId: 46378,
                currentUser: user,
            };
            const spyErrorHandler = chai.spy(() => {});

            await (expect(validateBusinessWithDeviceUow(payloadMock, spyErrorHandler))).to.be.rejectedWith('Device is not found');
            expect(spyErrorHandler).to.have.been.called();
        });

        it('should throw an error if the device is offline', async () => {
            device = await factory.create(FACTORIES_NAMES.device, {
                batchId: batch.id,
                isActive: true,
                isPaired: false,
                status: deviceStatuses.OFFLINE,
                name: '66:cc:88:dd'
            });
            const payloadMock = {
                deviceId: device.id,
                currentUser: user,
            };
            const spyErrorHandler = chai.spy(() => {});

            await (expect(validateBusinessWithDeviceUow(payloadMock, spyErrorHandler))).to.be.rejectedWith('Can not create a machine from offline device');
            expect(spyErrorHandler).to.have.been.called();
        });

        it('should throw an error if the device is with wrong name', async () => {
            device = await factory.create(FACTORIES_NAMES.device, {
                batchId: batch.id,
                isActive: true,
                isPaired: false,
                status: deviceStatuses.ONLINE,
                name: null
            });
            const payloadMock = {
                deviceId: device.id,
                currentUser: user,
            };
            const spyErrorHandler = chai.spy(() => {});

            await (expect(validateBusinessWithDeviceUow(payloadMock, spyErrorHandler))).to.be.rejectedWith('Can not create a machine from offline device');
            expect(spyErrorHandler).to.have.been.called();
        });

        it('should throw an error if the device is paired', async () => {
            device = await factory.create(FACTORIES_NAMES.device, {
                batchId: batch.id,
                isActive: true,
                isPaired: true,
                status: deviceStatuses.ONLINE,
                name: '66:cc:88:dd'
            });
            const payloadMock = {
                deviceId: device.id,
                currentUser: user,
            };
            const spyErrorHandler = chai.spy(() => {});

            await (expect(validateBusinessWithDeviceUow(payloadMock, spyErrorHandler))).to.be.rejectedWith('Device is already paired');
            expect(spyErrorHandler).to.have.been.called();
        });
    });

    describe('when business is wrong', () => {
       it('should throw an error if the business is not found by the user', async () => {
           device = await factory.create(FACTORIES_NAMES.device, {
               batchId: batch.id,
               isActive: true,
               isPaired: false,
               status: deviceStatuses.ONLINE,
               name: '66:cc:88:dd'
           });
           const payloadMock = {
               deviceId: device.id,
               currentUser: {
                   id: 76943,
               },
           };

           const spyErrorHandler = chai.spy(() => {});

           await (expect(validateBusinessWithDeviceUow(payloadMock, spyErrorHandler))).to.be.rejectedWith('Business is not found');
           expect(spyErrorHandler).to.have.been.called();
       });

       it('should throw an error if the device does not belongs to the business', async () => {
           const userSecond = await factory.create(FACTORIES_NAMES.userWithBusinessOwnerRole);
           await factory.create(FACTORIES_NAMES.laundromatBusiness, { userId: userSecond.id });
           device = await factory.create(FACTORIES_NAMES.device, {
               batchId: batch.id,
               isActive: true,
               isPaired: false,
               status: deviceStatuses.ONLINE,
               name: '66:cc:88:dd'
           });
           const payloadMock = {
               deviceId: device.id,
               currentUser: userSecond,
           };
           const spyErrorHandler = chai.spy(() => {});

           await (expect(validateBusinessWithDeviceUow(payloadMock, spyErrorHandler))).to.be.rejectedWith('Device is not belonged to your business');
           expect(spyErrorHandler).to.have.been.called();
       });
    });

    describe('when the validation passed successfully', () => {
        it('should attach the device to payload', async () => {
            device = await factory.create(FACTORIES_NAMES.device, {
                batchId: batch.id,
                isActive: true,
                isPaired: false,
                status: deviceStatuses.ONLINE,
                name: '66:cc:88:dd'
            });
            const payloadMock = {
                deviceId: device.id,
                currentUser: user,
            };
            const spyErrorHandler = chai.spy(() => {});

            const result = await validateBusinessWithDeviceUow(payloadMock, spyErrorHandler);
            const deviceExpected = await Device.query().findById(device.id).withGraphJoined('[batch]');

            expect(result).to.deep.equal({
                ...payloadMock,
                device: deviceExpected,
            });
            expect(spyErrorHandler).not.to.have.been.called();
        });
    });
});