const StoreSettings = require('../models/storeSettings');
const Store = require('../models/store');
const OwnDeliverySettings = require('../models/ownDeliverySettings');
const CentsDeliverySettings = require('../models/centsDeliverySettings');

class StoreQuery {
    constructor(storeId) {
        this.storeId = storeId;
    }

    async settings() {
        const settings = await StoreSettings.query().findOne({ storeId: this.storeId });
        return settings;
    }

    async ownDeliverySettings() {
        const ownDeliverySettings = await OwnDeliverySettings.query().findOne({
            storeId: this.storeId,
            active: true,
        });
        return ownDeliverySettings;
    }

    async onDemandSettings() {
        const onDemandSettings = await CentsDeliverySettings.query().findOne({
            storeId: this.storeId,
            active: true,
        });
        return onDemandSettings;
    }

    async taxRate() {
        const storeWIthTaxRate = await Store.query()
            .withGraphJoined('taxRate')
            .findById(this.storeId);
        return storeWIthTaxRate.taxRate;
    }

    async details() {
        const storeDetails = await Store.query().findById(this.storeId);
        return storeDetails;
    }
}
module.exports = exports = StoreQuery;
