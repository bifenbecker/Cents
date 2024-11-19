const { getMachineDetails, getConnectionLogs } = require('../../../services/machines/queries');
const { getStoreSettings } = require('../../../services/machines/queries');
const { dateFormat } = require('../../../helpers/dateFormatHelper');
const LoggerHandler = require('../../../LoggerHandler/LoggerHandler');

async function getStatusReport(req, res) {
    try {
        const machineDetails = await getMachineDetails(req.params.id);
        const statusLogs = await getConnectionLogs(machineDetails.deviceName);
        const storeSettings = await getStoreSettings(machineDetails.storeId);
        const timeZone = storeSettings.timeZone || 'America/Los_Angeles';
        const connectionResp = [
            [
                'PennyID',
                'status',
                'disconnectReason',
                'Date (MM/DD/YYYY)',
                `Time (${timeZone})`,
                'machine Name',
                'Device Id',
                'Serial Number',
            ],
        ];
        statusLogs.forEach((statusLog) => {
            const { PennyID, status, disconnectReason, time } = statusLog;
            const date = dateFormat(time, timeZone).split(',');
            connectionResp.push([PennyID, status, disconnectReason, date[0], date[1]]);
        });
        connectionResp[1].push(machineDetails.name);
        connectionResp[1].push(machineDetails.deviceName);
        connectionResp[1].push(machineDetails.serialNumber);
        res.send(connectionResp);
    } catch (err) {
        LoggerHandler('error', err, req);
        throw err;
    }
}

module.exports = getStatusReport;
