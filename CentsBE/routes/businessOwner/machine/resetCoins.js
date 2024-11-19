const ResetCoinsService = require('../../../services/machines/resetCoins');
const LoggerHandler = require('../../../LoggerHandler/LoggerHandler');

async function resetCoins(req, res, next) {
    try {
        const { id, machineId = +id } = req.params;
        const resetCoins = new ResetCoinsService({ machineId });
        await resetCoins.perform();
        res.send({
            success: true,
        });
    } catch (err) {
        LoggerHandler('error', err, req);
        next(err);
    }
}

module.exports = resetCoins;
