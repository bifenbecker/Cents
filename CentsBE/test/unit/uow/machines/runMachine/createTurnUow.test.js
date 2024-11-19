require('../../../../testHelper');
const { createTurnUow } = require('../../../../../uow/machines/runMachine/createTurnUow');
const { expect } = require('../../../../support/chaiHelper');
const factory = require('../../../../factories');
const {
    serviceTypes,
    deviceStatuses,
    turnStatuses,
    statuses,
} = require('../../../../../constants/constants');
const { FACTORIES_NAMES } = require('../../../../constants/factoriesNames');
const Turns = require('../../../../../models/turns');
const StoreCustomer = require('../../../../../models/storeCustomer');

describe('test createTurnUow', () => {
    let business, user, machine, device, store, centsCustomer;

    beforeEach(async () => {
        business = await factory.create(FACTORIES_NAMES.laundromatBusiness);
        user = await factory.create(FACTORIES_NAMES.user);
        machine = await factory.create(FACTORIES_NAMES.machine);
        device = await factory.create(FACTORIES_NAMES.device, {
            status: deviceStatuses.ONLINE,
            isPaired: true,
        });
        store = await factory.create(FACTORIES_NAMES.store);
        centsCustomer = await factory.create(FACTORIES_NAMES.centsCustomer);
    });

    it('should create a turn for a techical service', async () => {
        const payload = {
            serviceType: serviceTypes.TECHNICAL_SERVICE,
            technicianName: 'John Doe',
            note: 'Wash it',
            machineId: machine.id,
            machineDetails: {
                storeId: store.id,
                model: {
                    machineType: {
                        name: 'WASHER',
                    },
                },
                machinePricings: [
                    {
                        price: 10,
                    },
                ],
            },
            deviceId: device.id,
            quantity: 17,
            userId: user.id,
            origin: 'EMPLOYEE_TAB',
        };

        const result = await createTurnUow(payload);

        expect(result.userId).to.equal(payload.userId);
        expect(result.origin).to.equal(payload.origin);
        expect(result.turnId).to.exist;
        expect(result.turn).to.exist;
        expect(result.turn).to.include({
            serviceType: payload.serviceType,
            note: payload.note,
            machineId: payload.machineId,
            deviceId: payload.deviceId,
            storeId: payload.machineDetails.storeId,
            turnCode: 1001,
            status: turnStatuses.CREATED,
            netOrderTotalInCents: 170,
            technicianName: payload.technicianName,
        });
        expect(result.deviceStatus).to.equal(deviceStatuses.IN_USE);

        const turnInDb = await Turns.query().findById(result.turnId);
        expect(turnInDb).to.exist;
    });

    it('should create a turn with default quantity', async () => {
        const payload = {
            serviceType: serviceTypes.TECHNICAL_SERVICE,
            technicianName: 'John Doe',
            note: 'Wash it',
            machineId: machine.id,
            machineDetails: {
                storeId: store.id,
                model: {
                    machineType: {
                        name: 'WASHER',
                    },
                },
                machinePricings: [
                    {
                        price: 10,
                    },
                ],
            },
            deviceId: device.id,
            userId: user.id,
            origin: 'EMPLOYEE_TAB',
        };

        const result = await createTurnUow(payload);

        expect(result.userId).to.equal(payload.userId);
        expect(result.origin).to.equal(payload.origin);
        expect(result.turnId).to.exist;
        expect(result.turn).to.exist;
        expect(result.turn).to.include({
            serviceType: payload.serviceType,
            note: payload.note,
            machineId: payload.machineId,
            deviceId: payload.deviceId,
            storeId: payload.machineDetails.storeId,
            turnCode: 1001,
            status: turnStatuses.CREATED,
            netOrderTotalInCents: 10,
            technicianName: payload.technicianName,
        });
        expect(result.deviceStatus).to.equal(deviceStatuses.IN_USE);

        const turnInDb = await Turns.query().findById(result.turnId);
        expect(turnInDb).to.exist;
    });

    it('should create a turn for a customer service', async () => {
        const centsCustomer = await factory.create(FACTORIES_NAMES.centsCustomer),
            storeCustomer = await factory.create(FACTORIES_NAMES.storeCustomer, {
                storeId: store.id,
                businessId: business.id,
                centsCustomerId: centsCustomer.id,
            });

        const payload = {
            serviceType: serviceTypes.CUSTOMER_SERVICE,
            note: 'Wash it',
            machineId: machine.id,
            machineDetails: {
                storeId: store.id,
                model: {
                    machineType: {
                        name: 'WASHER',
                    },
                },
                machinePricings: [
                    {
                        price: 10,
                    },
                ],
            },
            deviceId: device.id,
            quantity: 17,
            businessId: business.id,
            centsCustomerId: centsCustomer.id,
            userId: user.id,
            origin: 'EMPLOYEE_TAB',
        };

        const result = await createTurnUow(payload);

        expect(result.userId).to.equal(payload.userId);
        expect(result.origin).to.equal(payload.origin);
        expect(result.turnId).to.exist;
        expect(result.turn).to.exist;
        expect(result.turn).to.include({
            serviceType: payload.serviceType,
            note: payload.note,
            machineId: payload.machineId,
            deviceId: payload.deviceId,
            storeId: payload.machineDetails.storeId,
            turnCode: 1001,
            status: turnStatuses.CREATED,
            netOrderTotalInCents: 170,
            storeCustomerId: storeCustomer.id,
        });
        expect(result.deviceStatus).to.equal(deviceStatuses.IN_USE);

        const turnInDb = await Turns.query().findById(result.turnId);
        expect(turnInDb).to.exist;
    });

    it('should create a turn for a customer service if customer does not exist', async () => {
        const centsCustomer = await factory.create(FACTORIES_NAMES.centsCustomer);

        const payload = {
            serviceType: serviceTypes.CUSTOMER_SERVICE,
            note: 'Wash it',
            machineId: machine.id,
            machineDetails: {
                storeId: store.id,
                model: {
                    machineType: {
                        name: 'WASHER',
                    },
                },
                machinePricings: [
                    {
                        price: 10,
                    },
                ],
            },
            deviceId: device.id,
            quantity: 17,
            businessId: business.id,
            centsCustomerId: centsCustomer.id,
            userId: user.id,
            origin: 'EMPLOYEE_TAB',
        };

        const result = await createTurnUow(payload);

        expect(result.userId).to.equal(payload.userId);
        expect(result.origin).to.equal(payload.origin);
        expect(result.turnId).to.exist;
        expect(result.turn).to.exist;
        expect(result.turn).to.include({
            serviceType: payload.serviceType,
            note: payload.note,
            machineId: payload.machineId,
            deviceId: payload.deviceId,
            storeId: payload.machineDetails.storeId,
            turnCode: 1001,
            status: turnStatuses.CREATED,
            netOrderTotalInCents: 170,
        });
        expect(result.turn.storeCustomerId).to.exist;
        expect(result.deviceStatus).to.equal(deviceStatuses.IN_USE);

        const turnInDb = await Turns.query().findById(result.turnId);
        expect(turnInDb).to.exist;

        // check that store customer was created
        const storeCustomerInDb = await StoreCustomer.query().findById(result.turn.storeCustomerId);
        expect(storeCustomerInDb).to.exist;
    });

    it('should create a turn for a full service', async () => {
        const activePairing = await factory.create(FACTORIES_NAMES.pairing, {
                machineId: machine.id,
                deviceId: device.id,
            }),
            centsCustomer = await factory.create(FACTORIES_NAMES.centsCustomer),
            storeCustomer = await factory.create(FACTORIES_NAMES.storeCustomer, {
                storeId: store.id,
                businessId: business.id,
                centsCustomerId: centsCustomer.id,
            }),
            serviceOrder = await factory.create(FACTORIES_NAMES.serviceOrder, {
                status: statuses.PROCESSING,
                storeId: store.id,
            });

        const payload = {
            serviceType: serviceTypes.FULL_SERVICE,
            note: 'Wash it',
            machineId: machine.id,
            machineDetails: {
                storeId: store.id,
                model: {
                    machineType: {
                        name: 'WASHER',
                    },
                },
                machinePricings: [
                    {
                        price: 10,
                    },
                ],
            },
            deviceId: device.id,
            quantity: 17,
            serviceOrderId: serviceOrder.id,
            businessId: business.id,
            centsCustomerId: centsCustomer.id,
            activePairing,
            userId: user.id,
            origin: 'EMPLOYEE_TAB',
        };

        const result = await createTurnUow(payload);

        expect(result.userId).to.equal(payload.userId);
        expect(result.origin).to.equal(payload.origin);
        expect(result.turnId).to.exist;
        expect(result.turn).to.exist;
        expect(result.turn).to.include({
            serviceType: payload.serviceType,
            note: payload.note,
            machineId: payload.machineId,
            deviceId: payload.deviceId,
            storeId: payload.machineDetails.storeId,
            turnCode: 1001,
            status: turnStatuses.CREATED,
            netOrderTotalInCents: 170,
            storeCustomerId: storeCustomer.id,
        });
        expect(result.deviceStatus).to.equal(deviceStatuses.IN_USE);

        const turnInDb = await Turns.query().findById(result.turnId);
        expect(turnInDb).to.exist;
    });

    it('should reject if no service order for a full service', async () => {
        const payload = {
            serviceType: serviceTypes.FULL_SERVICE,
            note: 'Wash it',
            machineId: machine.id,
            machineDetails: {
                storeId: store.id,
                model: {
                    machineType: {
                        name: 'WASHER',
                    },
                },
                machinePricings: [
                    {
                        price: 10,
                    },
                ],
            },
            deviceId: device.id,
            quantity: 17,
            serviceOrderId: -1,
        };

        await expect(createTurnUow(payload)).to.be.rejectedWith('Service order not found');
    });

    it('should reject if order of invalid status for a full service', async () => {
        const serviceOrder = await factory.create(FACTORIES_NAMES.serviceOrder, {
            status: statuses.READY_FOR_INTAKE,
            storeId: store.id,
        });

        const payload = {
            serviceType: serviceTypes.FULL_SERVICE,
            note: 'Wash it',
            machineId: machine.id,
            machineDetails: {
                storeId: store.id,
                model: {
                    machineType: {
                        name: 'WASHER',
                    },
                },
                machinePricings: [
                    {
                        price: 10,
                    },
                ],
            },
            deviceId: device.id,
            quantity: 17,
            serviceOrderId: serviceOrder.id,
        };

        await expect(createTurnUow(payload)).to.be.rejectedWith(
            'Can not run machine for this order',
        );
    });

    it('should create a turn for a full service without active pairing', async () => {
        const currentDate = new Date();

        const serviceOrder = await factory.create(FACTORIES_NAMES.serviceOrder, {
                status: statuses.PROCESSING,
                storeId: store.id,
            }),
            centsCustomer = await factory.create(FACTORIES_NAMES.centsCustomer);

        const payload = {
            serviceType: serviceTypes.FULL_SERVICE,
            note: 'Wash it',
            machineId: machine.id,
            machineDetails: {
                storeId: store.id,
                model: {
                    machineType: {
                        name: 'WASHER',
                    },
                },
                machinePricings: [
                    {
                        price: 10,
                    },
                ],
            },
            deviceId: device.id,
            quantity: 17,
            serviceOrderId: serviceOrder.id,
            businessId: business.id,
            centsCustomerId: centsCustomer.id,
        };

        const result = await createTurnUow(payload);

        expect(result.userId).to.equal(payload.userId);
        expect(result.origin).to.equal(payload.origin);
        expect(result.turnId).to.exist;
        expect(result.turn).to.exist;
        expect(result.turn).to.include({
            serviceType: payload.serviceType,
            note: payload.note,
            machineId: payload.machineId,
            deviceId: payload.deviceId,
            storeId: payload.machineDetails.storeId,
            turnCode: 1001,
            status: turnStatuses.COMPLETED,
            netOrderTotalInCents: 170,
        });
        expect(new Date(result.turn.completedAt)).to.be.greaterThanOrEqual(currentDate);
        expect(result.deviceStatus).to.equal(deviceStatuses.IN_USE);

        const turnInDb = await Turns.query().findById(result.turnId);
        expect(turnInDb).to.exist;
    });

    it('should create a turn for a self service', async () => {
        const payload = {
            serviceType: serviceTypes.SELF_SERVICE,
            note: 'Wash it',
            machineId: machine.id,
            machineDetails: {
                storeId: store.id,
                model: {
                    machineType: {
                        name: 'WASHER',
                    },
                },
                machinePricings: [
                    {
                        price: 10,
                    },
                ],
            },
            quantity: 17,
            deviceId: device.id,
            userId: user.id,
            centsCustomerId: centsCustomer.id,
            businessId: business.id,
            origin: 'EMPLOYEE_TAB',
        };

        const result = await createTurnUow(payload);

        expect(result.userId).to.equal(payload.userId);
        expect(result.origin).to.equal(payload.origin);
        expect(result.turnId).to.exist;
        expect(result.turn).to.exist;
        expect(result.turn).to.include({
            serviceType: payload.serviceType,
            note: payload.note,
            machineId: payload.machineId,
            deviceId: payload.deviceId,
            storeId: payload.machineDetails.storeId,
            turnCode: 1001,
            status: turnStatuses.CREATED,
            netOrderTotalInCents: 170,
        });
        expect(result.deviceStatus).to.equal(deviceStatuses.IN_USE);

        const turnInDb = await Turns.query().findById(result.turnId);
        expect(turnInDb).to.exist;
    });

    it('should reject if invalid args were passed', async () => {
        await expect(createTurnUow()).to.be.rejected;
        await expect(createTurnUow({})).to.be.rejected;
        await expect(createTurnUow(null)).to.be.rejected;
    });
});
