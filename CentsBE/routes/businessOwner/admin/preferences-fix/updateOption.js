const PreferenceOptions = require('../../../../models/preferenceOptions');

async function updateOption(req, res, next) {
    let trx = null;
    const id = parseInt(req.params.id, 10);
    try {
        const optionPayload = req.body;
        trx = await PreferenceOptions.startTransaction();
        const queryResponse = await PreferenceOptions.query(trx).patchAndFetchById(
            id,
            optionPayload,
        );

        await trx.commit();

        if (!queryResponse) {
            res.status(422).json({
                error: `No preference option with id ${optionPayload.id} found`,
            });
        } else {
            res.status(201).json({
                success: true,
                option: queryResponse,
            });
        }
    } catch (e) {
        if (trx) {
            await trx.rollback();
        }
        next(e);
    }
}

module.exports = exports = updateOption;
