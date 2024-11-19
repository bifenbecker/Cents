const { transaction } = require('objection');
const LoggerHandler = require('../../../../../LoggerHandler/LoggerHandler');

const SubscriptionProduct = require('../../../../../models/subscriptionProduct');

async function updateSubscriptionProduct(subscriptionProduct, productObject) {
    await SubscriptionProduct.query()
        .findbyId(subscriptionProduct.id)
        .patch({
            name: productObject.name,
            description: productObject.description,
            isDeleted: !productObject.active,
            deletedAt: productObject.active ? null : new Date().toISOString(),
        })
        .returning('*');
}

async function updateStripeProduct(req, res, next) {
    let trx = null;

    try {
        const { event } = req.constants;
        const productObject = event.data.object;

        const subscriptionProducts = await SubscriptionProduct.query().where({
            stripeProductId: productObject.product,
        });

        trx = await transaction.start(SubscriptionProduct.knex());

        const updateResult = subscriptionProducts.map((subscriptionProduct) =>
            updateSubscriptionProduct(subscriptionProduct, productObject),
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

module.exports = exports = updateStripeProduct;
