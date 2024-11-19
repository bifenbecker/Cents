require('../../../testHelper');

const factory = require('../../../factories');
const {
    createServiceOrderTurn,
    patchTurnServiceType,
} = require('../../../support/serviceOrderTestHelper');
const { expect } = require('../../../support/chaiHelper');
const turnDetails = require('../../../../uow/machines/turnDetailsUOW');
const { serviceTypes } = require('../../../../constants/constants');

describe('test getLatestCashOutEventUow', () => {
    let user,
        store,
        storeCustomer,
        turn,
        machine,
        machineType,
        machineModel,
        machinePricings,
        serviceOrder;

    beforeEach(async () => {
        store = await factory.create('store');
        storeCustomer = await factory.create('storeCustomer');
        user = await factory.create('user');
        serviceOrder = await factory.create('serviceOrder', {
            userId: user.id,
            storeId: store.id,
            storeCustomerId: storeCustomer.id,
        });
        machineType = await factory.create('machineType');
        machineModel = await factory.create('machineModel', { typeId: machineType.id });
        machine = await factory.create('machine', {
            modelId: machineModel.id,
            storeId: store.id,
            userId: user.id,
        });
        machinePricings = await factory.create('machinePricing', { machineId: machine.id });
        ({ turn } = await createServiceOrderTurn(serviceOrder, machine));
    });

    it('should throw an error if turn was not found', async () => {
        const payload = { turnId: -1 };

        try {
            await turnDetails(payload);
        } catch (e) {
            expect(e.message).to.be.equal('Error: Invalid turn id.');
        }
    });

    it('should be rejected with an error if passed payload with incorrect data', async () => {
        await expect(turnDetails()).to.be.rejected;
        await expect(turnDetails(null)).to.be.rejected;
        await expect(turnDetails({})).to.be.rejected;
    });

    it('should return expected result for full service', async () => {
        const payload = { turnId: turn.id };
        // call Uow
        const uowOutput = await turnDetails(payload);

        // assert
        expect(uowOutput).to.exist;
        expect(uowOutput.store.address).to.be.equal(store.address);
        expect(uowOutput.store.id).to.be.equal(store.id);
        expect(uowOutput.customer.firstName).to.be.equal(storeCustomer.firstName);
        expect(uowOutput.customer.lastName).to.be.equal(storeCustomer.lastName);
        expect(uowOutput.serviceType).to.be.equal(turn.serviceType);
        expect(uowOutput.order).to.exist;
    });

    it('should return expected result for self service', async () => {
        await patchTurnServiceType(turn.id, serviceTypes.SELF_SERVICE);
        const payload = { turnId: turn.id };
        // call Uow
        const uowOutput = await turnDetails(payload);

        // assert
        expect(uowOutput).to.exist;
        expect(uowOutput.store.address).to.be.equal(store.address);
        expect(uowOutput.store.id).to.be.equal(store.id);
        expect(uowOutput.customer.firstName).to.be.equal(storeCustomer.firstName);
        expect(uowOutput.customer.lastName).to.be.equal(storeCustomer.lastName);
        expect(uowOutput.serviceType).to.be.equal(serviceTypes.SELF_SERVICE);
        expect(uowOutput.payments).to.exist;
    });

    it('should return expected result for technical service', async () => {
        await patchTurnServiceType(turn.id, serviceTypes.TECHNICAL_SERVICE);
        const payload = { turnId: turn.id };
        // call Uow
        const uowOutput = await turnDetails(payload);

        // assert
        expect(uowOutput).to.exist;
        expect(uowOutput.store.address).to.be.equal(store.address);
        expect(uowOutput.store.id).to.be.equal(store.id);
        expect(uowOutput.serviceType).to.be.equal(serviceTypes.TECHNICAL_SERVICE);
        expect(uowOutput.technicianName).equal(turn.technicianName);
    });
});
