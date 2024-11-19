const MachineQrCodeModel = require('../../../models/machineQrCode');

const unpairMachineFromQrCodeValidation = async (req, res, next) => {
    try {
        const { id, machineId } = req.body;

        if (!machineId || !id) {
            return res.status(400).json({ message: 'machineId and id are required' });
        }

        const qrCode = await MachineQrCodeModel.query().findOne('id', id);
        if (!qrCode) {
            return res.status(404).json({ message: 'Qr Code does not exist' });
        }
        if (!qrCode.machineId) {
            return res.status(409).json({ message: 'Qr Code is not paired with any machine' });
        }
        if (qrCode.machineId !== machineId) {
            return res.status(409).json({ message: 'Qr Code paired with another machine' });
        }
        return next();
    } catch (e) {
        return next(e);
    }
};

module.exports = unpairMachineFromQrCodeValidation;
