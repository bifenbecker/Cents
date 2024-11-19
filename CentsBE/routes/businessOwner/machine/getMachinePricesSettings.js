const getMachinePricesSettingsPipeline = require('../../../pipeline/machines/getMachinePricesSettingsPipeline');

const getMachinePricesSettings = async (req, res, next) => {
    try {
        const { machineId } = req.params;
        const payload = {
            machineId: Number(machineId),
        };

        const errorHandler = async (error) => {
            res.status(error.statusCode).json({
                success: false,
                error: error.message,
            });
        };
        const { basePricing, modifierPricing, coinValues, cycleSettings, additionalSettings } =
            await getMachinePricesSettingsPipeline(payload, errorHandler);

        return res.json({
            basePricing,
            modifierPricing,
            coinValues,
            cycleSettings,
            additionalSettings,
        });
    } catch (error) {
        return next(error);
    }
};

module.exports = getMachinePricesSettings;
