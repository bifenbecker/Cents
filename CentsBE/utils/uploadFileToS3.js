const fs = require('fs');

const uploadFile = (file, s3, bucketName) => {
    const fileStream = fs.createReadStream(file.path);

    return s3
        .upload({
            Bucket: bucketName,
            Body: fileStream,
            Key: file.filename,
        })
        .promise();
};

module.exports = exports = uploadFile;
