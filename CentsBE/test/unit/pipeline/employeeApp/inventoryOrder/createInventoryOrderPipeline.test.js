require('../../../../testHelper');
const { expect } = require('../../../../support/chaiHelper');
const factory = require('../../../../factories');
const { FACTORIES_NAMES: FN } = require('../../../../constants/factoriesNames');
const createInventoryOrderPipeline = require('../../../../../pipeline/employeeApp/inventoryOrder/createInventoryOrderPipeline');

describe('createInventoryOrderPipeline test', function () {
    it('should return expected result', async () => {
        const user = await factory.create(FN.user);
        const centsCustomer = await factory.create(FN.centsCustomer);
        const laundromatBusiness = await factory.create(FN.laundromatBusiness);
        const store = await factory.create('store', { businessId: laundromatBusiness.id });
        const storeCustomer = await factory.create(FN.storeCustomer, {
            storeId: store.id,
            businessId: store.businessId,
            centsCustomerId: centsCustomer.id,
        });

        const teamMember = await factory.create(FN.teamMember, {
            businessId: laundromatBusiness.id,
            userId: user.id,
        });

        const payload = {
            store: {
                ...store,
                settings: { requiresEmployeeCode: false },
            },
            customer: {
                id: centsCustomer.id,
                stripeCustomerId: 'test id',
                centsCustomerId: 123,
            },
            orderItems: [
                {
                    priceId: 1,
                    count: 2,
                },
                {
                    priceId: 2,
                    count: 5,
                },
            ],
            storeCustomerId: storeCustomer.id,
            constants: {
                employee: {
                    id: teamMember.id,
                    employeeCode: teamMember.employeeCode,
                    firstname: user.firstname,
                    lastname: user.lastname,
                },
            },
            paymentStatus: 'BALANCE_DUE',
            orderType: 'InventoryOrder',
        };
        const res = await createInventoryOrderPipeline(payload);
        expect(res.orderableType).equal(payload.orderType);
        expect(res.store.name).equal(store.name)
        expect(res.store.id).equal(store.id)
        expect(res.store.address).equal(store.address)
    });

    it('should be rejected with an error if passed payload with incorrect data', async () => {
        await expect(createInventoryOrderPipeline()).to.be.rejected;
        await expect(createInventoryOrderPipeline(null)).to.be.rejected;
        await expect(createInventoryOrderPipeline({})).to.be.rejected;
    });
});
