const PreferenceOptions = require('../../../../models/preferenceOptions');

async function removeOption(req, res, next) {
    let trx = null;
    try {
        const id = parseInt(req.params.id, 10);
        trx = await PreferenceOptions.startTransaction();
        const queryResponse = await PreferenceOptions.query(trx)
            .findById(id)
            .patch({
                deletedAt: new Date().toISOString(),
                isDeleted: true,
            })
            .returning('*');

        await trx.commit();

        if (!queryResponse) {
            res.status(422).json({ error: `No existing preference option with id ${id}` });
        } else {
            res.status(200).json({
                success: true,
                queryResponse,
            });
        }
    } catch (error) {
        if (trx) {
            await trx.rollback();
        }
        next(error);
    }
}

module.exports = exports = removeOption;
