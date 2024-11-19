const qrCode = require('qrcode');

const Machine = require('../../../models/machine');

async function generateQrLogic(machineId) {
    const code = await qrCode.toDataURL(machineId);
    return { machineId, code };
}
async function generateQr(req, res, next) {
    try {
        let codes = [];
        const { machineId, storeId } = req.query;
        if (machineId) {
            codes = await generateQrLogic(machineId);
        } else if (storeId) {
            const machines = await Machine.query().where({
                storeId,
            });
            const allMachinesQr = machines.map((machine) => generateQrLogic(`${machine.id}`));
            codes = await Promise.all(allMachinesQr);
        }
        res.status(200).json({
            success: true,
            codes,
        });
    } catch (error) {
        next(error);
    }
}

module.exports = exports = generateQr;
