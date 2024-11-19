require('../../../testHelper');
const { expect } = require('../../../support/chaiHelper');
const factory = require('../../../factories');
const formatStripeCustomerData = require('../../../../utils/stripe/formatStripeCustomerData');

describe('test formatStripeCustomerData util', () => {
    let centsCustomer;

    beforeEach(async () => {
        centsCustomer = await factory.create('centsCustomer');
    })
    
    it('should return a formatted object without address field', async () => { 
        const request = {
            centsCustomerId: centsCustomer.id,
        };
        const customer = {
            firstName: centsCustomer.firstName,
            lastName: centsCustomer.lastName,
            email: centsCustomer.email,
            phoneNumber: centsCustomer.phoneNumber,
        };
        const expectedOutput = await formatStripeCustomerData(request, customer);

        // assert
        expect(expectedOutput.address).to.not.exist;
        expect(expectedOutput.name).to.equal(`${customer.firstName} ${customer.lastName}`);
        expect(expectedOutput.email).to.equal(customer.email);
        expect(expectedOutput.phone).to.equal(customer.phoneNumber);
    });

    it('should return a formatted object with address field', async () => { 
        const centsCustomerAddress = await factory.create('centsCustomerAddress', {
            centsCustomerId: centsCustomer.id,
        });
        const request = {
            centsCustomerId: centsCustomer.id,
            address: {
                line1: centsCustomerAddress.address1,
                city: centsCustomerAddress.city,
                postal_code: centsCustomerAddress.postalCode,
                state: centsCustomerAddress.firstLevelSubdivisionCode,
            },
        };
        const customer = {
            firstName: centsCustomer.firstName,
            lastName: centsCustomer.lastName,
            email: centsCustomer.email,
            phoneNumber: centsCustomer.phoneNumber,
        };
        const expectedOutput = await formatStripeCustomerData(request, customer);

        // assert
        expect(expectedOutput.name).to.equal(`${customer.firstName} ${customer.lastName}`);
        expect(expectedOutput.email).to.equal(customer.email);
        expect(expectedOutput.phone).to.equal(customer.phoneNumber);
        expect(expectedOutput.address).to.deep.equal({
            line1: request.address.address1,
            city: request.address.city,
            country: 'US',
            postal_code: request.address.postalCode,
            state: request.address.firstLevelSubdivisionCode,
        });
    });

    it('should return a formatted object without address field if address is empty', async () => { 
        const request = {
            centsCustomerId: centsCustomer.id,
            address: {},
        };
        const customer = {
            firstName: centsCustomer.firstName,
            lastName: centsCustomer.lastName,
            email: centsCustomer.email,
            phoneNumber: centsCustomer.phoneNumber,
        };
        const expectedOutput = await formatStripeCustomerData(request, customer);

        // assert
        expect(expectedOutput.address).to.not.exist;
        expect(expectedOutput.name).to.equal(`${customer.firstName} ${customer.lastName}`);
        expect(expectedOutput.email).to.equal(customer.email);
        expect(expectedOutput.phone).to.equal(customer.phoneNumber);
    });

});
