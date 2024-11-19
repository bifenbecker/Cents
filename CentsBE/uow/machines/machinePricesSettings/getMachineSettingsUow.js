async function getMachineSettingsUow(payload) {
    // TODO: get coin values
    const coinValues = [];

    // TODO: get cycleSettings
    const cycleSettings = [];

    // TODO: get additional settings
    const additionalSettings = [];

    return {
        ...payload,
        coinValues,
        cycleSettings,
        additionalSettings,
    };
}

module.exports = getMachineSettingsUow;
