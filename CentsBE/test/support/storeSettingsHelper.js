const Settings = require('../../models/businessSettings');

const getStoreSettings = async (query) => {
    const settings = await Settings.query().findOne(query);
    return settings;
}

module.exports = {
    getStoreSettings,
};
