require('../../../testHelper');
const factory = require('../../../factories');
const { expect } = require('../../../support/chaiHelper');
const getSalesStatEvent = require('../../../../uow/checkOutStats/getSalesStatsEventUow');
const {
    createPaymentRelations,
    getSumTotalOfPayments,
    createInventoryOrderPaymentRelations,
} = require('../../../support/createPaymentsHelper');
const {
  fetchServiceOrdersForShift,
  formatCompletedOrders,
  fetchInventoryOrdersForShift,
  formatOrdersForLineItems,
} = require('../../../support/checkOutStats/checkOutStatsHelper');

describe('test getSalesStatEvent UoW', () => {
    let business, store, user, teamMember, teamMemberCheckIn;

    beforeEach(async () => {
        business = await factory.create('laundromatBusiness');
        store = await factory.create('store', { businessId: business.id });
        user = await factory.create('user');
        teamMember = await factory.create('teamMember', {
            businessId: business.id,
            userId: user.id,
        });
        teamMemberCheckIn = await factory.create('teamMemberCheckIn', {
            teamMemberId: teamMember.id,
            storeId: store.id,
            checkInTime: new Date('4-5-2022').toISOString(),
            checkOutTime: new Date('4-7-2022').toISOString(),
        });
    });

    it('should provide sales stats and line items for a given time period', async () => {
        const orderDate = new Date('4-6-2022').toISOString();

        // ServiceOrder data
        const cashPayments = await createPaymentRelations(
            5,
            store.id,
            orderDate,
            'cash',
            teamMember,
        );
        const creditPayments = await createPaymentRelations(
            5,
            store.id,
            orderDate,
            'stripe',
            teamMember,
        );
        const cashCardPayments = await createPaymentRelations(
            5,
            store.id,
            orderDate,
            'cashCard',
            teamMember,
        );

        // InventoryOrder data
        const inventoryOrderObject = await createInventoryOrderPaymentRelations(
            5,
            store.id,
            orderDate,
            'cash',
            teamMember,
        );
        const cashCardInventoryOrderObject = await createInventoryOrderPaymentRelations(
            5,
            store.id,
            orderDate,
            'cashCard',
            teamMember,
        );
        const stripeInventoryOrderObject = await createInventoryOrderPaymentRelations(
            5,
            store.id,
            orderDate,
            'stripe',
            teamMember,
        );

        // Payload
        const inventoryOrdersForPayload = await fetchInventoryOrdersForShift(
            store.id,
            teamMemberCheckIn,
            teamMember,
        );
        const serviceOrdersForPayload = await fetchServiceOrdersForShift(
            store.id,
            teamMemberCheckIn,
            teamMember,
        );
        const totalEmployeeOrders = await formatCompletedOrders(
            store.id,
            serviceOrdersForPayload,
            inventoryOrdersForPayload,
        );

        const payload = {
            totalOrdersForEmployee: totalEmployeeOrders,
            inventoryOrders: inventoryOrdersForPayload,
        };

        // call Uow
        const uowOutput = await getSalesStatEvent(payload);
        const {
            cashCardTotal,
            creditCardTotal,
            cashTotal,
            cashOrderLineItems,
            creditCardOrderLineItems,
            cashCardOrderLineItems
        } = uowOutput;

        // assert cash data matches
        const cashPaymentTotals = getSumTotalOfPayments(cashPayments.payments);
        const inventoryCashPaymentTotals = getSumTotalOfPayments(inventoryOrderObject.payments);
        const totalCashExpected = Number(cashPaymentTotals + inventoryCashPaymentTotals).toFixed(2);
        expect(cashTotal).to.equal(totalCashExpected);

        // assert cash card data matches
        const cashCardPaymentTotals = getSumTotalOfPayments(cashCardPayments.payments);
        const inventoryCashCardTotals = getSumTotalOfPayments(cashCardInventoryOrderObject.payments);
        const totalCashCardExpected = Number(cashCardPaymentTotals + inventoryCashCardTotals).toFixed(2);
        expect(cashCardTotal).to.equal(totalCashCardExpected);

        // assert stripe payment data matches
        const stripePaymentTotals = getSumTotalOfPayments(creditPayments.payments);
        const inventoryStripeTotals = getSumTotalOfPayments(stripeInventoryOrderObject.payments);
        const totalStripePayments =  Number(stripePaymentTotals + inventoryStripeTotals).toFixed(2);
        expect(creditCardTotal).to.equal(totalStripePayments);

        // assert cash order line items - inventory line items go first according to UoW
        const expectedServiceOrderCashOrderLineItems = await formatOrdersForLineItems(cashPayments.orders);
        const expectedInventoryOrderCashOrderLineItems = await formatOrdersForLineItems(inventoryOrderObject.orders);
        const finalCashLineItems = expectedInventoryOrderCashOrderLineItems.concat(expectedServiceOrderCashOrderLineItems);
        expect(cashOrderLineItems).to.deep.equal(finalCashLineItems);

        // assert cash card order line items
        const expectedCashCardOrderLineItems = await formatOrdersForLineItems(cashCardPayments.orders);
        const expectedInventoryCashCardOrderLineItems = await formatOrdersForLineItems(cashCardInventoryOrderObject.orders);
        const finalCashCardLineItems = expectedInventoryCashCardOrderLineItems.concat(expectedCashCardOrderLineItems);
        expect(cashCardOrderLineItems).to.deep.equal(finalCashCardLineItems);

        // assert stripe (debit/credit) order line items
        const expectedCreditOrderLineItems = await formatOrdersForLineItems(creditPayments.orders);
        const expectedInventoryCreditOrderLineItems = await formatOrdersForLineItems(stripeInventoryOrderObject.orders);
        const finalStripeLineItems = expectedInventoryCreditOrderLineItems.concat(expectedCreditOrderLineItems);
        expect(creditCardOrderLineItems).to.deep.equal(finalStripeLineItems);
    });

    it('should throw an error if incoming payload is not defined', async () => {
        try {
            const payload = { inventoryOrders: [] };
            await getSalesStatEvent(payload);
        } catch (error) {
            return error;
        }
        
        // assert error type
        expect(error).to.be.an('Error');

        // assert error message - here, since totalOrdersForEmployee is undefined, filter() would fail
        expect(error.message).to.contain(`Cannot read property 'filter' of undefined`);
    });
});
