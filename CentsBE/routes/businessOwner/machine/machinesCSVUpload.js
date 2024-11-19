const csv = require('csv-parser');
const fs = require('fs');
const { origins } = require('../../../constants/constants');
const LoggerHandler = require('../../../LoggerHandler/LoggerHandler');
const pairMachinesAndDevicesPipeline = require('../../../pipeline/machines/pairMachinesAndDevices');

async function machinesCSVUpload(req, res, next) {
    try {
        const filePath = `${req.file.path}`;
        const uploadedData = [];
        fs.createReadStream(filePath)
            .pipe(csv())
            .on('data', (data) => uploadedData.push(data))
            .on('end', () => {
                req.body.machinesData = uploadedData;
                next();
            });
    } catch (err) {
        LoggerHandler('error', err, req);
        next(err);
    }
}

async function pairMachinesAndDevices(req, res, next) {
    try {
        const payload = {
            machinesData: req.body.machinesData,
            storeId: req.body.storeId,
            userId: req.currentUser.id,
            origin: origins.BUSINESS_MANAGER,
        };
        const result = await pairMachinesAndDevicesPipeline(payload);
        if (result.errors && result.errors.length) {
            res.status(400).send({
                success: false,
                error: 'CSV validation failed',
                errors: result.errors,
            });
        } else {
            res.send({
                success: true,
                ...result,
            });
        }
    } catch (err) {
        next(err);
    }
}

module.exports = {
    machinesCSVUpload,
    pairMachinesAndDevices,
};
