const LoggerHandler = require('../../../LoggerHandler/LoggerHandler');
const ResetTurnServices = require('../../../services/machines/resetAllTurnsService');

async function resetAllTurns(req, res, next) {
    try {
        const resetTurnServices = new ResetTurnServices({ machineId: req.params.id });
        await resetTurnServices.execute();
        res.send({
            success: true,
        });
    } catch (err) {
        LoggerHandler('error', err, req);
        next(err);
    }
}

module.exports = resetAllTurns;
