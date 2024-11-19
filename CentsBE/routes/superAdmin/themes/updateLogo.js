const fs = require('fs');
const S3 = require('aws-sdk/clients/s3');
const { promisify } = require('util');
const uploadFileToS3 = require('../../../utils/uploadFileToS3');

const unlinkAsync = promisify(fs.unlink);
const bucketName = process.env.LOGO_BUCKET_NAME;
const region = process.env.AWS_REGION;
const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

const s3 = new S3({
    region,
    accessKeyId,
    secretAccessKey,
});

async function updateLogo(req, res, next) {
    const { file } = req;
    try {
        const uploadedFile = await uploadFileToS3(file, s3, bucketName);
        await unlinkAsync(file.path);
        res.status(200).json(uploadedFile);
    } catch (error) {
        await unlinkAsync(file.path);
        next(error);
    }
}

module.exports = exports = updateLogo;
