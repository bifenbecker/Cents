const router = require('express').Router();

const signUpHandler = require('./signUp');
const signInHandler = require('./signIn');
const internalSignin = require('./superAdmin/authentication/signIn');
const superAdminHandler = require('./superAdmin');
const tokenAuth = require('../middlewares/tokenAuth');
const businessOwner = require('./businessOwner');
const stripe = require('./stripe');
const residentialOrder = require('./residentialOrder');
const roleCheck = require('../middlewares/roleCheck');
const employeeTab = require('./employeeTab');
const driverApp = require('./driverApp');
const twilioMessagingWebHook = require('../utils/sms/twilioWebHook');
const liveStatus = require('./live-link');
const quotes = require('./quotes');
const webhooks = require('./webhooks');
const pusherRoutes = require('./pusher');
const deliveryRoutes = require('./delivery');
const setApiVersion = require('../middlewares/setApiVersion');

router.use('/sign-up', tokenAuth, setApiVersion, roleCheck(['Super Admin']), signUpHandler);
router.use('/sign-in', setApiVersion, signInHandler);
router.use('/internal/sign-in', setApiVersion, internalSignin);

// Super Admin routes.
router.use('/super-admin', tokenAuth, setApiVersion, roleCheck(['Super Admin']), superAdminHandler);
router.use(
    '/business-owner',
    tokenAuth,
    setApiVersion,
    roleCheck(['Business Owner', 'Business Admin', 'Business Manager']),
    businessOwner,
);
router.use('/employee-tab', setApiVersion, employeeTab);
router.use('/driver-app', setApiVersion, driverApp);
router.use('/residential-app', setApiVersion, residentialOrder);

router.use('/stripe', setApiVersion, stripe);
router.use('/sms', setApiVersion, twilioMessagingWebHook);
router.use('/live-status', setApiVersion, liveStatus);
router.use('/quotes', setApiVersion, quotes);
router.use('/webhooks', webhooks);
router.use('/pusher', setApiVersion, pusherRoutes);
router.use('/delivery', setApiVersion, deliveryRoutes);

module.exports = exports = router;
