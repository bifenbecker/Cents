require('../../../../testHelper');
const { cloneDeep } = require('lodash');
const { expect, assert } = require('../../../../support/chaiHelper');
const factory = require('../../../../factories');
const findOwnDeliveryWindows = require('../../../../../uow/delivery/pickup/findOwnDeliveryWindows');
const { shiftType } = require('../../../../../constants/constants');
const { FACTORIES_NAMES: FN } = require('../../../../constants/factoriesNames');

describe('test findOwnDeliveryWindows UoW', () => {
    describe('should return correct payload', () => {
        describe('without changes', () => {
            it('when ownDeliveryStore.id does not exist', async () => {
                const payload = {
                    ownDeliveryStore: {},
                };
                const initialPayload = cloneDeep(payload);

                // call UoW
                const newPayload = await findOwnDeliveryWindows(payload);

                // assert
                assert.deepEqual(newPayload, initialPayload, 'should not change payload');
            });
        });

        describe('with changes', () => {
            const day = 1;
            const deliveryWindowBufferInHours = 0.5;
            const zipCode = '10001';

            describe('when have not onDemandDeliverySettings', () => {
                it('with delivery windows', async () => {
                    const store = await factory.create(FN.store);
                    await factory.create(FN.ownDeliverySetting, {
                        storeId: store.id,
                        active: true,
                        zipCodes: [zipCode],
                        hasZones: false,
                        deliveryFeeInCents: 0,
                        returnDeliveryFeeInCents: null,
                        deliveryWindowBufferInHours,
                    });
                    const ownDriverShift = await factory.create(FN.shift, {
                        storeId: store.id,
                        type: shiftType.OWN_DELIVERY,
                    });
                    const ownDriverTiming = await factory.create(FN.timing, {
                        shiftId: ownDriverShift.id,
                        day,
                    });
                    await factory.create(FN.deliveryTimingSetting, {
                        timingsId: ownDriverTiming.id,
                        maxStops: 5,
                    });
                    const timeZone = 'America/Los_Angeles';

                    const payload = {
                        ownDeliveryStore: store,
                        zipCode,
                        timeZone,
                    };
                    const initialPayload = cloneDeep(payload);

                    // call UoW
                    const newPayload = await findOwnDeliveryWindows(payload);

                    // assert
                    assert.deepInclude(
                        newPayload,
                        {
                            ...initialPayload,
                            ownDeliveryStore: {
                                ...initialPayload.ownDeliveryStore,
                                ownDeliverySettings: { deliveryWindowBufferInHours },
                            },
                        },
                        'should add ownDeliverySettings to initial payload',
                    );
                    expect(payload)
                        .have.property('ownDeliveryWindows')
                        .to.be.an('array')
                        .lengthOf(1);
                    expect(payload.ownDeliveryWindows[0]).have.property('day', day);
                    expect(payload.ownDeliveryWindows[0])
                        .have.property('timings')
                        .to.be.an('array')
                        .lengthOf(1);
                    expect(payload.ownDeliveryWindows[0].timings[0]).have.property(
                        'id',
                        ownDriverTiming.id,
                    );
                });

                it('when ownDriverDeliverySettings is not active', async () => {
                    const day = 1;
                    const store = await factory.create(FN.store);
                    await factory.create(FN.ownDeliverySetting, {
                        storeId: store.id,
                        active: false,
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
                    await factory.create(FN.timing, {
                        shiftId: ownDriverShift.id,
                        day,
                    });

                    const payload = {
                        ownDeliveryStore: store,
                    };

                    // call UoW
                    const newPayload = await findOwnDeliveryWindows(payload);

                    // assert
                    expect(newPayload)
                        .have.property('ownDeliveryStore')
                        .have.property('id', store.id);
                    expect(newPayload.ownDeliveryStore)
                        .have.property('ownDeliverySettings')
                        .have.property('deliveryWindowBufferInHours', deliveryWindowBufferInHours);
                    expect(newPayload)
                        .have.property('ownDeliveryWindows')
                        .to.be.an('array')
                        .lengthOf(0);
                });

                it('when offersCentsDelivery', async () => {
                    const day = 1;
                    const store = await factory.create(FN.store);
                    await factory.create(FN.ownDeliverySetting, {
                        storeId: store.id,
                        active: true,
                        zipCodes: [zipCode],
                        hasZones: false,
                        deliveryFeeInCents: 0,
                        returnDeliveryFeeInCents: null,
                        deliveryWindowBufferInHours: 0.5,
                    });
                    const ownDriverShift = await factory.create(FN.shift, {
                        storeId: store.id,
                        type: shiftType.OWN_DELIVERY,
                    });
                    await factory.create(FN.timing, {
                        shiftId: ownDriverShift.id,
                        day,
                    });

                    const payload = {
                        ownDeliveryStore: {
                            ...store,
                            offersCentsDelivery: true,
                        },
                    };

                    // call UoW
                    const newPayload = await findOwnDeliveryWindows(payload);

                    // assert
                    expect(newPayload)
                        .have.property('ownDeliveryStore')
                        .have.property('id', store.id);
                    expect(newPayload.ownDeliveryStore)
                        .have.property('ownDeliverySettings')
                        .have.property('deliveryWindowBufferInHours', deliveryWindowBufferInHours);
                    expect(newPayload.ownDeliveryStore)
                        .have.property('onDemandDeliverySettings')
                        .to.be.an('object').to.be.empty;
                    expect(newPayload)
                        .have.property('ownDeliveryWindows')
                        .to.be.an('array')
                        .lengthOf(0);
                });
            });

            describe('when have onDemandDeliverySettings', () => {
                it('onDemandDeliverySettings is active', async () => {
                    const day = 1;
                    const store = await factory.create(FN.store);
                    await factory.create(FN.ownDeliverySetting, {
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
                    await factory.create(FN.timing, {
                        shiftId: ownDriverShift.id,
                        day,
                    });
                    const centsDeliverySettings = await factory.create(FN.centsDeliverySettings, {
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

                    const payload = {
                        ownDeliveryStore: {
                            ...store,
                            offersCentsDelivery: true,
                        },
                    };

                    // call UoW
                    const newPayload = await findOwnDeliveryWindows(payload);

                    // assert
                    expect(newPayload)
                        .have.property('ownDeliveryStore')
                        .have.property('id', store.id);
                    expect(newPayload.ownDeliveryStore)
                        .have.property('ownDeliverySettings')
                        .have.property('deliveryWindowBufferInHours', deliveryWindowBufferInHours);
                    expect(newPayload.ownDeliveryStore)
                        .have.property('onDemandDeliverySettings')
                        .have.property('id', centsDeliverySettings.id);
                    expect(newPayload.ownDeliveryStore)
                        .have.property('onDemandDeliverySettings')
                        .have.property('dayWiseWindows')
                        .to.be.an('array')
                        .lengthOf(7);
                    expect(
                        payload.ownDeliveryStore.onDemandDeliverySettings.dayWiseWindows[day],
                    ).have.property('day', day);
                    expect(payload.ownDeliveryStore.onDemandDeliverySettings.dayWiseWindows[day])
                        .have.property('timings')
                        .to.be.an('array')
                        .lengthOf(1);
                    expect(
                        payload.ownDeliveryStore.onDemandDeliverySettings.dayWiseWindows[day]
                            .timings[0],
                    ).have.property('id', onDemandTiming.id);
                    expect(newPayload)
                        .have.property('ownDeliveryWindows')
                        .to.be.an('array')
                        .lengthOf(0);
                });

                it('onDemandDeliverySettings is not active', async () => {
                    const day = 1;
                    const store = await factory.create(FN.store);
                    await factory.create(FN.ownDeliverySetting, {
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
                    await factory.create(FN.timing, {
                        shiftId: ownDriverShift.id,
                        day,
                    });
                    const centsDeliverySettings = await factory.create(FN.centsDeliverySettings, {
                        storeId: store.id,
                        active: false,
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

                    const payload = {
                        ownDeliveryStore: {
                            ...store,
                            offersCentsDelivery: true,
                        },
                    };

                    // call UoW
                    const newPayload = await findOwnDeliveryWindows(payload);

                    // assert
                    expect(newPayload)
                        .have.property('ownDeliveryStore')
                        .have.property('id', store.id);
                    expect(newPayload.ownDeliveryStore)
                        .have.property('ownDeliverySettings')
                        .have.property('deliveryWindowBufferInHours', deliveryWindowBufferInHours);
                    expect(newPayload.ownDeliveryStore)
                        .have.property('onDemandDeliverySettings')
                        .have.property('id', centsDeliverySettings.id);
                    expect(newPayload.ownDeliveryStore)
                        .have.property('onDemandDeliverySettings')
                        .have.property('dayWiseWindows')
                        .to.be.an('array')
                        .lengthOf(0);
                    expect(newPayload)
                        .have.property('ownDeliveryWindows')
                        .to.be.an('array')
                        .lengthOf(0);
                });
            });
        });
    });

    it('should throw Error', async () => {
        await expect(findOwnDeliveryWindows()).to.be.rejected;
    });
});
