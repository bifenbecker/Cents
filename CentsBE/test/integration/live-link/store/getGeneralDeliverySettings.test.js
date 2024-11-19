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

const endpointName = 'live-status/stores/:storeId/general-delivery-settings';
const apiEndpoint = `/api/v1/${endpointName}`;

describe(`test ${apiEndpoint} API endpoint`, () => {
    const makeRequest = async () => {
        const {
            tokens: { customerToken },
            environment: { store, order },
        } = await createOrderAndCustomerTokensWithRelations();

        await factory.create(FN.ownDeliverySetting, {
            storeId: store.id,
            active: true,
            hasZones: true,
        });

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

                params = {
                    storeId: store.id
                };

                response = await ChaiHttpRequestHelper.get(testApiEndpoint, params)
                    .set('customerauthtoken', customerToken);

                const {
                    body: { generalDeliverySettings },
                } = response;

                response.should.have.status(200);
                response.body.should.have.property('success', true);
                response.body.should.have.property('generalDeliverySettings');
                expect(generalDeliverySettings).to.have.property('storeId');
                expect(generalDeliverySettings).to.have.property('deliveryEnabled').to.equal(false);
                expect(generalDeliverySettings).to.have.property('turnAroundInHours').to.equal(null);
                expect(generalDeliverySettings).to.have.property('recurringDiscountInPercent').to.equal(0);
                expect(generalDeliverySettings).to.have.property('deliveryTier').to.equal(null);
            });

            it('should return error', async () => {
                const { customerToken, testApiEndpoint } = await makeRequest();

                const errorMessage = 'Unprovided error';
                sinon.stub(GeneralDeliverySettingsService.prototype, 'storeSettings')
                    .throws(new Error(errorMessage));

                response = await ChaiHttpRequestHelper.get(testApiEndpoint, {})
                    .set('customerauthtoken', customerToken);

                response.should.have.status(500);
            });
        });
    });
});