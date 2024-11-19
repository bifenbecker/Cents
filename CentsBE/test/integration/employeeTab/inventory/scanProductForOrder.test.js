require('../../../testHelper');
const ChaiHttpRequestHepler = require('../../../support/chaiHttpRequestHelper')
const { generateToken } = require('../../../support/apiTestHelper')
const factory = require('../../../factories')
const { expect } = require('../../../support/chaiHelper');

describe('test scanProductForOrder', () => {
    let business, store, token, inventory, inventoryCategory;
    const apiEndPoint = '/api/v1/employee-tab/inventory/scan';

    beforeEach(async () => {
        business = await factory.create('laundromatBusiness')
        store = await factory.create('store', {
            businessId: business.id
        })
        token = generateToken({
            id: store.id,
        });
        inventoryCategory = await factory.create('inventoryCategory', {
            businessId: business.id
        }); 
        inventory = await factory.create('inventory', {
            categoryId: inventoryCategory.id,
            sku: '12345',
        }); 
    });

    it('should return inventoryItem', async () => {
        const inventoryItem = await factory.create('inventoryItem', {
            inventoryId: inventory.id,
            storeId: store.id,
        }); 
        const payload = {
            sku: inventory.sku,
        }
        const res =  await ChaiHttpRequestHepler.get(
            `${apiEndPoint}/`,
            payload
        )
        .set('authtoken', token);
        res.should.have.status(200);
        expect(res.body).to.have.property('success').to.equal(true);
        expect(res.body).to.have.property('inventoryItem');
        expect(res.body.inventoryItem.storeId).to.equal(store.id);
        expect(res.body.inventoryItem.inventoryCategory).to.equal(inventoryCategory.name);
        expect(res.body.inventoryItem.priceId).to.equal(inventoryItem.id);
    });

    it(`should return error if SKU doesn't exist in the system`, async () => {
        const payload = {
            sku: '-q2w1e0',
        }
        const res =  await ChaiHttpRequestHepler.get(
            `${apiEndPoint}/`,
            payload
        )
        .set('authtoken', token);
        res.should.have.status(422);
        expect(res.body).to.have.property('error').to.equal(
            `A product with the SKU you scanned doesn't exist in the Cents system.`
        );
    });

    it(`should return error if the product is not available`, async () => {
        const payload = {
            sku: inventory.sku,
        }
        const res =  await ChaiHttpRequestHepler.get(
            `${apiEndPoint}/`,
            payload
        )
        .set('authtoken', token);
        res.should.have.status(422);
        expect(res.body).to.have.property('error').to.equal(
            `The product you scanned is not available at your current location.`
        );

    });

    it(`should return error if SKU is not passed`, async () => {
        const res =  await ChaiHttpRequestHepler.get(`${apiEndPoint}/`, {})
        .set('authtoken', token);

        res.should.have.status(500);
        expect(res.body).to.have.property('error').to.equal(
            `undefined passed as a property in argument #0 for 'where' operation. Call skipUndefined() method to ignore the undefined values.`
        );
    });
})
