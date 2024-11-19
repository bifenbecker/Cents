const router = require('express').Router();

const getAllThemesByBusinessId = require('./getAllThemesByBusinessId');
const updateBusinessTheme = require('./updateBusinessTheme');
const updateStoreTheme = require('./updateStoreTheme');
const updateLogo = require('./updateLogo');
const updateThemesBunch = require('./updateThemesBunch');

const themeValidator = require('../../../validations/superAdmin/businesses/validateTheme');
const upload = require('../../../middlewares/imgUpload');

router.get('/:businessId', getAllThemesByBusinessId);
router.patch('/business/:themeId', themeValidator, updateBusinessTheme);
router.patch('/store/:themeId', themeValidator, updateStoreTheme);
router.patch('/bunch', updateThemesBunch);
router.post('/logo', upload.single('logo'), updateLogo);

module.exports = exports = router;
