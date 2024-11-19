require('../../testHelper');
const sinon = require('sinon');
const factory = require('../../factories');
const { expect, assert } = require('../../support/chaiHelper');
const ChaiHttpRequestHelper = require('../../support/chaiHttpRequestHelper');
const JwtService = require('../../../services/tokenOperations/main');
const GeneralDeliverySettingsService = require('../../../services/deliverySettings/generalDeliverySettings');
const StoreSettings = require('../../../models/storeSettings');
const {
    deliveryBufferTimeInHours,
    onDemandIntervalInMins,
    shiftType,
} = require('../../../constants/constants');
const { FACTORIES_NAMES: FN } = require('../../constants/factoriesNames');

const apiEndpoint = '/api/v1/live-status/stores/:storeId/delivery-settings';
describe(`test ${apiEndpoint} API endpoint`, () => {
    describe('should return correct response', () => {
        it('without delivery settings', async () => {
            const store = await factory.create(FN.store);
            const centsCustomer = await factory.create(FN.centsCustomer);
            const jwtOrderService = new JwtService(JSON.stringify(centsCustomer));
            const customerauthtoken = jwtOrderService.tokenGenerator(
                process.env.JWT_SECRET_TOKEN_ORDER,
            );
            await StoreSettings.query().delete().where({
                storeId: store.id,
            });

            // request
            const response = await ChaiHttpRequestHelper.get(
                apiEndpoint.replace(':storeId', store.id),
                {},
            ).set({
                customerauthtoken,
            });

            // assert
            response.should.have.status(200);
            expect(response.body).have.property('ownDriverDeliverySettings');
            assert.deepEqual(response.body.onDemandDeliverySettings, {
                dayWiseWindows: [],
            });
            expect(response.body).have.property('onDemandDeliverySettings');
            assert.deepEqual(response.body.onDemandDeliverySettings, {
                dayWiseWindows: [],
            });
            expect(response.body).have.property(
                'deliveryBufferTimeInHours',
                deliveryBufferTimeInHours,
            );
            expect(response.body).have.property('onDemandIntervalInMins', onDemandIntervalInMins);
            expect(response.body).have.property('turnAroundTime').to.be.null;
        });

        it('with delivery settings and timings', async () => {
            const turnAroundInHours = 2;
            const day = 1;
            const store = await factory.create(FN.store);
            await StoreSettings.query()
                .patch({
                    turnAroundInHours,
                })
                .where({
                    storeId: store.id,
                });
            const onDemandDeliverySettings = await factory.create(FN.centsDeliverySettings, {
                storeId: store.id,
                active: true,
                subsidyInCents: 0,
                returnOnlySubsidyInCents: 0,
                doorDashEnabled: false,
            });
            const onDemandShift = await factory.create(FN.shift, {
                storeId: store.id,
                type: shiftType.CENTS_DELIVERY,
            });
            const onDemandTiming = await factory.create(FN.timing, {
                shiftId: onDemandShift.id,
                day,
            });
            const ownDriverDeliverySettings = await factory.create(FN.ownDeliverySetting, {
                storeId: store.id,
                active: true,
                zipCodes: null,
                hasZones: false,
                deliveryFeeInCents: 0,
                returnDeliveryFeeInCents: null,
                deliveryWindowBufferInHours: 0.5,
            });
            const ownDriverShift = await factory.create(FN.shift, {
                storeId: store.id,
                type: shiftType.OWN_DELIVERY,
            });
            const ownDriverTiming = await factory.create(FN.timing, {
                shiftId: ownDriverShift.id,
                day,
            });
            const centsCustomer = await factory.create(FN.centsCustomer);
            const jwtOrderService = new JwtService(JSON.stringify(centsCustomer));
            const customerauthtoken = jwtOrderService.tokenGenerator(
                process.env.JWT_SECRET_TOKEN_ORDER,
            );

            // request
            const response = await ChaiHttpRequestHelper.get(
                apiEndpoint.replace(':storeId', store.id),
                {},
            ).set({
                customerauthtoken,
            });

            // assert
            response.should.have.status(200);

            expect(response.body).have.property('ownDriverDeliverySettings');
            assert.deepOwnInclude(
                response.body.ownDriverDeliverySettings,
                ownDriverDeliverySettings,
            );
            expect(response.body.ownDriverDeliverySettings).have.property('dayWiseWindows');
            expect(
                response.body.ownDriverDeliverySettings.dayWiseWindows
                    .filter((timing) => timing.day !== day)
                    .every((timing) => timing.timings.length === 0),
            ).to.be.true;
            expect(
                response.body.ownDriverDeliverySettings.dayWiseWindows[day].timings[0],
            ).have.property('id', ownDriverTiming.id);

            expect(response.body).have.property('onDemandDeliverySettings');
            assert.deepOwnInclude(response.body.onDemandDeliverySettings, onDemandDeliverySettings);
            expect(response.body.onDemandDeliverySettings).have.property('dayWiseWindows');
            expect(
                response.body.onDemandDeliverySettings.dayWiseWindows
                    .filter((timing) => timing.day !== day)
                    .every((timing) => timing.timings.length === 0),
            ).to.be.true;
            expect(
                response.body.onDemandDeliverySettings.dayWiseWindows[day].timings[0],
            ).have.property('id', onDemandTiming.id);

            expect(response.body).have.property(
                'deliveryBufferTimeInHours',
                deliveryBufferTimeInHours,
            );
            expect(response.body).have.property('onDemandIntervalInMins', onDemandIntervalInMins);
            expect(response.body).have.property('turnAroundTime', turnAroundInHours);
        });
    });

    it('should throw Error', async () => {
        sinon
            .stub(GeneralDeliverySettingsService.prototype, 'centsDeliverySettings')
            .throws('Error');
        const store = await factory.create(FN.store);
        const centsCustomer = await factory.create(FN.centsCustomer);
        const jwtOrderService = new JwtService(JSON.stringify(centsCustomer));
        const customerauthtoken = jwtOrderService.tokenGenerator(
            process.env.JWT_SECRET_TOKEN_ORDER,
        );

        // request
        const response = await ChaiHttpRequestHelper.get(
            apiEndpoint.replace(':storeId', store.id),
            {},
        ).set({
            customerauthtoken,
        });

        // assert
        response.should.have.status(500);
        expect(response.body).have.property('error', 'Something went wrong!');
    });
});
