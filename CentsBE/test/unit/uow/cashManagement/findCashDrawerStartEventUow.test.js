require('../../../testHelper');

const factory = require('../../../factories');
const { expect } = require('../../../support/chaiHelper');

const CashDrawerStartEvent = require('../../../../models/cashDrawerStartEvent');

const findCashDrawerStartEvent = require('../../../../uow/cashManagement/findCashDrawerStartEventUow');

describe('test findCashDrawerStartEventUow', () => {
    let business, store, teamMember;

    beforeEach(async () => {
        business = await factory.create('laundromatBusiness');
        teamMember = await factory.create('teamMember', { businessId: business.id });
        store = await factory.create('store', { businessId: business.id });
    });

    it('should retrieve the CashDrawerStartEvent model for a given ID', async () => {
        const cashDrawerStartEvent = await factory.create('cashDrawerStartEvent', {
            employeeCode: teamMember.employeeCode.toString(),
            teamMemberId: teamMember.id,
            storeId: store.id,
            startingCashAmount: 5000,
        });
        const payload = {
            cashDrawerEventId: cashDrawerStartEvent.id,
        };

        // call Uow
        const uowOutput = await findCashDrawerStartEvent(payload);
        const { cashEvent } = uowOutput;

        // assert
        const foundEvent = await CashDrawerStartEvent.query().findById(payload.cashDrawerEventId)
        expect(cashEvent).to.exist;
        expect(cashEvent).to.deep.equal(foundEvent);
    });

    it('should fail to retrieve the cashEvent if the CashDrawerStartEvent does not exist', async () => {
        const payload = {
            cashDrawerEventId: 100,
        };

        // call Uow
        const uowOutput = await findCashDrawerStartEvent(payload);
        const { cashEvent } = uowOutput;

        // assert
        expect(cashEvent).to.not.exist;
        expect(cashEvent).to.be.undefined;
    });
});
