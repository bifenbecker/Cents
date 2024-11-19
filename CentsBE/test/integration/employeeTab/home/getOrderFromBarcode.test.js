require('../../../testHelper');
const ChaiHttpRequestHelper = require('../../../support/chaiHttpRequestHelper');
const { generateToken } = require('../../../support/apiTestHelper');
const factory = require('../../../factories');
const { expect } = require('../../../support/chaiHelper');
const {
    assertGetResponseError,
    itShouldCorrectlyAssertTokenPresense,
} = require('../../../support/httpRequestsHelper');

function getApiEndPoint() {
    return `/api/v1/employee-tab/home/order/barcode/retrieve`;
}

describe('test getOrderFromBarcode api', () => {
    itShouldCorrectlyAssertTokenPresense(
        assertGetResponseError,
        () => getApiEndPoint(),
    );

    it('should get order from barcode successfully', async () => {
        const store = await factory.create('store');
        const token = generateToken({ id: store.id });
        const barcode = 'a81bc81b-dead-4e5d-abff-90865d1e13b1';
        const serviceOrder = await factory.create('serviceOrder', {
            storeId: store.id,
            uuid: barcode,
        });

        const res = await ChaiHttpRequestHelper.get(getApiEndPoint(), {
            barcode: barcode,
        }).set('authtoken', token);

        res.should.have.status(200);
        expect(res.body).to.have.property('orderId');
        expect(res.body.orderId).to.eq(serviceOrder.id);
        expect(res.body.orderStatus).to.eq(serviceOrder.status);
    });

    it('should return status 422', async () => {
        const store = await factory.create('store');
        const token = generateToken({ id: store.id });
        const barcode = 'a81bc81b-dead-4e5d-abff-90865d1e13b1';
        const res = await ChaiHttpRequestHelper.get(getApiEndPoint(), {
            barcode: barcode,
        }).set('authtoken', token);
        res.should.have.status(422);
        expect(res.body).to.have.property('error');
        expect(res.body.error).to.eq('Order was not found using this barcode.');
    });

    it('should throw an error if params not passed', async () => {
        const store = await factory.create('store');
        const token = generateToken({ id: store.id });
        const res = await ChaiHttpRequestHelper.get(getApiEndPoint(), {}).set('authtoken', token);
        res.should.have.status(500);
    });

});