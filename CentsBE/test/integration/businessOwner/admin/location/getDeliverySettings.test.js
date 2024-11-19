require('../../../../testHelper');
const ChaiHttpRequestHepler = require('../../../../support/chaiHttpRequestHelper');
const { generateToken } = require('../../../../support/apiTestHelper');
const factory = require('../../../../factories');
const { expect } = require('../../../../support/chaiHelper');
const { store } = require('../../../../../appQueues/eventHandlers');
const baseUrl = '/api/v1/business-owner/admin/locations';
const endpointUrl  = 'delivery-settings';

describe('test get delivery settings', () => {
    describe('Without auth token', () => {
        
        it('should return Unauthorized when no auth token provided', async () => {
            const deliverySettings = await ChaiHttpRequestHepler.put(`${baseUrl}/${endpointUrl}`)
            .set('authtoken', '');
            deliverySettings.should.have.status(401);
            expect(deliverySettings.body).to.have.property('error').equal('Please sign in to proceed.');
        });
    });

    describe('With auth token', async () => {
        let user, authToken, laundromatBusiness, store;
        beforeEach(async () => {
            await factory.create('role', { userType: "Business Owner" });
            user = await factory.create('userWithBusinessOwnerRole');
            authToken = generateToken({
                id: user.id
            });
        });

        describe('when bank account is not present', () => {

            beforeEach(async () => {
                laundromatBusiness = await factory.create('laundromatBusiness', { userId: user.id, merchantId: null });
                store = await factory.create('store', { businessId: laundromatBusiness.id });
            });
    
            it('should return canEnableDeliverySettings as FALSE', async () => {
                const deliverySettings = await ChaiHttpRequestHepler.get(`${baseUrl}/${store.id}/${endpointUrl}`)
                .set('authtoken', authToken);
                deliverySettings.should.have.status(200);
                expect(deliverySettings.body).to.have.property('canEnableDeliverySettings').equal(false);
                expect(deliverySettings.body).to.have.property('generalDeliverySettings').to.be.empty;
                expect(deliverySettings.body).to.have.property('ownDriverDeliverySettings').to.be.empty;
                expect(deliverySettings.body).to.have.property('onDemandDeliverySettings').to.be.empty;
            });
        });
    
        describe('when bank account is present', () => {
    
            beforeEach(async () => {
                laundromatBusiness = await factory.create('laundromatBusiness', { userId: user.id, merchantId: 'dYnKmgPWsa' });
                store = await factory.create('store', { businessId: laundromatBusiness.id });
            });
            
            it('should return canEnableDeliverySettings as TRUE', async () => {
                const deliverySettings = await ChaiHttpRequestHepler.get(`${baseUrl}/${store.id}/${endpointUrl}`)
                .set('authtoken', authToken);
                deliverySettings.should.have.status(200);
                expect(deliverySettings.body).to.have.property('canEnableDeliverySettings').equal(true);
                expect(deliverySettings.body).to.have.property('generalDeliverySettings');
                expect(deliverySettings.body).to.have.property('onDemandDeliverySettings');
                expect(deliverySettings.body).to.have.property('ownDriverDeliverySettings');
            });
        });
    });
    
});
