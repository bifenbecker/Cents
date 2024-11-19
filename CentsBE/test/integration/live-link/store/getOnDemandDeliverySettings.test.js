require('../../../testHelper');
const sinon = require('sinon');
const { expect } = require('../../../support/chaiHelper');
const ChaiHttpRequestHelper = require('../../../support/chaiHttpRequestHelper');
const {
    createOrderAndCustomerTokensWithRelations
} = require('../../../support/createOrderAndCustomerTokensHelper');
const factory = require('../../../factories');
const GeneralDeliverySettingsService = require('../../../../services/deliverySettings/generalDeliverySettings');
const { FACTORIES_NAMES: FN } = require('../../../constants/factoriesNames');
const {
    ORDER_DELIVERY_TYPES,
    orderDeliveryStatuses
} = require('../../../../constants/constants');

const endpointName = 'live-status/stores/:storeId/on-demand-delivery-settings';
const apiEndpoint = `/api/v1/${endpointName}`;

describe(`test ${apiEndpoint} API endpoint`, () => {
    const makeRequest = async () => {
        const {
            tokens: { customerToken },
            environment: { store, order },
        } = await createOrderAndCustomerTokensWithRelations();

        await factory.create(FN.orderDelivery, {
            orderId: order.id,
            type: ORDER_DELIVERY_TYPES.PICKUP,
            status: orderDeliveryStatuses.SCHEDULED,
        });

        const testApiEndpoint = apiEndpoint.replace(':storeId', store.id);

        return {
            store,
            customerToken,
            testApiEndpoint
        }
    };

    describe('with full pipeline stages', async () => {
        describe('should return correct response', async () => {
            let response, params;

            it('should return correct response status and body', async () => {
                const { store, customerToken, testApiEndpoint } = await makeRequest();

                await factory.create(FN.centsDeliverySettings, {
                    storeId: store.id,
                });

                params = {
                    storeId: store.id
                };

                response = await ChaiHttpRequestHelper.get(testApiEndpoint, params)
                    .set('customerauthtoken', customerToken);

                const {
                    body: { onDemandDeliverySettings },
                } = response;

                response.should.have.status(200);
                response.body.should.have.property('success', true);
                response.body.should.have.property('onDemandDeliverySettings');
                response.body.should.have.property('onDemandIntervalInMins');
                expect(onDemandDeliverySettings).to.have.property('id');
                expect(onDemandDeliverySettings).to.have.property('active').to.equal(true);
                expect(onDemandDeliverySettings).to.have.property('storeId');
                expect(onDemandDeliverySettings).to.have.property('subsidyInCents').to.equal(0);
                expect(onDemandDeliverySettings).to.have.property('returnOnlySubsidyInCents').to.equal(0);
                expect(onDemandDeliverySettings).to.have.property('doorDashEnabled').to.equal(false);
                expect(onDemandDeliverySettings).to.have.property('dayWiseWindows');
            });

            it('should return an empty onDemandDeliverySettings', async () => {
                const {
                    tokens: { customerToken },
                    environment: { store },
                } = await createOrderAndCustomerTokensWithRelations();

                const testApiEndpoint = apiEndpoint.replace(':storeId', store.id);

                params = {
                    storeId: store.id
                };

                response = await ChaiHttpRequestHelper.get(testApiEndpoint, params)
                    .set('customerauthtoken', customerToken);

                const {
                    body: { onDemandDeliverySettings },
                } = response;

                response.should.have.status(200);
                response.body.should.have.property('success', true);
                response.body.should.have.property('onDemandDeliverySettings');
                response.body.should.have.property('onDemandIntervalInMins');
                expect(onDemandDeliverySettings).to.be.empty;
            });

             it('should return an empty array when centsDeliverySettings.active is false', async () => {
                const { store, customerToken, testApiEndpoint } = await makeRequest();

                await factory.create(FN.centsDeliverySettings, {
                    storeId: store.id,
                    active: false
                });

                params = {
                    storeId: store.id
                };

                response = await ChaiHttpRequestHelper.get(testApiEndpoint, params)
                    .set('customerauthtoken', customerToken);

                const {
                    body: { onDemandDeliverySettings },
                } = response;

                response.should.have.status(200);
                response.body.should.have.property('success', true);
                response.body.should.have.property('onDemandDeliverySettings');
                response.body.should.have.property('onDemandIntervalInMins');
                expect(onDemandDeliverySettings).to.have.property('id');
                expect(onDemandDeliverySettings).to.have.property('active').to.equal(false);
                expect(onDemandDeliverySettings).to.have.property('storeId');
                expect(onDemandDeliverySettings).to.have.property('subsidyInCents').to.equal(0);
                expect(onDemandDeliverySettings).to.have.property('returnOnlySubsidyInCents').to.equal(0);
                expect(onDemandDeliverySettings).to.have.property('doorDashEnabled').to.equal(false);
                expect(onDemandDeliverySettings).to.have.property('dayWiseWindows');
            });

            it('should return error', async () => {
                const { customerToken, testApiEndpoint } = await makeRequest();

                const errorMessage = 'Unprovided error';
                sinon.stub(GeneralDeliverySettingsService.prototype, 'centsDeliverySettings')
                    .throws(new Error(errorMessage));

                response = await ChaiHttpRequestHelper.get(testApiEndpoint, {})
                    .set('customerauthtoken', customerToken);

                response.should.have.status(500);
            });
        });
    });
});