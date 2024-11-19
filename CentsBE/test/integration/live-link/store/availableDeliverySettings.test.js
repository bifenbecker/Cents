require('../../../testHelper');
const sinon = require('sinon');
const ChaiHttpRequestHelper = require('../../../support/chaiHttpRequestHelper');
const { generateToken, generateLiveLinkCustomerToken } = require('../../../support/apiTestHelper');
const factory = require('../../../factories');
const GeneralDeliverySettingsService = require('../../../../services/deliverySettings/generalDeliverySettings');
const { expect } = require('../../../support/chaiHelper');

function getEndpointURL({ id: storeId }) {
    return `/api/v1/live-status/stores/${storeId}/available-delivery-settings`;
}

describe('tests available delivery settings api', () => {
    let store;

    beforeEach(async () => {
        store = await factory.create('store');
    });

    describe('test get available delivery settings', () => {
        describe('when auth token validation fails', () => {
            it('should respond with a 401 code when token is empty', async () => {
                const res = await ChaiHttpRequestHelper.get(getEndpointURL(store)).set(
                    'customerauthtoken',
                    '',
                );
                res.should.have.status(401);
                expect(res.body)
                    .to.have.property('error')
                    .equal('Please provide customerToken to proceed.');
            });

            it('should respond with a 404 when wrong customer token is used', async () => {
                const token = await generateLiveLinkCustomerToken({ id: 100 });
                const res = await ChaiHttpRequestHelper.get(getEndpointURL(store)).set(
                    'customerauthtoken',
                    token,
                );
                res.should.have.status(404);
                expect(res.body).to.have.property('error').equal('Customer could not be found');
            });

            it('should return error', async () => {
                const centsCustomer = await factory.create('centsCustomer');
                const token = generateLiveLinkCustomerToken({ id: centsCustomer.id });

                const errorMessage = 'Unprovided error';
                sinon.stub(GeneralDeliverySettingsService.prototype, 'storeSettings')
                    .throws(new Error(errorMessage));

                response = await ChaiHttpRequestHelper.get(getEndpointURL(store), {})
                    .set('customerauthtoken', token);

                response.should.have.status(500);
            });
        });

        describe('when auth token is valid', () => {
            let token;

            beforeEach(async () => {
                const centsCustomer = await factory.create('centsCustomer');
                token = generateLiveLinkCustomerToken({ id: centsCustomer.id });
            });

            describe('when there are no delivery settings available', () => {
                it('should successfully return empty objects', async () => {
                    const res = await ChaiHttpRequestHelper.get(getEndpointURL(store)).set(
                        'customerauthtoken',
                        token,
                    );
                    res.should.have.status(200);
                    res.body.generalDeliverySettings.should.not.be.empty;
                    res.body.generalDeliverySettings.should.have.property('deliveryEnabled', false);
                    res.body.generalDeliverySettings.should.have.property('deliveryTier', null);
                    res.body.generalDeliverySettings.should.have.property(
                        'turnAroundInHours',
                        null,
                    );

                    res.body.ownDriverDeliverySettings.should.be.empty;
                    res.body.onDemandDeliverySettings.should.be.empty;
                });
            });

            describe('when there are delivery settings available', () => {
                let ownDriverSetting, onDemandSetting;

                beforeEach(async () => {
                    ownDriverSetting = await factory.create('ownDeliverySetting', {
                        storeId: store.id,
                    });
                    onDemandSettings = await factory.create('centsDeliverySettings', {
                        storeId: store.id,
                    });
                });
                it('should successfully return the settings', async () => {
                    const res = await ChaiHttpRequestHelper.get(getEndpointURL(store)).set(
                        'customerauthtoken',
                        token,
                    );
                    res.should.have.status(200);

                    res.body.ownDriverDeliverySettings.should.not.be.empty;
                    res.body.ownDriverDeliverySettings.should.have.property('active', true);
                    res.body.ownDriverDeliverySettings.should.have.property(
                        'deliveryWindowBufferInHours',
                        0.5,
                    );

                    res.body.onDemandDeliverySettings.should.not.be.empty;
                    res.body.onDemandDeliverySettings.should.have.property('active', true);
                });
            });
        });
    });
});
