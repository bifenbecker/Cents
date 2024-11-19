require('../../../../testHelper');
const { cloneDeep } = require('lodash');
const { expect, assert } = require('../../../../support/chaiHelper');
const factory = require('../../../../factories');
const findOnDemandDeliveryWindow = require('../../../../../uow/delivery/pickup/findOnDemandDeliveryWindow');
const { shiftType } = require('../../../../../constants/constants');
const { FACTORIES_NAMES: FN } = require('../../../../constants/factoriesNames');

describe('test findOnDemandDeliveryWindow UoW', () => {
    describe('should return correct payload', () => {
        const googlePlacesId = 'googlePlacesId';

        describe('without changes', () => {
            it('when onDemandDeliveryStore.id does not exist', async () => {
                const payload = {
                    onDemandDeliveryStore: {},
                };
                const initialPayload = cloneDeep(payload);

                // call UoW
                const newPayload = await findOnDemandDeliveryWindow(payload);

                // assert
                assert.deepEqual(newPayload, initialPayload, 'should not change payload');
            });
        });

        describe('with changes', () => {
            it('with delivery windows', async () => {
                const day = 1;
                const store = await factory.create(FN.store);
                await factory.create(FN.centsDeliverySettings, {
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
                await factory.create(FN.timing, {
                    shiftId: onDemandShift.id,
                    day,
                });
                const timeZone = 'America/Los_Angeles';

                const payload = {
                    googlePlacesId,
                    onDemandDeliveryStore: store,
                    timeZone,
                };
                const initialPayload = cloneDeep(payload);

                // call UoW
                const newPayload = await findOnDemandDeliveryWindow(payload);

                // assert
                assert.deepInclude(newPayload, initialPayload, 'should include initial payload');
                expect(newPayload)
                    .have.property('onDemandDeliveryWindow')
                    .to.be.an('array')
                    .lengthOf(7);
                expect(newPayload.onDemandDeliveryWindow[day].timings).to.be.an('array').not.empty;
                expect(newPayload).have.property('storeId', store.id);
                expect(newPayload).have.property('dropoffId', googlePlacesId);
                expect(newPayload).have.property('deliveryTimes');
                expect(newPayload).have.property('requireUberAuthToken', true);
            });
        });
    });

    it('should throw Error', async () => {
        await expect(findOnDemandDeliveryWindow()).to.be.rejected;
    });
});
