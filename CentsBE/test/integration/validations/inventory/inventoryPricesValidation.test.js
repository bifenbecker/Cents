require('./../../../testHelper');
const ChaiHttpRequestHepler = require('./../../../support/chaiHttpRequestHelper')
const {generateToken} = require('./../../../support/apiTestHelper')
const factory = require('./../../../factories')
const { expect } = require('./../../../support/chaiHelper');

describe('test inventoryPricesValidation', () => {
    let business, store, payload, token, centsCustomer, serviceOrder, inventory, inventoryItem, inventoryCategory;
    const apiEndPoint = '/api/v1/employee-tab/inventory';

    beforeEach(async () => {
        business = await factory.create('laundromatBusiness')
        store = await factory.create('store', {
            businessId: business.id
        })
        token = generateToken({
            id: store.id,
        });
        centsCustomer = await factory.create('centsCustomer');
        serviceOrder = await factory.create('serviceOrder', {
            storeId: store.id,
            tierId: null,
        });
        inventoryCategory = await factory.create('inventoryCategory', {
            businessId: business.id
        }); 
        inventory = await factory.create('inventory', {
            categoryId: inventoryCategory.id
        }); 
        inventoryItem = await factory.create('inventoryItem', {
            inventoryId: inventory.id,
            storeId: store.id,
        }); 
    });

    it('should return an error if centsCustomerId is not a number', async () => {
        const serviceOrderItem = await factory.create('serviceOrderItem', {
            orderId: serviceOrder.id,
        });
        payload = {
            centsCustomerId: 'id',
            orderId: serviceOrderItem.orderId, 
        }
        const res =  await ChaiHttpRequestHepler.get(
            `${apiEndPoint}/`,
            payload
        )
        .set('authtoken', token);
        res.should.have.status(422);
        expect(res.body).to.have.property('error').to.equal(`child "centsCustomerId" fails because ["centsCustomerId" must be a number]`);
    });

    it('should return an error if centsCustomerId is undefined', async () => {
        const serviceOrderItem = await factory.create('serviceOrderItem', {
            orderId: serviceOrder.id,
        });
        payload = {
            centsCustomerId: undefined,
            orderId: serviceOrderItem.orderId, 
        }
        const res =  await ChaiHttpRequestHepler.get(
            `${apiEndPoint}/`,
            payload
        )
        .set('authtoken', token);
        res.should.have.status(500);
        expect(res.body).to.have.property('error').to.equal(`Cannot read property 'id' of undefined`);
    });

    it('should return an error if centsCustomerId is invalid', async () => {
        const serviceOrderItem = await factory.create('serviceOrderItem', {
            orderId: serviceOrder.id,
        });
        payload = {
            centsCustomerId: -123,
            orderId: serviceOrderItem.orderId, 
        }
        const res =  await ChaiHttpRequestHepler.get(
            `${apiEndPoint}/`,
            payload
        )
        .set('authtoken', token);
        res.should.have.status(422);
        expect(res.body).to.have.property('error').to.equal(`Invalid customer id`);
    });

    it('should return an error if centsCustomerId is invalid', async () => {
        const serviceOrderItem = await factory.create('serviceOrderItem', {
            orderId: serviceOrder.id,
        });
        payload = {
            centsCustomerId: centsCustomer.id,
            orderId: serviceOrderItem.orderId, 
        }
        const res =  await ChaiHttpRequestHepler.get(
            `${apiEndPoint}/`,
            payload
        )
        .set('authtoken', token);
        res.should.have.status(200);
        expect(res.body).to.have.property('success').to.equal(true);
        expect(res.body).to.have.property('inventoryPrice').not.to.be.empty;
        expect(res.body.inventoryPrice[0].storeId).to.equal(store.id);
        expect(res.body.inventoryPrice[0].inventoryCategory).to.equal(inventoryCategory.name);
        expect(res.body.inventoryPrice[0].priceId).to.equal(inventoryItem.id);
    });
})