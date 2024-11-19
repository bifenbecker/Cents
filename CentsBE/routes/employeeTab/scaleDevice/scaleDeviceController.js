// Packages
const { transaction } = require('objection');

// Models
const ScaleDevice = require('../../../models/scaleDevice');
const ScaleDeviceStoreMap = require('../../../models/scaleDeviceStoreMap');

/**
 * Assign a specific ScaleDevice to a Store.
 *
 * @param {Object} req
 * @param {Object} res
 * @param {void} next
 * @returns JSON
 */
async function attachStoreToScaleDevice(req, res, next) {
    let trx = null;

    try {
        const { currentStore, body } = req;
        const { pinNumber } = body;

        const scaleDevice = await ScaleDevice.query()
            .where({
                pinNumber,
            })
            .first();

        trx = await transaction.start(ScaleDeviceStoreMap.knex());

        await ScaleDeviceStoreMap.query(trx)
            .insert({
                storeId: currentStore.id,
                scaleDeviceId: scaleDevice.id,
            })
            .returning('*');

        await trx.commit();

        return res.json({
            success: true,
            scaleDevice,
        });
    } catch (error) {
        if (trx) {
            await trx.rollback();
        }
        return next(error);
    }
}

module.exports = exports = { attachStoreToScaleDevice };
