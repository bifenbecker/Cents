require('../../../testHelper');
const { expect } = require('../../../support/chaiHelper');
const factory = require('../../../factories');
const addMachine = require('../../../../uow/machines/addMachineUOW');
const addOfflineMachine = require('../../../../uow/machines/addOfflineMachineUOW');
const Machine = require('../../../../models/machine');
const { FACTORIES_NAMES } = require('../../../constants/factoriesNames');

describe('test business-owner\'s machine can be stored', () => {
    let model, store, type;

    beforeEach(async () => {
        store = await factory.create(FACTORIES_NAMES.store);
        type = await factory.create(FACTORIES_NAMES.machineTypeWasher)
        model = await factory.create(FACTORIES_NAMES.machineModel, {
            typeId: type.id
        });
    })

    it('should store machine with model', async () => {
            const reqPayload = {
                "storeId": store.id,
                "modelId": model.id,
                "name": "123",
                "turnTimeInMinutes": 14
            }

            const machine = await addMachine(reqPayload);
            const stored = await Machine.query().findById(machine.id);

            expect(stored).to.be.an("object");
            expect(stored.name).to.equal("123");
            expect(stored.turnTimeInMinutes).to.equal(14);
        }
    );

    it('should store offline machine with model', async () => {
            const reqPayload = {
                "storeId": store.id,
                "modelId": model.id,
                "name": "124",
                "turnTimeInMinutes": 14
            }

            const machine = await addOfflineMachine(reqPayload);
            const stored = await Machine.query().findById(machine.id);

            expect(stored).to.be.an("object");
            expect(stored.name).to.equal("124");
            expect(stored.turnTimeInMinutes).to.equal(14);
        }
    );
})
