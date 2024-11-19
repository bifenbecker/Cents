const csv = require('csv-parser');
const fs = require('fs');
const { transaction } = require('objection');

const Device = require('../../../models/device');

const validator = require('../../../validations/deviceCreation');
const batchCreator = require('../../../utils/batchCreate');
const formatError = require('../../../utils/formatError');
const fileValidation = require('../../../validations/deviceUpload');

const { deviceStatuses } = require('../../../constants/constants');

function deleteFile(filePath) {
    fs.unlink(filePath, (err) => {
        if (err) throw err;
    });
}
async function createDevice(req, res, next) {
    let trx = null;
    try {
        if (req.file) {
            const uploadedData = [];
            const filePath = `./${req.file.path}`;
            const errorCheck = validator(req.body);
            if (!errorCheck.error) {
                fs.createReadStream(filePath)
                    .pipe(csv())
                    .on('data', (data) => uploadedData.push(data))
                    .on('end', async () => {
                        try {
                            if (uploadedData.length) {
                                const isFileValid = await fileValidation(uploadedData);
                                if (isFileValid.error) {
                                    deleteFile(filePath);
                                    res.status(isFileValid.code).json({
                                        error: isFileValid.message,
                                    });
                                } else {
                                    trx = await transaction.start(Device.knex());
                                    const batch = await batchCreator(req.body.businessId, trx);
                                    const { deviceNames } = isFileValid;
                                    const devices = deviceNames.map((device) => ({
                                        isActive: false,
                                        name: device,
                                        status: deviceStatuses.OFFLINE,
                                        batchId: batch.id,
                                    }));
                                    await Device.query(trx).insert(devices);
                                    await trx.commit();
                                    deleteFile(filePath);
                                    res.status(200).json({
                                        success: true,
                                    });
                                }
                            } else {
                                deleteFile(filePath);
                                res.status(400).json({
                                    error: 'CSV file is empty.',
                                });
                            }
                        } catch (error) {
                            throw new Error(error);
                        }
                    });
            } else {
                deleteFile(filePath);
                res.status(422).json({
                    error: formatError(errorCheck.error),
                });
            }
        } else {
            res.status(422).json({
                error: 'CSV file is missing.',
            });
        }
    } catch (error) {
        if (trx) {
            await trx.rollback();
        }
        if (req.file) {
            deleteFile(`./${req.file.path}`);
            next(error);
        } else {
            next(error);
        }
    }
}

module.exports = exports = createDevice;
