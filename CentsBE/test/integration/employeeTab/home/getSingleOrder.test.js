require('../../../testHelper');
const { generateToken } = require('../../../support/apiTestHelper');
const factory = require('../../../factories');
const { expect } = require('../../../support/chaiHelper');
const { FACTORIES_NAMES: FN } = require('../../../constants/factoriesNames');
const {
    itShouldCorrectlyAssertTokenPresense,
    assertGetResponseError,
    assertGetResponseSuccess,
} = require('../../../support/httpRequestsHelper');
const BusinessSettings = require('../../../../models/businessSettings');

describe('test getSingleOrder', () => {
    let business,
        store,
        token,
        serviceOrder;
    const apiEndPoint = '/api/v1/employee-tab/home/singleOrder';

    beforeEach(async () => {
        business = await factory.create(FN.laundromatBusiness);
        store = await factory.create(FN.store, {
            businessId: business.id,
        });
        token = generateToken({
            id: store.id,
        });
        serviceOrder = await factory.create(FN.serviceOrder, {
            storeId: store.id,
        });
    });

    itShouldCorrectlyAssertTokenPresense(assertGetResponseError, () => apiEndPoint);

    it('should return order details', async () => {
        const res = await assertGetResponseSuccess({
            url: apiEndPoint,
            params: {
                orderId: serviceOrder.id,
            },
            token,
        });

        expect(res.body)
            .to
            .have
            .property('success')
            .to
            .equal(true);
        expect(res.body.orderDetails).to.not.be.empty;
    });

    it('should return order details with hangerBundles and storageRacks for 2.0 on', async () => {
        await BusinessSettings.query()
            .patch({
                dryCleaningEnabled: true,
            })
            .findOne({ businessId: business.id });
        const res = await assertGetResponseSuccess({
            url: apiEndPoint,
            params: {
                orderId: serviceOrder.id,
            },
            token,
        });

        expect(res.body)
            .to
            .have
            .property('success')
            .to
            .equal(true);
        expect(res.body.orderDetails).to.not.be.empty;
        expect(res.body.orderDetails.serviceOrderBags).to.not.be.undefined;
        expect(res.body.orderDetails.serviceOrderBags).to.be.an('array');
        expect(res.body.orderDetails.hangerBundles).to.not.be.undefined;
        expect(res.body.orderDetails.hangerBundles).to.be.an('array');
        expect(res.body.orderDetails.hangerBundlesCount).to.not.be.undefined;
        expect(res.body.orderDetails.storageRacks).to.not.be.undefined;
        expect(res.body.orderDetails.storageRacks).to.be.an('object');
        expect(res.body.orderDetails.turnAroundInHours).to.not.be.undefined;
        expect(res.body.orderDetails.turnAroundInHours).to.be.an('object');
    });

    it('should fail when orderId is not a number', async () => {
        const res = await assertGetResponseError({
            url: apiEndPoint,
            params: {
                orderId: 'id',
            },
            token,
            code: 422,
            expectedError: 'Order id must be number',
        });
    });
});
