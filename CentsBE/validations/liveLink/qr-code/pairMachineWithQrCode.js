// Models
const MachineQrCodeModel = require('../../../models/machineQrCode');
const MachineModel = require('../../../models/machine');

const validateQrCodeHash = async (res, qrCodeHash) => {
    const qrCode = await MachineQrCodeModel.query().findOne('hash', qrCodeHash);
    if (!qrCode) {
        return res.status(404).json({ message: 'Qr Code does not exist' });
    }
    if (qrCode.machineId) {
        return res.status(409).json({ message: 'Qr Code is already paired' });
    }

    return null;
};

const validateMachine = async (res, machineId) => {
    const pairedQrCode = await MachineQrCodeModel.query().findOne('machineId', machineId);
    if (pairedQrCode) {
        return res
            .status(409)
            .json({ message: 'Another Qr Code is already paired with this machine' });
    }

    const machine = await MachineModel.query().findOne('id', machineId);
    if (!machine) {
        return res.status(404).json({ message: 'Machine does not exist' });
    }

    return null;
};

const pairMachineWithQrCodeValidation = async (req, res, next) => {
    try {
        const { machineId, qrCodeHash } = req.body;
        if (!machineId || !qrCodeHash) {
            return res.status(400).json({ message: 'machineId and qrCodeHash are required' });
        }

        await validateQrCodeHash(res, qrCodeHash);
        await validateMachine(res, machineId);

        return next();
    } catch (e) {
        return next(e);
    }
};

module.exports = pairMachineWithQrCodeValidation;
