const {
    itShouldCorrectlyAssertTokenPresense,
    assertGetResponseSuccess,
    assertPutResponseSuccess,
    assertGetResponseError,
    assertPutResponseError,
} = require('../../../support/httpRequestsHelper');
const { expect } = require('../../../support/chaiHelper');
const factory = require('../../../factories');
const { generateToken } = require('../../../support/apiTestHelper');
const { FACTORIES_NAMES: FN } = require('../../../constants/factoriesNames');
const { RECORDS_PER_PAGE_DEFAULT, inventoryOrderStatuses, ORDERABLE_TYPES } = require('../../../../constants/constants');

describe('test super admin inventory orders controller', function () {
    describe('Get all inventoty orders in the Cents ecosystem', () => {
        let inventoryOrders, token;
        const url = '/api/v1/super-admin/inventory-orders';

        beforeEach(async () => {
            const user = await factory.create(FN.userWithSuperAdminRole);
            const laundromatBusiness = await factory.create(FN.laundromatBusiness);
            const centsCustomer = await factory.create(FN.centsCustomer);
            const store = await factory.create(FN.store, {
                businessId: laundromatBusiness.id,
            });
            const storeCustomer = await factory.create(FN.storeCustomer, {
                storeId: store.id,
                businessId: store.businessId,
                centsCustomerId: centsCustomer.id,
            });

            inventoryOrders = [];

            for(let i = 0; i < 22; i++) {
                const inventoryOrder = await factory.create(FN.inventoryOrder, {
                    storeId: store.id,
                    storeCustomerId: storeCustomer.id,
                    orderCode: `${1000 + i}`,
                });
                
                inventoryOrders.push(inventoryOrder)
            }        
            
            token = generateToken({ id: user.id });
        });

        itShouldCorrectlyAssertTokenPresense(assertGetResponseError, () => url);

        it('should return inventory orders and total count', async () => {
            const { body } = await assertGetResponseSuccess({
                url,
                token,
            });

            expect(body).to.have.property('success').to.be.true;
            expect(body).to.have.property('total').equal(inventoryOrders.length);
            expect(body).to.have.property('inventoryOrders');
            expect(body.inventoryOrders.length).to.equal(RECORDS_PER_PAGE_DEFAULT);
        });

        it('should return inventory orders for a specific page', async () => {
            const pageNumber = 1;

            const { body } = await assertGetResponseSuccess({
                url: `${url}?pageNumber=${pageNumber}`,
                token,
            });

            expect(body).to.have.property('total').equal(inventoryOrders.length);
            expect(body.inventoryOrders.length).to.equal(2);
        });

        it('should return matching inventory orders with a specific orderCode from query param', async () => {
            const searchTerm = '1001';

            const { body } = await assertGetResponseSuccess({
                url: `${url}?searchTerm=${searchTerm}`,
                token,
            });

            expect(body).to.have.property('total').equal(1);
            expect(body.inventoryOrders.length).to.equal(1);
            expect(body.inventoryOrders[0].orderCode).to.equal(searchTerm);
        });
    });

    describe('Get individual inventory order', () => {
        let token, inventoryOrder;
        const getApiEndpoint = (inventoryOrderId) => {
            return `/api/v1/super-admin/inventory-orders/${inventoryOrderId}`;
        };

        beforeEach(async () => {
            const superAdmin = await factory.create(FN.userWithSuperAdminRole);

            inventoryOrder = await factory.create(FN.inventoryOrder, {
                orderCode: '1001',
            });

            token = generateToken({ id: superAdmin.id });
        });

        itShouldCorrectlyAssertTokenPresense(assertGetResponseError, () => getApiEndpoint(inventoryOrder.id));

        it('should return certain inventory order by id', async () => {
            const { body } = await assertGetResponseSuccess({
                url: getApiEndpoint(inventoryOrder.id),
                token,
            });

            expect(body).to.have.property('success').to.be.true;
            expect(body.inventoryOrder).to.have.property('id').equal(inventoryOrder.id);
            expect(body.inventoryOrder).to.have.property('orderCode').equal(inventoryOrder.orderCode);
        });
    });

    describe('Update inventory order status', () => {
      let token, inventoryOrder;
      const getApiEndpoint = (inventoryOrderId) => {
          return `/api/v1/super-admin/inventory-orders/${inventoryOrderId}/status/update`;
      };

      beforeEach(async () => {
          const superAdmin = await factory.create(FN.userWithSuperAdminRole);

          inventoryOrder = await factory.create(FN.inventoryOrder);

          await factory.create(FN.inventoryOrderMasterOrder, {
              orderableId: inventoryOrder.id,
              orderableType: ORDERABLE_TYPES.INVENTORY_ORDER,
          });

          token = generateToken({ id: superAdmin.id });
      });

      itShouldCorrectlyAssertTokenPresense(assertPutResponseError, () => getApiEndpoint(inventoryOrder.id));

      it('should update status of the certain inventory order', async () => {
          const newStatus = inventoryOrderStatuses.CANCELLED;

          const { body } = await assertPutResponseSuccess({
              url: getApiEndpoint(inventoryOrder.id),
              token,
              body: {
                status: newStatus,
                inventoryOrderId: inventoryOrder.id,
              },
          });

          expect(body).to.have.property('success').to.be.true;
          expect(body.inventoryOrder).to.have.property('id').equal(inventoryOrder.id);
          expect(body.inventoryOrder).to.have.property('status').equal(newStatus);
          expect(inventoryOrder).to.have.property('status').equal(inventoryOrderStatuses.CREATED);
      });
  });
});
