require('../../../../testHelper');
const { expect } = require('../../../../support/chaiHelper');
const { formatResponse } = require('../../../../../uow/delivery/pickup/formatResponse');

describe('test formatResponse UoW', () => {
    describe('should return correct response', () => {
        it('with ownDeliveryWindows and doorDashEstimate', async () => {
            const ownDeliveryStore = {
                id: 'storeId',
                name: 'storeName',
                state: 'state',
                ownDeliverySettings: {
                    active: true,
                },
                onDemandDeliverySettings: {
                    active: true,
                },
                deliveryFeeInCents: 100,
                turnAroundInHours: 24,
                recurringDiscountInPercent: 10,
                autoScheduleReturnEnabled: true,
                doorDashEnabled: true,
            };
            const ownDeliveryWindows = [
                [1, 2],
                [3, 4],
            ];

            const onDemandDeliveryStore = {
                id: 'onDemandStoreId',
                name: 'onDemandStoreName',
                state: 'onDemandState',
                subsidyInCents: 200,
                returnOnlySubsidyInCents: 140,
                turnAroundInHours: 48,
                recurringDiscountInPercent: 5,
                doorDashEnabled: true,
            };
            const onDemandDeliveryWindow = [
                [5, 6],
                [7, 8],
            ];

            const payload = {
                ownDeliveryStore,
                ownDeliveryWindows,
                onDemandDeliveryStore,
                onDemandDeliveryWindow,
                doorDashEstimate: true,
            };

            // act
            const result = formatResponse(payload);

            // assert
            expect(result).to.have.property('onDemandDeliveryStore');

            expect(result.onDemandDeliveryStore).to.have.property(
                'storeId',
                onDemandDeliveryStore.id,
            );
            expect(result.onDemandDeliveryStore).to.have.property(
                'state',
                onDemandDeliveryStore.state,
            );
            expect(result.onDemandDeliveryStore).to.have.property(
                'storeName',
                onDemandDeliveryStore.name,
            );
            expect(result.onDemandDeliveryStore).to.have.property(
                'dayWiseWindows',
                onDemandDeliveryWindow,
            );
            expect(result.onDemandDeliveryStore).to.have.property(
                'subsidyInCents',
                onDemandDeliveryStore.subsidyInCents,
            );
            expect(result.onDemandDeliveryStore).to.have.property(
                'returnOnlySubsidyInCents',
                onDemandDeliveryStore.returnOnlySubsidyInCents,
            );
            expect(result.onDemandDeliveryStore).to.have.property(
                'turnAroundInHours',
                onDemandDeliveryStore.turnAroundInHours,
            );
            expect(result.onDemandDeliveryStore).to.have.property(
                'recurringDiscountInPercent',
                onDemandDeliveryStore.recurringDiscountInPercent,
            );
            expect(result.onDemandDeliveryStore).to.have.property(
                'doorDashEnabled',
                onDemandDeliveryStore.doorDashEnabled,
            );

            expect(result).to.have.property('ownDeliveryStore');
            expect(result.ownDeliveryStore)
                .to.have.property('ownDeliverySettings')
                .to.have.property('active', ownDeliveryStore.ownDeliverySettings.active);
            expect(result.ownDeliveryStore)
                .to.have.property('onDemandDeliverySettings')
                .to.have.property('active', ownDeliveryStore.onDemandDeliverySettings.active);
            expect(result.ownDeliveryStore.onDemandDeliverySettings).to.have.property(
                'doorDashEnabled',
                ownDeliveryStore.doorDashEnabled,
            );
            expect(result.ownDeliveryStore).to.have.property('storeId', ownDeliveryStore.id);
            expect(result.ownDeliveryStore).to.have.property('state', ownDeliveryStore.state);
            expect(result.ownDeliveryStore).to.have.property('storeName', ownDeliveryStore.name);
            expect(result.ownDeliveryStore).to.have.property(
                'deliveryFeeInCents',
                ownDeliveryStore.deliveryFeeInCents,
            );
            expect(result.ownDeliveryStore).to.have.property(
                'turnAroundInHours',
                ownDeliveryStore.turnAroundInHours,
            );
            expect(result.ownDeliveryStore).to.have.property(
                'recurringDiscountInPercent',
                ownDeliveryStore.recurringDiscountInPercent,
            );
            expect(result.ownDeliveryStore).to.have.property(
                'autoScheduleReturnEnabled',
                ownDeliveryStore.autoScheduleReturnEnabled,
            );
        });

        it('without ownDeliveryWindows and without doorDashEstimate', async () => {
            const ownDeliveryStore = {
                ownDeliverySettings: {
                    active: true,
                },
                onDemandDeliverySettings: {
                    active: true,
                },
                doorDashEnabled: true,
            };

            const onDemandDeliveryStore = {
                id: 'onDemandStoreId',
                name: 'onDemandStoreName',
                state: 'onDemandState',
                subsidyInCents: 200,
                returnOnlySubsidyInCents: 140,
                turnAroundInHours: 48,
                recurringDiscountInPercent: 5,
                doorDashEnabled: true,
            };
            const onDemandDeliveryWindow = [
                [5, 6],
                [7, 8],
            ];

            const payload = {
                ownDeliveryStore,
                onDemandDeliveryStore,
                onDemandDeliveryWindow,
                doorDashEstimate: false,
            };

            // act
            const result = formatResponse(payload);

            // assert
            expect(result).to.have.property('onDemandDeliveryStore').to.be.an('object').to.be.empty;

            expect(result).to.have.property('ownDeliveryStore');
            expect(result.ownDeliveryStore)
                .to.have.property('ownDeliverySettings')
                .to.have.property('active', ownDeliveryStore.ownDeliverySettings.active);
            expect(result.ownDeliveryStore)
                .to.have.property('onDemandDeliverySettings')
                .to.have.property('active', ownDeliveryStore.onDemandDeliverySettings.active);
            expect(result.ownDeliveryStore.onDemandDeliverySettings).to.have.property(
                'doorDashEnabled',
                ownDeliveryStore.doorDashEnabled,
            );
            expect(result.ownDeliveryStore).to.not.have.property('storeId');
            expect(result.ownDeliveryStore).to.not.have.property('state');
            expect(result.ownDeliveryStore).to.not.have.property('storeName');
            expect(result.ownDeliveryStore).to.not.have.property('deliveryFeeInCents');
            expect(result.ownDeliveryStore).to.not.have.property('turnAroundInHours');
            expect(result.ownDeliveryStore).to.not.have.property('recurringDiscountInPercent');
            expect(result.ownDeliveryStore).to.not.have.property('autoScheduleReturnEnabled');
        });
    });

    it('should throw Error', async () => {
        let error;
        try {
            await formatResponse.execute();
        } catch (err) {
            error = err;
        }
        expect(error).to.be.an('Error');
    });
});
