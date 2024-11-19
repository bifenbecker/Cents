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
    return `/api/v1/employee-tab/home/check-barcode`;
}

describe('test checkBarcode api', () => {
    let store, token;

    beforeEach(async() => {
        store = await factory.create('store');
        token = generateToken({ id: store.id });
    });

    itShouldCorrectlyAssertTokenPresense(
        assertGetResponseError,
        () => getApiEndPoint(),
    );

    it('should check barcode successfully', async () => {
        const serviceOrder = await factory.create(FN.serviceOrder);
        const serviceOrderBag = await factory.create(FN.serviceOrderBag, {
            serviceOrderId: serviceOrder.id,
        });

        const res = await ChaiHttpRequestHelper.get(getApiEndPoint(), {
            barcode: '123abc456',
        }).set('authtoken', token);

        res.should.have.status(200);
        expect(res.body.status).to.eq('success');
        expect(res.body.message).to.eq('Barcode is available');
    });

    it('should throw an error if barcode is null', async () => {
        const res = await ChaiHttpRequestHelper.get(getApiEndPoint()).set('authtoken', token);
        res.should.have.status(422);
        expect(res.body.error).to.eq(true);
        expect(res.body.message).to.eq('barcode param is required');
    });

    it('should throw an error if bags.length > 0', async () => {
        const serviceOrder = await factory.create(FN.serviceOrder);
        const serviceOrderBag = await factory.create(FN.serviceOrderBag, {
            barcode: '123abc456',
            isActiveBarcode: true,
            serviceOrderId: serviceOrder.id,
        });

        const res = await ChaiHttpRequestHelper.get(getApiEndPoint(), {
            barcode: '123abc456',
        }).set('authtoken', token);

        res.should.have.status(404);
        expect(res.body.error).to.eq(true);
        expect(res.body.message).to.eq('Barcode is not available');
    });
});