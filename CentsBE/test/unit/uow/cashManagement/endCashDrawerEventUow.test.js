require('../../../testHelper');

const factory = require('../../../factories');
const { expect } = require('../../../support/chaiHelper');

const CashDrawerEndEvent = require('../../../../models/cashDrawerEndEvent');
const TeamMember = require('../../../../models/teamMember');

const endCashDrawerEvent = require('../../../../uow/cashManagement/endCashDrawerEventUow');

describe('test endCashDrawerEventUow', () => {
    let business, store, user, teamMember, cashDrawerStartEvent, serviceOrder, order, cashPayment;

    beforeEach(async () => {
        business = await factory.create('laundromatBusiness');
        store = await factory.create('store', { businessId: business.id });
        user = await factory.create('user');
        teamMember = await factory.create('teamMember', {
            businessId: business.id,
            userId: user.id,
        });
        cashDrawerStartEvent = await factory.create('cashDrawerStartEvent', {
          employeeCode: teamMember.employeeCode.toString(),
          teamMemberId: teamMember.id,
          storeId: store.id,
          startingCashAmount: 5000,
          createdAt: new Date('4-4-2022').toISOString(),
        });
        serviceOrder = await factory.create('serviceOrder', {
          storeId: store.id,
          netOrderTotal: 100,
          placedAt: new Date('4-5-2022').toISOString(),
        });
        order = await factory.create('order', {
          orderableId: serviceOrder.id,
          orderableType: 'ServiceOrder'
        });
        cashPayment = await factory.create('payments', {
          storeId: store.id,
          orderId: order.id,
          paymentProcessor: 'cash',
          totalAmount: serviceOrder.netOrderTotal,
          appliedAmount: serviceOrder.netOrderTotal,
          createdAt: new Date('4-5-2022').toISOString(),
        });
    });

    it('should create a CashDrawerEndEvent given all incoming information', async () => {
        const teamMemberWithUser = await TeamMember.query()
            .withGraphFetched('user')
            .findById(teamMember.id);

        // actualInDrawer is the starting amount of the cash drawer + cash sale
        const payload = {
            store,
            teamMember: teamMemberWithUser,
            cashPayments: [ cashPayment ],
            cashEvent: cashDrawerStartEvent,
            employeeCode: teamMember.employeeCode.toString(),
            actualInDrawer: 150,
            cashInOut: null,
            cashInOutType: null,
        };

        // call Uow
        const uowOutput = await endCashDrawerEvent(payload);
        const { endingCashDrawerEvent } = uowOutput;

        // assert events match
        const foundEndEvent = await CashDrawerEndEvent.query()
          .where({
            storeId: store.id,
            teamMemberId: teamMember.id,
          })
          .first();
        expect(endingCashDrawerEvent).to.deep.equal(foundEndEvent);

        // based on cash payments and starting amount, confirm that expected amount = actual amount
        expect(endingCashDrawerEvent.expectedInDrawer).to.equal(foundEndEvent.actualInDrawer);
    });
});
