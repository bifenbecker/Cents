const { raw } = require('objection');
const ServiceModifier = require('../../../models/serviceModifiers');

const { mapCustomerSelectionModifiers } = require('../responseMappers');

function getModifiers(serviceModifierIds, transaction) {
    const details = ServiceModifier.query(transaction)
        .select(
            'serviceModifiers.id as serviceModifierId',
            'modifiers.price',
            'modifiers.name as name',
            'modifiers.description',
            'modifiers.id as modifierId',
            'modifiers.latestModifierVersion as latestModifierVersion',
            'modifiers.pricingType as modifierPricingType',
            raw(
                ` null as "minimumQuantity", null as "minimumPrice", 'MODIFIER' as "lineItemType",
            false as "hasMinPrice", 0 as weight
            `,
            ),
        )
        .join('modifiers', 'modifiers.id', 'serviceModifiers.modifierId')
        .whereIn('serviceModifiers.id', serviceModifierIds);
    return details;
}

function getServiceModifiers(serviceId, serviceModifierIds, transaction) {
    const serviceModifiers = getModifiers(serviceModifierIds, transaction).where(
        'serviceModifiers.serviceId',
        serviceId,
    );
    return serviceModifiers;
}

async function getCustomerSelectionModifiers(serviceId, orderId) {
    const modifiers = ServiceModifier.query()
        .select(
            'serviceModifiers.id as serviceModifierId',
            'modifiers.name as name',
            'modifiers.description as description',
            'modifiers.price as price',
            raw('true as "customerSelection"'),
        )
        .from('serviceOrderItems')
        .join('serviceReferenceItems', (builder) => {
            builder
                .on('serviceOrderItems.id', '=', 'serviceReferenceItems.orderItemId')
                .andOn('serviceOrderItems.orderId', Number(orderId));
        })
        .join('serviceModifiers', 'serviceReferenceItems.serviceModifierId', 'serviceModifiers.id')
        .join('modifiers', 'modifiers.id', 'serviceModifiers.modifierId')
        .where('serviceModifiers.serviceId', '=', serviceId);
    return modifiers;
}

async function getFeaturedModifiers(serviceId, orderId) {
    let featuredModifiers = ServiceModifier.query()
        .select(
            'serviceModifiers.id as serviceModifierId',
            'modifiers.name as name',
            'modifiers.description as description',
            'modifiers.price as price',
            raw('false as "customerSelection"'),
        )
        .join('modifiers', 'modifiers.id', 'serviceModifiers.modifierId')
        .where('serviceId', '=', serviceId)
        .andWhere('isFeatured', '=', true);
    featuredModifiers = Number(orderId)
        ? featuredModifiers.union((query) => {
              query
                  .select(
                      'serviceModifiers.id as serviceModifierId',
                      'modifiers.name as name',
                      'modifiers.description as description',
                      'modifiers.price as price',
                      raw('false as "customerSelection"'),
                  )
                  .from('serviceOrderItems')
                  .join('serviceReferenceItems', (builder) => {
                      builder
                          .on('serviceOrderItems.id', '=', 'serviceReferenceItems.orderItemId')
                          .andOn('serviceOrderItems.orderId', Number(orderId))
                          .onNull('serviceOrderItems.deletedAt');
                  })
                  .join(
                      'serviceModifiers',
                      'serviceReferenceItems.serviceModifierId',
                      'serviceModifiers.id',
                  )
                  .join('modifiers', 'modifiers.id', 'serviceModifiers.modifierId')
                  .where('serviceModifiers.serviceId', '=', serviceId);
          })
        : featuredModifiers;
    featuredModifiers = featuredModifiers.orderBy('name');
    featuredModifiers = await featuredModifiers;
    if (orderId) {
        const customerSelectionModifiers = await getCustomerSelectionModifiers(serviceId, orderId);
        return mapCustomerSelectionModifiers(featuredModifiers, customerSelectionModifiers);
    }
    return featuredModifiers;
}

module.exports = exports = {
    getModifiers,
    getServiceModifiers,
    getFeaturedModifiers,
};
