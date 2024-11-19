require('../../../testHelper');

const factory = require('../../../factories');
const {expect} = require('../../../support/chaiHelper');
const { getServicePricesAndProducts } = require('../../../../services/washServices/queries');

describe('test serviePricesAndProducts', () => {

    it('should retrieve the service prices and products of a business', async () => {
        let serviceCategory, service, inventoryCategory, inventory, servicesResult, productsResult;
        serviceCategory = await factory.create('serviceCategory');
        service = await factory.create('serviceMaster', {
            serviceCategoryId: serviceCategory.id
        });
        await factory.create('servicePrice', {
            serviceId: service.id
        });

        inventoryCategory = await factory.create('inventoryCategory', {
            businessId: serviceCategory.businessId
        });
        inventory = await factory.create('inventory', {
            categoryId: inventoryCategory.id
        });
        await factory.create('inventoryItem', {
            inventoryId: inventory.id
        });

        const result = await getServicePricesAndProducts(serviceCategory.businessId);
        servicesResult = result.services[0];
        productsResult = result.products;
        expect(servicesResult).to.have.property('category').to.equal(serviceCategory.category);
        expect(servicesResult.services).is.to.be.an('array').that.has.length.greaterThan(0);
        expect(servicesResult.services[0]).is.have.property('name').to.equal(service.name);
        expect(servicesResult.services[0]).is.have.property('serviceCategoryId').to.equal(serviceCategory.id);
        expect(servicesResult.services[0].prices).is.to.be.an('array').that.has.length.greaterThan(0);
        expect(servicesResult.services[0].prices[0]).is.have.property('serviceId').to.equal(service.id);

        expect(productsResult).to.be.an('array').that.has.length.greaterThan(0);
        expect(productsResult[0]).is.have.property('inventoryId').to.equal(inventory.id);
        expect(productsResult[0]).is.have.property('price').to.equal(0);
    });
    it('should not fetch the data for a business which is not exists', async () => {
        const result = await getServicePricesAndProducts(23459);
        expect(result.services).is.to.be.an('array').that.is.empty;
        expect(result.products).is.to.be.an('array').that.is.empty;
    });

});

