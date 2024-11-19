const router = require('express').Router();

// Controllers
const {
    createCashOutEvent,
    retrieveLastCashOutEvent,
    retrieveCurrentCashBalance,
} = require('./cashOutEventController');
const {
    startCashDrawerEvent,
    endCashDrawerEvent,
    getCashDrawerStatus,
    getCashDrawerHistory,
    getIndividualCashDrawerEvent,
} = require('./cashDrawerEventController');

// Validations
const createCashOutEventValidation = require('../../../validations/employeeTab/cashManagement/createCashOutEvent');
const createStartCashDrawerEventValidation = require('../../../validations/employeeTab/cashManagement/createCashDrawerStartEvent');
const createCashDrawerEndEventValidation = require('../../../validations/employeeTab/cashManagement/createCashDrawerEndEvent');

router.post('/cash-out/create', createCashOutEventValidation, createCashOutEvent);
router.get('/cash-out/balance', retrieveCurrentCashBalance);
router.get('/cash-out/latest', retrieveLastCashOutEvent);
router.post('/cash-drawer/start', createStartCashDrawerEventValidation, startCashDrawerEvent);
router.post('/cash-drawer/end', createCashDrawerEndEventValidation, endCashDrawerEvent);
router.get('/cash-drawer/status', getCashDrawerStatus);
router.get('/cash-drawer/history', getCashDrawerHistory);
router.get('/cash-drawer/history/:endEventId', getIndividualCashDrawerEvent);

module.exports = exports = router;
