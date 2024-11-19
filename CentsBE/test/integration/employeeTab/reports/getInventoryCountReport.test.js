require('../../../testHelper');
const ChaiHttpRequestHelper = require('../../../support/chaiHttpRequestHelper');
const { generateToken } = require('../../../support/apiTestHelper');
const factory = require('../../../factories');
const { expect } = require('../../../support/chaiHelper');

function getApiEndPoint() {
    return `/api/v1/employee-tab/reports/inventory/count`;
}

describe('test getInventoryCountReport', () => {
    it('should throw an error if token is not sent', async () => {
        const res = await ChaiHttpRequestHelper.get(getApiEndPoint()).set('authtoken', '');
        const { error } = JSON.parse(res.text);
        res.should.have.status(401);
        expect(error).to.equal('Please sign in to proceed.');
    });

    it('should get inventory count report successfully', async () => {
        const store = await factory.create('store');
        const token = generateToken({ id: store.id });
        const inventory = await factory.create('inventory');
        const inventoryItem = await factory.create('inventoryItem', {
            inventoryId: inventory.id,
            storeId: store.id,
        });
        const res = await ChaiHttpRequestHelper.get(getApiEndPoint()).set('authtoken', token);
        res.should.have.status(200);
        expect(res.body).to.have.property('columns');
        expect(res.body).to.have.property('report');
        expect(res.body.report.length).not.to.eq(0);
        expect(res.body.report[0].productName).to.eq(inventory.productName);
        expect(res.body.report[0].quantity).to.eq(inventoryItem.quantity);
    });
});