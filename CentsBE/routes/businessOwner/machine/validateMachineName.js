const validateMachineNamePipeline = require('../../../pipeline/machines/validateMachineNamePipeline');

async function validateMachineName(req, res, next) {
    try {
        const payload = req.body;
        await validateMachineNamePipeline(payload);
        res.status(200).json({
            success: true,
        });
    } catch (error) {
        next(error);
    }
}
module.exports = exports = validateMachineName;
