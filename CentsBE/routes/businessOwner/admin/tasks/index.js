const router = require('express').Router();

const getTasks = require('./getTasks');

const updateTaskValidations = require('../../../../validations/tasks/updateTask');
const updateTask = require('./updateTask');

const { createTask } = require('./createTask');
const taskValidations = require('../../../../validations/tasks/addTask').validations;
const fetchDetails = require('../../../../validations/tasks/fetchTaskCreationDetails');
const getShifts = require('./allShifts');
const tasksList = require('./tasksLists');
const tasksExport = require('./tasksReport');
const archiveTask = require('./archiveTask');

router.get('/', getTasks);
router.get('/allShifts', getShifts);
router.get('/all-tasks', tasksList);
router.post('/', taskValidations, fetchDetails, createTask);
router.put('/', updateTaskValidations, fetchDetails, updateTask);
router.get('/export', tasksExport);
router.put('/archive/:id', archiveTask);

module.exports = router;
