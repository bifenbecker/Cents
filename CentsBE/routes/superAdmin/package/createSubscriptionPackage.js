const createSubscriptionPackagePipeline = require('../../../pipeline/subscription/createSubscriptionPackagePipeline');

/**
 * Save subscription package details to a newly created business.
 *
 * This API performs the following actions:
 *
 * 1) Create a Business Owner User and corresponding UserRole models;
 * 2) Create a LaundromatBusiness model;
 * 3) Create a Customer in Stripe;
 * 4) Create SubscriptionProduct model for each selected subscription item;
 * 5) Send email containing link to package;
 *
 * NOTE: the email sent is not the welcome email where the business owner gets account info.
 *       this email will be sent separately once payment is received.
 *
 * @param {Object} req
 * @param {Object} res
 * @param {void} next
 */
async function createSubscriptionPackage(req, res, next) {
    try {
        const output = await createSubscriptionPackagePipeline(req.body);

        return res.status(200).json({
            success: true,
            output,
        });
    } catch (error) {
        return next(error);
    }
}

module.exports = exports = createSubscriptionPackage;
