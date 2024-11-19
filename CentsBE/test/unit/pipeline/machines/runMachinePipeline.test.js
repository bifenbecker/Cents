require('../../../testHelper');
const { expect, chai } = require('../../../support/chaiHelper');
const factory = require('../../../factories');
const runMachinePipeline = require('../../../../pipeline/machines/runMachinePipeline');
const { serviceTypes, deviceStatuses, statuses } = require('../../../../constants/constants');
const Turns = require('../../../../models/turns');
const PusherOperations = require('../../../../pusher/PusherOperations');
const MessageBroker = require('../../../../message_broker/messageBroker');
const sinon = require('sinon');

const createMachinePricing = async (machineId) => {
    await factory.create('machinePricing', {
        machineId: machineId,
        price: 11,
    });
};

const createMachinePairingAndPricing = async (machineId, deviceId) => {
    await factory.create('pairing', {
        machineId: machineId,
        deviceId: deviceId,
    });
    await createMachinePricing(machineId);
};

describe('test runMachinePipeline', () => {
    let user, business, store, machine, device, pusherSpy, messageBrokerSpy;

    beforeEach(async () => {
        user = await factory.create('userWithBusinessOwnerRole');
        business = await factory.create('laundromatBusiness', { userId: user.id });
        store = await factory.create('store', {
            businessId: business.id,
        });
        machine = await factory.create('machine', {
            storeId: store.id,
        });
        device = await factory.create('device', {
            status: deviceStatuses.ONLINE,
            isPaired: true,
        });
        pusherSpy = sinon.spy(PusherOperations, 'publishStoreEvent');
        messageBrokerSpy = sinon.spy(MessageBroker, 'publish');
    });

    afterEach(() => {
        chai.spy.restore(PusherOperations);
        chai.spy.restore(MessageBroker);
    });

    it('should throw an error if machine was not found', async () => {
        const payload = {
            serviceType: serviceTypes.TECHNICAL_SERVICE,
            technicianName: 'John Doe',
            note: 'Just fix it',
            quantity: 1,
            machineId: -1,
            businessId: business.id,
        };

        await expect(runMachinePipeline(payload)).to.be.rejectedWith('Machine not found');
    });

    it('should throw an error if machine is not paired', async () => {
        const payload = {
            serviceType: serviceTypes.TECHNICAL_SERVICE,
            technicianName: 'John Doe',
            note: 'Just fix it',
            quantity: 1,
            machineId: machine.id,
            businessId: business.id,
        };

        await expect(runMachinePipeline(payload)).to.be.rejectedWith('Machine is not paired');
    });

    it('should create a turn for a technical service', async () => {
        await createMachinePairingAndPricing(machine.id, device.id);

        const payload = {
            serviceType: serviceTypes.TECHNICAL_SERVICE,
            technicianName: 'John Doe',
            note: 'Just fix it',
            quantity: 1,
            machineId: machine.id,
            businessId: business.id,
        };

        const result = await runMachinePipeline(payload);

        const turn = await Turns.query().findById(result.turnId);
        expect(turn).to.not.be.null;

        expect(pusherSpy.getCall(0).args[0]).to.equal(store.id);
        expect(messageBrokerSpy.getCall(0).args[0]).to.include({
            paymentStatus: 'SUCCESS',
            paymentType: 'App',
            amount: 0.11,
            startSignal: 1,
            type: 'REMOTE_START',
            deviceName: device.name,
        });
    });

    it('should create a turn for a customer service', async () => {
        await createMachinePairingAndPricing(machine.id, device.id);
        const centsCustomer = await factory.create('centsCustomer');

        const payload = {
            serviceType: serviceTypes.CUSTOMER_SERVICE,
            centsCustomerId: centsCustomer.id,
            note: 'Just fix it',
            quantity: 1,
            machineId: machine.id,
            businessId: business.id,
        };

        const result = await runMachinePipeline(payload);

        const turn = await Turns.query().findById(result.turnId);
        expect(turn).to.not.be.null;

        expect(pusherSpy.getCall(0).args[0]).to.equal(store.id);
        expect(messageBrokerSpy.getCall(0).args[0]).to.include({
            paymentStatus: 'SUCCESS',
            paymentType: 'App',
            amount: 0.11,
            startSignal: 1,
            type: 'REMOTE_START',
            deviceName: device.name,
        });
    });

    it('should create a turn for a full service', async () => {
        await createMachinePricing(machine.id);
        const centsCustomer = await factory.create('centsCustomer');
        const serviceOrder = await factory.create('serviceOrder', {
            userId: user.id,
            storeId: store.id,
            storeCustomerId: factory.assoc('storeCustomer', 'id'),
            status: statuses.PROCESSING,
        });

        const payload = {
            serviceType: serviceTypes.FULL_SERVICE,
            centsCustomerId: centsCustomer.id,
            note: 'Just fix it',
            quantity: 1,
            machineId: machine.id,
            businessId: business.id,
            serviceOrderId: serviceOrder.id,
        };

        const result = await runMachinePipeline(payload);

        const turn = await Turns.query().findById(result.turnId);
        expect(turn).to.not.be.null;

        expect(pusherSpy.getCall(0)).to.be.null;
        expect(messageBrokerSpy.getCall(0)).to.be.null;
    });
});
