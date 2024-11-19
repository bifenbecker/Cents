const { transaction } = require('objection');
const Store = require('../../../../models/store');
const { locationType } = require('../../../../constants/constants');

async function deleteHub(hubId, trx) {
    await Store.query(trx)
        .patch({
            hubId: null,
            type: locationType.STANDALONE,
        })
        .where('hubId', hubId);
}

// async function getStores(hubId) {
//     const stores = await Store.query().select('id').where('hubId', hubId);
//     return stores.map((store) => store.id);
// }

async function addHub(req, res, next) {
    let trx = null;
    try {
        const { store } = req.constants;
        const { isHub, locationsServed } = req.body;
        trx = await transaction.start(Store.knex());
        await deleteHub(store.id, trx);
        const updatedStore = await Store.query(trx)
            .patch({
                isHub,
                type: isHub ? locationType.HUB : locationType.STANDALONE,
            })
            .where('id', store.id)
            .returning('*');
        if (isHub && locationsServed.length) {
            await Store.query(trx)
                .patch({
                    hubId: store.id,
                    type: locationType.STORE,
                })
                .whereIn('id', locationsServed);
        }
        await trx.commit();
        res.status(200).json({
            success: true,
            store: {
                ...updatedStore,
                locationsServed: isHub ? locationsServed : [],
            },
        });
    } catch (error) {
        if (trx) {
            await trx.rollback();
        }
        next(error);
    }
}

module.exports = exports = addHub;
