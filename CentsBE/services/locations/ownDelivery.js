const Base = require('../base');

const OwnDeliverySettings = require('../../models/ownDeliverySettings');
const Shift = require('../../models/shifts');
const Zone = require('../../models/zone');
const ShiftTimingZone = require('../../models/shiftTimingZone');
const Timings = require('../../models/timings');
const DeliveryTimingSettings = require('../../models/deliveryTimingSettings');

const permittedParams = require('../../utils/permittedParams');

/**
 *  creates cents's own delivery settings
 *  if we have Zones then will add zones and then zipCodes for the zones
 *  add new shift and timing records and shiftTimingRecords
 */
class OwnDelivery extends Base {
    constructor(storeId, payload) {
        super();
        this.storeId = storeId;
        this.payload = payload;
    }

    async perform() {
        await this.validateOwnDriverSettingsAvailability();
        await this.addDeliverySettings();
        await this.addZones();
        await this.addShift();
    }

    async validateOwnDriverSettingsAvailability() {
        const existingOwnDeliverySettings = await OwnDeliverySettings.query()
            .select('id')
            .findOne({ storeId: this.storeId });

        if (existingOwnDeliverySettings && existingOwnDeliverySettings.id) {
            throw new Error('Own delivery settings already exists');
        }
    }

    async addShift() {
        await Promise.all(
            this.payload.shifts.map(async (shift) => {
                const newShift = await Shift.query(this.transaction)
                    .insert({
                        name: shift.name,
                        storeId: this.storeId,
                        type: this.payload.shiftType,
                        deletedAt: null,
                    })
                    .returning('*');
                await this.createNewTimingRecords(
                    shift.timings,
                    this.payload.hasZones,
                    newShift.id,
                    this.transaction,
                );
            }),
        );
    }

    async createOrUpdateShiftTimingZone(timingId, zoneIds) {
        const shiftTiming = await ShiftTimingZone.query(this.transaction).findOne({
            timingId,
        });
        if (shiftTiming) {
            await shiftTiming.$query(this.transaction).patch({
                zoneIds,
            });
        } else if (zoneIds && zoneIds.length) {
            await ShiftTimingZone.query(this.transaction).insert({
                timingId,
                zoneIds,
            });
        }
    }

    async createNewTimingRecords(timings, hasZones, shiftId) {
        const records = await Promise.all(
            timings.map(async (timing) => {
                const timingRecord = await Timings.query(this.transaction).insert({
                    shiftId,
                    day: timing.day,
                    startTime: timing.startTime,
                    endTime: timing.endTime,
                    isActive: timing.isActive,
                });
                if (timing.deliveryTimingSettings) {
                    await DeliveryTimingSettings.query(this.transaction).insert({
                        timingsId: timingRecord.id,
                        maxStops: timing.deliveryTimingSettings.maxStops,
                        serviceType: timing.deliveryTimingSettings.serviceType,
                    });
                }
                if (hasZones && timing.zones && timing.zones.length) {
                    await this.createOrUpdateShiftTimingZone(
                        timingRecord.id,
                        this.payload.createdZones
                            .filter(({ name }) => timing.zones.includes(name))
                            .map(({ id }) => id),
                    );
                }
            }),
        );
        return records;
    }

    async addZones() {
        if (this.payload.hasZones) {
            this.payload.createdZones = await Promise.all(
                this.payload.zones.map(async (item) => {
                    const zone = await Zone.query(this.transaction)
                        .insert({
                            name: item.name,
                            zipCodes: item.zipCodes,
                            ownDeliverySettingsId: this.payload.ownDeliverySettingId,
                            deliveryTierId: this.payload.deliveryTierId || null,
                        })
                        .returning('*');
                    return permittedParams(zone, ['id', 'name']);
                }),
            );
        }
    }

    async addDeliverySettings() {
        const permittedKeys = [
            'zipCodes',
            'deliveryFeeInCents',
            'returnDeliveryFeeInCents',
            'active',
            'hasZones',
        ];
        const deliverySettingsPayload = permittedParams(this.payload, permittedKeys);
        deliverySettingsPayload.storeId = this.storeId;
        const ownDeliverySettings = await OwnDeliverySettings.query(this.transaction)
            .insert(deliverySettingsPayload)
            .returning('*');
        this.payload.ownDeliverySettingId = ownDeliverySettings.id;
    }
}

module.exports = exports = OwnDelivery;
