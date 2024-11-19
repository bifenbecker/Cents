const router = require('express').Router();

// Controllers
const { getTeamMembersForStore } = require('./teamMembersController');

router.get('/all', getTeamMembersForStore);

module.exports = exports = router;
