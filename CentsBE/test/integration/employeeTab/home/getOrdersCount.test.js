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
    return `/api/v1/employee-tab/home/orders-count`;
}

describe('test getOrdersCount api', () => {
    itShouldCorrectlyAssertTokenPresense(
        assertGetResponseError,
        () => getApiEndPoint(),
    );

    it('should get orders count successfully for receiveForHub', async () => {
        const store = await factory.create(FN.store, {
            hubId: this.id,
            isHub: true,
        });
        const token = generateToken({ id: store.id });
        const serviceOrder = await factory.create(FN.serviceOrder, {
            hubId: store.id,
            status: 'IN_TRANSIT_TO_HUB',
        });

        const res = await ChaiHttpRequestHelper.get(getApiEndPoint()).set('authtoken', token);

        res.should.have.status(200);
        expect(res.body.success).to.eq(true);
        expect(res.body.receiveForHub).to.eq('1');
    });

    it('should get orders count successfully for receiveForStore', async () => {
        const store = await factory.create(FN.store);
        const token = generateToken({ id: store.id });
        const serviceOrder = await factory.create(FN.serviceOrder, {
            storeId: store.id,
            status: 'IN_TRANSIT_TO_STORE',
        });

        const res = await ChaiHttpRequestHelper.get(getApiEndPoint()).set('authtoken', token);

        res.should.have.status(200);
        expect(res.body.success).to.eq(true);
        expect(res.body.receiveForStore).to.eq('1');
    });

    it('should get orders count successfully for releaseForHub', async () => {
        const store = await factory.create(FN.store, {
            hubId: this.id,
            isHub: true,
        });
        const token = generateToken({ id: store.id });
        const serviceOrder = await factory.create(FN.serviceOrder, {
            hubId: store.id,
            status: 'HUB_PROCESSING_COMPLETE',
        });

        const res = await ChaiHttpRequestHelper.get(getApiEndPoint()).set('authtoken', token);

        res.should.have.status(200);
        expect(res.body.success).to.eq(true);
        expect(res.body.releaseForHub).to.eq('1');
    });

    it('should get orders count successfully for releaseForStore', async () => {
        const store = await factory.create(FN.store);
        const token = generateToken({ id: store.id });
        const serviceOrder = await factory.create(FN.serviceOrder, {
            storeId: store.id,
            status: 'DESIGNATED_FOR_PROCESSING_AT_HUB',
        });

        const res = await ChaiHttpRequestHelper.get(getApiEndPoint()).set('authtoken', token);

        res.should.have.status(200);
        expect(res.body.success).to.eq(true);
        expect(res.body.releaseForStore).to.eq('1');
    });
});