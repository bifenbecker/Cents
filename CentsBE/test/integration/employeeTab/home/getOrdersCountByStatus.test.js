require('../../../testHelper');
const ChaiHttpRequestHelper = require('../../../support/chaiHttpRequestHelper');
const { generateToken } = require('../../../support/apiTestHelper');
const factory = require('../../../factories');
const { expect } = require('../../../support/chaiHelper');
const {
    assertGetResponseError,
    itShouldCorrectlyAssertTokenPresense,
} = require('../../../support/httpRequestsHelper');
const { FACTORIES_NAMES: FN } = require('../../../constants/factoriesNames');

function getApiEndPoint() {
    return `/api/v1/employee-tab/home/orders-count-by-status`;
}

describe('test getOrdersCountByStatus api', () => {
    itShouldCorrectlyAssertTokenPresense(
        assertGetResponseError,
        () => getApiEndPoint(),
    );

    it('should get orders count by status successfully if status is cancelled', async () => {
        const store = await factory.create(FN.store, {
            isHub: true,
        });
        const token = generateToken({ id: store.id });
        const serviceOrder = await factory.create(FN.serviceOrder, {
            storeId: store.id,
            status: 'CANCELLED',
        });

        const res = await ChaiHttpRequestHelper.get(getApiEndPoint(), {
            status: [ 'COMPLETED', 'CANCELLED' ],
        }).set('authtoken', token);

        res.should.have.status(200);
        expect(res.body.rows[0].name).to.eq(store.name);
        expect(res.body.rows[0].cancelled).to.eq('1');
        expect(res.body.rows[0].completed).to.eq('0');
    });

    it('should get orders count by status successfully if status is completed', async () => {
        const store = await factory.create(FN.store, {
            isHub: false,
        });
        const token = generateToken({ id: store.id });
        const serviceOrder = await factory.create(FN.serviceOrder, {
            hubId: store.id,
            storeId: store.id,
            status: 'COMPLETED',
        });

        const res = await ChaiHttpRequestHelper.get(getApiEndPoint(), {
            status: [ 'COMPLETED', 'CANCELLED' ],
        }).set('authtoken', token);

        res.should.have.status(200);
        expect(res.body.rows[0].name).to.eq(store.name);
        expect(res.body.rows[0].completed).to.eq('1');
        expect(res.body.rows[0].cancelled).to.eq('0');
    });

    it('should get orders count by status successfully if status is completed and businessId are passed', async () => {
        const laundromatBusiness = await factory.create(FN.laundromatBusiness);
        const store = await factory.create(FN.store, {
            isHub: true,
            businessId: laundromatBusiness.id,
        });
        const token = generateToken({ id: store.id });
        const serviceOrder = await factory.create(FN.serviceOrder, {
            hubId:  store.id,
            status: 'COMPLETED',
        });

        const res = await ChaiHttpRequestHelper.get(getApiEndPoint(), {
            status: [ 'COMPLETED', 'CANCELLED' ],
            bussinessId: laundromatBusiness.id,
        }).set('authtoken', token);

        res.should.have.status(200);
        expect(res.body.rows[0].name).to.eq(store.name);
        expect(res.body.rows[0].completed).to.eq('1');
        expect(res.body.rows[0].cancelled).to.eq(null);
    });

    it('should throw an error if status is not passed', async () => {
        const store = await factory.create(FN.store);
        const token = generateToken({ id: store.id });
        const serviceOrder = await factory.create(FN.serviceOrder, {
            status: 'COMPLETED',
        });
        const res = await ChaiHttpRequestHelper.get(getApiEndPoint(), {}).set('authtoken', token);
        res.should.have.status(500);
    });
});