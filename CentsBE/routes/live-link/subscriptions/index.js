const router = require('express').Router({ mergeParams: true });

const updateSubscriptionsValidation = require('../../../validations/liveLink/subscriptions/updateSubscriptions');

const { updateSubscription, listSubscriptions } = require('../subscriptionsController');

router.patch('/:id', updateSubscriptionsValidation, updateSubscription);
// list subscriptions
router.get('/', listSubscriptions);

module.exports = exports = router;
