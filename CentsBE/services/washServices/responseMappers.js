const lodash = require('lodash');

function mapServiceAndCategories(input) {
    const res = {};
    // map response into nested structure.
    for (const service of input) {
        const temp = {
            ...service,
        };
        temp.defaultPrice = temp.prices;
        delete temp.prices;
        delete temp.category;
        delete temp.categoryId;
        delete temp.totalRecords;
        if (res[service.categoryId]) {
            res[service.categoryId].services.push(temp);
        } else {
            res[service.categoryId] = {
                id: service.categoryId,
                category: service.category,
                services: temp.id ? [temp] : [],
            };
        }
    }
    return Object.values(res);
}

function mapCustomerSelectionForServices(services, customerSelectionServices) {
    if (!customerSelectionServices.length) {
        return services;
    }
    const mappedServices = services;
    for (const i of customerSelectionServices) {
        const index = mappedServices.findIndex((service) => service.priceId === i.priceId);
        if (index !== -1) {
            mappedServices[index].customerSelection = true;
        } else {
            mappedServices.push(i);
        }
    }
    return mappedServices;
}

function mapCustomerSelectionModifiers(modifiers, customerSelectionModifiers) {
    if (!customerSelectionModifiers.length) {
        return modifiers;
    }
    const mappedModifiers = modifiers;
    for (const i of customerSelectionModifiers) {
        const index = mappedModifiers.findIndex(
            (modifier) => modifier.serviceModifierId === i.serviceModifierId,
        );
        if (index !== -1) {
            mappedModifiers[index].customerSelection = true;
        } else {
            mappedModifiers.push(i);
        }
    }
    return mappedModifiers;
}

function mapServicesAndProducts(products, services) {
    const mappedProducts = [];
    products = products.map((inventory) => {
        if (!lodash.filter(mappedProducts, { inventoryId: inventory.inventoryId }).length) {
            mappedProducts.push({
                productName: inventory.productName,
                productImage: inventory.productImage,
                description: inventory.description,
                price: 0,
                isFeatured: true,
                inventoryId: inventory.inventoryId,
            });
        }
        return inventory;
    });
    services = services.map((serviceCategoryItem) => {
        serviceCategoryItem.services = serviceCategoryItem.services.map((srviceItem) => {
            srviceItem.prices = [
                {
                    serviceId: srviceItem.id,
                    storePrice: 0,
                    minQty: 0,
                    minPrice: 0,
                    isFeatured: true,
                    isDeliverable: false,
                    isTaxable: false,
                },
            ];
            return srviceItem;
        });
        return serviceCategoryItem;
    });
    return { products: mappedProducts, services };
}
module.exports = exports = {
    mapServiceAndCategories,
    mapCustomerSelectionModifiers,
    mapCustomerSelectionForServices,
    mapServicesAndProducts,
};
