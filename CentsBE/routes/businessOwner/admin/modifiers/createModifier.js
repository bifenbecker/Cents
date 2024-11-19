const { transaction } = require('objection');
const { pick } = require('lodash');

const Model = require('../../../../models');
const Modifier = require('../../../../models/modifiers');
const ModifierVersion = require('../../../../models/modifierVersions');

async function addModifier(req, res, next) {
    let trx = null;
    try {
        const { name, price } = req.body;
        const { businessId, services } = req.constants;

        trx = await transaction.start(Model.knex());

        // Create modifier
        const insertModifierObject = {
            name: name.trim(),
            price: price.toFixed(2),
            businessId,
            serviceModifiers: services,
        };
        const modifier = await Modifier.query(trx).insertGraph(insertModifierObject).returning('*');

        // Create modifier version
        const insertModifierVersionObject = {
            modifierId: modifier.id,
            ...pick(modifier, ['name', 'price', 'description', 'pricingType']),
        };
        const modifierVersion = await ModifierVersion.query(trx).insertGraph(
            insertModifierVersionObject,
        );

        // Update modifier with the latest modifier version id
        const updatedModifier = await Modifier.query(trx)
            .patch({
                latestModifierVersion: modifierVersion.id,
            })
            .findById(modifier.id)
            .returning('*');

        await trx.commit();

        res.status(200).json({
            success: true,
            modifier: updatedModifier,
        });
    } catch (error) {
        if (trx) {
            await trx.rollback();
        }
        next(error);
    }
}

module.exports = exports = addModifier;
