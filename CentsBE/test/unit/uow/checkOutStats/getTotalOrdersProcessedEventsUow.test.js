require('../../../testHelper');
const factory = require('../../../factories');
const { expect } = require('../../../support/chaiHelper');
const getTotalOrdersProcessedEvents = require('../../../../uow/checkOutStats/getTotalOrdersProcessedEventsUow');
const {
    createPaymentRelations,
    createInventoryOrderPaymentRelations,
} = require('../../../support/createPaymentsHelper');
const {
    fetchServiceOrdersForShift,
    formatCompletedOrders,
    fetchInventoryOrdersForShift,
    fetchProcessedOrdersForShift,
    getTotalOrdersProcessedForEmployee,
} = require('../../../support/checkOutStats/checkOutStatsHelper');
const ServiceOrder = require('../../../../models/serviceOrders');
const InventoryOrder = require('../../../../models/inventoryOrders');
const BusinessSettings = require('../../../../models/businessSettings');

describe('test getTotalOrdersProcessedEvents UoW', () => {
    let business, store, user, teamMember, teamMemberCheckIn, orderDate, payload;

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
        orderDate = new Date('4-6-2022').toISOString();
        payload = {
          teamMemberId: teamMember.id,
          checkedOutTime: teamMemberCheckIn.checkOutTime,
          checkedInTime: teamMemberCheckIn.checkInTime,
          previousStoreId: store.id,
          businessId: business.id,
        };
    });

    it('should provide processed order information if employee codes are enabled', async () => {
        await BusinessSettings.query().delete().where({ businessId: business.id });
        await factory.create('businessSetting', {
            businessId: business.id,
            requiresEmployeeCode: true,
        });
        await createPaymentRelations(5, store.id, orderDate, 'cash', teamMember);
        await createInventoryOrderPaymentRelations(5, store.id, orderDate, 'cash', teamMember);

        // call UoW
        const uowOutput = await getTotalOrdersProcessedEvents(payload);
        const {
            inventoryOrders,
            processedOrders,
            totalOrdersForEmployee,
            totalProcessedOrdersForEmployee,
            isEmployeeCodeRequired,
        } = uowOutput;

        // output assertions
        expect(isEmployeeCodeRequired).to.be.true;

        const expectedInventoryOrders = await fetchInventoryOrdersForShift(
            store.id,
            teamMemberCheckIn,
            teamMember,
        );
        expect(inventoryOrders).to.deep.equal(expectedInventoryOrders);

        const expectedProcessedOrders = await fetchProcessedOrdersForShift(
            store.id,
            teamMemberCheckIn,
            teamMember,
        );
        expect(processedOrders).to.deep.equal(expectedProcessedOrders);

        const serviceOrdersForShift = await fetchServiceOrdersForShift(
            store.id,
            teamMemberCheckIn,
            teamMember,
        );
        const expectedTotalOrdersForEmployee = await formatCompletedOrders(
            store.id,
            serviceOrdersForShift,
            expectedInventoryOrders,
        );
        expect(totalOrdersForEmployee).to.deep.equal(expectedTotalOrdersForEmployee);

        const expectedTotalProcessed = await getTotalOrdersProcessedForEmployee(
            store.id,
            expectedProcessedOrders,
        );
        expect(totalProcessedOrdersForEmployee).to.deep.equal(expectedTotalProcessed);
    });

    it('should provide processed order information if employee codes are not enabled', async () => {
        // deleting existing settings and creating new settings since Business can only have one setting model
        await BusinessSettings.query().delete().where({ businessId: business.id });
        await factory.create('businessSetting', {
          businessId: business.id,
          requiresEmployeeCode: false,
        })
        await createPaymentRelations(5, store.id, orderDate, 'cash', teamMember);
        await createInventoryOrderPaymentRelations(5, store.id, orderDate, 'cash', teamMember);

        // call UoW
        const uowOutput = await getTotalOrdersProcessedEvents(payload);
        const {
            serviceOrders,
            serviceOrderIds,
            inventoryOrderIds,
            isEmployeeCodeRequired,
        } = uowOutput;

        // output assertions
        expect(isEmployeeCodeRequired).to.be.false;

        const expectedServiceOrders = await ServiceOrder.query()
            .where({ storeId: store.id })
            .whereBetween('createdAt', [payload.checkedInTime, payload.checkedOutTime]);
        expect(serviceOrders).to.deep.equal(expectedServiceOrders);
        const expectedServiceOrderIds = expectedServiceOrders.map((order) => order.id);
        expect(serviceOrderIds).to.deep.equal(expectedServiceOrderIds);

        const expectedInventoryOrders = await InventoryOrder.query()
            .where({ storeId: store.id })
            .whereBetween('createdAt', [payload.checkedInTime, payload.checkedOutTime]);
        const expectedInventorOrderIds = expectedInventoryOrders.map((order) => order.id);
        expect(inventoryOrderIds).to.deep.equal(expectedInventorOrderIds);
    });

    it('should throw an error if incoming payload is not defined', async () => {
        try {
            const failedPayload = {};
            await getTotalOrdersProcessedEvents(failedPayload);
        } catch (error) {
            return error;
        }

        // assert error type
        expect(error).to.be.an('Error');

        // assert error message - here, since businessId is undefined, BusinessSettings query would fail
        expect(error.message).to.contain(`undefined passed as argument #1 for 'where' operation.`);
    });
});
