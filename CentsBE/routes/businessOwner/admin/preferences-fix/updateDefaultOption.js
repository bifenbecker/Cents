const PreferenceOptions = require('../../../../models/preferenceOptions');

async function updateDefaultOption(req, res, next) {
    let trx = null;

    try {
        const optionPayload = req.body;
        trx = await PreferenceOptions.startTransaction();

        const firstUpdateResult = await PreferenceOptions.query(trx)
            .patch({ isDefault: false })
            .findById(optionPayload.previousDefaultOptionId);

        const secondUpdateResult = await PreferenceOptions.query(trx)
            .patch({ isDefault: true })
            .findById(optionPayload.newDefaultOptionId);

        if (firstUpdateResult !== 1 || secondUpdateResult !== 1) {
            const firstUpdateStatus = firstUpdateResult === 1 ? 'succeed' : 'failed';
            const secondUpdateStatus = secondUpdateResult === 1 ? 'succeed' : 'failed';
            const errorMessage = `Failed to change default option, updating old default ${firstUpdateStatus}, updating new default ${secondUpdateStatus}`;
            await trx.rollback(errorMessage);

            res.status(409).json({
                error: errorMessage,
            });
        } else {
            await trx.commit();
            res.status(200).json({
                success: true,
            });
        }
    } catch (e) {
        if (trx) {
            trx.rollback(e);
        }
        next(e);
    }
}

module.exports = exports = updateDefaultOption;
