const { transaction } = require('objection');
const LoggerHandler = require('../../../../../LoggerHandler/LoggerHandler');

const SubscriptionProduct = require('../../../../../models/subscriptionProduct');

async function updateSubscriptionProduct(subscriptionProduct, priceObject) {
    await SubscriptionProduct.query()
        .findbyId(subscriptionProduct.id)
        .patch({
            billingFrequency: priceObject.billingFrequency,
            unitPrice: priceObject.unitAmount / 100,
            isDeleted: !priceObject.active,
            deletedAt: priceObject.active ? null : new Date().toISOString(),
        })
        .returning('*');
}

async function updateStripePrice(req, res, next) {
    let trx = null;

    try {
        const { event } = req.constants;
        const priceObject = event.data.object;

        const subscriptionProducts = await SubscriptionProduct.query().where({
            stripePriceId: priceObject.id,
            stripeProductId: priceObject.product,
        });

        trx = await transaction.start(SubscriptionProduct.knex());

        const updateResult = subscriptionProducts.map((subscriptionProduct) =>
            updateSubscriptionProduct(subscriptionProduct, priceObject),
        );

        await Promise.all(updateResult);

        await trx.commit();

        return res.json({
            success: true,
        });
    } catch (error) {
        if (trx) {
            await trx.rollback();
        }
        LoggerHandler('error', error, req);
        return next(error);
    }
}

module.exports = exports = updateStripePrice;
