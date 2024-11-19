require('../../../testHelper');
const { expect, faker } = require('../../../support/chaiHelper');
const factory = require('../../../factories');

const OwnDeliverySettings = require('../../../../models/ownDeliverySettings');
const Timings = require('../../../../models/timings');
const Zone = require('../../../../models/zone');
const Shift = require('../../../../models/shifts');
const ShiftTimingZone = require('../../../../models/shiftTimingZone');

const CreateOwnDriverDeliverySettingsService = require('../../../../services/locations/ownDelivery');

describe('test CreateOwnDriverDeliverySettingsService', () => {
    let ownDriverDeliverySettings, store, newShiftwithZonesPayload, newShiftwithOutZonesPayload;

    describe('ownDeliverySettings exists', () => {
        it('should throw error', async () => {
            ownDriverDeliverySettings = await factory.create('ownDeliverySetting', {
                zipCodes: ['01001'],
            });
            const { storeId } = ownDriverDeliverySettings;
            const serviceObj = new CreateOwnDriverDeliverySettingsService(storeId, {});
            let error;

            try {
                await serviceObj.execute();
            } catch (err) {
                error = err;
            }

            expect(error).to.be.an('Error');
            expect(error.message).to.equal('Own delivery settings already exists');
        });
    });

    describe('with zones', () => {
        beforeEach(async () => {
            //create a store.
            store = await factory.create('store');
            newShiftwithZonesPayload = {
                hasZones: true,
                zones: [
                    {
                        name: 'santaMonica',
                        zipCodes: ['27565', '58282'],
                    },
                    {
                        name: 'newYork',
                        zipCodes: ['10001', '10002'],
                    },
                ],
                deliveryFeeInCents: 200,
                shifts: [
                    {
                        name: 'Window 123124',
                        type: 'OWN_DELIVERY',
                        isActive: true,
                        timings: [
                            {
                                day: '1',
                                startTime: '1970-01-01T00:00:00.000Z',
                                endTime: '1971-04-01T00:30:00.000Z',
                                isActive: true,
                                zones: ['santaMonica'],
                            },
                            {
                                day: '2',
                                startTime: '1970-01-01T00:00:00.000Z',
                                endTime: '1973-02-02T00:30:00.000Z',
                                isActive: true,
                                zones: ['santaMonica'],
                            },
                        ],
                    },
                ],
            };
        });

        it('should create ownDeliverySettings with zones successfully', async () => {
            const result = new CreateOwnDriverDeliverySettingsService(store.id, {
                ...newShiftwithZonesPayload,
            });
            await result.execute();
            const ownDeliverySetting = await OwnDeliverySettings.query().findOne({
                storeId: store.id,
            });
            const zone = await Zone.query().findOne({
                ownDeliverySettingsId: ownDeliverySetting.id,
                name: 'santaMonica',
            });
            const { zipCodes } = zone;
            expect(ownDeliverySetting.deliveryFeeInCents).to.equal(200);
            expect(zipCodes).to.be.an('array').that.includes('27565', '58282');
        });

        it('should create or update shiftTimingZone with zones successfully', async () => {
            const result = new CreateOwnDriverDeliverySettingsService(store.id, {
                ...newShiftwithZonesPayload,
            });
            await result.execute();
            const shift = await Shift.query().findOne({
                storeId: store.id,
            });
            const timings = await Timings.query().where('shiftId', shift.id);
            const newTimings = { ...timings[0] };
            const shiftTimingZone = await ShiftTimingZone.query()
                .where('timingId', newTimings.id)
                .count();
            expect(timings).to.be.an('array');
            expect(shiftTimingZone[0].count).to.equal('1');
        });

        it('should create shifts successfully', async () => {
            const result = new CreateOwnDriverDeliverySettingsService(store.id, {
                ...newShiftwithZonesPayload,
            });
            await result.execute();
            const shift = await Shift.query().findOne({
                storeId: store.id,
            });
            expect(shift).to.be.an('object');
            expect(shift).to.have.a.property('name').to.equal('Window 123124');
        });

        it('should create timings successfully', async () => {
            const result = new CreateOwnDriverDeliverySettingsService(store.id, {
                ...newShiftwithZonesPayload,
            });
            await result.execute();
            const shift = await Shift.query().findOne({
                storeId: store.id,
            });
            const timings = await Timings.query().where('shiftId', shift.id).count();
            expect(timings).to.be.an('array');
            expect(timings[0].count).to.equal('2');
        });

        it('should create timings with no zones if not selected successufully', async () => {
            const updatedPayloadWithNoZonesForTimings = {
                hasZones: true,
                zones: [
                    {
                        name: 'santaMonica',
                        zipCodes: ['27565', '58282'],
                    },
                    {
                        name: 'newYork',
                        zipCodes: ['10001', '10002'],
                    },
                ],
                deliveryFeeInCents: 200,
                shifts: [
                    {
                        name: 'Window 123124',
                        type: 'OWN_DELIVERY',
                        isActive: true,
                        timings: [
                            {
                                day: '1',
                                startTime: '1970-01-01T00:00:00.000Z',
                                endTime: '1971-04-01T00:30:00.000Z',
                                isActive: true,
                            },
                            {
                                day: '2',
                                startTime: '1970-01-01T00:00:00.000Z',
                                endTime: '1973-02-02T00:30:00.000Z',
                                isActive: true,
                            },
                        ],
                    },
                ],
            };
            const result = new CreateOwnDriverDeliverySettingsService(store.id, {
                ...updatedPayloadWithNoZonesForTimings,
            });
            await result.execute();
            const shift = await Shift.query().findOne({
                storeId: store.id,
            });
            const ownDeliverySetting = await OwnDeliverySettings.query().findOne({
                storeId: store.id,
            });
            const zones = await Zone.query().where('ownDeliverySettingsId', ownDeliverySetting.id);
            const timings = await Timings.query().where('shiftId', shift.id);
            const shiftTimingZones = await ShiftTimingZone.query().where(
                'timingId',
                'IN',
                timings.map(({ id }) => id),
            );
            expect(timings).to.be.an('array');
            expect(zones).to.be.an('array').and.lengthOf(2);
            expect(shiftTimingZones).to.be.an('array').and.lengthOf(0);
        });
    });

    describe('without zones', () => {
        beforeEach(async () => {
            //create a store.
            store = await factory.create('store');
            newShiftwithOutZonesPayload = {
                hasZones: false,
                zipCodes: ['27565', '58282'],
                deliveryFeeInCents: 20,
                returnDeliveryFeeInCents: 15,
                shifts: [
                    {
                        name: 'Window 123124',
                        type: 'OWN_DELIVERY',
                        isActive: true,
                        timings: [
                            {
                                day: '1',
                                startTime: '1970-01-01T00:00:00.000Z',
                                endTime: '1971-02-01T00:30:00.000Z',
                                isActive: true,
                            },
                            {
                                day: '2',
                                startTime: '1970-01-01T00:00:00.000Z',
                                endTime: '1971-03-02T00:30:00.000Z',
                                isActive: true,
                            },
                        ],
                    },
                ],
            };
        });

        it('should create ownDeliverySettings withOut zones successfully', async () => {
            const result = new CreateOwnDriverDeliverySettingsService(store.id, {
                ...newShiftwithOutZonesPayload,
            });
            await result.execute();
            const ownDeliverySetting = await OwnDeliverySettings.query().findOne({
                storeId: store.id,
            });
            expect(ownDeliverySetting.deliveryFeeInCents).to.equal(20);
        });

        it('should not create or update shiftTimingZone without Zones successfully', async () => {
            const result = new CreateOwnDriverDeliverySettingsService(store.id, {
                ...newShiftwithOutZonesPayload,
            });
            await result.execute();
            const shift = await Shift.query().findOne({
                storeId: store.id,
            });
            const timings = await Timings.query().where('shiftId', shift.id);
            const newTimings = { ...timings[0] };
            const shiftTimingZone = await ShiftTimingZone.query()
                .where('timingId', newTimings.id)
                .count();
            expect(shiftTimingZone[0].count).to.equal('0');
        });

        it('should create shifts successfully', async () => {
            const result = new CreateOwnDriverDeliverySettingsService(store.id, {
                ...newShiftwithOutZonesPayload,
            });
            await result.execute();
            const shift = await Shift.query().findOne({
                storeId: store.id,
            });
            expect(shift).to.be.an('object');
            expect(shift).to.have.a.property('name').to.equal('Window 123124');
        });

        it('should create timings successfully', async () => {
            const result = new CreateOwnDriverDeliverySettingsService(store.id, {
                ...newShiftwithOutZonesPayload,
            });
            await result.execute();
            const shift = await Shift.query().findOne({
                storeId: store.id,
            });
            const timings = await Timings.query().where('shiftId', shift.id).count();
            expect(timings).to.be.an('array');
            expect(timings[0].count).to.equal('2');
        });

        it('should add returnDeliveryFeeInCents successfully', async () => {
            const result = new CreateOwnDriverDeliverySettingsService(store.id, {
                ...newShiftwithOutZonesPayload,
            });
            await result.execute();
            const ownDeliverySetting = await OwnDeliverySettings.query().findOne({
                storeId: store.id,
            });

            expect(ownDeliverySetting.returnDeliveryFeeInCents).equals(
                newShiftwithOutZonesPayload.returnDeliveryFeeInCents,
            );
        });
    });
});
