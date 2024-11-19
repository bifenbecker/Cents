const moment = require('moment');
const Base = require('../base');
const Turn = require('../../models/turns');
const MachineTurnStats = require('../../models/machineTurnsStats');

class ResetAllTurnsServices extends Base {
    constructor(payload) {
        super();
        this.machineId = payload.machineId;
    }

    async perform() {
        await Turn.query(this.transaction)
            .update({ deletedAt: moment() })
            .where({ machineId: this.machineId });
        await MachineTurnStats.query(this.transaction)
            .update({ avgTurnsPerDay: 0, avgSelfServeRevenuePerDay: 0 })
            .where({ machineId: this.machineId });
        return true;
    }
}

module.exports = ResetAllTurnsServices;
