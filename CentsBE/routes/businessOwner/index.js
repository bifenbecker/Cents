const router = require('express').Router();

const machineRoutes = require('./machine');
const customers = require('./customers');
const orders = require('./orders');
const reports = require('./reports');
const admin = require('./admin');
const location = require('./location');
const assignedLocations = require('./location/assignedLocations');
const feedbackLink = require('./feedback/feedbackLink');
const roleCheck = require('../../middlewares/roleCheck');
const payments = require('./payments');
const accountInfo = require('./account/info');
const analyticsDashboard = require('./analytics-dashboard');
const qrCodeRouter = require('./qr-code');

router.use('/admin', roleCheck(['Business Owner', 'Business Admin']), admin);
router.get('/assigned-locations', assignedLocations);
router.use('/machine', machineRoutes);
router.use('/customers', customers);
router.use('/orders', orders);
router.use('/reports', reports);
router.use('/locations', location);
router.get('/feedback-link', feedbackLink);
router.use('/payments', payments);
router.get('/account', accountInfo);
router.use('/analytics-dashboard', analyticsDashboard);
router.use('/qr-code', qrCodeRouter);

module.exports = router;
