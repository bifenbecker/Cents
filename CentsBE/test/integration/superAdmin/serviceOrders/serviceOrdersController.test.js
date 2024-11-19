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
const { RECORDS_PER_PAGE_DEFAULT, statuses, ORDERABLE_TYPES } = require('../../../../constants/constants');

describe('test super admin service orders controller', function () {
    describe('Get all service orders in the Cents ecosystem', () => {
        let serviceOrders, token;
        const url = '/api/v1/super-admin/service-orders';

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

            serviceOrders = [];

            for(let i = 0; i < 22; i++) {
                const serviceOrder = await factory.create(FN.serviceOrder, {
                    storeId: store.id,
                    storeCustomerId: storeCustomer.id,
                    orderCode: `${1000 + i}`,
                });
                
                serviceOrders.push(serviceOrder)
            }        
            
            token = generateToken({ id: user.id });
        });

        itShouldCorrectlyAssertTokenPresense(assertGetResponseError, () => url);

        it('should return service orders and total count', async () => {
            const { body } = await assertGetResponseSuccess({
                url,
                token,
            });

            expect(body).to.have.property('success').to.be.true;
            expect(body).to.have.property('total').equal(serviceOrders.length);
            expect(body).to.have.property('serviceOrders');
            expect(body.serviceOrders.length).to.equal(RECORDS_PER_PAGE_DEFAULT);
        });

        it('should return service orders for a specific page', async () => {
            const pageNumber = 1;

            const { body } = await assertGetResponseSuccess({
                url: `${url}?pageNumber=${pageNumber}`,
                token,
            });

            expect(body).to.have.property('total').equal(serviceOrders.length);
            expect(body.serviceOrders.length).to.equal(2);
        });

        it('should return matching service orders with a specific orderCode from query param', async () => {
            const searchTerm = '1001';

            const { body } = await assertGetResponseSuccess({
                url: `${url}?searchTerm=${searchTerm}`,
                token,
            });

            expect(body).to.have.property('total').equal(1);
            expect(body.serviceOrders.length).to.equal(1);
            expect(body.serviceOrders[0].orderCode).to.equal(searchTerm);
        });
    });

    describe('Get individual service order', () => {
        let token, serviceOrder;
        const getApiEndpoint = (serviceOrderId) => {
            return `/api/v1/super-admin/service-orders/${serviceOrderId}`;
        };

        beforeEach(async () => {
            const superAdmin = await factory.create(FN.userWithSuperAdminRole);

            serviceOrder = await factory.create(FN.serviceOrder, {
                orderCode: '1001',
            });

            token = generateToken({ id: superAdmin.id });
        });

        itShouldCorrectlyAssertTokenPresense(assertGetResponseError, () => getApiEndpoint(serviceOrder.id));

        it('should return certain service order by id', async () => {
            const { body } = await assertGetResponseSuccess({
                url: getApiEndpoint(serviceOrder.id),
                token,
            });

            expect(body).to.have.property('success').to.be.true;
            expect(body.serviceOrder).to.have.property('id').equal(serviceOrder.id);
            expect(body.serviceOrder).to.have.property('orderCode').equal(serviceOrder.orderCode);
        });
    });

    describe('Update service order status', () => {
        let token, serviceOrder;
        const getApiEndpoint = (serviceOrderId) => {
            return `/api/v1/super-admin/service-orders/${serviceOrderId}/status/update`;
        };

        beforeEach(async () => {
            const superAdmin = await factory.create(FN.userWithSuperAdminRole);

            serviceOrder = await factory.create(FN.serviceOrder);

            await factory.create(FN.serviceOrderMasterOrder, {
                orderableId: serviceOrder.id,
                orderableType: ORDERABLE_TYPES.SERVICE_ORDER,
            });

            token = generateToken({ id: superAdmin.id });
        });

        itShouldCorrectlyAssertTokenPresense(assertPutResponseError, () => getApiEndpoint(serviceOrder.id));

        it('should update status of the certain service order', async () => {
            const newStatus = statuses.IN_TRANSIT_TO_HUB;

            const { body } = await assertPutResponseSuccess({
                url: getApiEndpoint(serviceOrder.id),
                token,
                body: {
                  status: newStatus,
                  serviceOrderId: serviceOrder.id,
                },
            });

            expect(body).to.have.property('success').to.be.true;
            expect(body.serviceOrder).to.have.property('id').equal(serviceOrder.id);
            expect(body.serviceOrder).to.have.property('status').equal(newStatus);
            expect(serviceOrder).to.have.property('status').equal(statuses.SUBMITTED);
        });
    });
});
