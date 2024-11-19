const router = require('express').Router();
const upload = require('../../../middlewares/csvUpload');

const devicesCreation = require('./deviceUpload');

router.post('/', upload.single('deviceList'), devicesCreation);

module.exports = exports = router;
