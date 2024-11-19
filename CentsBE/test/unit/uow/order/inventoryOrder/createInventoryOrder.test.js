require('../../../../testHelper');
const createInventoryOrder = require('../../../../../uow/order/inventoryOrder/createInventoryOrder');
const InventoryOrder = require('../../../../../models/inventoryOrders');
const factory = require('../../../../factories');
const { expect } = require('../../../../support/chaiHelper');
const { FACTORIES_NAMES } = require('../../../../constants/factoriesNames');

describe('test createInventoryOrder UOW', () => {
    let payload;

    beforeEach(async () => {
        const businessSetting = await factory.create(FACTORIES_NAMES.businessSetting, {
            requiresEmployeeCode: true,
        });
        const employeeDetails = await factory.create(FACTORIES_NAMES.teamMember, {
            businessId: businessSetting.businessId,
        });
        const store = await factory.create(FACTORIES_NAMES.store, {
            businessId: businessSetting.businessId,
        });
        await factory.create(FACTORIES_NAMES.teamMemberStore, {
            teamMemberId: employeeDetails.id,
            storeId: store.id,
        });
        const centsCustomer = await factory.create(FACTORIES_NAMES.centsCustomer);
        const storeCustomer = await factory.create(FACTORIES_NAMES.storeCustomer, {
            centsCustomerId: centsCustomer.id,
            storeId: store.id,
            businessId: store.businessId,
        });
        payload = {
            store: {
                settings: businessSetting,
                id: store.id,
                businessId: businessSetting.businessId,
            },
            customer: {
                storeCustomerId: storeCustomer.id,
            },
            constants: {
                employee: employeeDetails,
            },
        };
    });

    it('should be able to create a service order with order count', async () => {
        const result = await createInventoryOrder(payload);
        expect(result.inventoryOrder).to.have.property('id');
        expect(result.inventoryOrder).to.have.property('orderCode').equal('1001');
        expect(result.inventoryOrder).to.have.property('storeId').equal(payload.store.id);
        expect(result.inventoryOrder)
            .to.have.property('employeeId')
            .equal(payload.constants.employee.id);
        expect(result.inventoryOrder)
            .to.have.property('storeCustomerId')
            .equal(payload.customer.storeCustomerId);
    });

    it('should create inventory order entry in db', async () => {
        await createInventoryOrder(payload);
        const result = await InventoryOrder.query().findOne({ storeId: payload.store.id });
        expect(result).to.have.property('orderCode').equal('1001');
        expect(result).to.have.property('storeId').equal(payload.store.id);
        expect(result).to.have.property('employeeId').equal(payload.constants.employee.id);
        expect(result).to.have.property('storeCustomerId').equal(payload.customer.storeCustomerId);
        expect(result).to.have.property('status').equal(payload.inventoryOrder.status);
    });

    it('should be rejected when wrong data passed', async () => {
        await expect(createInventoryOrder({})).to.be.rejected;
        await expect(createInventoryOrder(null)).to.be.rejected;
        await expect(createInventoryOrder()).to.be.rejected;
    });
});
