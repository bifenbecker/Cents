const PreferenceOptions = require('../../../../models/preferenceOptions');

async function createOption(req, res, next) {
    let trx = null;

    try {
        const optionPayload = req.body;
        trx = await PreferenceOptions.startTransaction();
        const queryResponse = await PreferenceOptions.query(trx).insertAndFetch(optionPayload);

        await trx.commit();
        res.status(201).json({
            success: true,
            option: queryResponse,
        });
    } catch (e) {
        if (trx) {
            trx.rollback(e);
        }
        next(e);
    }
}

module.exports = exports = createOption;
