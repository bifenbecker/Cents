require('../../../../testHelper');
const { generateToken } = require('../../../../support/apiTestHelper');
const factory = require('../../../../factories');
const { expect } = require('../../../../support/chaiHelper');
const { FACTORIES_NAMES: FN } = require('../../../../constants/factoriesNames');
const {
    itShouldCorrectlyAssertTokenPresense,
    assertPutResponseError,
} = require('../../../../support/httpRequestsHelper');
const ChaiHttpRequestHelper = require('../../../../support/chaiHttpRequestHelper');

describe('test updateProduct API', () => {
    let user, business, store, token, inventoryCategory, inventory, url;

    beforeEach(async () => {
        await factory.create(FN.role, { userType: 'Business Owner' });
        user = await factory.create(FN.userWithBusinessOwnerRole);
        business = await factory.create(FN.laundromatBusiness, {
            userId: user.id,
        });
        store = await factory.create(FN.store, {
            businessId: business.id,
        });
        token = generateToken({
            id: user.id,
        });
        inventoryCategory = await factory.create(FN.inventoryCategory, {
            businessId: business.id,
            name: 'Candy',
        })
        inventory = await factory.create(FN.inventory, {
            categoryId: inventoryCategory.id,
            productName: 'Starburst',
            price: null,
        });
        url = `/api/v1/business-owner/admin/products/${inventory.id}`;
    });

    itShouldCorrectlyAssertTokenPresense(assertPutResponseError, () => url);

    it('should return product with single price from inventoryItem listed', async () => {
        const inventoryItem = await factory.create(FN.inventoryItem, {
            storeId: store.id,
            price: 4,
            inventoryId: inventory.id,
        });
        const payload = {
            id: inventory.id,
            productName: 'Starburst',
            categoryId: inventoryCategory.id,
            description: 'These fruity squares do not make me feel like a square!',
        };
        const response = await ChaiHttpRequestHelper.put(url, {}, payload).set('authtoken', token);

        expect(response.body.product.inventoryItems).to.not.be.undefined;
        expect(response.body.product.id).to.equal(inventory.id);
        expect(response.body.product.productName).to.equal(inventory.productName);
        expect(response.body.product.price).to.equal(inventoryItem.price);
        expect(response.body.product.description).to.equal(payload.description);
    });

    it('should return product with count of prices from multiple inventoryItems', async () => {
        const secondStore = await factory.create(FN.store, {
            businessId: business.id,
        });
        await factory.create(FN.inventoryItem, {
            storeId: store.id,
            price: 4,
            inventoryId: inventory.id,
        });
        await factory.create(FN.inventoryItem, {
            storeId: secondStore.id,
            price: 7,
            inventoryId: inventory.id,
        });
        const payload = {
            id: inventory.id,
            productName: 'Starburst Candy',
            categoryId: inventoryCategory.id,
            description: `I don't know what these are made of but I love them`,
        };
        const response = await ChaiHttpRequestHelper.put(url, {}, payload).set('authtoken', token);

        expect(response.body.product.inventoryItems).to.not.be.undefined;
        expect(response.body.product.id).to.equal(inventory.id);
        expect(response.body.product.productName).to.equal(payload.productName);
        expect(response.body.product.price).to.equal('2 prices');
        expect(response.body.product.description).to.equal(payload.description);
    });

    it('should update the product if inventoryItem is deleted', async () => {
        await factory.create(FN.inventoryItem, {
            storeId: store.id,
            price: 7,
            inventoryId: inventory.id,
            deletedAt: new Date().toISOString(),
        });
        const payload = {
            id: inventory.id,
            productName: 'Starburst Mini',
            categoryId: inventoryCategory.id,
            description: `The size is small but the flavor is large`,
        };
        const response = await ChaiHttpRequestHelper.put(url, {}, payload).set('authtoken', token);

        expect(response.body.product.inventoryItems).to.deep.equal([]);
        expect(response.body.product.id).to.equal(inventory.id);
        expect(response.body.product.productName).to.equal(payload.productName);
        expect(response.body.product.price).to.equal(null);
        expect(response.body.product.description).to.equal(payload.description);
    });
});