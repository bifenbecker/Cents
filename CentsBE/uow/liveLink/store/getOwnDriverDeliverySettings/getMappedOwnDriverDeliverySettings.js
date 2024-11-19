async function getMappedOwnDriverDeliverySettings(payload) {
    const { ownDriverDeliverySettings } = payload;
    if (!ownDriverDeliverySettings.id) {
        return {};
    }

    delete ownDriverDeliverySettings.hasZones;
    delete ownDriverDeliverySettings.zipCodes;

    return ownDriverDeliverySettings;
}

module.exports = getMappedOwnDriverDeliverySettings;
