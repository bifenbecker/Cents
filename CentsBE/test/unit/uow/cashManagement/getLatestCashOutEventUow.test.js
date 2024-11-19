require('../../../testHelper');

const factory = require('../../../factories');
const { expect } = require('../../../support/chaiHelper');

const CashOutEvent = require('../../../../models/cashOutEvent');

const getLatestCashOutEvent = require('../../../../uow/cashManagement/getLatestCashOutEventUow');

describe('test getLatestCashOutEventUow', () => {
    let business, store, teamMember;

    beforeEach(async () => {
        business = await factory.create('laundromatBusiness');
        teamMember = await factory.create('teamMember', { businessId: business.id });
        store = await factory.create('store', { businessId: business.id });
    });

    it('should retrieve the most recently created CashOutEvent model for a given store', async () => {
        await factory.create('cashOutEvent', {
            employeeCode: teamMember.employeeCode.toString(),
            teamMemberId: teamMember.id,
            storeId: store.id,
            totalCashChanged: 5000,
            amountLeftInDrawer: 1000,
            type: 'OUT',
            createdAt: new Date('4-5-2022').toISOString(),
        });
        const secondCashOutEvent = await factory.create('cashOutEvent', {
            employeeCode: teamMember.employeeCode.toString(),
            teamMemberId: teamMember.id,
            storeId: store.id,
            totalCashChanged: 1000,
            amountLeftInDrawer: 2000,
            type: 'IN',
            createdAt: new Date('4-6-2022').toISOString(),
        });
        const payload = { store };

        // call Uow
        const uowOutput = await getLatestCashOutEvent(payload);
        const { cashEvent } = uowOutput;

        // assert
        const foundEvent = await CashOutEvent.query().findById(secondCashOutEvent.id)
        expect(cashEvent).to.exist;
        expect(cashEvent).to.deep.equal(foundEvent);
    });

    it('should return an empty object where a CashOutEvent does not exist', async () => {
        const payload = { store };

        // call Uow
        const uowOutput = await getLatestCashOutEvent(payload);
        const { cashEvent } = uowOutput;

        // assert
        expect(cashEvent).to.exist;
        expect(cashEvent).to.deep.equal({});
    });
});
