async function getDeliveryWindows(payload) {
    const { ownDriverDeliverySettings, deliverySettingsService, zipCode } = payload;

    if (ownDriverDeliverySettings.id) {
        const { active } = await deliverySettingsService.getOwnDeliveryWindowsWithEpochDate({
            ownDriverDeliverySettings,
            zipCode,
        });
        ownDriverDeliverySettings.active = active;
    }
    return {
        ...payload,
        ownDriverDeliverySettings,
        deliverySettingsService,
    };
}

module.exports = getDeliveryWindows;
