const OnDemandDeliverySettings = require('../../models/centsDeliverySettings');
const getPermittedParamsObject = require('../../utils/permittedParams');
const Base = require('../base');
const Shift = require('../../models/shifts');

/**
 *  creates cents's on demand delivery settings
 */
class OnDemandDelivery extends Base {
    constructor(storeId, payload) {
        super();
        this.storeId = storeId;
        this.payload = payload;
    }

    async perform() {
        await this.addOnDemandDeliverySettings();
        await this.addShift();
    }

    async addShift() {
        const shifts = this.payload.shifts.map((shift) => ({
            name: shift.name,
            storeId: this.storeId,
            type: this.payload.shiftType,
            timings: shift.timings,
        }));
        await Shift.query(this.transaction).insertGraph(shifts);
    }

    async addOnDemandDeliverySettings() {
        const permittedParams = ['returnOnlySubsidyInCents', 'subsidyInCents'];
        const onDemandDeliverySettingsPayload = await getPermittedParamsObject(
            this.payload,
            permittedParams,
        );
        onDemandDeliverySettingsPayload.storeId = this.storeId;
        await OnDemandDeliverySettings.query(this.transaction).insert(
            onDemandDeliverySettingsPayload,
        );
    }
}
module.exports = exports = OnDemandDelivery;
