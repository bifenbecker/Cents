const router = require('express').Router();

// validations

const createRouteValidation = require('../../../validations/driverApp/route/createRoute');
const createRouteHandler = require('./createRouteHandler');
const routeCompleteHandler = require('./routeCompleteHandler');
const getRouteHandler = require('./getRouteHandler');
const getRouteOrdersSummary = require('./getRouteOrdersSummary');

router.get('/:routeId', getRouteHandler);
router.post('/', createRouteValidation, createRouteHandler);
router.put('/:routeId/complete', routeCompleteHandler);
router.get('/:routeId/orders-summary', getRouteOrdersSummary);

module.exports = exports = router;
