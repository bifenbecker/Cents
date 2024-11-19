const router = require('express').Router();

// Controllers
const { getAllRoles } = require('./rolesController');

router.get('/all', getAllRoles);

module.exports = exports = router;
