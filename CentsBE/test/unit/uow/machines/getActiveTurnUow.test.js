require('../../../testHelper');
const factory = require('../../../factories');
const { expect } = require('../../../support/chaiHelper');
const { getActiveTurnUow } = require('../../../../uow/machines/getActiveTurnUow');
const { turnStatuses } = require('../../../../constants/constants');

describe('test getActiveTurnUow', () => {
    let machine;

    beforeEach(async () => {
        machine = await factory.create('machine');
    });

    it('should return active created turn', async () => {
        const turn = await factory.create('turn', {
            machineId: machine.id,
            status: turnStatuses.CREATED,
        });
        const result = await getActiveTurnUow(machine.id);

        expect(result).to.include({
            id: turn.id,
            serviceType: turn.serviceType,
        });
    });

    it('should return active started turn', async () => {
        const turn = await factory.create('turn', {
            machineId: machine.id,
            status: turnStatuses.STARTED,
        });
        const result = await getActiveTurnUow(machine.id);

        expect(result).to.include({
            id: turn.id,
            serviceType: turn.serviceType,
        });
    });

    it('should return active enabled turn', async () => {
        const turn = await factory.create('turn', {
            machineId: machine.id,
            status: turnStatuses.ENABLED,
        });
        const result = await getActiveTurnUow(machine.id);

        expect(result).to.include({
            id: turn.id,
            serviceType: turn.serviceType,
        });
    });

    it('should return empty object for completed turn', async () => {
        await factory.create('turn', {
            machineId: machine.id,
            status: turnStatuses.COMPLETED,
        });
        const result = await getActiveTurnUow(machine.id);

        expect(result).to.be.empty;
    });
});
