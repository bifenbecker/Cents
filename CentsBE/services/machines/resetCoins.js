const Base = require('../base');
const MachineConfiguration = require('../../mongooseModels/machineConfiguration');

class ResetCoins extends Base {
    constructor(payload) {
        super();
        this.machineId = payload.machineId;
    }

    async perform() {
        await MachineConfiguration.findOneAndUpdate(
            {
                LaundryMachineID: this.machineId,
            },
            { CoinTotal: 0 },
        );
        return true;
    }
}

module.exports = ResetCoins;
