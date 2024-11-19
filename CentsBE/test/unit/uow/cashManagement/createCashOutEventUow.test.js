require('../../../testHelper');

const factory = require('../../../factories');
const { expect } = require('../../../support/chaiHelper');
const { createPaymentRelations, getSumTotalOfPayments } = require('../../../support/createPaymentsHelper');

const CashOutEvent = require('../../../../models/cashOutEvent');
const TeamMember = require('../../../../models/teamMember');

// UoW
const createCashOutEvent = require('../../../../uow/cashManagement/createCashOutEventUow');

describe('test createCashOutEventUow', () => {
    let business, store, user, teamMember;

    beforeEach(async () => {
        business = await factory.create('laundromatBusiness');
        store = await factory.create('store', { businessId: business.id });
        user = await factory.create('user');
        teamMember = await factory.create('teamMember', {
          businessId: business.id,
          userId: user.id,
        });
    });

    it('should create a CashOutEvent when no incoming CashOutEvent exists prior', async () => {
        await factory.create('cashDrawerStartEvent', {
          employeeCode: teamMember.employeeCode.toString(),
          teamMemberId: teamMember.id,
          storeId: store.id,
          startingCashAmount: 5000,
          createdAt: new Date('4-4-2022').toISOString(),
        });
        const paymentDate = new Date('4-6-2022').toISOString();
        const response = await createPaymentRelations(5, store.id, paymentDate, 'cash', teamMember);
        const { payments } = response;
        const teamMemberWithUser = await TeamMember.query()
            .withGraphFetched('user')
            .findById(teamMember.id);

        // CashOutEvent to be created should be an INCOMING amount of $100
        const payload = {
            store,
            teamMember: teamMemberWithUser,
            cashPayments: payments,
            cashEvent: {},
            employeeCode: teamMember.employeeCode.toString(),
            type: 'IN',
            cashActionAmount: 100,
            notes: 'This is a INCOMING cash out event for $100',
        };

        // call Uow
        const uowOutput = await createCashOutEvent(payload);
        const { cashOutEvent } = uowOutput;

        // assert events match and amountLeftInDrawer = cash payments + cashActionAmount
        const foundCashOutEvent = await CashOutEvent.query()
          .where({
            storeId: store.id,
            teamMemberId: teamMember.id,
          })
          .first();
        expect(cashOutEvent).to.deep.equal(foundCashOutEvent);

        // assert amountLeftInDrawer = cash payments + cashActionAmount
        const totalCashSum = getSumTotalOfPayments(payments);
        const expectedAmountLeftInDrawer = Number(Number(totalCashSum * 100) + Number(payload.cashActionAmount * 100));
        expect(cashOutEvent.amountLeftInDrawer).to.equal(expectedAmountLeftInDrawer);
    });

    it('should create a CashOutEvent when CashOutEvent exists but no cash payments exist', async () => {
        const teamMemberWithUser = await TeamMember.query()
            .withGraphFetched('user')
            .findById(teamMember.id);
        const existingCashOutEvent = await factory.create('cashOutEvent', {
          employeeCode: teamMember.employeeCode.toString(),
          teamMemberId: teamMember.id,
          storeId: store.id,
          totalCashChanged: 5000,
          amountLeftInDrawer: 4000,
          type: 'OUT',
          createdAt: new Date('4-5-2022').toISOString(),
        });

        // CashOutEvent to be created should be an INCOMING amount of $100
        const payload = {
            store,
            teamMember: teamMemberWithUser,
            cashPayments: [],
            cashEvent: existingCashOutEvent,
            employeeCode: teamMember.employeeCode.toString(),
            type: 'OUT',
            cashActionAmount: 50,
            notes: 'This is a OUTGOING cash out event for $50',
        };

        // call Uow
        const uowOutput = await createCashOutEvent(payload);
        const { cashOutEvent } = uowOutput;

        // assert events match and amountLeftInDrawer = cash payments + cashActionAmount
        const foundCashOutEvent = await CashOutEvent.query()
          .where({
            storeId: store.id,
            teamMemberId: teamMember.id,
            notes: 'This is a OUTGOING cash out event for $50',
          })
          .first();
        expect(cashOutEvent).to.deep.equal(foundCashOutEvent);

        // assert amountLeftInDrawer = cash payments + cashActionAmount
        const expectedAmountLeftInDrawer = Number(existingCashOutEvent.amountLeftInDrawer - Number(payload.cashActionAmount * 100));
        expect(cashOutEvent.amountLeftInDrawer).to.equal(expectedAmountLeftInDrawer);
    });

    it('should create a CashOutEvent when CashOutEvent does not exists and no cash payments exist', async () => {
      const teamMemberWithUser = await TeamMember.query()
          .withGraphFetched('user')
          .findById(teamMember.id);
          await factory.create('cashDrawerStartEvent', {
            employeeCode: teamMember.employeeCode.toString(),
            teamMemberId: teamMember.id,
            storeId: store.id,
            startingCashAmount: 5000,
            createdAt: new Date('4-4-2022').toISOString(),
          });

      // CashOutEvent to be created should be an INCOMING amount of $100
      const payload = {
          store,
          teamMember: teamMemberWithUser,
          cashPayments: [],
          cashEvent: {},
          employeeCode: teamMember.employeeCode.toString(),
          type: 'OUT',
          cashActionAmount: 50,
          notes: 'This is a OUTGOING cash out event for $50',
      };

      // call Uow
      const uowOutput = await createCashOutEvent(payload);
      const { cashOutEvent } = uowOutput;

      // assert events match and amountLeftInDrawer = cash payments + cashActionAmount
      const foundCashOutEvent = await CashOutEvent.query()
        .where({
          storeId: store.id,
          teamMemberId: teamMember.id,
          notes: 'This is a OUTGOING cash out event for $50',
        })
        .first();
      expect(cashOutEvent).to.deep.equal(foundCashOutEvent);
      expect(cashOutEvent.amountLeftInDrawer).to.equal(0);
  });
});
