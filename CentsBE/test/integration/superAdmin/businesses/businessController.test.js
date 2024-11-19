require('../../../testHelper');
const sinon = require('sinon');
const { generateToken } = require('../../../support/apiTestHelper');
const factory = require('../../../factories');
const { expect } = require('../../../support/chaiHelper');
const { 
    itShouldCorrectlyAssertTokenPresense,
    assertGetResponseSuccess,
    assertGetResponseError,
    assertPutResponseSuccess,
    assertPutResponseError,
} = require('../../../support/httpRequestsHelper');
const BusinessSettings = require('../../../../models/businessSettings');
const stripe = require('../../../../routes/stripe/config');
const { FACTORIES_NAMES: FN } = require('../../../constants/factoriesNames');
const { ERROR_MESSAGES } = require('../../../../constants/error.messages');

const BASE_URL = '/api/v1/super-admin/businesses';
const MERCHANT_ID = 'acc_34fs45dg34fd';

describe('test businessController APIs', () => {
    let statementDescriptor;

    beforeEach(() => {
        statementDescriptor = 'test';

        sinon.stub(stripe.accounts, 'retrieve').callsFake(() => ({
            settings: {
                payments: {
                    statement_descriptor: statementDescriptor,
                },
            },
        }));
    });


    describe('test API to get all businesses', () => {
        let token, user, url;

        beforeEach(async () => {
            await factory.create(FN.role, { userType: 'Super Admin' });
            user = await factory.create(FN.userWithSuperAdminRole);

            token = generateToken({ id: user.id });

            url = `${BASE_URL}/all`;
        });

        itShouldCorrectlyAssertTokenPresense(
            assertGetResponseError,
            () => url,
        );

        it('should return empty array', async () => {
            const { body: { businesses, success, total }} = await assertGetResponseSuccess({ url, token });

            expect(success).to.be.true;
            expect(businesses).to.have.lengthOf(0);
            expect(total).to.equal(0);
        });

        it('should return businesses', async () => {
            await factory.create(FN.laundromatBusiness, { userId: user.id });

            const { body: { businesses, total }} = await assertGetResponseSuccess({ url, token });
            
            expect(businesses).to.have.lengthOf(1);
            expect(total).to.equal(1);
        });
    });

    describe('test API to get all businesses\' names and ids in the Cents ecosystem', () => {
        let token, user, url;

        beforeEach(async () => {
            await factory.create(FN.role, { userType: 'Super Admin' });
            user = await factory.create(FN.userWithSuperAdminRole);

            token = generateToken({ id: user.id });

            url = `${BASE_URL}/all/simple`;
        });

        itShouldCorrectlyAssertTokenPresense(
            assertGetResponseError,
            () => url,
        );

        it('should return empty array', async () => {
            const { body: { businesses, success }} = await assertGetResponseSuccess({ url, token });

            expect(success).to.be.true;
            expect(businesses).to.have.lengthOf(0);
        });

        it('should return simple businesses', async () => {
            const business = await factory.create(FN.laundromatBusiness, { userId: user.id });

            const { body: { businesses }} = await assertGetResponseSuccess({ url, token });
            
            expect(businesses).to.have.lengthOf(1);
            expect(businesses[0]).to.have.property('value').to.equal(business.id);
            expect(businesses[0]).to.have.property('name').to.equal(business.name);
            expect(businesses[0]).to.have.property('display').to.equal(business.name);
        });
    });

    describe('test API to fetch an individual business', () => {
        let token, business, user, url;        

        beforeEach(async () => {
            await factory.create(FN.role, { userType: 'Super Admin' });
            user = await factory.create(FN.userWithSuperAdminRole);
            business = await factory.create(FN.laundromatBusiness, { userId: user.id, merchantId: MERCHANT_ID });

            token = generateToken({ id: user.id });

            url = `${BASE_URL}/${business.id}/get`;
        });

        itShouldCorrectlyAssertTokenPresense(
            assertGetResponseError,
            () => url,
        );

        it('should return error if "id" is not valid', async () => {
            url = `${BASE_URL}/null/get`;

            await assertGetResponseError({ url, token, code: 409, expectedError: ERROR_MESSAGES.INVALID_PARAM_ID });
        });

        it('should fetch details for an individual business', async () => {
            const res = await assertGetResponseSuccess({ url, token });

            const businessSettings = await BusinessSettings.query().findOne({ businessId: business.id });

            expect(res.body.success).to.be.true;
            expect(res.body.business.id).to.equal(business.id);
            expect(res.body.business.user).to.not.be.undefined
            expect(res.body.business.user.id).to.equal(user.id);
            expect(res.body.business.settings).to.not.be.undefined;
            expect(res.body.business.settings.id).to.equal(businessSettings.id);
        });

        it('should include stripe account payment statement descriptor if merchantId exists', async () => {
            const res = await assertGetResponseSuccess({ url, token });

            expect(res.body.success).to.be.true;
            expect(res.body.business.statementDescriptor).to.exist;
            expect(res.body.business.statementDescriptor).to.equal(statementDescriptor);
        });

        it('should return business without statementDescriptor if merchantId doesn\'t exist', async () => {
            business = await factory.create(FN.laundromatBusiness, { userId: user.id });
            url = `${BASE_URL}/${business.id}/get`;

            const res = await assertGetResponseSuccess({ url, token });

            expect(res.body.success).to.be.true;
            expect(res.body.business.statementDescriptor).to.not.exist;
        });
    });

    describe('test API to update business settings', () => {
        let token, business, user, url, businessSettings, payload;

        beforeEach(async () => {
            await factory.create(FN.role, { userType: 'Super Admin' });
            user = await factory.create(FN.userWithSuperAdminRole);
            business = await factory.create(FN.laundromatBusiness, { userId: user.id, merchantId: MERCHANT_ID });
            businessSettings = await BusinessSettings.query().findOne({ businessId: business.id });

            token = generateToken({ id: user.id });

            url = `${BASE_URL}/business/settings/update`;

            payload = {
                field: 'termsOfServiceUrl',
                value: 'https://pierre-is-great.gov',
                id: business.id,
            };
        });

        itShouldCorrectlyAssertTokenPresense(
            assertPutResponseError,
            () => url,
        );

        it('should update details for business settings', async () => {
            payload = {
                ...payload,
                field: 'dryCleaningEnabled',
                value: true,
            }

            const res = await assertPutResponseSuccess({ url, token, body: payload });

            expect(res.body.success).to.be.true;
            expect(res.body.business.settings.dryCleaningEnabled).to.equal(payload.value);
            expect(res.body.business.user).to.exist;
            expect(res.body.business.user.id).to.equal(user.id);
        });

        it('should update details for business settings', async () => {
            const res = await assertPutResponseSuccess({ url, token, body: payload });

            expect(res.body.success).to.be.true;
            expect(res.body.business.settings.termsOfServiceUrl).to.equal(payload.value);
            expect(res.body.business.user).to.exist;
            expect(res.body.business.user.id).to.equal(user.id);
        });

        it('should include stripe account payment statement descriptor if merchantId exists', async () => {
            const res = await assertPutResponseSuccess({ url, token, body: payload });

            expect(res.body.success).to.be.true;
            expect(res.body.business.statementDescriptor).to.exist;
            expect(res.body.business.statementDescriptor).to.equal(statementDescriptor);
        });
    });

    describe('test API to update business field value', () => {
        let token, business, user, url, payload;

        beforeEach(async () => {
            const businessName = 'Minsk Laundry';
            await factory.create(FN.role, { userType: 'Super Admin' });
            user = await factory.create(FN.userWithSuperAdminRole);
            business = await factory.create(FN.laundromatBusiness, {
                userId: user.id,
                merchantId: MERCHANT_ID,
                name: businessName,
            });

            token = generateToken({ id: user.id });

            url = `${BASE_URL}/${business.id}/update`;

            payload = {
                field: 'zipCode',
                name: businessName,
                value: '11211',
            };
        });

        itShouldCorrectlyAssertTokenPresense(
            assertPutResponseError,
            () => url,
        );

        it('should update business field value', async () => {
            const res = await assertPutResponseSuccess({ url, token, body: payload });

            expect(res.body.success).to.be.true;
            expect(res.body.business.user).to.exist;
            expect(res.body.business.user.id).to.equal(user.id);
            expect(res.body.business.zipCode).to.equal(payload.value);
        });

        it('should include stripe account payment statement descriptor if merchantId exists', async () => {
            const res = await assertPutResponseSuccess({ url, token, body: payload });

            expect(res.body.success).to.be.true;
            expect(res.body.business.statementDescriptor).to.exist;
            expect(res.body.business.statementDescriptor).to.equal(statementDescriptor);
        });
    });

    describe('test API to get all stores per business id', () => {
        let token, business, user, url;

        beforeEach(async () => {
            await factory.create(FN.role, { userType: 'Super Admin' });
            user = await factory.create(FN.userWithSuperAdminRole);
            business = await factory.create(FN.laundromatBusiness, { userId: user.id });

            token = generateToken({ id: user.id });

            url = `${BASE_URL}/${business.id}/stores`;
        });

        itShouldCorrectlyAssertTokenPresense(
            assertGetResponseError,
            () => url,
        );

        it('should return empty array', async () => {
            const { body: { stores, success }} = await assertGetResponseSuccess({ url, token });

            expect(success).to.be.true;
            expect(stores).to.have.lengthOf(0);
        });

        it('should return stores by business id', async () => {
            await factory.create(FN.store, { businessId: business.id });

            const { body: { stores, success }} = await assertGetResponseSuccess({ url, token });
            
            expect(success).to.be.true;
            expect(stores).to.have.lengthOf(1);
        });
    });

    describe('test API to search across LaundromatBusiness models based on search input', () => {
        let token, user, url;

        beforeEach(async () => {
            await factory.create(FN.role, { userType: 'Super Admin' });
            user = await factory.create(FN.userWithSuperAdminRole);

            token = generateToken({ id: user.id });

            url = `${BASE_URL}/all/search`;
        });

        itShouldCorrectlyAssertTokenPresense(
            assertGetResponseError,
            () => url,
        );

        it('should return empty array', async () => {
            const { body: { businesses, success, total }} = await assertGetResponseSuccess({ url, token });

            expect(success).to.be.true;
            expect(businesses).to.have.lengthOf(0);
            expect(total).to.equal(0);
        });

        it('should search one business by name', async () => {
            const businessName = 'test';

            await factory.create(FN.laundromatBusiness, { userId: user.id, name: businessName });

            url = `${BASE_URL}/all/search?searchTerm=${businessName}`;

            const { body: { businesses, success, total }} = await assertGetResponseSuccess({ url, token });

            expect(success).to.be.true;
            expect(businesses).to.have.lengthOf(1);
            expect(total).to.equal(1);
        });

        it('should search one business by business id', async () => {
            const business = await factory.create(FN.laundromatBusiness, { userId: user.id });

            url = `${BASE_URL}/all/search?searchTerm=${business.id}`;

            const { body: { businesses, success, total }} = await assertGetResponseSuccess({ url, token });

            expect(success).to.be.true;
            expect(businesses).to.have.lengthOf(1);
            expect(total).to.equal(1);
        });
    });
});
