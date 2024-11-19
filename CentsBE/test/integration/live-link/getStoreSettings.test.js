require('../../testHelper');
const sinon = require('sinon');
const factory = require('../../factories');
const { expect } = require('../../support/chaiHelper');
const ChaiHttpRequestHelper = require('../../support/chaiHttpRequestHelper');
const {
    createUserWithBusinessAndCustomerOrders,
} = require('../../support/factoryCreators/createUserWithBusinessAndCustomerOrders');
const JwtService = require('../../../services/tokenOperations/main');
const { FACTORIES_NAMES: FN } = require('../../constants/factoriesNames');

const endpointName = 'live-status/settings';
const apiEndpoint = `/api/v1/${endpointName}`;

describe(`test ${apiEndpoint} API endpoint`, () => {
    let businessSettings;
    let store;
    let centsCustomer;
    let serviceOrder;
    let storeTheme;
    let token;
    let customerauthtoken;
    let tipSettings;

    beforeEach(async () => {
        const entities = await createUserWithBusinessAndCustomerOrders();
        businessSettings = entities.businessSettings;
        store = entities.store;
        centsCustomer = entities.centsCustomer;
        serviceOrder = entities.serviceOrder;
        storeTheme = entities.storeTheme;

        const jwtOrderService = new JwtService(JSON.stringify(serviceOrder));
        token = jwtOrderService.tokenGenerator(process.env.JWT_SECRET_TOKEN_ORDER);
        const jwtService = new JwtService(JSON.stringify(centsCustomer));
        customerauthtoken = jwtService.tokenGenerator(process.env.JWT_SECRET_LIVE_LINK_CUSTOMER);
        tipSettings = await factory.create(FN.tipSetting, {
            businessId: store.businessId,
        });
        await businessSettings.$query().update({ allowInStoreTip: true });
    });

    describe('should return correct response', async () => {
        const defaultAssert = (response) => {
            expect(response.statusCode).equals(200);
            expect(response.body).should.not.be.empty;
            expect(response.body).to.have.property('success').equal(true);
            expect(response.body).to.have.property('theme');
            expect(response.body.theme).to.have.property('id');
            expect(response.body.theme).to.have.property('businessId');
            expect(response.body.theme).to.have.property('primaryColor');
            expect(response.body.theme).to.have.property('secondaryColor');
            expect(response.body.theme).to.have.property('borderRadius');
            expect(response.body.theme).to.have.property('logoUrl');
            expect(response.body.theme).to.have.property('createdAt');
            expect(response.body.theme).to.have.property('updatedAt');
            expect(response.body.theme).to.have.property('normalFont');
            expect(response.body.theme).to.have.property('boldFont');
            expect(response.body.theme).to.have.property('active');
        };

        it('with tip settings', async () => {
            // call
            const response = await ChaiHttpRequestHelper.get(apiEndpoint, { token }).set({
                customerauthtoken,
            });

            // assert
            defaultAssert(response);
            expect(response.body).to.have.property('tipType').equal(tipSettings.tipType);
            expect(response.body).to.have.property('tipOptions').to.be.an('array').that.is.not
                .empty;
            expect(response.body.theme, 'with storeTheme when it exist')
                .to.have.property('storeId')
                .equal(store.id);
        });

        describe('without tip settings', async () => {
            it('when allowInStoreTip in businessSettings is false', async () => {
                await businessSettings.$query().update({ allowInStoreTip: false });

                // call
                const response = await ChaiHttpRequestHelper.get(apiEndpoint, { token }).set({
                    customerauthtoken,
                });

                // assert
                defaultAssert(response);
                expect(response.body).to.have.property('tipType').equal('');
                expect(response.body).to.have.property('tipOptions').to.be.an('array').that.is
                    .empty;
                expect(response.body.theme, 'with storeTheme when it exist')
                    .to.have.property('storeId')
                    .equal(store.id);
            });

            it('when TipSetting is not exist', async () => {
                await tipSettings.$query().deleteById(tipSettings.id);

                // call
                const response = await ChaiHttpRequestHelper.get(apiEndpoint, { token }).set({
                    customerauthtoken,
                });

                // assert
                defaultAssert(response);
                expect(response.body).to.have.property('tipType').equal('');
                expect(response.body).to.have.property('tipOptions').to.be.an('array').that.is
                    .empty;
                expect(response.body.theme, 'with storeTheme when it exist')
                    .to.have.property('storeId')
                    .equal(store.id);
            });

            it('when businessSettings is not exist', async () => {
                await businessSettings.$query().deleteById(businessSettings.id);

                // call
                const response = await ChaiHttpRequestHelper.get(apiEndpoint, { token }).set({
                    customerauthtoken,
                });

                // assert
                defaultAssert(response);
                expect(response.body).to.have.property('tipType').equal('');
                expect(response.body).to.have.property('tipOptions').to.be.an('array').that.is
                    .empty;
                expect(response.body.theme, 'with storeTheme when it exist')
                    .to.have.property('storeId')
                    .equal(store.id);
            });
        });

        it('with businessTheme when storeTheme is not exist', async () => {
            // call
            await storeTheme.$query().deleteById(storeTheme.id);
            const response = await ChaiHttpRequestHelper.get(apiEndpoint, { token }).set({
                customerauthtoken,
            });

            // assert
            defaultAssert(response);
            expect(
                response.body.theme,
                'should have businessTheme in theme property',
            ).not.have.property('storeId');
        });
    });

    describe('should return error', async () => {
        it('with unprovided Error', async () => {
            const errorMessage = 'Unprovided error!';
            sinon.stub(JwtService.prototype, 'verifyToken').throws(new Error(errorMessage));

            // call
            const response = await ChaiHttpRequestHelper.get(apiEndpoint, { token }).set({
                customerauthtoken,
            });

            // assert
            expect(response.statusCode).equals(500);
            expect(response.body).to.have.property('error').equals(errorMessage);
        });
    });
});
