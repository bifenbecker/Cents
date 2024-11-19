require('../../../testHelper');
const { expect } = require('../../../support/chaiHelper');
const factory = require('../../../factories');
const { getServiceOrderTurnDetails } = require('../../../../uow/machines/getServiceOrderTurnsDetailsUow');
const { FACTORIES_NAMES: FN } = require('../../../constants/factoriesNames');

describe('test getServiceOrderTurnsDetailsUow', () => {
    let user, turn, machine, turnLineItems;

    beforeEach(async () => {
        user = await factory.create(FN.user);
        machine = await factory.create(FN.machine);
        turn = await factory.create(FN.turn, {
            userId: user.id,
            machineId: machine.id,
        });
        turnLineItems = await factory.create(FN.turnLineItem, {
            turnId: turn.id,
        });
    });

    it('should return details successfully', async () => {
        const payload = {
            turnId: turn.id,
        };
        const result = await getServiceOrderTurnDetails(payload);
        expect(result).should.exist;
        expect(result.id).to.eq(turn.id);
        expect(result.status).to.eq(turn.status);
        expect(result.machine.id).to.eq(machine.id);
        expect(result.machine.name).to.eq(machine.name);
        expect(result.machine.type).to.eq('W');
        expect(result.employee.id).to.eq(user.id);
        expect(result.employee.firstName).to.eq(user.firstname);
        expect(result.employee.lastName).to.eq(user.lastname);
        expect(result.quantity).to.eq(turnLineItems.quantity);
    });

    it('should be rejected with an error if passed payload with incorrect data', async () => {
        await expect(getServiceOrderTurnDetails()).to.be.rejected;
        await expect(getServiceOrderTurnDetails(null)).to.be.rejected;
        await expect(getServiceOrderTurnDetails({})).to.be.rejected;
    });
});