const { transaction } = require('objection');
// Models
const MachineQrCodeModel = require('../../../models/machineQrCode');

const createQrCode = async (req, res, next) => {
    let trx;
    try {
        const { qrCodeHash } = req.body;

        trx = await transaction.start(MachineQrCodeModel.knex());
        const qrCode = await MachineQrCodeModel.query(trx)
            .insert({ hash: qrCodeHash })
            .returning('*');
        await trx.commit();

        return res.send(qrCode);
    } catch (e) {
        if (trx) {
            await trx.rollback();
        }
        return next(e);
    }
};

const pairMachineWithQrCode = async (req, res, next) => {
    let trx;
    try {
        const { machineId, qrCodeHash } = req.body;

        trx = await transaction.start(MachineQrCodeModel.knex());
        const [pairedQrCode] = await MachineQrCodeModel.query()
            .where('hash', qrCodeHash)
            .andWhere('deletedAt', null)
            .update({ machineId })
            .returning('*');

        await trx.commit();

        return res.send(pairedQrCode);
    } catch (e) {
        if (trx) {
            await trx.rollback();
        }
        return next(e);
    }
};

const unpairMachineFromQrCode = async (req, res, next) => {
    let trx;
    try {
        const { id } = req.body;

        trx = await transaction.start(MachineQrCodeModel.knex());
        const [unpairedQrCode] = await MachineQrCodeModel.query()
            .where('id', id)
            .andWhere('deletedAt', null)
            .update({ machineId: null })
            .returning('*');

        await trx.commit();

        return res.send(unpairedQrCode);
    } catch (e) {
        if (trx) {
            await trx.rollback();
        }
        return next(e);
    }
};

const removeQrCode = async (req, res, next) => {
    try {
        const { id } = req.params;

        const qrCode = await MachineQrCodeModel.query().findOne('id', id);
        if (!qrCode || qrCode.deletedAt) {
            return res.status(404).send({ message: 'Qr Code does not exist' });
        }

        await MachineQrCodeModel.query()
            .where('id', id)
            .update({ deletedAt: new Date().toISOString() });
        return res.send(200);
    } catch (err) {
        return next(err);
    }
};

module.exports = {
    createQrCode,
    pairMachineWithQrCode,
    unpairMachineFromQrCode,
    removeQrCode,
};
