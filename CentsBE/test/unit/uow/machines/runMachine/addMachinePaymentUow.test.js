require('../../../../testHelper');
const { expect, chai } = require('../../../../support/chaiHelper');
chai.use(require('chai-as-promised'));
const factory = require('../../../../factories');
const { FACTORIES_NAMES } = require('../../../../constants/factoriesNames');
const { addMachinePaymentUow }  = require('../../../../../uow/machines/runMachine/addMachinePaymentUow');
const MachinePayment = require('../../../../../models/machinePayment');
const MachinePaymentType = require('../../../../../models/machinePaymentType');
const { serviceTypes, MACHINE_PAYMENT_TYPES } = require('../../../../../constants/constants');

describe('test addMachinePaymentUow function', () => {
    let business;
    let store;
    let centsCustomer;
    let device;
    let pairing;
    let machine;
    let machinePaymentType;
    let turn;

    beforeEach(async () => {
        business = await factory.create(FACTORIES_NAMES.laundromatBusiness);
        store = await factory.create(FACTORIES_NAMES.store, {
            businessId: business.id,
        });
        centsCustomer = await factory.create(FACTORIES_NAMES.centsCustomer);
        device = await factory.create(FACTORIES_NAMES.devicePaired);
        machine = await factory.create(FACTORIES_NAMES.machine, {
            storeId: store.id,
        });
        machinePaymentType = await factory.create(FACTORIES_NAMES.machinePaymentType, {
            type: MACHINE_PAYMENT_TYPES.APP,
        });
        pairing = await factory.create(FACTORIES_NAMES.pairing, {
            deviceId: device.id,
            machineId: machine.id,
        })
        turn = await factory.create(FACTORIES_NAMES.turn, {
            machineId: machine.id,
            storeId: store.id,
            deviceId: device.id,
        });
    })

    describe('when serviceType is not SELF_SERVICE', () => {
        it('should not change the payload and create MachinePayment if serviceType is CUSTOMER_SERVICE', async () => {
            const payloadMock = {
                serviceType: serviceTypes.CUSTOMER_SERVICE,
                businessId: business.id,
                turn,
            };

            const result = await addMachinePaymentUow(payloadMock);
            const machinePayment = await MachinePayment.query().first();

            expect(machinePayment).to.be.undefined;
            expect(result).to.be.deep.equal(payloadMock);
        });

        it('should not change the payload and create MachinePayment if serviceType is TECHNICAL_SERVICE', async () => {
            const payloadMock = {
                serviceType: serviceTypes.CUSTOMER_SERVICE,
                businessId: business.id,
                turn,
            };

            const result = await addMachinePaymentUow(payloadMock);
            const machinePayment = await MachinePayment.query().first();

            expect(machinePayment).to.be.undefined;
            expect(result).to.be.deep.equal(payloadMock);
        });

        it('should not change the payload and create MachinePayment if serviceType is FULL_SERVICE', async () => {
            const payloadMock = {
                serviceType: serviceTypes.FULL_SERVICE,
                businessId: business.id,
                turn,
            };

            const result = await addMachinePaymentUow(payloadMock);
            const machinePayment = await MachinePayment.query().first();

            expect(machinePayment).to.be.undefined;
            expect(result).to.be.deep.equal(payloadMock);
        });
    })

    describe('when serviceType is SELF_SERVICE', () => {
        it('should add to payload and create machinePayment if serviceType is SELF_SERVICE', async () => {
            const payloadMock = {
                serviceType: serviceTypes.SELF_SERVICE,
                businessId: business.id,
                turn,
            };

            const result = await addMachinePaymentUow(payloadMock);
            const machinePayment = await MachinePayment.query().first();

            expect(machinePayment).not.to.be.undefined;
            expect(result).to.be.deep.equal({ ...payloadMock, machinePayment });
        });

        it('should reject when MachinePaymentType is missed if serviceType is SELF_SERVICE', async () => {
            await MachinePaymentType.query().delete();
            const payloadMock = {
                serviceType: serviceTypes.SELF_SERVICE,
                businessId: business.id,
                turn,
            };

            await expect(addMachinePaymentUow(payloadMock)).to.be.rejected;
        });
    });
});
