require('../../../../testHelper');
const factory = require('../../../../factories');
const { expect } = require('../../../../support/chaiHelper');
const { assertGetResponseSuccess } = require('../../../../support/httpRequestsHelper.js')

const API_ENDPOINT = '/api/v1/live-status/business-settings';

describe('test to fetch business settings', () => {
    describe('without business', () => {
        it('should have no business settings', async () => {
            const { body } = await assertGetResponseSuccess({
                url: `${API_ENDPOINT}/99`,
                token: ''
            });
            expect(body).to.have.property('success').equal(true);
            expect(body).to.not.have.property('businessSettings');
        });
    });

    describe('with business', () => {
        let business;
        beforeEach(async () => {
            business = await factory.create('laundromatBusiness');
            await factory.create('businessSetting', {
                businessId: business.id,
                allowInStoreTip: false,
                hasConvenienceFee: true,
                isBagTrackingEnabled: false,
                isCustomPreferencesEnabled: false,
                isCustomUrl: false,
                isHangDryEnabled: false,
                isWeightAfterProcessing: true,
                isWeightBeforeProcessing: true,
                isWeightDuringIntake: true,
                isWeightUpOnCompletion: true,
                requiresEmployeeCode: false,
                requiresRack: true,
            });
        });
    
        it('should return business settings', async () => {
            const { body } = await assertGetResponseSuccess({
                url: `${API_ENDPOINT}/${business.id}`,
                token: ''
            });
            expect(body).to.have.property('success').equal(true);
            const businessSettings = body.businessSettings;
            expect(businessSettings).to.have.property('allowInStoreTip').equal(false);
            expect(businessSettings).to.have.property('hasConvenienceFee').equal(true);
            expect(businessSettings).to.have.property('isBagTrackingEnabled').equal(false);
            expect(businessSettings).to.have.property('isCustomPreferencesEnabled').equal(false);
            expect(businessSettings).to.have.property('isCustomUrl').equal(false);
            expect(businessSettings).to.have.property('isHangDryEnabled').equal(false);
            expect(businessSettings).to.have.property('isWeightAfterProcessing').equal(true);
            expect(businessSettings).to.have.property('isWeightBeforeProcessing').equal(true);
            expect(businessSettings).to.have.property('isWeightDuringIntake').equal(true);
            expect(businessSettings).to.have.property('isWeightUpOnCompletion').equal(true);
            expect(businessSettings).to.have.property('receiptFooterMessage').equal('Thank you for your order.');
            expect(businessSettings).to.have.property('requiresEmployeeCode').equal(false);
            expect(businessSettings).to.have.property('requiresRack').equal(true);
            expect(businessSettings).to.have.property('salesWeight').equal('DURING_INTAKE');
            expect(businessSettings).to.have.property('businessId').equal(business.id);
        });
    });
});
