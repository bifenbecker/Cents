const { pick } = require('lodash');
const { transaction } = require('objection');

const Model = require('../../../../models');
const Modifier = require('../../../../models/modifiers');
const ModifierVersion = require('../../../../models/modifierVersions');

async function updateModifier(req, res, next) {
    try {
        const { id } = req.params;
        const { name, price } = req.body;

        const trx = await transaction.start(Model.knex());

        // Update modifier
        const updatedModifier = await Modifier.query(trx)
            .patch({
                name: name.trim(),
                price: price.toFixed(2),
            })
            .findById(id)
            .returning('*');

        // Create new modifier version
        const insertModifierVersionObject = {
            modifierId: updatedModifier.id,
            ...pick(updatedModifier, ['name', 'price', 'description', 'pricingType']),
        };
        const modifierVersion = await ModifierVersion.query(trx).insertGraph(
            insertModifierVersionObject,
        );

        // Update modifier with the latest modifier version id
        await Modifier.query(trx)
            .patch({
                latestModifierVersion: modifierVersion.id,
            })
            .findById(updatedModifier.id);

        await trx.commit();

        res.status(200).json({
            success: true,
        });
    } catch (error) {
        next(error);
    }
}

module.exports = exports = updateModifier;
