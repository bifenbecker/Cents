require('../../../testHelper');
const { expect, assert } = require('../../../support/chaiHelper');
const initShiftUpsert = require('../../../../uow/store/initShiftUpsert');
const createShifts = require('../../../../uow/store/createShifts');
const factory = require('../../../factories');
const ShiftTimeZone = require('../../../../models/shiftTimingZone');
const DeliveryTimingSettings = require('../../../../models/deliveryTimingSettings');

describe('test business-owner\'s createShifts uow', () => {
    let store, shift, timing, ownDeliverySetting, zoneIds, testZoneIds = [10, 9];
    let shiftResponse;
    describe('updating shifts with no extra attributes', () => {
        beforeEach(async () => {
            //create a store.
            store = await factory.create('store');

            //create own delivery settings for the latter store
            ownDeliverySetting = await factory.create('ownDeliverySetting', { storeId: store.id });

            //create shifts for the above store
            shift = await factory.create('shift', { name: 'Day Shift', storeId: store.id, type: 'OWN_DELIVERY' });

            //create timings for shift created.
            timing = await factory.create('timing', { shiftId: shift.id });

            shift = {
                ...shift,
                timings: [timing],
            };
        });

        it('should create a new shift successfully', async () => {
            // new shift payload
            const reqPayload = {
                storeId: store.id,
                shifts: [
                    {
                        name: 'Window 123124',
                        type: 'OWN_DELIVERY',
                        timings: [
                            {
                                day: '1',
                                startTime: '1970-01-01T00:02:00.000Z',
                                endTime: '1970-01-01T00:13:00.000Z',
                                isActive: true,
                                deliveryTimingSettings: {
                                    maxStops: 190,
                                    serviceType: 'ALL'
                                },
                            },
                        ],
                    },
                ],
            };

            const newShiftPayload = await initShiftUpsert(reqPayload);
            const result = await createShifts(newShiftPayload);

            expect(result).to.be.an('object');
            //test shifts
            expect(result).to.have.property('shifts').to.be.an('array');
            shiftResponse = result.shifts[0];
            expect(shiftResponse).to.have.a.property('name').to.equal('Window 123124');
            expect(shiftResponse).to.have.a.property('type').to.equal('OWN_DELIVERY');
            expect(shiftResponse).to.have.a.property('timings').to.be.an('array');
            //test timing
            expect(shiftResponse.timings[0]).to.have.a.property('isActive').to.equal(true);
            assert.deepEqual(new Date(shiftResponse.timings[0].startTime), new Date('1970-01-01T00:02:00.000Z'));
            assert.deepEqual(new Date(shiftResponse.timings[0].endTime), new Date('1970-01-01T00:13:00.000Z'));
        });

        it('should fail to create the shifts with invalid payload', async () => {
            expect(createShifts({ userId: '123a' })).rejectedWith(Error);
        });
    });

    describe('updating shifts with zones', () => {
        beforeEach(async () => {
            //create a store.
            store = await factory.create('store');

            //create own delivery settings for the latter store
            ownDeliverySetting = await factory.create('ownDeliverySetting', { hasZones: true, storeId: store.id });

            //create shifts for the above store
            shift = await factory.create('shift', { name: 'Day Shift', storeId: store.id, type: 'OWN_DELIVERY' });

            //create zones
            zones = await factory.createMany('zone', 2, {
                ownDeliverySettingsId: ownDeliverySetting.id
            });

            //store the zone ids for the payload
            zoneIds = zones.map((zone) => zone.id);

            //create timings for shift created.
            timing = await factory.create('timing', { shiftId: shift.id });

            //create shiftTimingZone record
            shiftTimingZone = await factory.create('shiftTimingZone', {
                timingId: timing.id,
                zoneIds: [...testZoneIds]
            });

            //add zoneIds to timing objects
            shift = {
                ...shift,
                timings: [{ ...timing, zoneIds }],
            };
        });

        it('should create a new shift successfully', async () => {
            // new shift payload
            const reqPayload = {
                storeId: store.id,
                shifts: [
                    {
                        name: 'Window 123124',
                        type: 'OWN_DELIVERY',
                        timings: [
                            {
                                day: '1',
                                startTime: '1970-01-01T00:05:00.000Z',
                                endTime: '1970-01-01T00:16:00.000Z',
                                isActive: true,
                                zoneIds: [...testZoneIds],
                            },
                        ],
                    },
                ],
            };

            const newShiftPayload = await initShiftUpsert(reqPayload);
            const result = await createShifts(newShiftPayload);

            const shiftTimingZone = await ShiftTimeZone.query().findOne({
                timingId: result.shifts[0].timings[0].id
            });
            expect(shiftTimingZone.zoneIds).to.include.members(testZoneIds);
            //test shifts
            shiftResponse = result.shifts[0];
            expect(shiftResponse).to.have.a.property('name').to.equal('Window 123124');
            expect(shiftResponse).to.have.a.property('type').to.equal('OWN_DELIVERY');
            expect(shiftResponse).to.have.a.property('timings').to.be.an('array');
            //test timing
            expect(shiftResponse.timings[0]).to.have.a.property('isActive').to.equal(true);
            assert.deepEqual(new Date(shiftResponse.timings[0].startTime), new Date('1970-01-01T00:05:00.000Z'));
            assert.deepEqual(new Date(shiftResponse.timings[0].endTime), new Date('1970-01-01T00:16:00.000Z'));
        });

        it('should create a new shift with no zones successfully', async () => {
            // new shift payload
            const reqPayload = {
                storeId: store.id,
                shifts: [
                    {
                        name: 'Window 123124',
                        type: 'OWN_DELIVERY',
                        timings: [
                            {
                                day: '1',
                                startTime: '1970-01-01T00:05:00.000Z',
                                endTime: '1970-01-01T00:16:00.000Z',
                                isActive: true,
                                zoneIds: [],
                            },
                        ],
                    },
                ],
            };

            const newShiftPayload = await initShiftUpsert(reqPayload);
            const result = await createShifts(newShiftPayload);

            const shiftTimingZone = await ShiftTimeZone.query().findOne({
                timingId: result.shifts[0].timings[0].id
            });
            expect(shiftTimingZone).to.undefined;
        });

        it('should fail to update the shifts with invalid payload', async () => {
            expect(createShifts({ userId: '123a' })).rejectedWith(Error);
        });
    });

    describe('updating shifts with deliveryTimingSettings', () => {
        beforeEach(async () => {
            //create a store.
            store = await factory.create('store');

            //create own delivery settings for the latter store
            ownDeliverySetting = await factory.create('ownDeliverySetting', { hasZones: true, storeId: store.id });

            //create shifts for the above store
            shift = await factory.create('shift', { name: 'Day Shift', storeId: store.id, type: 'OWN_DELIVERY' });

            //create timings for shift created.
            timing = await factory.create('timing', { shiftId: shift.id });

            deliveryTimingSettings = await factory.create('deliveryTimingSettings', { timingsId: timing.id });

            //add deliveryTimingSettings to timing objects
            shift = {
                ...shift,
                timings: [{ ...timing, deliveryTimingSettings }],
            };
        });

        it('should create a new shift successfully', async () => {
            // new shift payload
            const reqPayload = {
                storeId: store.id,
                shifts: [
                    {
                        name: 'Window 123124',
                        type: 'OWN_DELIVERY',
                        timings: [
                            {
                                day: '1',
                                startTime: '1970-01-01T00:05:00.000Z',
                                endTime: '1970-01-01T00:16:00.000Z',
                                isActive: true,
                                deliveryTimingSettings: {
                                    maxStops: 190,
                                    serviceType: 'ALL'
                                },
                            },
                        ],
                    },
                ],
            };

            const newShiftPayload = await initShiftUpsert(reqPayload);
            const result = await createShifts(newShiftPayload);

            const timingsDeliveryTimingSettings = await DeliveryTimingSettings.query().findOne({
                timingsId: result.shifts[0].timings[0].id
            });
            expect(timingsDeliveryTimingSettings.maxStops).to.equal(190);
            //test shifts
            shiftResponse = result.shifts[0];
            expect(shiftResponse).to.have.a.property('name').to.equal('Window 123124');
            expect(shiftResponse).to.have.a.property('type').to.equal('OWN_DELIVERY');
            expect(shiftResponse).to.have.a.property('timings').to.be.an('array');
            //test timing
            expect(shiftResponse.timings[0]).to.have.a.property('isActive').to.equal(true);
            assert.deepEqual(new Date(shiftResponse.timings[0].startTime), new Date('1970-01-01T00:05:00.000Z'));
            assert.deepEqual(new Date(shiftResponse.timings[0].endTime), new Date('1970-01-01T00:16:00.000Z'));
        });

        it('should create a new shift with no deliveryTimingSettings successfully', async () => {
            // new shift payload
            const reqPayload = {
                storeId: store.id,
                shifts: [
                    {
                        name: 'Window 123124',
                        type: 'OWN_DELIVERY',
                        timings: [
                            {
                                day: '1',
                                startTime: '1970-01-01T00:05:00.000Z',
                                endTime: '1970-01-01T00:16:00.000Z',
                                isActive: true,
                                deliveryTimingSettings: null,
                            },
                        ],
                    },
                ],
            };

            const newShiftPayload = await initShiftUpsert(reqPayload);
            const result = await createShifts(newShiftPayload);

            const timingsDeliveryTimingSettings = await DeliveryTimingSettings.query().findOne({
                timingsId: result.shifts[0].timings[0].id
            });
            expect(timingsDeliveryTimingSettings).to.undefined;
        });

        it('should fail to update the shifts with invalid payload', async () => {
            expect(createShifts({ userId: '123a' })).rejectedWith(Error);
        });
    });
});
