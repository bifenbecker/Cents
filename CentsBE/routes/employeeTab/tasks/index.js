const router = require('express').Router();

const createTask = require('./createTasks');
const getTasks = require('./getTasks');

router.post('/', createTask);
router.get('/', getTasks);

module.exports = exports = router;
