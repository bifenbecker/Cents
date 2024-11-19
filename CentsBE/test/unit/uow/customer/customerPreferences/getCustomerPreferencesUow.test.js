require('../../../../testHelper');
const { expect } = require('../../../../support/chaiHelper');
const getCustomerPreferences = require('../../../../../uow/customer/customerPreferences/getCustomerPreferencesUow');
const factory = require('../../../../factories');
const BusinessCustomer = require('../../../../../models/businessCustomer');

describe('test get customer preferences UOW', () => {
    let business, centsCustomer;

    beforeEach(async () => {
        centsCustomer = await factory.create('centsCustomer');
        business = await factory.create('laundromatBusiness');
    });

    it('should return empty array when no preferences exist', async () => {
        // act
        const res = await getCustomerPreferences({
            businessId: business.id,
            centsCustomerId: centsCustomer.id,
        });

        // assert
        expect(res).to.have.property('customerPreferences');
        expect(res.customerPreferences).to.be.an('array');
        expect(res.customerPreferences).to.have.length(0);
    });

    it('should return single-option customer preferences', async () => {
        // arrange
        const singleOptionPreference = await factory.create('businessCustomerPreferences', {
            businessId: business.id,
            type: 'single',
        });
        const selectedOption = await factory.create('preferenceOptions', {
            businessCustomerPreferenceId: singleOptionPreference.id,
        });
        await factory.create('preferenceOptions', {
            businessCustomerPreferenceId: singleOptionPreference.id,
        });
        await factory.create('preferenceOptions', {
            businessCustomerPreferenceId: singleOptionPreference.id,
        });
        await factory.create('customerPreferencesOptionSelection', {
            preferenceOptionId: selectedOption.id,
            centsCustomerId: centsCustomer.id,
        });

        // act
        const res = await getCustomerPreferences({
            businessId: business.id,
            centsCustomerId: centsCustomer.id,
        });

        // assert
        expect(res).to.have.property('customerPreferences');
        expect(res.customerPreferences).to.be.an('array');
        expect(res.customerPreferences).to.have.length(1);
        expect(res.customerPreferences[0].label).to.equal(singleOptionPreference.fieldName);
        expect(res.customerPreferences[0].values).to.have.length(1);
        expect(res.customerPreferences[0].values[0]).to.equal(selectedOption.value);
    });

    it('should return multi-option customer preferences', async () => {
        // arrange
        const multiOptionPreference = await factory.create('businessCustomerPreferences', {
            businessId: business.id,
            type: 'multi',
        });
        const selectedOption1 = await factory.create('preferenceOptions', {
            businessCustomerPreferenceId: multiOptionPreference.id,
        });
        const selectedOption2 = await factory.create('preferenceOptions', {
            businessCustomerPreferenceId: multiOptionPreference.id,
        });
        await factory.create('preferenceOptions', {
            businessCustomerPreferenceId: multiOptionPreference.id,
        });
        await factory.create('customerPreferencesOptionSelection', {
            preferenceOptionId: selectedOption1.id,
            centsCustomerId: centsCustomer.id,
        });
        await factory.create('customerPreferencesOptionSelection', {
            preferenceOptionId: selectedOption2.id,
            centsCustomerId: centsCustomer.id,
        });

        // act
        const res = await getCustomerPreferences({
            businessId: business.id,
            centsCustomerId: centsCustomer.id,
        });

        // assert
        expect(res).to.have.property('customerPreferences');
        expect(res.customerPreferences).to.be.an('array');
        expect(res.customerPreferences).to.have.length(1);
        expect(res.customerPreferences[0].label).to.equal(multiOptionPreference.fieldName);
        expect(res.customerPreferences[0].values).to.have.length(2);
        expect(res.customerPreferences[0].values[0]).to.equal(selectedOption1.value);
        expect(res.customerPreferences[0].values[1]).to.equal(selectedOption2.value);
    });

    it('should return customer preferences for specified business', async () => {
        // arrange
        const newBusiness = await factory.create('laundromatBusiness');
        const customerPreferenceNewBusiness = await factory.create('businessCustomerPreferences', {
            businessId: newBusiness.id,
            type: 'single',
        });
        const selectedOptionNewBusiness = await factory.create('preferenceOptions', {
            businessCustomerPreferenceId: customerPreferenceNewBusiness.id,
        });
        await factory.create('customerPreferencesOptionSelection', {
            preferenceOptionId: selectedOptionNewBusiness.id,
            centsCustomerId: centsCustomer.id,
        });

        const singleOptionPreference = await factory.create('businessCustomerPreferences', {
            businessId: business.id,
            type: 'single',
        });
        const selectedOption = await factory.create('preferenceOptions', {
            businessCustomerPreferenceId: singleOptionPreference.id,
        });
        await factory.create('preferenceOptions', {
            businessCustomerPreferenceId: singleOptionPreference.id,
        });
        await factory.create('preferenceOptions', {
            businessCustomerPreferenceId: singleOptionPreference.id,
        });
        await factory.create('customerPreferencesOptionSelection', {
            preferenceOptionId: selectedOption.id,
            centsCustomerId: centsCustomer.id,
        });

        // act
        const res = await getCustomerPreferences({
            businessId: business.id,
            centsCustomerId: centsCustomer.id,
        });

        // assert
        expect(res).to.have.property('customerPreferences');
        expect(res.customerPreferences).to.be.an('array');
        expect(res.customerPreferences).to.have.length(1);
        expect(res.customerPreferences[0].label).to.equal(singleOptionPreference.fieldName);
        expect(res.customerPreferences[0].values).to.have.length(1);
        expect(res.customerPreferences[0].values[0]).to.equal(selectedOption.value);
        expect(res).to.have.property('businessId', business.id);
        expect(res).to.have.property('centsCustomerId', centsCustomer.id);
    });
});
