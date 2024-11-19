require('../../../testHelper');

const { generateToken } = require('../../../support/apiTestHelper');
const factory = require('../../../factories');
const { FACTORIES_NAMES } = require('../../../constants/factoriesNames');
const {
    assertGetResponseSuccess,
    assertGetResponseError,
    itShouldCorrectlyAssertTokenPresense,
} = require('../../../support/httpRequestsHelper');
const { expect } = require('../../../support/chaiHelper');
const { mockMachineModelConfig, mockMachineFeatureConfig, mockMachineProgrammingWasherConfig } = require('../../../support/machineConfiguartionsHelper');
const { deviceStatuses } = require('../../../../constants/constants');
const MachineConfiguration = require('../../../../mongooseModels/machineConfiguration');
const { mapMachineProgramming, mapMachineModel, mapMachineFeature } = require('../../../../services/machines/devicesResponseMappers');

const getApiEndPoint = (deviceId) => `/api/v1/business-owner/machine/devices/${deviceId}/details-prices`;

describe('getDeviceMachineDetailsAndPrices test', () => {
    let user, business, store, batch, device, configurations, token;

    beforeEach(async () => {
        user = await factory.create(FACTORIES_NAMES.userWithBusinessOwnerRole);
        business = await factory.create(FACTORIES_NAMES.laundromatBusiness, { userId: user.id });
        store = await factory.create(FACTORIES_NAMES.store, {
            businessId: business.id,
        });
        batch = await factory.create(FACTORIES_NAMES.batch, {
            storeId: store.id,
            businessId: business.id,
        });
        device = await factory.create(FACTORIES_NAMES.device, {
            batchId: batch.id,
            isActive: true,
            isPaired: false,
            status: deviceStatuses.ONLINE,
            name: '66:cc:88:dd'
        });
        token = generateToken({
            id: user.id,
        });


        const mockConfigurationsBody = {
            ...mockMachineFeatureConfig({ PennyID: device.name }),
            ...mockMachineModelConfig({ PennyID: device.name }),
            ...mockMachineProgrammingWasherConfig({ PennyID: device.name }),
        };
        configurations = await factory.create(FACTORIES_NAMES.machineConfiguration, mockConfigurationsBody);
    });

    describe('when auth token validation fails', () => {
        itShouldCorrectlyAssertTokenPresense(assertGetResponseError, () => getApiEndPoint(device.id));
    });

    describe('when parameters are invalid', () => {
        it('should throw 422 if deviceId param is in string format', async () => {
            await assertGetResponseError({
                url: getApiEndPoint('dhfjdhj'),
                token,
                code: 422,
            });
        });

        it('should throw 422 if deviceId is negative', async () => {
            await assertGetResponseError({
                url: getApiEndPoint(-2),
                token,
                code: 422,
            });
        });

        it('should throw 422 if deviceId is float value', async () => {
            await assertGetResponseError({
                url: getApiEndPoint(5.78),
                token,
                code: 422,
            });
        });

        it('should throw 404 if device is not found', async () => {
            await assertGetResponseError({
                url: getApiEndPoint(46753),
                token,
                code: 404,
            });
        });

        it('should throw 404 if device has not stored configurations yet', async () => {
            await MachineConfiguration.deleteOne({
                PennyID: device.name
            });
            await assertGetResponseError({
                url: getApiEndPoint(device.id),
                token,
                code: 404,
                expectedError: 'Requested device configuration does not exist'
            });
        });
    });

    describe('when success response', () => {
        it('should return 200', async () => {
            await assertGetResponseSuccess({
                url: getApiEndPoint(device.id),
                token,
                code: 200,
            });
        });

        it('should return status 200 with expected values', async () => {
            const { body } = await assertGetResponseSuccess({
                url: getApiEndPoint(device.id),
                token,
            });

            expect(body).to.deep.equal({
                machineFeature: mapMachineFeature(configurations),
                machineModel: mapMachineModel(configurations),
                machineProgramming: mapMachineProgramming(configurations),
            });
        });
    });
});
