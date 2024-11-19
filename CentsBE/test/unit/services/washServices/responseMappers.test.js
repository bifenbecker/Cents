require('../../../testHelper');
const { expect } = require('../../../support/chaiHelper');
const { mapCustomerSelectionModifiers, mapCustomerSelectionForServices } = require('../../../../services/washServices/responseMappers');

describe('test mapCustomerSelectionModifiers', () => {
    let customerSelectionModifiers;

    beforeEach(async () => {
        customerSelectionModifiers = [{
            serviceModifierId: 1,
        }, {
            serviceModifierId: 2,
        }, {
            serviceModifierId: 3,
        }];
        modifiers = [{
            serviceModifierId: 1,
        }, {
            serviceModifierId: 2,
        }];
    });

    it('should return mappedModifiers', async () => {
        const mappedModifiers = await mapCustomerSelectionModifiers(modifiers, customerSelectionModifiers);
        const filterdeMappedModifiers = mappedModifiers.filter(modifier => modifier.customerSelection);

        expect(mappedModifiers.length).to.equal(3);
        expect(filterdeMappedModifiers.length).to.equal(2);
    });

    it('should return modifiers when customerSelectionModifiers is empty', async () => {
        const mappedModifiers = await mapCustomerSelectionModifiers(modifiers, []);
        const filterdeMappedModifiers = mappedModifiers.filter(modifier => modifier.customerSelection);

        expect(mappedModifiers.length).to.equal(2);
        expect(filterdeMappedModifiers).to.be.empty;
    });
});

describe('test mapCustomerSelectionForServices', () => {
    let customerSelectionServices;

    beforeEach(async () => {
        customerSelectionServices = [{
            priceId: 1,
        }, {
            priceId: 2,
        }, {
            priceId: 3,
        }];
        services = [{
            priceId: 1,
        }, {
            priceId: 2,
        }];
    });

    it('should return mappedServices', async () => {
        const mappedServices = await mapCustomerSelectionForServices(services, customerSelectionServices);
        const filterdeMappedServices = mappedServices.filter(service => service.customerSelection);
        
        expect(mappedServices.length).to.equal(3);
        expect(filterdeMappedServices.length).to.equal(2);
    });

    it('should return services when customerSelectionServices is empty', async () => {
        const mappedServices = await mapCustomerSelectionForServices(services, []);
        const filterdeMappedServices = mappedServices.filter(service => service.customerSelection);

        expect(mappedServices.length).to.equal(2);
        expect(filterdeMappedServices).to.be.empty;
    });
})
