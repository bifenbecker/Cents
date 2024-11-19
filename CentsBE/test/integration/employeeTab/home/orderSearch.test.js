require('../../../testHelper');
const ChaiHttpRequestHepler = require('../../../support/chaiHttpRequestHelper');
const { generateToken } = require('../../../support/apiTestHelper');
const factory = require('../../../factories');
const { expect } = require('../../../support/chaiHelper');
const { FACTORIES_NAMES: FN } = require('../../../constants/factoriesNames');
const { statuses } = require('../../../../constants/constants');
const {
    itShouldCorrectlyAssertTokenPresense,
    assertGetResponseError,
} = require('../../../support/httpRequestsHelper');
const ServiceOrder = require('../../../../models/serviceOrders');

const LIMIT_ON_PAGE = 10;

describe('test orderSearch', () => {
    let hubStore, token, serviceOrder, storeCustomer;
    const apiEndPoint = '/api/v1/employee-tab/home/orders/search';

    beforeEach(async () => {
        hubStore = await factory.create(FN.store, {
            isHub: true,
        });
        token = generateToken({
            id: hubStore.id,
        });
        storeCustomer = await factory.create(FN.storeCustomer, {
            firstName: 'test',
        });
        serviceOrder = await factory.create(FN.serviceOrder, {
            storeCustomerId: storeCustomer.id,
            storeId: hubStore.id,
            status: statuses.SUBMITTED,
            hubId: hubStore.id,
        });
    });

    itShouldCorrectlyAssertTokenPresense(assertGetResponseError, () => apiEndPoint);

    it('should fail when keyword is not passed', async () => {
        await assertGetResponseError({
            url: apiEndPoint,
            token,
            code: 422,
            expectedError: 'Keyword is required.',
        });
    });

    it('should fail when page is not passed', async () => {
        await assertGetResponseError({
            url: apiEndPoint,
            token,
            params: {
                keyword: 'asd',
            },
            code: 422,
            expectedError: 'child "page" fails because ["page" is required]',
        });
    });

    it('should fail when stores are invalid', async () => {
        await assertGetResponseError({
            url: apiEndPoint,
            token,
            params: {
                keyword: 'asd',
                page: 1,
                stores: ['a', 'b'],
            },
            code: 422,
            expectedError: 'Store Ids are Invalid',
        });
    });

    it('should return found ServiceOrder', async () => {
        const res = await ChaiHttpRequestHepler.get(apiEndPoint, {
            keyword: 'test',
            page: 1,
        }).set('authtoken', token);

        res.should.have.status(200);
        expect(res.body).to.have.property('success').to.equal(true);
        expect(res.body).to.have.property('activeOrders').to.not.be.empty;
        expect(res.body.activeOrders[0]).to.have.property('id').to.equal(serviceOrder.id);
    });

    it('should return limited orders count when withoutPagination is not defined (by default)', async () => {
        // remove all existing orders to count properly
        await ServiceOrder.query().delete();

        await factory.createMany(FN.serviceOrder, 11, {
            storeCustomerId: storeCustomer.id,
            storeId: hubStore.id,
            status: statuses.SUBMITTED,
            hubId: hubStore.id,
        });

        const res = await ChaiHttpRequestHepler.get(apiEndPoint, {
            keyword: 'test',
            page: 1,
        }).set('authtoken', token);

        res.should.have.status(200);
        expect(res.body).to.have.property('success').to.equal(true);
        expect(res.body).to.have.property('activeOrders').to.not.be.empty;
        expect(res.body.activeOrders).to.have.length(LIMIT_ON_PAGE);
    });

    it('should return limited orders count when withoutPagination=false', async () => {
        // remove all existing orders to count properly
        await ServiceOrder.query().delete();

        await factory.createMany(FN.serviceOrder, 11, {
            storeCustomerId: storeCustomer.id,
            storeId: hubStore.id,
            status: statuses.SUBMITTED,
            hubId: hubStore.id,
        });

        const res = await ChaiHttpRequestHepler.get(apiEndPoint, {
            keyword: 'test',
            page: 1,
            withoutPagination: false, // explicitly enable pagination
        }).set('authtoken', token);

        res.should.have.status(200);
        expect(res.body).to.have.property('success').to.equal(true);
        expect(res.body).to.have.property('activeOrders').to.not.be.empty;
        expect(res.body.activeOrders).to.have.length(LIMIT_ON_PAGE);
    });

    it('should return all orders when withoutPagination=true', async () => {
        // remove all existing orders to count properly
        await ServiceOrder.query().delete();

        const ordersCount = 11;

        await factory.createMany(FN.serviceOrder, ordersCount, {
            storeCustomerId: storeCustomer.id,
            storeId: hubStore.id,
            status: statuses.SUBMITTED,
            hubId: hubStore.id,
        });

        const res = await ChaiHttpRequestHepler.get(apiEndPoint, {
            keyword: 'test',
            page: 1,
            withoutPagination: true,
        }).set('authtoken', token);

        res.should.have.status(200);
        expect(res.body).to.have.property('success').to.equal(true);
        expect(res.body).to.have.property('activeOrders').to.not.be.empty;
        expect(res.body.activeOrders).to.have.length(ordersCount);
    });

    it('should return found ServiceOrder with many stores', async () => {
        const anotherStore = await factory.create(FN.store);
        const anotherStoreCustomer = await factory.create(FN.storeCustomer, {
            firstName: 'another',
        });
        const anotherServiceOrder = await factory.create(FN.serviceOrder, {
            storeCustomerId: anotherStoreCustomer.id,
            storeId: anotherStore.id,
            status: statuses.SUBMITTED,
            hubId: hubStore.id,
        });
        const res = await ChaiHttpRequestHepler.get(apiEndPoint, {
            keyword: 'another',
            page: 1,
            stores: [hubStore.id, anotherStore.id],
            statuses: [statuses.SUBMITTED, statuses.PROCESSING],
        }).set('authtoken', token);

        res.should.have.status(200);
        expect(res.body).to.have.property('success').to.equal(true);
        expect(res.body).to.have.property('activeOrders').to.not.be.empty;
        expect(res.body.activeOrders[0]).to.have.property('id').to.equal(anotherServiceOrder.id);
    });

    it('should fail when statuses not passed', async () => {
        const anotherStore = await factory.create(FN.store);
        const res = await ChaiHttpRequestHepler.get(apiEndPoint, {
            keyword: 'another',
            page: 1,
            stores: [hubStore.id, anotherStore.id],
        }).set('authtoken', token);

        res.should.have.status(500);
        expect(res.body).to.have.property('error');
    });
});
